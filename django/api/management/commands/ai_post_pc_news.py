# -*- coding: utf-8 -*-
import os, re, random, requests, feedparser, time, csv
from datetime import datetime
from bs4 import BeautifulSoup
from django.core.management.base import BaseCommand
from django.db import connection

from api.models.article import Article
from api.utils.html_utils import HTMLConverter
from api.management.commands.blog_drivers.hatena_driver import HatenaDriver
from api.management.commands.blog_drivers.livedoor_driver import LivedoorDriver
from api.management.commands.blog_drivers.blogger_driver import BloggerDriver
from api.management.commands.blog_drivers.data_mapper import ArticleMapper
from api.management.commands.blog_drivers.ai_processor import AIProcessor

class Command(BaseCommand):
    help = 'Gemini-3 BICSTATION v31.0: Universal Multi-Fleet Engine (Path-Fixed)'

    def add_arguments(self, parser):
        # プロジェクト名を受け取る（pc, saving など）
        parser.add_argument('--project', type=str, default='pc', help='Project name')

    def handle(self, *args, **options):
        project = options['project']
        self.log(f"--- 🚀 BICSTATION Universal Engine v31.0 [{project.upper()}] START ---", self.style.SUCCESS)
        
        # 1. パスの自動解決（実行ファイルからの相対パスでconfigを探す）
        # これにより、docker内でも外でも config フォルダを確実に見つけます
        current_cmd_dir = os.path.dirname(os.path.abspath(__file__))
        config_dir = os.path.join(current_cmd_dir, "config")
        
        fleet_csv = os.path.join(config_dir, f"{project}_fleet.csv")
        rss_csv = os.path.join(config_dir, f"{project}_rss_sources.csv")

        # 2. データの読み込み
        rss_sources = self.load_csv_data(rss_csv)
        fleet_data = self.load_csv_data(fleet_csv)

        # デバッグ：読み込めなかった場合、探した場所を表示
        if not fleet_data or not rss_sources:
            self.log(f"❌ 設定ファイルが見つかりません。プロジェクト名を確認してください: {project}", self.style.ERROR)
            self.log(f"   検索パス1: {fleet_csv}")
            self.log(f"   検索パス2: {rss_csv}")
            return

        # 3. RSSネタの一括取得
        rss_urls = [row['url'] for row in rss_sources]
        rss_pool = self.get_fresh_rss_pool(rss_urls)
        
        if not rss_pool:
            self.log("🏁 新着記事なし（または全記事投稿済み）。終了します。")
            return

        # 4. Gemini API準備
        api_keys = [os.getenv(f"GEMINI_API_KEY_{i}").strip() for i in range(1, 11) if os.getenv(f"GEMINI_API_KEY_{i}")]
        prompt_dir = os.path.join(current_cmd_dir, "prompt")
        
        prompt_path = os.path.join(prompt_dir, f"ai_prompt_{project}.txt")
        if not os.path.exists(prompt_path):
            prompt_path = os.path.join(prompt_dir, "ai_prompt_news.txt")
        
        with open(prompt_path, "r", encoding='utf-8') as f:
            template = f.read()

        # 5. 全サイトへデプロイ
        for site in fleet_data:
            b_key = site['site_key']
            try:
                # 💡 各サイト、まだ投稿していない記事の中からキーワードマッチを優先
                kws = [k.strip() for k in site.get('routing_keywords', '').split(',') if k.strip()]
                
                # 未投稿プールを作成（サイトごとに判定）
                unused_pool = [e for e in rss_pool if not Article.objects.filter(site=b_key, source_url=e.link).exists()]
                
                if not unused_pool:
                    self.log(f"⏩ [{b_key.upper()}] 投稿可能な新着記事がありません。スキップ。")
                    continue

                # キーワードに合う記事を検索
                entry = next((e for e in unused_pool if any(k.lower() in (e.title + getattr(e, 'summary', '')).lower() for k in kws)), None)
                
                # なければ未投稿からランダム
                if not entry:
                    entry = random.choice(unused_pool)

                self.process_single_post(b_key, site, entry, template, api_keys)
                time.sleep(12) # API負荷とBan防止のインターバル
            except Exception as e:
                self.log(f"🔥 [{b_key}] 実行エラー: {str(e)}", self.style.ERROR)

    def load_csv_data(self, path):
        data = []
        if not os.path.exists(path):
            return data
        with open(path, "r", encoding="utf-8") as f:
            # 💡 DictReaderで1行目のヘッダーをキーとして読み込む
            reader = csv.DictReader(f, delimiter='|')
            for row in reader:
                data.append(row)
        return data

    def get_fresh_rss_pool(self, urls):
        pool = []
        for url in urls:
            try:
                res = requests.get(url, timeout=10, headers={'User-Agent': 'Mozilla/5.0'})
                feed = feedparser.parse(res.text)
                for e in feed.entries:
                    # DB全体で一度も扱っていないURLを優先的にプール
                    pool.append(e)
            except: continue
        return pool

    def process_single_post(self, b_key, cfg, entry, template, api_keys):
        connection.close()
        self.log(f"🧵 [{b_key.upper()}] Deployment: {entry.title[:25]}...")
        
        data = self.scrape_article(entry)
        if not data: return
        
        processor = AIProcessor(api_keys, template)
        ext = processor.generate_blog_content(data, b_key)
        if not ext: return
        
        title = ext.get('title_g', '').strip()
        pf = cfg['platform']

        # Blogger用の認証ファイルディレクトリを動的に指定
        cfg['current_dir'] = os.path.join(os.path.dirname(os.path.abspath(__file__)), "bs_json")

        if pf == 'hatena':
            raw_body = ext.get('cont_h'); driver_class = HatenaDriver
        elif pf == 'blogger':
            raw_body = ext.get('cont_g'); driver_class = BloggerDriver
        else: # livedoor
            raw_body = ext.get('cont_g'); driver_class = LivedoorDriver
            
        html_body = HTMLConverter.md_to_html(raw_body)
        
        # フッター誘導先
        main_url = cfg.get('footer_url', 'https://bicstation.com')
        footer = f'<hr><p style="text-align:center;">🚀 <b>連合艦隊</b>: <a href="{main_url}">{main_url}</a></p>'
        
        # ドライバー互換性のためのマッピング
        cfg['api_key'] = cfg['api_key_or_pw']
        cfg['endpoint'] = cfg['url_or_endpoint']
        cfg['url'] = cfg['url_or_endpoint']
        cfg['blog_id'] = cfg['blog_id_or_rpc']
        
        driver = driver_class(cfg)
        if driver.post(title=title, body=html_body + footer, image_url=data['img'], source_url=data['url']):
            ArticleMapper.save_post_result(b_key, ext, data, True)
            self.log(f"📊 [{b_key.upper()}] ✅ Success", self.style.SUCCESS)

    def scrape_article(self, entry):
        try:
            res = requests.get(entry.link, timeout=10, headers={'User-Agent': 'Mozilla/5.0'})
            res.encoding = res.apparent_encoding
            soup = BeautifulSoup(res.text, 'html.parser')
            og = soup.find("meta", property="og:image") or soup.find("meta", attrs={"name": "og:image"})
            raw_img = og["content"] if og else ""
            img_url = re.sub(r'(p[s|r|t]|p)\.jpg$', 'pl.jpg', raw_img)
            area = soup.find('article') or soup.find('main') or soup.body
            for img in area.find_all('img'): img.decompose()
            return {'url': entry.link, 'title': entry.title, 'img': img_url, 'body': area.get_text(strip=True)[:5500]}
        except: return None

    def log(self, msg, style_func=None):
        ts = datetime.now().strftime('%H:%M:%S')
        text = f"[{ts}] {msg}"
        if style_func: self.stdout.write(style_func(text))
        else: self.stdout.write(text)