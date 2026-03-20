# -*- coding: utf-8 -*-
import os, re, random, requests, feedparser, time, hashlib
from datetime import datetime
from django.core.management.base import BaseCommand
from django.db import connection
from bs4 import BeautifulSoup

from api.models.article import Article
from api.utils.html_utils import HTMLConverter
from api.management.commands.blog_drivers.livedoor_driver import LivedoorDriver
from api.management.commands.blog_drivers.adult_ai_processor import AdultAIProcessor as AIProcessor

class Command(BaseCommand):
    help = 'BICSTATION Adult Fleet v25.7.1: LIVEDOOR FOCUS (DB Centric Optimized)'

    # --- 🚨 Markdown保存先はDB管理へ移行したため不要（コメントアウト） ---
    # SAVE_DIR = "/home/maya/shin-dev/shin-vps/next-tiper/content/posts/"
    
    # 認証情報
    LD_KEY_PBIC = "lNh8lSooOq"
    LD_KEY_ADULT = "dPCZ3nAKf1"
    LD_USER_PBIC = "pbic"
    LD_USER_ADULT = "pbic_adult"

    # --- 🏘 Livedoor 20サイト・マスター設定 ---
    BLOG_CONFIGS = {
        "tiper": {"name": "Tiper.Live", "user": LD_USER_PBIC, "api_key": LD_KEY_PBIC, "url": "https://livedoor.blogcms.jp/atompub/pbic/article", "keywords": [], "persona": "総合ポータル：網羅的で高級感のあるレビュー"},
        "reserve": {"name": "先行予約", "user": LD_USER_PBIC, "api_key": LD_KEY_PBIC, "url": "https://livedoor.blogcms.jp/atompub/pbic-br9qoupv/article", "keywords": ["予約", "先行", "2026", "発売予定"], "persona": "先行予約：期待感を煽る速報スタイル"},
        "jukujo": {"name": "熟女・人妻", "user": LD_USER_PBIC, "api_key": LD_KEY_PBIC, "url": "https://livedoor.blogcms.jp/atompub/pbic-eaenvfmg/article", "keywords": ["熟女", "人妻", "40代", "50代", "女上司"], "persona": "熟女人妻：大人の色気と背徳的な描写重視"},
        "vr": {"name": "VR快楽", "user": LD_USER_PBIC, "api_key": LD_KEY_PBIC, "url": "https://livedoor.blogcms.jp/atompub/pbic-7vu6rapd/article", "keywords": ["VR", "360", "vr", "バーチャル"], "persona": "VR：最新技術による没入体験と臨場感の解説"},
        "idol": {"name": "美少女", "user": LD_USER_PBIC, "api_key": LD_KEY_PBIC, "url": "https://livedoor.blogcms.jp/atompub/pbic-ldp7wpxx/article", "keywords": ["新人", "単体", "美少女", "アイドル"], "persona": "美少女：清純さとエロスのギャップを強調"},
        "ntr": {"name": "NTR・不倫", "user": LD_USER_PBIC, "api_key": LD_KEY_PBIC, "url": "https://livedoor.blogcms.jp/atompub/pbic-xem23smb/article", "keywords": ["NTR", "寝取", "不倫"], "persona": "NTR：心の痛みと肉体の悦楽を綴るスタイル"},
        "fetish": {"name": "フェチ・巨乳", "user": LD_USER_PBIC, "api_key": LD_KEY_PBIC, "url": "https://livedoor.blogcms.jp/atompub/pbic-txjhpcdr/article", "keywords": ["巨乳", "爆乳", "美尻", "フェチ", "アナル"], "persona": "フェチ：特定の部位への執着とフェティシズム"},
        "wiki": {"name": "名作まとめ", "user": LD_USER_PBIC, "api_key": LD_KEY_PBIC, "url": "https://livedoor.blogcms.jp/atompub/pbic-ihotsur8/article", "keywords": ["神作", "名作", "まとめ"], "persona": "名作：歴史に残る傑作をアーカイブする学術的視点"},
        "nakadashi": {"name": "中出し", "user": LD_USER_PBIC, "api_key": LD_KEY_PBIC, "url": "https://livedoor.blogcms.jp/atompub/pbic-znfejpqv/article", "keywords": ["中出し", "生ハメ", "種付け"], "persona": "中出し：本能に訴えかける生々しい官能描写"},
        "amateur": {"name": "素人", "user": LD_USER_PBIC, "api_key": LD_KEY_PBIC, "url": "https://livedoor.blogcms.jp/atompub/pbic-7zjsg4zw/article", "keywords": ["素人", "18", "女子高生"], "persona": "素人：隣にいそうな親近感とリアルな淫らさ"},
        "virgin": {"name": "処女・初体験", "user": LD_USER_ADULT, "api_key": LD_KEY_ADULT, "url": "https://livedoor.blogcms.jp/atompub/pbic_adult-4coewush/article", "keywords": ["処女", "初撮り", "新人", "デビュー", "初体験"], "persona": "処女：初々しさと羞恥に悶える様子を克明に"},
        "jk": {"name": "現役女子校生", "user": LD_USER_ADULT, "api_key": LD_KEY_ADULT, "url": "https://livedoor.blogcms.jp/atompub/pbic_adult-sxfhya5c/article", "keywords": ["JK", "女子高生", "制服", "現役"], "persona": "JK：制服の下に隠された禁断の若さ"},
        "jd": {"name": "現役女子大生", "user": LD_USER_ADULT, "api_key": LD_KEY_ADULT, "url": "https://livedoor.blogcms.jp/atompub/pbic_adult-gkkd2nd3/article", "keywords": ["女子大生", "JD", "キャンパス"], "persona": "JD：開放的になった女子大生の夜の顔"},
        "enkou": {"name": "パパ活・秘密の放課後", "user": LD_USER_ADULT, "api_key": LD_KEY_ADULT, "url": "https://livedoor.blogcms.jp/atompub/pbic_adult-paacv98o/article", "keywords": ["援交", "えんこう", "パパ活"], "persona": "パパ活：金銭と欲望が交錯するリアルな現場感"},
        "wakazuma": {"name": "新婚若妻", "user": LD_USER_ADULT, "api_key": LD_KEY_ADULT, "url": "https://livedoor.blogcms.jp/atompub/pbic_adult-4iwnt1oa/article", "keywords": ["若妻", "新婚", "新妻"], "persona": "若妻：新生活の裏で芽生える不実な情事"},
        "nurse": {"name": "白衣の天使・ナース", "user": LD_USER_ADULT, "api_key": LD_KEY_ADULT, "url": "https://livedoor.blogcms.jp/atompub/pbic_adult-ykt0g9cd/article", "keywords": ["看護師", "ナース", "白衣", "女医"], "persona": "ナース：献身的なケアの裏にある過激な奉仕"},
        "ol": {"name": "背徳OL・女上司", "user": LD_USER_ADULT, "api_key": LD_KEY_ADULT, "url": "https://livedoor.blogcms.jp/atompub/pbic_adult/article", "keywords": ["OL", "女上司", "スーツ"], "persona": "OL：オフィスの理性が崩壊する瞬間の美学"},
        "chijo": {"name": "痴女・野外露出", "user": LD_USER_ADULT, "api_key": LD_KEY_ADULT, "url": "https://livedoor.blogcms.jp/atompub/pbic_adult-ozx42sxy/article", "keywords": ["痴女", "露出", "野外", "ノーパン"], "persona": "痴女：人目に晒される快感と大胆な誘惑"},
        "gal": {"name": "爆乳ギャル名鑑", "user": LD_USER_ADULT, "api_key": LD_KEY_ADULT, "url": "https://livedoor.blogcms.jp/atompub/pbic_adult-m2cd5bcm/article", "keywords": ["ギャル", "黒ギャル", "派手"], "persona": "ギャル：快楽至上主義のハデめな誘惑"},
        "slender": {"name": "極薄・スレンダー", "user": LD_USER_ADULT, "api_key": LD_KEY_ADULT, "url": "https://livedoor.blogcms.jp/atompub/pbic_adult-ij5rw5os/article", "keywords": ["スレンダー", "細身", "貧乳"], "persona": "スレンダー：研ぎ澄まされた肢体の美しさとフェチ"},
    }

    RSS_SOURCES = [
        "https://www.dmm.co.jp/mono/dvd/-/list/=/rss=create/sort=p_date/",
        "https://www.dmm.co.jp/digital/videoa/-/list/=/rss=create/sort=p_date/",
        "https://www.dmm.co.jp/rental/-/list/=/rss=create/sort=date/",
        "https://www.dmm.co.jp/digital/videoa/-/list/=/article=vr/rss=create/sort=p_date/",
    ]

    def log(self, msg):
        ts = datetime.now().strftime('%H:%M:%S')
        print(f"[{ts}] {msg}")

    def handle(self, *args, **options):
        self.log("====================================================")
        self.log("🔥 BICSTATION Adult Fleet v25.7.1 - DB OPTIMIZED")
        self.log("====================================================")
        
        rss_pool = self.get_raw_rss_pool()
        if not rss_pool: return

        all_targets = []
        for b_id, cfg in self.BLOG_CONFIGS.items(): 
            all_targets.append({"id": b_id, "mode": "livedoor", "cfg": cfg, "done": False})

        api_keys = [os.getenv(f"GEMINI_API_KEY_{i}").strip() for i in range(1, 11) if os.getenv(f"GEMINI_API_KEY_{i}")]
        prompt_path = os.path.join(os.path.dirname(__file__), "prompt", "ai_prompt_adult.txt")
        with open(prompt_path, "r", encoding='utf-8') as f: template = f.read()
        processor = AIProcessor(api_keys, template)

        for item in rss_pool:
            remaining_targets = [t for t in all_targets if not t["done"]]
            if not remaining_targets: break 

            for target in remaining_targets:
                b_id = target["id"]
                cfg = target["cfg"]
                
                keywords = cfg.get("keywords", [])
                is_match = not keywords or any(k.lower() in (item['title'] + item['body']).lower() for k in keywords)

                if is_match:
                    # サイト識別子にb_idを含めて重複投稿を厳密に防止
                    if Article.objects.filter(source_url=item['url'], site=f"livedoor_{b_id}").exists():
                        continue

                    if self.process_single_post(b_id, item, processor, cfg):
                        target["done"] = True 
                        self.log(f"🎯 {b_id.upper()} COMPLETED.")
                        time.sleep(10)

        success_count = sum(1 for t in all_targets if t["done"])
        self.log("====================================================")
        self.log(f"🏁 Mission Accomplished: {success_count}/{len(all_targets)} Livedoor sites updated.")
        self.log("====================================================")

    def get_raw_rss_pool(self):
        pool = []
        seen_urls = set()
        for url in self.RSS_SOURCES:
            try:
                res = requests.get(url, headers={'User-Agent': 'Mozilla/5.0'}, timeout=20)
                feed = feedparser.parse(res.text)
                for e in feed.entries:
                    if e.link not in seen_urls:
                        parsed = self.parse_item(e)
                        if parsed:
                            pool.append(parsed)
                            seen_urls.add(e.link)
            except Exception as ex: self.log(f"⚠️ RSSエラー: {str(ex)}")
        random.shuffle(pool)
        return pool

    def parse_item(self, entry):
        try:
            raw_img_url = ""
            if hasattr(entry, 'package'): raw_img_url = entry.package
            else:
                content = entry.content[0].value if hasattr(entry, 'content') else getattr(entry, "summary", "")
                img_match = re.search(r'src="(.*?)"', content)
                if img_match: raw_img_url = img_match.group(1)
            
            img_url = re.sub(r'(p[s|r|t]|p)\.jpg$', 'pl.jpg', raw_img_url)
            raw_content = entry.content[0].value if hasattr(entry, 'content') else getattr(entry, "summary", "")
            soup = BeautifulSoup(raw_content, 'html.parser')
            for img in soup.find_all('img'): img.decompose()
            
            return {'url': entry.link, 'title': entry.title, 'img': img_url, 'body': soup.get_text().strip()[:800]}
        except: return None

    def process_single_post(self, b_id, data, processor, cfg):
        connection.close()
        
        power_word = random.choice(["神作", "究極快楽", "衝撃のデビュー", "伝説級", "最高傑作", "脳溶け確定"])
        
        inject_data = {
            "name": cfg['name'],
            "persona": cfg['persona'],
            "power_word": power_word
        }

        self.log(f"🖋 AI Generation for [{cfg['name']}]...")
        raw_res = processor.generate_blog_content(data, str(inject_data))
        if not raw_res: return False

        content_text = raw_res.get('cont_g', '')
        title_match = re.search(r'\[TITLE\](.*?)\[/TITLE\]', content_text, re.DOTALL)
        gen_title = title_match.group(1).strip() if title_match else data['title']
        
        body_match = re.search(r'\[BODY\](.*?)\[/BODY\]', content_text, re.DOTALL)
        clean_body = body_match.group(1).strip() if body_match else content_text

        # Next.js(Tiper.Live)側への内部リンク用URL生成（MDがなくてもハッシュで一貫性を保持）
        date_str = datetime.now().strftime('%Y%m%d')
        url_hash = hashlib.md5(data['url'].encode()).hexdigest()[:8]
        slug = f"{date_str}_{url_hash}"
        tiper_url = f"https://tiper.live/posts/{slug}/"
        official_url = data['url']

        html_body = HTMLConverter.md_to_html(clean_body)
        html_body += f'''
        <div class="cta-box" style="background:#111; padding:25px; border-radius:15px; margin-top:40px; text-align:center; border:2px solid #d4af37;">
            <p style="color:#d4af37; font-weight:bold; font-size:1.1rem; margin-bottom:20px;">🎬 この作品を今すぐチェック</p>
            <div style="margin-bottom:15px;">
                <a href="{tiper_url}" target="_blank" style="background:linear-gradient(135deg, #d4af37 0%, #b8860b 100%); color:#000; padding:12px 30px; text-decoration:none; font-weight:bold; border-radius:50px; display:inline-block; width:220px; box-shadow:0 4px 15px rgba(212,175,55,0.4);">▶ Tiper.Live で視聴</a>
            </div>
            <div>
                <a href="{official_url}" target="_blank" style="background:#333; color:#fff; padding:10px 30px; text-decoration:none; font-size:0.9rem; font-weight:bold; border-radius:50px; display:inline-block; width:220px; border:1px solid #555;">➡ 公式サイトで詳細を見る</a>
            </div>
            <p style="color:#888; font-size:0.75rem; margin-top:15px;">※リンク先は成人向けコンテンツを含みます。18歳未満の方はご遠慮ください。</p>
        </div>'''

        driver = LivedoorDriver(cfg)
        
        # SyntaxError回避済みの安全なタイトル処理
        clean_gen_title = re.sub(r'[\r\n\t]', ' ', gen_title)
        safe_title = f"[PR] {clean_gen_title}".strip()[:95]

        try:
            if driver.post(title=safe_title, body=html_body, image_url=data["img"], source_url=data['url']):
                # 🏆 Django DBへの保存（マスターデータ）
                Article.objects.update_or_create(
                    site=f"livedoor_{b_id}", 
                    source_url=data['url'], 
                    defaults={
                        'content_type': 'post', 
                        'title': safe_title, 
                        'body_text': clean_body, 
                        'main_image_url': data['img'], 
                        'is_exported': True
                    }
                )
                self.log(f"✅ DEPLOYED & DB SAVED: [{b_id.upper()}]")
                return True
        except Exception as e:
            self.log(f"❌ ERROR: [{b_id.upper()}] {str(e)}")
        return False