# -*- coding: utf-8 -*-
import os, re, random, requests, feedparser, time, hashlib
from datetime import datetime
from django.core.management.base import BaseCommand
from django.db import connection
from bs4 import BeautifulSoup

from api.models.article import Article
from api.utils.html_utils import HTMLConverter
from api.management.commands.blog_drivers.livedoor_driver import LivedoorDriver
from api.management.commands.blog_drivers.wordpress_driver import WordPressDriver 
from api.management.commands.blog_drivers.adult_ai_processor import AdultAIProcessor as AIProcessor

class Command(BaseCommand):
    help = 'BICSTATION Adult Fleet v25.0: FULL SITE SYNC WITH /article'

    # --- 📂 保存先 ---
    SAVE_DIR = "/home/maya/shin-dev/shin-vps/next-tiper/content/posts/"

    # --- 🔑 認証情報 ---
    LD_KEY_PBIC = "lNh8lSooOq"
    LD_KEY_ADULT = "dPCZ3nAKf1"
    LD_USER_PBIC = "pbic"
    LD_USER_ADULT = "pbic_adult"

    # --- 🏘 22サイト・マスター設定 (全サイト /article 完備) ---
    BLOG_CONFIGS = {
        # --- pbic ユーザー (10サイト) ---
        "tiper": {"name": "Tiper.Live", "user": LD_USER_PBIC, "api_key": LD_KEY_PBIC, "url": "https://livedoor.blogcms.jp/atompub/pbic/article", "keywords": [], "persona": "総合ポータル：網羅的レビュー"},
        "reserve": {"name": "先行予約", "user": LD_USER_PBIC, "api_key": LD_KEY_PBIC, "url": "https://livedoor.blogcms.jp/atompub/pbic-br9qoupv/article", "keywords": ["予約", "先行", "2026", "発売予定"], "persona": "先行予約：速報スタイル"},
        "jukujo": {"name": "熟女・人妻", "user": LD_USER_PBIC, "api_key": LD_KEY_PBIC, "url": "https://livedoor.blogcms.jp/atompub/pbic-eaenvfmg/article", "keywords": ["熟女", "人妻", "40代", "50代", "女上司"], "persona": "熟女人妻：背徳描写"},
        "vr": {"name": "VR快楽", "user": LD_USER_PBIC, "api_key": LD_KEY_PBIC, "url": "https://livedoor.blogcms.jp/atompub/pbic-7vu6rapd/article", "keywords": ["VR", "360", "vr", "バーチャル"], "persona": "VR：没入体験型"},
        "idol": {"name": "美少女", "user": LD_USER_PBIC, "api_key": LD_KEY_PBIC, "url": "https://livedoor.blogcms.jp/atompub/pbic-ldp7wpxx/article", "keywords": ["新人", "単体", "美少女", "アイドル"], "persona": "美少女：推薦スタイル"},
        "ntr": {"name": "NTR・不倫", "user": LD_USER_PBIC, "api_key": LD_KEY_PBIC, "url": "https://livedoor.blogcms.jp/atompub/pbic-xem23smb/article", "keywords": ["NTR", "寝取", "不倫"], "persona": "NTR：背徳スタイル"},
        "fetish": {"name": "フェチ・巨乳", "user": LD_USER_PBIC, "api_key": LD_KEY_PBIC, "url": "https://livedoor.blogcms.jp/atompub/pbic-txjhpcdr/article", "keywords": ["巨乳", "爆乳", "美尻", "フェチ", "アナル"], "persona": "フェチ：執着描写"},
        "wiki": {"name": "名作まとめ", "user": LD_USER_PBIC, "api_key": LD_KEY_PBIC, "url": "https://livedoor.blogcms.jp/atompub/pbic-ihotsur8/article", "keywords": ["神作", "名作", "まとめ"], "persona": "名作：学術的解説"},
        "nakadashi": {"name": "中出し", "user": LD_USER_PBIC, "api_key": LD_KEY_PBIC, "url": "https://livedoor.blogcms.jp/atompub/pbic-znfejpqv/article", "keywords": ["中出し", "生ハメ", "種付け"], "persona": "中出し：本能重視"},
        "amateur": {"name": "素人", "user": LD_USER_PBIC, "api_key": LD_KEY_PBIC, "url": "https://livedoor.blogcms.jp/atompub/pbic-7zjsg4zw/article", "keywords": ["素人", "18", "女子高生"], "persona": "素人：日常の淫らさ"},

        # --- pbic_adult ユーザー (10サイト) ---
        "virgin": {"name": "処女・初体験", "user": LD_USER_ADULT, "api_key": LD_KEY_ADULT, "url": "https://livedoor.blogcms.jp/atompub/pbic_adult-4coewush/article", "keywords": ["処女", "初撮り", "新人", "デビュー", "初体験"], "persona": "処女：羞恥描写"},
        "jk": {"name": "現役女子校生", "user": LD_USER_ADULT, "api_key": LD_KEY_ADULT, "url": "https://livedoor.blogcms.jp/atompub/pbic_adult-sxfhya5c/article", "keywords": ["JK", "女子高生", "制服", "現役", "放課後"], "persona": "JK：制服の背徳"},
        "jd": {"name": "現役女子大生", "user": LD_USER_ADULT, "api_key": LD_KEY_ADULT, "url": "https://livedoor.blogcms.jp/atompub/pbic_adult-gkkd2nd3/article", "keywords": ["女子大生", "JD", "キャンパス", "大学", "女子寮"], "persona": "JD：夜の顔"},
        "enkou": {"name": "パパ活・秘密の放課後", "user": LD_USER_ADULT, "api_key": LD_KEY_ADULT, "url": "https://livedoor.blogcms.jp/atompub/pbic_adult-paacv98o/article", "keywords": ["援交", "えんこう", "パパ活", "素人", "小遣い"], "persona": "パパ活：リアル描写"},
        "wakazuma": {"name": "新婚若妻", "user": LD_USER_ADULT, "api_key": LD_KEY_ADULT, "url": "https://livedoor.blogcms.jp/atompub/pbic_adult-4iwnt1oa/article", "keywords": ["若妻", "新婚", "新妻", "人妻", "エプロン"], "persona": "若妻：不実な蜜"},
        "nurse": {"name": "白衣の天使・ナース", "user": LD_USER_ADULT, "api_key": LD_KEY_ADULT, "url": "https://livedoor.blogcms.jp/atompub/pbic_adult-ykt0g9cd/article", "keywords": ["看護師", "ナース", "白衣", "病院", "女医"], "persona": "ナース：禁断処置"},
        "ol": {"name": "背徳OL・女上司", "user": LD_USER_ADULT, "api_key": LD_KEY_ADULT, "url": "https://livedoor.blogcms.jp/atompub/pbic_adult/article", "keywords": ["OL", "女上司", "ストッキング", "スーツ", "事務"], "persona": "OL：オフィスの理性"},
        "chijo": {"name": "痴女・野外露出", "user": LD_USER_ADULT, "api_key": LD_KEY_ADULT, "url": "https://livedoor.blogcms.jp/atompub/pbic_adult-ozx42sxy/article", "keywords": ["痴女", "露出", "野外", "ノーパン", "誘惑"], "persona": "痴女：見られる快感"},
        "gal": {"name": "爆乳ギャル名鑑", "user": LD_USER_ADULT, "api_key": LD_KEY_ADULT, "url": "https://livedoor.blogcms.jp/atompub/pbic_adult-m2cd5bcm/article", "keywords": ["ギャル", "黒ギャル", "派手", "ヤリマン"], "persona": "ギャル：快楽主義"},
        "slender": {"name": "極薄・スレンダー", "user": LD_USER_ADULT, "api_key": LD_KEY_ADULT, "url": "https://livedoor.blogcms.jp/atompub/pbic_adult-ij5rw5os/article", "keywords": ["スレンダー", "細身", "貧乳", "微乳", "美体"], "persona": "スレンダー：極薄フェチ"},
    }

    WP_CONFIGS = {
        "blog.bic-erog.com": {"name": "WP A", "url": "https://blog.bic-erog.com/xmlrpc.php", "user": "bicstation", "app_password": "a0H2 McUX 3XK6 apzh JZ82 SzTm", "keywords": [], "persona": "SEOニュース"},
        "blog.adult-search.xyz": {"name": "WP B", "url": "https://blog.adult-search.xyz/xmlrpc.php", "user": "bicstation", "app_password": "OBlD Yz2v lR8F wswY zwaW cF43", "keywords": [], "persona": "マニアックレビュー"}
    }

    RSS_SOURCES = [
        "https://www.dmm.co.jp/mono/dvd/-/list/=/rss=create/sort=p_date/",
        "https://www.dmm.co.jp/digital/videoa/-/list/=/rss=create/sort=p_date/",
        "https://www.dmm.co.jp/rental/-/list/=/rss=create/sort=date/",
        "https://www.dmm.co.jp/digital/videoa/-/list/=/article=vr/rss=create/sort=p_date/",
    ]

    def add_arguments(self, parser):
        parser.add_argument('--target', type=str, default='all', help='Target blog ID')

    def log(self, msg):
        ts = datetime.now().strftime('%H:%M:%S')
        print(f"[{ts}] {msg}")

    def handle(self, *args, **options):
        target_id = options['target']
        self.log("====================================================")
        self.log("🔥 BICSTATION Adult Fleet v25.0 - TOTAL SYNC")
        self.log("====================================================")
        
        if not os.path.exists(self.SAVE_DIR): os.makedirs(self.SAVE_DIR)
        rss_pool = self.get_raw_rss_pool()
        if not rss_pool: return
        
        used_urls_this_session = set()
        all_blogs = []
        for b_id, cfg in self.BLOG_CONFIGS.items(): all_blogs.append((b_id, "livedoor", cfg))
        for b_id, cfg in self.WP_CONFIGS.items(): all_blogs.append((b_id, "wordpress", cfg))
        
        if target_id != 'all':
            all_blogs = [b for b in all_blogs if b[0] == target_id]

        api_keys = [os.getenv(f"GEMINI_API_KEY_{i}").strip() for i in range(1, 11) if os.getenv(f"GEMINI_API_KEY_{i}")]
        prompt_path = os.path.join(os.path.dirname(__file__), "prompt", "ai_prompt_adult.txt")
        with open(prompt_path, "r", encoding='utf-8') as f: template = f.read()
        processor = AIProcessor(api_keys, template)

        success_count = 0
        for b_id, mode, cfg in all_blogs:
            self.log(f"🚀 [SCAN] Target: {b_id.upper()}")
            posted_successfully = False
            
            for item in rss_pool:
                if item['url'] in used_urls_this_session: continue
                if Article.objects.filter(source_url=item['url'], site=f"{mode}_{b_id}").exists(): continue

                keywords = cfg.get("keywords", [])
                is_match = not keywords or any(k.lower() in (item['title'] + item['body']).lower() for k in keywords)

                if is_match:
                    if self.process_single_post(b_id, item, processor, mode, cfg):
                        used_urls_this_session.add(item['url'])
                        posted_successfully = True
                        success_count += 1
                        time.sleep(12) # サーバー負荷低減
                        break
            
            if not posted_successfully:
                self.log(f"⚠️ {b_id}: No matching content found.")

        self.log(f"🏁 Mission Accomplished: {success_count}/{len(all_blogs)} deployed.")

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

    def process_single_post(self, b_id, data, processor, mode, cfg):
        connection.close()
        self.log(f"🖋 AI Content Gen: [{b_id}]")
        raw_res = processor.generate_blog_content(data, cfg['persona'])
        if not raw_res: return False

        content_text = raw_res.get('cont_g', '')
        # AIタイトルの抽出
        title_match = re.search(r'\[TITLE\](.*?)\[/TITLE\]', content_text, re.DOTALL)
        gen_title = title_match.group(1).strip() if title_match else data['title']
        
        # AI本文の抽出
        body_match = re.search(r'\[BODY\](.*?)\[/BODY\]', content_text, re.DOTALL)
        clean_body = body_match.group(1).strip() if body_match else content_text

        # 🔍 デバッグ用ログ（司令官の要望通り、タイトル・URL・冒頭を表示）
        self.log("----------------------------------------------------")
        self.log(f"📡 BLOG_ID: {b_id}")
        self.log(f"🔗 ENDPOINT: {cfg['url']}")
        self.log(f"🏷️ AI_TITLE: {gen_title}")
        self.log(f"📝 BODY_PREVIEW: {clean_body[:150]}...")
        self.log("----------------------------------------------------")

        # HTML変換
        html_body = HTMLConverter.md_to_html(clean_body)
        
        # Tiperへの導線
        date_str = datetime.now().strftime('%Y%m%d')
        url_hash = hashlib.md5(data['url'].encode()).hexdigest()[:8]
        slug = f"{date_str}_{url_hash}"
        html_body += f'''<div class="tiper-cta" style="background:#000; color:#fff; border:2px solid #d4af37; padding:20px; border-radius:10px; margin-top:30px; text-align:center;"><p style="color:#d4af37; font-weight:bold;">⚜️ PREMIUM ACCESS ⚜️</p><a href="https://tiper.live/posts/{slug}/" target="_blank" style="background:#d4af37; color:#000; padding:10px 20px; text-decoration:none; font-weight:bold; border-radius:5px; display:inline-block; margin-top:10px;">▶ Tiper.Live で視聴する</a></div>'''

        # 投稿実行
        if mode == "livedoor":
            driver = LivedoorDriver(cfg)
        else:
            wp_payload = cfg.copy()
            wp_payload['password'] = wp_payload['app_password']
            driver = WordPressDriver(wp_payload)

        # 念のためタイトルから改行を除去
        safe_title = re.sub(r'[\r\n\t]', ' ', gen_title)[:95].strip()

        try:
            if driver.post(title=safe_title, body=html_body, image_url=data["img"], source_url=data['url']):
                Article.objects.update_or_create(
                    site=f"{mode}_{b_id}", 
                    source_url=data['url'], 
                    defaults={
                        'content_type': 'post', 
                        'title': safe_title, 
                        'body_text': clean_body, 
                        'main_image_url': data['img'], 
                        'is_exported': True
                    }
                )
                self.log(f"✅ DEPLOY SUCCESS: [{b_id.upper()}]")
                return True
        except Exception as e:
            self.log(f"❌ DEPLOY ERROR: [{b_id.upper()}] {str(e)}")
        return False