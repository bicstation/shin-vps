# -*- coding: utf-8 -*-
# BIC-FLEET Engine v1.2: Imperial Edition (Project Identity: bicstation)
# /home/maya/shin-dev/shin-vps/django/api/management/commands/ai_fleet_deployer.py

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
    help = 'BIC-FLEET v1.2: Multi-Project Auto Deployment Engine (Brand Consistent)'

    def add_arguments(self, parser):
        # デフォルトプロジェクトを 'bicstation' に変更
        parser.add_argument('--project', type=str, default='bicstation', help='プロジェクト名 (bicstation/adult/saving等)')
        parser.add_argument('--target', '-t', type=str, default=None, help='投稿先指定: LD, BG, HT')

    def handle(self, *args, **options):
        project = options['project']
        target = options['target'].upper() if options['target'] else None
        
        self.log(f"--- 🚀 BIC-FLEET Engine v1.2 [{project.upper()}] START ---", self.style.SUCCESS)
        
        # 1. パスの解決 (コンテナ内部の絶対パスを優先)
        current_cmd_dir = "/usr/src/app/api/management/commands"
        config_dir = os.path.join(current_cmd_dir, "config")
        prompt_dir = os.path.join(current_cmd_dir, "prompt")
        
        fleet_csv = os.path.join(config_dir, f"{project}_fleet.csv")
        rss_csv = os.path.join(config_dir, f"{project}_rss_sources.csv")

        # CTAテンプレートの読み込み
        cta_path = os.path.join(prompt_dir, f"cta_{project}.txt")
        if not os.path.exists(cta_path):
            cta_path = os.path.join(prompt_dir, "cta_default.txt")
        
        cta_template = ""
        if os.path.exists(cta_path):
            with open(cta_path, "r", encoding='utf-8') as f:
                cta_template = f.read()
            self.log(f"📝 CTA Template Loaded: {os.path.basename(cta_path)}")

        # 2. データの読み込み
        rss_sources = self.load_csv_data(rss_csv)
        all_fleet_data = self.load_csv_data(fleet_csv)

        if not all_fleet_data or not rss_sources:
            self.log(f"❌ 設定ファイル欠如: {project} (path: {fleet_csv})", self.style.ERROR)
            return

        # ターゲットフィルタリング & シャッフル
        fleet_data = [s for s in all_fleet_data if not target or s['platform'].upper().startswith(target)]
        random.shuffle(fleet_data)
        self.log(f"🎲 艦隊出撃順序をシャッフルしました ({len(fleet_data)} sites)")

        # 3. RSS取得 & 重複チェック
        rss_urls = [row['url'] for row in rss_sources]
        raw_pool = self.get_fresh_rss_pool(rss_urls)
        # DB全体で既に source_url が存在するかチェック
        rss_pool = [e for e in raw_pool if not Article.objects.filter(source_url=e.link).exists()]
        
        if not rss_pool:
            self.log("🏁 全サイト共通の新着記事はありません。")
            return

        # 4. AIプロンプト準備
        api_keys = [os.getenv(f"GEMINI_API_KEY_{i}").strip() for i in range(1, 11) if os.getenv(f"GEMINI_API_KEY_{i}")]
        prompt_path = os.path.join(prompt_dir, f"ai_prompt_{project}.txt")
        if not os.path.exists(prompt_path): prompt_path = os.path.join(prompt_dir, "ai_prompt_news.txt")
        with open(prompt_path, "r", encoding='utf-8') as f: ai_template = f.read()

        stats = {"success": [], "fail": [], "skip": []}

        # 5. 実行ループ
        for site in fleet_data:
            b_key = site['site_key']
            try:
                # この特定のサイト(b_key)でまだ投稿していない記事を抽出
                current_unused = [e for e in rss_pool if not Article.objects.filter(site=b_key, source_url=e.link).exists()]
                
                if not current_unused:
                    stats["skip"].append(b_key.upper())
                    continue

                # 🌟 修正ポイント: 記事情報を target_entry に隔離して固定
                target_entry = random.choice(current_unused)
                
                success = self.process_single_post(b_key, site.copy(), target_entry, ai_template, cta_template, api_keys, current_cmd_dir, project)
                
                if success:
                    stats["success"].append(b_key.upper())
                    # 🌟 成功したら即座にプールから削除（同一ループ内での重複を回避）
                    rss_pool = [e for e in rss_pool if e.link != target_entry.link]
                else:
                    stats["fail"].append(b_key.upper())
                
                wait = random.randint(15, 45)
                self.log(f"⏳ 次のサイトまで待機中... ({wait}s)")
                time.sleep(wait)
                
            except Exception as e:
                self.log(f"🔥 [{b_key}] 致命的エラー: {str(e)}", self.style.ERROR)
                stats["fail"].append(b_key.upper())

        self.show_final_report(stats)

    def process_single_post(self, b_key, cfg, entry, ai_template, cta_template, api_keys, cmd_dir, project):
        connection.close()
        # 🌟 ここで entry.title を使うことで、DB保存とAI生成の整合性を担保
        self.log(f"🧵 [{b_key.upper()}] 処理開始: {entry.title[:25]}...")
        
        data = self.scrape_article(entry)
        if not data: return False
        
        processor = AIProcessor(api_keys, ai_template)
        ext = processor.generate_blog_content(data, b_key)
        if not ext or not ext.get('title_g'): return False
        
        # 🌟 修正ポイント: メタデータにプロジェクト識別子と役割を明記
        article_id = ArticleMapper.create_article(
            site_id=b_key,
            title=ext.get('title_g', 'No Title').strip(),
            body_text=ext.get('cont_g', ''),
            source_url=data['url'],
            content_type='post',
            extra_metadata={
                'project': project, 
                'is_main_brand': True if b_key == 'bicstation' else False,
                'original_title': data['title'], # 隔離されたentryから取得
                'source_img': data['img'],
                'scraped_at': datetime.now().isoformat()
            }
        )
        
        if not article_id: return False

        # ドメインマップ (pcをbicstationに統合)
        domain_map = {'bicstation': 'bicstation.com', 'saving': 'bic-saving.com', 'adult': 'tiper.live'}
        domain = domain_map.get(project, 'bicstation.com')
        internal_url = f"https://{domain}/news/{article_id}"
        
        title = ext.get('title_g', '').strip()
        pf = cfg['platform'].lower()
        cfg['current_dir'] = cmd_dir 

        if pf == 'hatena':
            raw_body = ext.get('cont_h') or ext.get('cont_g')
            driver_class = HatenaDriver
        elif pf == 'blogger':
            raw_body = ext.get('cont_g')
            driver_class = BloggerDriver
        else:
            raw_body = ext.get('cont_g')
            driver_class = LivedoorDriver
            if 'atompub' in cfg.get('url_or_endpoint', '') and not cfg['url_or_endpoint'].endswith('/article'):
                cfg['url_or_endpoint'] += '/article'
            
        html_body = HTMLConverter.md_to_html(raw_body)
        final_cta = cta_template.replace("{{internal_url}}", internal_url)
        
        post_config = {
            **cfg,
            'api_key': cfg.get('api_key_or_pw'),
            'endpoint': cfg.get('url_or_endpoint'), 
            'url': cfg.get('url_or_endpoint'),
            'blog_id': cfg.get('blog_id_or_rpc')
        }
        
        try:
            driver = driver_class(post_config)
            if driver.post(title=title, body=html_body + final_cta, image_url=data['img'], source_url=data['url']):
                ArticleMapper.save_post_result(
                    article_id, 
                    blog_type=pf, 
                    post_url=post_config['url'], 
                    is_published=True
                )
                self.log(f"📊 [{b_key.upper()}] ✅ Success: {internal_url}", self.style.SUCCESS)
                return True
            else:
                return False
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
        self.stdout.write(self.style.SUCCESS("🏁 BIC-FLEET DEPLOYMENT FINAL REPORT"))
        self.stdout.write("="*50)
        self.stdout.write(self.style.SUCCESS(f"✅ SUCCESS: {len(stats['success'])}"))
        self.stdout.write(self.style.ERROR(f"❌ FAILED : {len(stats['fail'])}"))
        self.stdout.write(self.style.WARNING(f"⏩ SKIPPED: {len(stats['skip'])}"))
        self.stdout.write("="*50 + "\n")

    def log(self, msg, style_func=None):
        ts = datetime.now().strftime('%H:%M:%S')
        text = f"[{ts}] {msg}"
        if style_func: self.stdout.write(style_func(text))
        else: self.stdout.write(text)