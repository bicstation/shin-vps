# -*- coding: utf-8 -*-
# /home/maya/shin-dev/shin-vps/django/api/management/commands/ai_post_pc_news.py
import os, re, random, requests, feedparser, time, hashlib, base64
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor, as_completed
from bs4 import BeautifulSoup
from django.core.management.base import BaseCommand
from django.db import connection

# モデルとユーティリティのインポート
from api.models.pc_products import PCProduct
from api.models.article import Article
from api.utils.html_utils import HTMLConverter

# 専門ロジックファイルのインポート
from api.management.commands.blog_drivers.hatena_driver import HatenaDriver
from api.management.commands.blog_drivers.livedoor_driver import LivedoorDriver
from api.management.commands.blog_drivers.seesaa_driver import SeesaaDriver
from api.management.commands.blog_drivers.blogger_driver import BloggerDriver
from api.management.commands.blog_drivers.data_mapper import ArticleMapper
from api.management.commands.blog_drivers.ai_processor import AIProcessor

class Command(BaseCommand):
    help = 'Gemini-3 BICSTATION 5連装マルチブログ投稿システム v10.4.1 (Stability & Image Fix)'

    BLOG_CONFIGS = {
        'hatena': {'id': "bicstation", 'api_key': "se0o5znod6", 'url': "https://blog.hatena.ne.jp/bicstation/bicstation.hatenablog.com/atom/entry"},
        'livedoor': {'user': "pbic", 'api_key': "lNh8lSooOq", 'url': "https://livedoor.blogcms.jp/atompub/pbic-bcorjo9q/article"},
        'blogger': {'client_json_dir': 'bs_json'},
        'seesaa': {'rpc_url': "https://blog.seesaa.jp/rpc", 'user': "bicstation@gmail.com", 'pw': "1492nabe", 'blog_id': "7242363"},
        'seesaa_ai': {'rpc_url': "https://blog.seesaa.jp/rpc", 'user': "bicstation@gmail.com", 'pw': "1492nabe", 'blog_id': "7242440"},
        'seesaa_game': {'rpc_url': "https://blog.seesaa.jp/rpc", 'user': "bicstation@gmail.com", 'pw': "1492nabe", 'blog_id': "7242441"},
        'seesaa_mobile': {'rpc_url': "https://blog.seesaa.jp/rpc", 'user': "bicstation@gmail.com", 'pw': "1492nabe", 'blog_id': "7242442"},
        'seesaa_work': {'rpc_url': "https://blog.seesaa.jp/rpc", 'user': "bicstation@gmail.com", 'pw': "1492nabe", 'blog_id': "7242443"}
    }

    DRIVERS = {
        'hatena': HatenaDriver, 'livedoor': LivedoorDriver, 'seesaa': SeesaaDriver,
        'seesaa_ai': SeesaaDriver, 'seesaa_game': SeesaaDriver, 
        'seesaa_mobile': SeesaaDriver, 'seesaa_work': SeesaaDriver, 'blogger': BloggerDriver
    }

    RSS_SOURCES = [
        "https://pc.watch.impress.co.jp/data/rss/1.0/pcw/feed.rdf",
        "https://rss.itmedia.co.jp/rss/2.0/pcuser.xml",
        "https://news.mynavi.jp/rss/digital/pc",
        "https://www.4gamer.net/rss/index.xml",
        "https://www.gizmodo.jp/index.xml"
    ]

    MD_OUTPUT_DIR = "/usr/src/app/next-bicstation/content/posts"

    def log(self, msg, style_func=None):
        ts = datetime.now().strftime('%H:%M:%S.%f')[:-3]
        text = f"[{ts}] {msg}"
        if style_func: self.stdout.write(style_func(text))
        else: self.stdout.write(text)

    def add_arguments(self, parser):
        parser.add_argument('--limit', type=int, default=1)
        parser.add_argument('--target', type=str, default='all')

    def handle(self, *args, **options):
        self.log("--- 🚀 BICSTATION Multi-Blog System v10.4.1 ---", self.style.SUCCESS)
        current_dir = os.path.dirname(os.path.abspath(__file__))
        api_keys = [os.getenv(f"GEMINI_API_KEY_{i}").strip() for i in range(1, 11) if os.getenv(f"GEMINI_API_KEY_{i}")]
        if not api_keys: 
            self.log("❌ APIキーが見つかりません。", self.style.ERROR)
            return

        prompt_path = os.path.join(current_dir, "prompt", "ai_prompt_news.txt")
        with open(prompt_path, "r", encoding='utf-8') as f: template = f.read()

        targets = list(self.BLOG_CONFIGS.keys()) if options['target'] == 'all' else [options['target']]
        all_entries = self.get_random_rss_pool()
        if not all_entries: 
            self.log("⚠️ 投稿可能な新しい記事がありませんでした。")
            return

        tasks = []
        for _ in range(options['limit']):
            for b_type in targets:
                if not all_entries: break
                entry = all_entries.pop(random.randrange(len(all_entries)))
                selected_target = self.auto_route_seesaa(entry, b_type)
                tasks.append((selected_target, entry, template, api_keys, current_dir))

        # Seesaaの 'many access' 回避のため、並列実行数を2に制限（安全策）
        max_workers = 1 if 'seesaa' in options['target'] else 2
        with ThreadPoolExecutor(max_workers=max_workers) as executor:
            futures = [executor.submit(self.process_single_post, *task) for task in tasks]
            for future in as_completed(futures):
                try: future.result()
                except Exception as e: self.log(f"🔥 システム例外: {str(e)}", self.style.ERROR)

    def auto_route_seesaa(self, entry, b_type):
        if not b_type.startswith('seesaa'): return b_type
        text = (entry.title + entry.summary).lower()
        if any(k in text for k in ['ai', 'chatgpt', 'gemini', 'nvidia', 'npu']): return 'seesaa_ai'
        if any(k in text for k in ['game', 'steam', 'rtx', 'ゲーミング', 'fps', 'ps5']): return 'seesaa_game'
        if any(k in text for k in ['スマホ', 'iphone', 'android', 'モバイル', '軽量', '携帯']): return 'seesaa_mobile'
        if any(k in text for k in ['仕事', '法人', 'ワークステーション', '自作', 'cpu', 'メモリ']): return 'seesaa_work'
        return 'seesaa'

    def get_random_rss_pool(self):
        pool = []
        for url in self.RSS_SOURCES:
            try:
                res = requests.get(url, timeout=10)
                feed = feedparser.parse(res.text)
                for e in feed.entries:
                    if not Article.objects.filter(source_url=e.link).exists(): pool.append(e)
            except: continue
        return pool

    def process_single_post(self, b_type, entry, template, api_keys, current_dir):
        connection.close()
        self.log(f"🧵 [{b_type.upper()}] 処理中: {entry.title[:20]}...")
        data = self.scrape_article(entry)
        if not data: return
        
        processor = AIProcessor(api_keys, template)
        ext = processor.generate_blog_content(data, b_type)
        if not ext: return
        
        # HTMLConverterを使ってMarkdownをHTMLに一括変換
        raw_body = ext.get('cont_h') if b_type == 'hatena' else ext.get('cont_g')
        ext['html_body'] = HTMLConverter.md_to_html(raw_body)
        
        success_post = self.execute_blog_post(b_type, ext, data, current_dir)
        success_db, _ = ArticleMapper.save_post_result(b_type, ext, data, success_post)
        if success_db: self.save_as_markdown(ext, data)
        self.log(f"📊 [{b_type.upper()}] 完了: {'⭕' if success_post else '❌'}")

    def execute_blog_post(self, b_type, ext, data, current_dir):
        DriverClass = self.DRIVERS.get(b_type)
        if not DriverClass: return False
        driver = DriverClass(self.BLOG_CONFIGS.get(b_type))
        
        title = ext.get('title_h') if b_type == 'hatena' else ext.get('title_g')
        if not title: title = data['title']

        # --- 🚀 アイキャッチ認識率を100%にするための画像配置 ---
        eye_catch_html = ""
        if data.get('img'):
            eye_catch_html = f'<div class="eye-catch" style="text-align:center; margin-bottom:30px;">' \
                             f'<img src="{data["img"]}" alt="{title}" style="max-width:100%; height:auto; border-radius:8px;">' \
                             f'</div>'
        
        body = eye_catch_html + ext.get('html_body', '')

        # --- 🚀 CTA情報の設定: BICSTATION公式サイト ---
        product_info = {
            'name': "BICSTATION 公式オンラインストア",
            'price': "最新のPCパーツ・周辺機器をチェック",
            'url': "https://bicstation.com",
            'cta_text': "公式サイトで詳細を見る"
        }

        cta_html = f"""
        <hr style="border:0; border-top:1px solid #eee; margin:40px 0;">
        <div style="padding:20px; border:2px solid #2c3e50; border-radius:10px; background:#f9f9f9; text-align:center;">
            <p style="font-weight:bold; font-size:1.1em; color:#2c3e50; margin-bottom:10px;">🚀 BICSTATION おすすめ情報</p>
            <p style="margin-bottom:15px; color:#555;">最新のガジェットやPCパーツを最安値圏で提供中！</p>
            <a href="{product_info['url']}" style="display:inline-block; padding:12px 25px; background:#2c3e50; color:white; text-decoration:none; border-radius:5px; font-weight:bold;">{product_info['name']} を訪れる</a>
        </div>
        """
        body += cta_html

        post_args = {
            'title': title,
            'body': body,
            'image_url': data['img'],
            'source_url': data['url'],
            'product_info': product_info,
            'summary': ext.get('summary', '')
        }
        
        if b_type == 'blogger':
            post_args['current_dir'] = current_dir

        try:
            return driver.post(**post_args)
        except Exception as e:
            self.log(f"⚠️ [{b_type.upper()}] 投稿例外: {str(e)}")
            return False

    def scrape_article(self, entry):
        try:
            headers = {'User-Agent': 'Mozilla/5.0'}
            res = requests.get(entry.link, timeout=10, headers=headers)
            res.encoding = res.apparent_encoding
            soup = BeautifulSoup(res.text, 'html.parser')
            og_img = soup.find("meta", property="og:image") or soup.find("meta", attrs={"name": "og:image"})
            return {'url': entry.link, 'title': entry.title, 'img': og_img["content"] if og_img else "", 'body': (soup.find('article') or soup.body).get_text(strip=True)[:4500]}
        except: return None

    def save_as_markdown(self, ext, data):
        try:
            if not os.path.exists(self.MD_OUTPUT_DIR): os.makedirs(self.MD_OUTPUT_DIR, exist_ok=True)
            file_hash = hashlib.md5(data['url'].encode()).hexdigest()[:8]
            path = os.path.join(self.MD_OUTPUT_DIR, f"{datetime.now().strftime('%Y%m%d')}_{file_hash}.md")
            m = ArticleMapper.format_for_markdown(ext, data)
            md_content = f'---\ntitle: "{m["title"].replace(chr(34), chr(92)+chr(34))}"\ndate: "{datetime.now().strftime("%Y-%m-%d")}"\ncategory: "ニュース"\nimage: "{m["image"]}"\nsource_url: "{m["source"]}"\n---\n\n{m["content"]}\n'
            with open(path, "w", encoding='utf-8') as f: f.write(md_content)
            os.chmod(path, 0o666)
        except: pass