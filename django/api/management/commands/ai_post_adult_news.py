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
    help = 'BICSTATION Adult Fleet v21.0: RSS Package-Targeting & Image-Duplication Fix'

    LD_API_KEY_PBIC = "lNh8lSooOq"
    LD_API_KEY_ADULT = "dPCZ3nAKf1"
    LD_USER_PBIC = "pbic"
    LD_USER_ADULT = "pbic_adult"

    # --- 🏘 22サイト設定 (完全版) ---
    BLOG_CONFIGS = {
        "tiper": {"name": "Tiper.Live", "user": LD_USER_PBIC, "api_key": LD_API_KEY_PBIC, "url": "https://livedoor.blogcms.jp/atompub/pbic/article", "keywords": [], "persona": "総合ポータル：扇情的かつ網羅的レビュー"},
        "reserve": {"name": "先行予約", "user": LD_USER_PBIC, "api_key": LD_API_KEY_PBIC, "url": "https://livedoor.blogcms.jp/atompub/pbic-br9qoupv/article", "keywords": ["予約", "先行", "解禁", "最新作", "告知", "速報", "予定", "サンプル"], "persona": "先行予約：速報スタイル"},
        "jukujo": {"name": "熟女・人妻", "user": LD_USER_PBIC, "api_key": LD_API_KEY_PBIC, "url": "https://livedoor.blogcms.jp/atompub/pbic-eaenvfmg/article", "keywords": ["熟女", "人妻", "不倫", "母", "未亡人", "女将", "奥様", "背徳", "マダム"], "persona": "熟女人妻：背徳官能描写"},
        "vr": {"name": "VR快楽", "user": LD_USER_PBIC, "api_key": LD_API_KEY_PBIC, "url": "https://livedoor.blogcms.jp/atompub/pbic-7vu6rapd/article", "keywords": ["VR", "360", "パノラマ", "バーチャル", "没入", "立体", "目の前", "ゼロ距離", "ヘッドセット"], "persona": "VR：没入体験型レビュー"},
        "idol": {"name": "美少女", "user": LD_USER_PBIC, "api_key": LD_API_KEY_PBIC, "url": "https://livedoor.blogcms.jp/atompub/pbic-ldp7wpxx/article", "keywords": ["新人", "美少女", "デビュー", "透明感", "アイドル", "専属", "清楚", "可憐"], "persona": "美少女：アイドルオタク的推薦"},
        "ntr": {"name": "NTR・不倫", "user": LD_USER_PBIC, "api_key": LD_API_KEY_PBIC, "url": "https://livedoor.blogcms.jp/atompub/pbic-xem23smb/article", "keywords": ["NTR", "不倫", "寝取られ", "浮気", "略奪", "間男", "略奪愛", "浮気相手"], "persona": "NTR：泥沼背徳スタイル"},
        "fetish": {"name": "フェチ・巨乳", "user": LD_USER_PBIC, "api_key": LD_API_KEY_PBIC, "url": "https://livedoor.blogcms.jp/atompub/pbic-txjhpcdr/article", "keywords": ["巨乳", "フェチ", "爆乳", "美脚", "足コキ", "お尻", "尻", "美尻", "衣装", "制服"], "persona": "フェチ：偏執的執着"},
        "wiki": {"name": "名作まとめ", "user": LD_USER_PBIC, "api_key": LD_API_KEY_PBIC, "url": "https://livedoor.blogcms.jp/atompub/pbic-ihotsur8/article", "keywords": ["神作", "まとめ", "決定版", "完全収録", "ベスト", "BEST", "大賞", "伝説", "最高傑作", "総集編"], "persona": "名作：学術的エロ解説"},
        "nakadashi": {"name": "中出し", "user": LD_USER_PBIC, "api_key": LD_API_KEY_PBIC, "url": "https://livedoor.blogcms.jp/atompub/pbic-znfejpqv/article", "keywords": ["中出し", "生ハメ", "種付け", "本番", "避妊なし", "大量噴射", "絶倫", "孕ませ"], "persona": "中出し：本能的興奮重視"},
        "amateur": {"name": "素人", "user": LD_USER_PBIC, "api_key": LD_API_KEY_PBIC, "url": "https://livedoor.blogcms.jp/atompub/pbic-7zjsg4zw/article", "keywords": ["素人", "18", "投稿", "ナンパ", "ハメ撮り", "自画撮り", "流出", "恥じらい", "一般人"], "persona": "素人：日常に潜む淫らさ"},
        "virgin": {"name": "処女・初体験", "user": LD_USER_ADULT, "api_key": LD_API_KEY_ADULT, "url": "https://livedoor.blogcms.jp/atompub/pbic_adult-4coewush/article", "keywords": ["処女", "初撮り", "未経験", "初めて", "処女喪失", "純潔", "羞恥", "初体験"], "persona": "処女：純潔汚染と羞恥"},
        "jk": {"name": "現役女子校生", "user": LD_USER_ADULT, "api_key": LD_API_KEY_ADULT, "url": "https://livedoor.blogcms.jp/atompub/pbic_adult-sxfhya5c/article", "keywords": ["JK", "女子高生", "現役", "制服", "放課後", "校内", "体育倉庫", "女子校", "スク水"], "persona": "JK：制服の背徳"},
        "jd": {"name": "現役女子大生", "user": LD_USER_ADULT, "api_key": LD_API_KEY_ADULT, "url": "https://livedoor.blogcms.jp/atompub/pbic_adult-gkkd2nd3/article", "keywords": ["女子大生", "JD", "キャンパス", "サークル", "合コン", "女子寮", "アルバイト", "二十歳"], "persona": "JD：女子大生の夜の顔"},
        "enkou": {"name": "パパ活・秘密の放課後", "user": LD_USER_ADULT, "api_key": LD_API_KEY_ADULT, "url": "https://livedoor.blogcms.jp/atompub/pbic_adult-paacv98o/article", "keywords": ["パパ活", "援交", "援助交際", "小遣い", "ホテル街", "割り切り", "即日", "密会", "パパ"], "persona": "パパ活：金銭の取引リアル"},
        "wakazuma": {"name": "新婚若妻", "user": LD_USER_ADULT, "api_key": LD_API_KEY_ADULT, "url": "https://livedoor.blogcms.jp/atompub/pbic_adult-4iwnt1oa/article", "keywords": ["若妻", "新婚", "主婦", "旦那の留守", "アパート", "エプロン", "欲求不満"], "persona": "若妻：新妻の不実な蜜"},
        "nurse": {"name": "白衣の天使・ナース", "user": LD_USER_ADULT, "api_key": LD_API_KEY_ADULT, "url": "https://livedoor.blogcms.jp/atompub/pbic_adult-ykt0g9cd/article", "keywords": ["ナース", "看護師", "白衣", "入院", "診察", "病院", "夜勤", "奉仕", "医療"], "persona": "ナース：診察室の禁断処置"},
        "ol": {"name": "背徳OL・女上司", "user": LD_USER_ADULT, "api_key": LD_API_KEY_ADULT, "url": "https://livedoor.blogcms.jp/atompub/pbic_adult/article", "keywords": ["OL", "女上司", "オフィス", "事務", "秘書", "会議室", "残業", "出張", "タイトスカート"], "persona": "OL：オフィスで理性が崩れる美学"},
        "chijo": {"name": "痴女・野外露出", "user": LD_USER_ADULT, "api_key": LD_API_KEY_ADULT, "url": "https://livedoor.blogcms.jp/atompub/pbic_adult-ozx42sxy/article", "keywords": ["痴女", "露出", "野外", "公園", "電車", "車内", "自意義", "ノーパン", "公然"], "persona": "痴女：見られる快感の煽り"},
        "gal": {"name": "爆乳ギャル名鑑", "user": LD_USER_ADULT, "api_key": LD_API_KEY_ADULT, "url": "https://livedoor.blogcms.jp/atompub/pbic_adult-m2cd5bcm/article", "keywords": ["ギャル", "黒ギャル", "金髪", "日サロ", "派手", "爆乳", "厚化粧", "egg"], "persona": "ギャル：淫らな快楽主義"},
        "slender": {"name": "極薄・スレンダー", "user": LD_USER_ADULT, "api_key": LD_API_KEY_ADULT, "url": "https://livedoor.blogcms.jp/atompub/pbic_adult-ij5rw5os/article", "keywords": ["スレンダー", "貧乳", "美脚", "細身", "モデル体型", "極細", "小尻", "微乳", "ぺたんこ"], "persona": "スレンダー：極薄肉体のフェティシズム"},
    }

    WP_CONFIGS = {
        "wp_a": {"name": "WP A", "url": "https://blog.bic-erog.com/xmlrpc.php", "user": "bicstation", "app_password": "a0H2 McUX 3XK6 apzh JZ82 SzTm", "keywords": ["解禁", "先行", "独占", "速報", "最新作", "デビュー", "新人", "美少女", "話題", "ランキング"], "persona": "SEO重視のストレートなニュース記事"},
        "wp_b": {"name": "WP B", "url": "https://blog.adult-search.xyz/xmlrpc.php", "user": "bicstation", "app_password": "OBlD Yz2v lR8F wswY zwaW cF43", "keywords": ["ガチ", "本番", "中出し", "ハメ撮り", "マニアック", "専門", "徹底解剖", "濃密", "狂騒"], "persona": "コア層向けのマニアックで濃密なレビュー"}
    }

    RSS_SOURCES = [
        "https://www.dmm.co.jp/mono/dvd/-/list/=/rss=create/sort=p_date/",
        "https://www.dmm.co.jp/digital/videoa/-/list/=/rss=create/sort=p_date/",
        "https://www.dmm.co.jp/rental/-/list/=/rss=create/sort=date/",
        "https://www.dmm.co.jp/digital/videoa/-/list/=/article=vr/rss=create/sort=p_date/",
    ]

    def add_arguments(self, parser):
        parser.add_argument('--target', type=str, default='all', help='Target blog ID')

    def log(self, msg, style_func=None):
        ts = datetime.now().strftime('%H:%M:%S')
        text = f"[{ts}] {msg}"
        if style_func: self.stdout.write(style_func(text))
        else: self.stdout.write(text)

    def handle(self, *args, **options):
        target_id = options['target']
        self.log("====================================================")
        self.log(f"🔥 BICSTATION Adult Fleet v21.0 - IMAGE ENGINE FIXED")
        self.log("====================================================")
        
        rss_pool = self.get_raw_rss_pool()
        if not rss_pool: return
        
        all_blogs = []
        for b_id, cfg in self.BLOG_CONFIGS.items(): all_blogs.append((b_id, "livedoor", cfg))
        for b_id, cfg in self.WP_CONFIGS.items(): all_blogs.append((b_id, "wordpress", cfg))
        
        if target_id != 'all':
            all_blogs = [b for b in all_blogs if b[0] == target_id]

        api_keys = [os.getenv(f"GEMINI_API_KEY_{i}").strip() for i in range(1, 11) if os.getenv(f"GEMINI_API_KEY_{i}")]
        prompt_path = os.path.join(os.path.dirname(__file__), "prompt", "ai_prompt_adult.txt")
        with open(prompt_path, "r", encoding='utf-8') as f: template = f.read()
        processor = AIProcessor(api_keys, template)

        posted_count = {b[0]: 0 for b in all_blogs}
        
        for item in rss_pool:
            self.log(f"💠 Analyzing: {item['title'][:30]}...")
            for b_id, mode, cfg in all_blogs:
                if posted_count[b_id] >= 1: continue
                site_id = f"{mode}_{b_id}"
                if Article.objects.filter(source_url=item['url'], site=site_id).exists(): continue

                keywords = cfg.get("keywords", [])
                is_match = not keywords or any(k.lower() in (item['title'] + item['body']).lower() for k in keywords)

                if is_match:
                    if self.process_single_post(b_id, item, processor, mode, cfg):
                        posted_count[b_id] += 1
                        time.sleep(15)

            if all(count >= 1 for count in posted_count.values()): break

    def get_raw_rss_pool(self):
        pool = []
        seen_urls = set()
        for url in self.RSS_SOURCES:
            try:
                res = requests.get(url, headers={'User-Agent': 'Mozilla/5.0'}, timeout=20)
                feed = feedparser.parse(res.text)
                for e in feed.entries:
                    if e.link not in seen_urls:
                        pool.append(self.parse_item(e))
                        seen_urls.add(e.link)
            except Exception as ex: self.log(f"⚠️ RSSエラー: {str(ex)}")
        return pool

    def parse_item(self, entry):
        # 🚨 [100%確定] <package>タグからURLを直接抜き出す
        raw_img_url = ""
        if hasattr(entry, 'package'):
            raw_img_url = entry.package
        else:
            # 万が一packageタグがない場合はcontentから抽出
            content = entry.content[0].value if hasattr(entry, 'content') else getattr(entry, "summary", "")
            img_match = re.search(r'src="(.*?)"', content)
            if img_match: raw_img_url = img_match.group(1)

        # 🚨 [100%確定] pt.jpg を pl.jpg に置換し最大化
        img_url = re.sub(r'(p[s|r|t]|p)\.jpg$', 'pl.jpg', raw_img_url)

        # 🚨 [100%確定] 重複排除のため本文から<img>を物理的に除去
        raw_content = entry.content[0].value if hasattr(entry, 'content') else getattr(entry, "summary", "")
        soup = BeautifulSoup(raw_content, 'html.parser')
        for img in soup.find_all('img'):
            img.decompose() # 本文内のimgタグを完全に消去
        
        body_text = soup.get_text().strip()

        return {
            'url': entry.link, 
            'title': entry.title, 
            'img': img_url, 
            'body': body_text[:800]
        }

    def process_single_post(self, b_id, data, processor, mode, cfg):
        connection.close()
        self.log(f"🖋 AI Generate [{b_id}]...")
        
        raw_res = processor.generate_blog_content(data, cfg['persona'])
        if not raw_res: return False

        content_text = raw_res.get('cont_g', '')
        title_match = re.search(r'\[TITLE\](.*?)\[/TITLE\]', content_text, re.DOTALL)
        gen_title = title_match.group(1).strip() if title_match else data['title']
        body_match = re.search(r'\[BODY\](.*?)\[/BODY\]', content_text, re.DOTALL)
        clean_body = body_match.group(1).strip() if body_match else content_text

        # 🚨 画像はDriverに任せ、本文は純粋な記事のみにする
        html_body = HTMLConverter.md_to_html(clean_body)

        slug = f"{datetime.now().strftime('%Y%m%d')}_{hashlib.md5(data['url'].encode()).hexdigest()[:8]}"
        html_body += f'''
            <div class="tiper-cta" style="background:#000; color:#fff; border:2px solid #d4af37; padding:20px; border-radius:10px; margin-top:30px; text-align:center;">
                <p style="color:#d4af37; font-weight:bold;">⚜️ PREMIUM ACCESS ⚜️</p>
                <a href="https://tiper.live/posts/{slug}/" target="_blank" style="background:#d4af37; color:#000; padding:10px 20px; text-decoration:none; font-weight:bold; border-radius:5px; display:inline-block; margin-top:10px;">▶ Tiper.Live で視聴する</a>
            </div>
        '''

        if mode == "livedoor":
            driver = LivedoorDriver(cfg)
        else:
            wp_payload = cfg.copy()
            if 'app_password' in wp_payload: wp_payload['password'] = wp_payload['app_password']
            driver = WordPressDriver(wp_payload)

        safe_title = re.sub(r'[\r\n\t]', ' ', gen_title)[:95].strip()

        try:
            # 🚨 修正された pl.jpg のURLを渡すことで、Driver側が本文トップに大きく配置します
            if driver.post(title=safe_title, body=html_body, image_url=data["img"], source_url=data['url']):
                Article.objects.update_or_create(
                    site=f"{mode}_{b_id}", source_url=data['url'],
                    defaults={
                        'content_type': 'post', 'title': safe_title,
                        'body_text': clean_body, 'main_image_url': data['img'], 'is_exported': True
                    }
                )
                self.log(f"✅ DEPLOY SUCCESS: [{b_id.upper()}]")
                return True
        except Exception as e:
            self.log(f"❌ DEPLOY ERROR: [{b_id.upper()}] {str(e)}", self.style.ERROR)
        return False