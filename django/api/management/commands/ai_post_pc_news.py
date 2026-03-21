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
    help = 'BICSTATION v32.0: Universal Multi-Fleet Engine (Final Report Edition)'

    def add_arguments(self, parser):
        parser.add_argument('--project', type=str, default='pc', help='Project name')

    def handle(self, *args, **options):
        project = options['project']
        self.log(f"--- 🚀 BICSTATION Universal Engine v32.0 [{project.upper()}] START ---", self.style.SUCCESS)
        
        # 1. パスの自動解決
        current_cmd_dir = os.path.dirname(os.path.abspath(__file__))
        config_dir = os.path.join(current_cmd_dir, "config")
        
        fleet_csv = os.path.join(config_dir, f"{project}_fleet.csv")
        rss_csv = os.path.join(config_dir, f"{project}_rss_sources.csv")

        # 2. データの読み込み
        rss_sources = self.load_csv_data(rss_csv)
        fleet_data = self.load_csv_data(fleet_csv)

        if not fleet_data or not rss_sources:
            self.log(f"❌ 設定ファイル欠如: {project}", self.style.ERROR)
            return

        # 3. RSSネタの一括取得
        rss_urls = [row['url'] for row in rss_sources]
        rss_pool = self.get_fresh_rss_pool(rss_urls)
        
        if not rss_pool:
            self.log("🏁 新着記事なし。終了。")
            return

        # 4. Gemini API準備
        api_keys = [os.getenv(f"GEMINI_API_KEY_{i}").strip() for i in range(1, 11) if os.getenv(f"GEMINI_API_KEY_{i}")]
        prompt_dir = os.path.join(current_cmd_dir, "prompt")
        prompt_path = os.path.join(prompt_dir, f"ai_prompt_{project}.txt")
        if not os.path.exists(prompt_path): prompt_path = os.path.join(prompt_dir, "ai_prompt_news.txt")
        
        with open(prompt_path, "r", encoding='utf-8') as f: template = f.read()

        # 🏁 戦績記録用
        stats = {"success": [], "fail": [], "skip": []}

        # 5. 全サイトへ順次デプロイ
        for site in fleet_data:
            b_key = site['site_key']
            try:
                kws = [k.strip() for k in site.get('routing_keywords', '').split(',') if k.strip()]
                # 未投稿プール判定（DB重複チェック）
                unused_pool = [e for e in rss_pool if not Article.objects.filter(site=b_key, source_url=e.link).exists()]
                
                if not unused_pool:
                    self.log(f"⏩ [{b_key.upper()}] 投稿可能記事なし。")
                    stats["skip"].append(b_key.upper())
                    continue

                # キーワード優先マッチ
                entry = next((e for e in unused_pool if any(k.lower() in (e.title + getattr(e, 'summary', '')).lower() for k in kws)), None)
                if not entry: entry = random.choice(unused_pool)

                # 実行
                success = self.process_single_post(b_key, site, entry, template, api_keys, config_dir)
                
                if success:
                    stats["success"].append(b_key.upper())
                else:
                    stats["fail"].append(b_key.upper())
                
                time.sleep(10) # 負荷調整
            except Exception as e:
                self.log(f"🔥 [{b_key}] Error: {str(e)}", self.style.ERROR)
                stats["fail"].append(b_key.upper())

        # 🏆 最終リザルト表示
        self.show_final_report(stats)

    def process_single_post(self, b_key, cfg, entry, template, api_keys, config_dir):
        connection.close()
        self.log(f"🧵 [{b_key.upper()}] Deployment: {entry.title[:30]}...")
        
        data = self.scrape_article(entry)
        if not data: return False
        
        processor = AIProcessor(api_keys, template)
        ext = processor.generate_blog_content(data, b_key)
        if not ext: return False
        
        title = ext.get('title_g', '').strip()
        pf = cfg['platform']

        # 💡 Blogger認証パスの固定解決 (v32.0 修正の要)
        cfg['current_dir'] = config_dir # config/token.json を見に行くように指定

        if pf == 'hatena':
            raw_body = ext.get('cont_h'); driver_class = HatenaDriver
        elif pf == 'blogger':
            raw_body = ext.get('cont_g'); driver_class = BloggerDriver
        else: # livedoor
            raw_body = ext.get('cont_g'); driver_class = LivedoorDriver
            # LivedoorのURL補正（末尾に/articleがない場合に自動付与）
            if 'atompub' in cfg['url_or_endpoint'] and not cfg['url_or_endpoint'].endswith('/article'):
                cfg['url_or_endpoint'] += '/article'
            
        html_body = HTMLConverter.md_to_html(raw_body)
        main_url = cfg.get('footer_url', 'https://bicstation.com')
        footer = f'<hr><p style="text-align:center;">🚀 <b>連合艦隊ポータル</b>: <a href="{main_url}">{main_url}</a></p>'
        
        # ドライバー互換性ブリッジ
        cfg['api_key'] = cfg['api_key_or_pw']
        cfg['endpoint'] = cfg['url_or_endpoint']
        cfg['url'] = cfg['url_or_endpoint']
        cfg['blog_id'] = cfg['blog_id_or_rpc']
        
        try:
            driver = driver_class(cfg)
            if driver.post(title=title, body=html_body + footer, image_url=data['img'], source_url=data['url']):
                ArticleMapper.save_post_result(b_key, ext, data, True)
                self.log(f"📊 [{b_key.upper()}] ✅ Success", self.style.SUCCESS)
                return True
        except Exception as e:
            self.log(f"❌ Driver Error [{b_key}]: {str(e)}", self.style.WARNING)
        return False

    def load_csv_data(self, path):
        data = []
        if not os.path.exists(path): return data
        with open(path, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f, delimiter='|')
            for row in reader: data.append(row)
        return data

    def get_fresh_rss_pool(self, urls):
        pool = []
        for url in urls:
            try:
                res = requests.get(url, timeout=10, headers={'User-Agent': 'Mozilla/5.0'})
                feed = feedparser.parse(res.text)
                pool.extend(feed.entries)
            except: continue
        return pool

    def scrape_article(self, entry):
        try:
            res = requests.get(entry.link, timeout=10, headers={'User-Agent': 'Mozilla/5.0'})
            res.encoding = res.apparent_encoding
            soup = BeautifulSoup(res.text, 'html.parser')
            og = soup.find("meta", property="og:image") or soup.find("meta", attrs={"name": "og:image"})
            img_url = og["content"] if og else ""
            area = soup.find('article') or soup.find('main') or soup.body
            for img in area.find_all('img'): img.decompose()
            return {'url': entry.link, 'title': entry.title, 'img': img_url, 'body': area.get_text(strip=True)[:5500]}
        except: return None

    def show_final_report(self, stats):
        self.stdout.write("\n" + "="*50)
        self.stdout.write(self.style.SUCCESS("🏁 BICSTATION DEPLOYMENT FINAL REPORT"))
        self.stdout.write("="*50)
        self.stdout.write(self.style.SUCCESS(f"✅ SUCCESS: {len(stats['success'])} sites"))
        if stats['success']: self.stdout.write(f"   ({', '.join(stats['success'])})")
        
        self.stdout.write(self.style.ERROR(f"❌ FAILED : {len(stats['fail'])} sites"))
        if stats['fail']: self.stdout.write(f"   ({', '.join(stats['fail'])})")
        
        self.stdout.write(self.style.WARNING(f"⏩ SKIPPED: {len(stats['skip'])} sites"))
        if stats['skip']: self.stdout.write(f"   ({', '.join(stats['skip'])})")
        self.stdout.write("="*50 + "\n")

    def log(self, msg, style_func=None):
        ts = datetime.now().strftime('%H:%M:%S')
        text = f"[{ts}] {msg}"
        if style_func: self.stdout.write(style_func(text))
        else: self.stdout.write(text)