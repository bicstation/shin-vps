# -*- coding: utf-8 -*-
# /home/maya/shin-dev/shin-vps/django/api/management/commands/ai_post_pc_news.py
import os, re, random, requests, feedparser, time, hashlib, base64
from datetime import datetime
from bs4 import BeautifulSoup
from django.core.management.base import BaseCommand
from django.db import connection

# モデルとユーティリティ
from api.models.article import Article
from api.utils.html_utils import HTMLConverter

# 専門ロジック
from api.management.commands.blog_drivers.hatena_driver import HatenaDriver
from api.management.commands.blog_drivers.livedoor_driver import LivedoorDriver
from api.management.commands.blog_drivers.seesaa_driver import SeesaaDriver
from api.management.commands.blog_drivers.wordpress_driver import WordPressDriver
from api.management.commands.blog_drivers.data_mapper import ArticleMapper
from api.management.commands.blog_drivers.ai_processor import AIProcessor

class Command(BaseCommand):
    help = 'Gemini-3 BICSTATION v16.6：日本語タイトル生成強制＆投稿順ランダム化モデル'

    # --- 🚀 艦隊構成：WordPress + Livedoor + Seesaa ---
    BLOG_CONFIGS = {
        'wp_main': {'endpoint': "https://bicstation.com", 'user': "admin", 'app_password': "xxxx xxxx xxxx xxxx"},
        'seesaa': {'rpc_url': "https://blog.seesaa.jp/rpc", 'user': "bicstation@gmail.com", 'pw': "1492nabe", 'blog_id': "7242363"},
        'seesaa_ai': {'rpc_url': "https://blog.seesaa.jp/rpc", 'user': "bicstation@gmail.com", 'pw': "1492nabe", 'blog_id': "7242440"},
        'seesaa_game': {'rpc_url': "https://blog.seesaa.jp/rpc", 'user': "bicstation@gmail.com", 'pw': "1492nabe", 'blog_id': "7242441"},
        'seesaa_mobile': {'rpc_url': "https://blog.seesaa.jp/rpc", 'user': "bicstation@gmail.com", 'pw': "1492nabe", 'blog_id': "7242442"},
        'seesaa_work': {'rpc_url': "https://blog.seesaa.jp/rpc", 'user': "bicstation@gmail.com", 'pw': "1492nabe", 'blog_id': "7242443"},
        'ld_apple': {'user': "bicstation", 'api_key': "lmSZuzJO6O", 'url': "https://livedoor.blogcms.jp/atompub/bicstation/article"},
        'ld_asus': {'user': "bicstation", 'api_key': "lmSZuzJO6O", 'url': "https://livedoor.blogcms.jp/atompub/bicstation-rstaipkg/article"},
        'ld_msi': {'user': "bicstation", 'api_key': "lmSZuzJO6O", 'url': "https://livedoor.blogcms.jp/atompub/bicstation-1if6nwcy/article"},
        'ld_sony': {'user': "bicstation", 'api_key': "lmSZuzJO6O", 'url': "https://livedoor.blogcms.jp/atompub/bicstation-is61wtfe/article"},
        'ld_dell': {'user': "bicstation", 'api_key': "lmSZuzJO6O", 'url': "https://livedoor.blogcms.jp/atompub/bicstation-ufgtyxdn/article"},
        'ld_hp': {'user': "bicstation", 'api_key': "lmSZuzJO6O", 'url': "https://livedoor.blogcms.jp/atompub/bicstation-tiodrmio/article"},
        'ld_lenovo': {'user': "bicstation", 'api_key': "lmSZuzJO6O", 'url': "https://livedoor.blogcms.jp/atompub/bicstation-zbjz0l1a/article"},
        'ld_logicool': {'user': "bicstation", 'api_key': "lmSZuzJO6O", 'url': "https://livedoor.blogcms.jp/atompub/bicstation-tjicu3hv/article"},
        'ld_intel': {'user': "bicstation", 'api_key': "lmSZuzJO6O", 'url': "https://livedoor.blogcms.jp/atompub/bicstation-zftrmwub/article"},
        'ld_amd': {'user': "bicstation", 'api_key': "lmSZuzJO6O", 'url': "https://livedoor.blogcms.jp/atompub/bicstation-u5yjy0lt/article"},
    }

    DRIVERS = {
        'wp_main': WordPressDriver, 'livedoor': LivedoorDriver, 'seesaa': SeesaaDriver,
        'seesaa_ai': SeesaaDriver, 'seesaa_game': SeesaaDriver, 
        'seesaa_mobile': SeesaaDriver, 'seesaa_work': SeesaaDriver,
        'ld_apple': LivedoorDriver, 'ld_asus': LivedoorDriver, 'ld_msi': LivedoorDriver,
        'ld_sony': LivedoorDriver, 'ld_dell': LivedoorDriver, 'ld_hp': LivedoorDriver,
        'ld_lenovo': LivedoorDriver, 'ld_logicool': LivedoorDriver, 'ld_intel': LivedoorDriver,
        'ld_amd': LivedoorDriver
    }

    RSS_SOURCES = [
        "https://pc.watch.impress.co.jp/data/rss/1.0/pcw/feed.rdf",
        "https://rss.itmedia.co.jp/rss/2.0/pcuser.xml",
        "https://news.mynavi.jp/rss/digital/pc",
        "https://ascii.jp/rss.xml",
        "https://www.gizmodo.jp/index.xml",
        "https://www.theverge.com/rss/index.xml",
        "https://www.engadget.com/rss.xml",
    ]

    MD_OUTPUT_DIR = "/usr/src/app/next-bicstation/content/posts"

    def log(self, msg, style_func=None):
        ts = datetime.now().strftime('%H:%M:%S')
        text = f"[{ts}] {msg}"
        if style_func: self.stdout.write(style_func(text))
        else: self.stdout.write(text)

    def handle(self, *args, **options):
        self.log("--- 🚀 BICSTATION Multi-Fleet Full-Auto v16.6 ---", self.style.SUCCESS)
        current_dir = os.path.dirname(os.path.abspath(__file__))
        api_keys = [os.getenv(f"GEMINI_API_KEY_{i}").strip() for i in range(1, 11) if os.getenv(f"GEMINI_API_KEY_{i}")]
        
        prompt_path = os.path.join(current_dir, "prompt", "ai_prompt_news.txt")
        with open(prompt_path, "r", encoding='utf-8') as f: template = f.read()

        # 1. RSSプール取得
        all_entries = self.get_random_rss_pool()
        random.shuffle(all_entries)
        
        if not all_entries: 
            self.log("🏁 新着記事はありません。")
            return

        # 2. ブログごとに1記事配給（ルーティング）
        assigned_tasks = {}
        used_links = set()

        for b_type in self.BLOG_CONFIGS.keys():
            for entry in all_entries:
                if entry.link in used_links: continue
                if self.auto_route_all(entry) == b_type:
                    assigned_tasks[b_type] = entry
                    used_links.add(entry.link)
                    break 

        # 3. 投稿順序のランダム化（Seesaa連続攻撃を回避）
        task_list = list(assigned_tasks.items())
        random.shuffle(task_list)

        self.log(f"📡 稼働ブログ数: {len(task_list)} サイトへ配給を開始します...")

        # 4. 逐次実行
        for b_type, entry in task_list:
            try: 
                success = self.process_single_post(b_type, entry, template, api_keys, current_dir)
                
                if not success:
                    self.log(f"⚠️ [{b_type.upper()}] スキップ。次回または別のブログへ持ち越します。")
                    continue
                
                # 投稿間のインターバル（制限回避のため45秒に設定）
                time.sleep(45) 
            except Exception as e: 
                self.log(f"🔥 [{b_type.upper()}] 処理異常: {str(e)}", self.style.ERROR)

    def auto_route_all(self, entry):
        text = (entry.title + (entry.summary if hasattr(entry, 'summary') else "")).lower()
        # WP優先条件
        if any(k in text for k in ['新型', 'レビュー', 'ベンチマーク', 'リーク']): return 'wp_main'
        
        mapping = {
            'ld_apple': ['apple', 'macbook', 'ipad', 'iphone'],
            'ld_asus': ['asus', 'rog', 'zenbook'],
            'ld_msi': ['msi', 'stealth', 'claw'],
            'ld_sony': ['sony', 'playstation', 'ps5', 'xperia'],
            'ld_dell': ['dell', 'alienware'],
            'ld_hp': ['hp', 'omen'],
            'ld_lenovo': ['lenovo', 'thinkpad'],
            'ld_logicool': ['logicool', 'logitech', 'razer'],
            'ld_intel': ['intel', 'nvidia', 'geforce', 'rtx'],
            'ld_amd': ['amd', 'ryzen', 'radeon'],
        }
        for target, keys in mapping.items():
            if any(k in text for k in keys): return target
        if any(k in text for k in ['ai', 'chatgpt']): return 'seesaa_ai'
        if any(k in text for k in ['game', 'steam']): return 'seesaa_game'
        if any(k in text for k in ['スマホ', 'android']): return 'seesaa_mobile'
        if any(k in text for k in ['自作', 'pcパーツ']): return 'seesaa_work'
        return 'seesaa'

    def get_random_rss_pool(self):
        pool = []
        for url in self.RSS_SOURCES:
            try:
                res = requests.get(url, timeout=10)
                feed = feedparser.parse(res.text)
                for e in feed.entries:
                    if not Article.objects.filter(source_url=e.link).exists(): 
                        pool.append(e)
            except: continue
        return pool

    def process_single_post(self, b_type, entry, template, api_keys, current_dir):
        connection.close()
        self.log(f"🧵 [{b_type.upper()}] 処理中: {entry.title[:30]}...")
        
        data = self.scrape_article(entry)
        if not data: return False
        
        processor = AIProcessor(api_keys, template)
        ext = processor.generate_blog_content(data, b_type)
        if not ext: return False
        
        # --- 🚨 修正：日本語タイトル厳格チェック 🚨 ---
        title = ext.get('title_g', '').strip()
        # ひらがな・カタカナ・漢字のいずれも含まれていない（＝英語/記号のみ）場合はボツ
        if not re.search(r'[ぁ-んァ-ヶー一-龠]', title):
            self.log(f"🚫 タイトルが非日本語のため破棄: {title}")
            return False

        title = title.replace('\n', '').strip()
        raw_body = ext.get('cont_h') if b_type == 'hatena' else ext.get('cont_g')
        ext['html_body'] = HTMLConverter.md_to_html(raw_body)
        
        # 投稿実行
        success_post = self.execute_blog_post(b_type, title, ext['html_body'], data)
        
        if success_post:
            ArticleMapper.save_post_result(b_type, ext, data, True)
            self.save_as_markdown(ext, data)
            self.log(f"📊 [{b_type.upper()}] ✅ 成功")
            return True
        return False

    def execute_blog_post(self, b_type, title, html_body, data):
        DriverClass = self.DRIVERS.get(b_type)
        if not DriverClass: return False
        driver = DriverClass(self.BLOG_CONFIGS.get(b_type))
        
        brand_name = "最新PC・ガジェット"
        body = html_body + f'<hr><div style="text-align:center;"><p>🚀 <b>{brand_name}</b> の最新情報をBICSTATIONでチェック！</p><a href="https://bicstation.com">公式サイトはこちら</a></div>'

        try:
            return driver.post(title=title, body=body, image_url=data['img'], source_url=data['url'])
        except Exception as e:
            self.log(f"❌ {b_type.upper()}投稿エラー: {str(e)}")
            return False

    def scrape_article(self, entry):
        try:
            headers = {'User-Agent': 'Mozilla/5.0'}
            res = requests.get(entry.link, timeout=10, headers=headers)
            res.encoding = res.apparent_encoding
            soup = BeautifulSoup(res.text, 'html.parser')
            og_img = soup.find("meta", property="og:image") or soup.find("meta", attrs={"name": "og:image"})
            content_area = soup.find('article') or soup.find('main') or soup.body
            return {'url': entry.link, 'title': entry.title, 'img': og_img["content"] if og_img else "", 'body': content_area.get_text(strip=True)[:5000]}
        except: return None

    def save_as_markdown(self, ext, data):
        try:
            if not os.path.exists(self.MD_OUTPUT_DIR): os.makedirs(self.MD_OUTPUT_DIR, exist_ok=True)
            file_hash = hashlib.md5(data['url'].encode()).hexdigest()[:8]
            path = os.path.join(self.MD_OUTPUT_DIR, f"{datetime.now().strftime('%Y%m%d')}_{file_hash}.md")
            m = ArticleMapper.format_for_markdown(ext, data)
            md_content = f'---\ntitle: "{m["title"]}"\ndate: "{datetime.now().strftime("%Y-%m-%d")}"\ncategory: "News"\nimage: "{m["image"]}"\nsource_url: "{m["source"]}"\n---\n\n{m["content"]}\n'
            with open(path, "w", encoding='utf-8') as f: f.write(md_content)
        except: pass