# -*- coding: utf-8 -*-
import os, re, random, requests, feedparser, time, hashlib, base64
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor, as_completed
from bs4 import BeautifulSoup
from django.core.management.base import BaseCommand
from django.db import connection

# モデルのインポート
from api.models.pc_products import PCProduct
from api.models.article import Article

# 専門ロジックファイルのインポート（絶対パス）
from api.management.commands.blog_drivers.hatena_driver import HatenaDriver
from api.management.commands.blog_drivers.livedoor_driver import LivedoorDriver
from api.management.commands.blog_drivers.seesaa_driver import SeesaaDriver
from api.management.commands.blog_drivers.blogger_driver import BloggerDriver
from api.management.commands.blog_drivers.data_mapper import ArticleMapper
from api.management.commands.blog_drivers.ai_processor import AIProcessor

class Command(BaseCommand):
    help = 'Gemma-3 ニュース自動投稿システム v9.0.2 (完全モジュール化版)'

    BLOG_CONFIGS = {
        'hatena': {'id': "bicstation", 'api_key': "se0o5znod6", 'url': "https://blog.hatena.ne.jp/bicstation/bicstation.hatenablog.com/atom/entry"},
        'livedoor': {'user': "pbic", 'api_key': "a4lnDJzzXU", 'url': "https://livedoor.blogcms.jp/atompub/pbic-bcorjo9q/article"},
        'seesaa': {'rpc_url': "https://blog.seesaa.jp/rpc", 'user': "bicstation@gmail.com", 'pw': "1492nabe", 'blog_id': "7242363"},
        'blogger': {'client_json_dir': 'bs_json'}
    }

    DRIVERS = {
        'hatena': HatenaDriver,
        'livedoor': LivedoorDriver,
        'seesaa': SeesaaDriver,
        'blogger': BloggerDriver
    }

    RSS_SOURCES = [
        "https://pc.watch.impress.co.jp/data/rss/1.0/pcw/feed.rdf",
        "https://rss.itmedia.co.jp/rss/2.0/pcuser.xml",
        "https://news.mynavi.jp/rss/digital/pc",
        "https://www.4gamer.net/rss/index.xml",
        "https://www.gizmodo.jp/index.xml"
    ]

    MD_OUTPUT_DIR = "/home/maya/dev/shin-vps/next-bicstation/content/posts"

    def log(self, msg, style_func=None):
        ts = datetime.now().strftime('%H:%M:%S.%f')[:-3]
        text = f"[{ts}] {msg}"
        if style_func:
            self.stdout.write(style_func(text))
        else:
            self.stdout.write(text)

    def add_arguments(self, parser):
        parser.add_argument('--limit', type=int, default=1, help='各媒体に投稿する記事数')
        parser.add_argument('--target', type=str, default='all', help='配信先')

    def handle(self, *args, **options):
        self.log("--- 🚀 Maya's Parallel System v9.0.2 ---", self.style.SUCCESS)
        
        current_dir = os.path.dirname(os.path.abspath(__file__))
        api_keys = [os.getenv(f"GEMINI_API_KEY_{i}").strip() for i in range(1, 11) if os.getenv(f"GEMINI_API_KEY_{i}")]

        if not api_keys:
            self.log("❌ GEMINI_API_KEY が不足しています", self.style.ERROR)
            return

        prompt_path = os.path.join(current_dir, "prompt", "ai_prompt_news.txt")
        if not os.path.exists(prompt_path):
            self.log(f"❌ プロンプトなし: {prompt_path}", self.style.ERROR)
            return
            
        with open(prompt_path, "r", encoding='utf-8') as f:
            template = f.read()

        targets = ['hatena', 'livedoor', 'seesaa', 'blogger'] if options['target'] == 'all' else [options['target']]
        all_entries = self.get_random_rss_pool()
        
        if not all_entries:
            self.log("⚠️ 投稿可能な新着記事がありません", self.style.WARNING)
            return

        tasks = []
        for _ in range(options['limit']):
            for b_type in targets:
                if not all_entries: break
                entry = all_entries.pop(random.randrange(len(all_entries)))
                tasks.append((b_type, entry, template, api_keys, current_dir))

        with ThreadPoolExecutor(max_workers=min(len(tasks), 4)) as executor:
            futures = [executor.submit(self.process_single_post, *task) for task in tasks]
            for future in as_completed(futures):
                try:
                    future.result()
                except Exception as e:
                    self.log(f"🔥 システム例外: {str(e)}", self.style.ERROR)

        self.log("--- 🏁 全タスク完了 ---", self.style.SUCCESS)

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
        # スレッドごとにDB接続を安全に終了
        connection.close()
        self.log(f"🧵 [{b_type.upper()}] 処理開始: {entry.title[:20]}...")
        
        # 1. スクレイピング
        data = self.scrape_article(entry)
        if not data: return

        # 2. AI生成 (AIProcessorに委譲)
        processor = AIProcessor(api_keys, template)
        ext = processor.generate_blog_content(data, b_type)
        if not ext:
            self.log(f"❌ [{b_type.upper()}] AI生成失敗", self.style.ERROR)
            return

        # 3. 投稿 (Driverに委譲)
        success_post = self.execute_blog_post(b_type, ext, data, current_dir)
        
        # 4. DB保存 (Mapperに委譲)
        success_db, _ = ArticleMapper.save_post_result(b_type, ext, data, success_post)
        
        # 5. 結果出力
        res_p = "⭕" if success_post else "❌"
        res_d = "⭕" if success_db else "❌"
        self.log(f"📊 [{b_type.upper()}] 完了 -> 投稿: {res_p} | DB保存: {res_d}")

        if success_post:
            self.save_as_markdown(ext, data)

    def execute_blog_post(self, b_type, ext, data, current_dir):
        DriverClass = self.DRIVERS.get(b_type)
        if not DriverClass: return False
        
        driver = DriverClass(self.BLOG_CONFIGS[b_type])
        
        title = ext['title_h'] if b_type == 'hatena' else ext['title_g']
        body = ext['cont_h'] if b_type == 'hatena' else ext['cont_g']
        
        try:
            prod = PCProduct.objects.filter(is_active=True).order_by('?').first()
            product_info = {'name': prod.name, 'price': prod.price, 'url': prod.url} if prod else None
        except: product_info = None

        kwargs = {'current_dir': current_dir} if b_type == 'blogger' else {}
        return driver.post(
            title=title, body=body, image_url=data['img'],
            source_url=data['url'], product_info=product_info,
            summary=ext['summary'], **kwargs
        )

    def scrape_article(self, entry):
        try:
            res = requests.get(entry.link, timeout=10, headers={'User-Agent': 'Mozilla/5.0'})
            res.encoding = res.apparent_encoding
            soup = BeautifulSoup(res.text, 'html.parser')
            og_img = soup.find("meta", property="og:image") or soup.find("meta", attrs={"name": "og:image"})
            return {
                'url': entry.link, 'title': entry.title, 
                'img': og_img["content"] if og_img else None, 
                'body': (soup.find('article') or soup.body).get_text(strip=True)[:4500]
            }
        except: return None

    def save_as_markdown(self, ext, data):
        try:
            os.makedirs(self.MD_OUTPUT_DIR, exist_ok=True)
            file_hash = hashlib.md5(data['url'].encode()).hexdigest()[:8]
            path = os.path.join(self.MD_OUTPUT_DIR, f"{datetime.now().strftime('%Y%m%d')}_{file_hash}.md")
            m = ArticleMapper.format_for_markdown(ext, data)
            md_content = f"---\ntitle: \"{m['title']}\"\ndate: \"{m['date']}\"\nimage: \"{m['image']}\"\nsource: \"{m['source']}\"\n---\n\n{m['content']}"
            with open(path, "w", encoding='utf-8') as f:
                f.write(md_content)
        except: pass