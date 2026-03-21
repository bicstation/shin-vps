# -*- coding: utf-8 -*-
# BIC-FLEET Engine v1.2: Imperial Edition (Project Identity: bicstation)
import os, re, random, requests, feedparser, time, csv
from datetime import datetime
from bs4 import BeautifulSoup
from django.core.management.base import BaseCommand
from django.db import connection
from urllib.parse import urljoin

from api.models.article import Article
from api.utils.html_utils import HTMLConverter
from api.management.commands.blog_drivers.hatena_driver import HatenaDriver
from api.management.commands.blog_drivers.livedoor_driver import LivedoorDriver
from api.management.commands.blog_drivers.blogger_driver import BloggerDriver
from api.management.commands.blog_drivers.data_mapper import ArticleMapper
from api.management.commands.blog_drivers.ai_processor import AIProcessor

class Command(BaseCommand):
    help = 'BIC-FLEET v1.2: Multi-Project Auto Deployment Engine (DB Mapping Optimized)'

    def add_arguments(self, parser):
        parser.add_argument('--project', type=str, default='bicstation', help='プロジェクト名')
        parser.add_argument('--target', '-t', type=str, default=None, help='投稿先指定: LD, BG, HT')

    def handle(self, *args, **options):
        project = options['project']
        target = options['target'].upper() if options['target'] else None
        
        self.log(f"--- 🚀 BIC-FLEET Engine v1.2 [{project.upper()}] START ---", self.style.SUCCESS)
        
        current_cmd_dir = "/usr/src/app/api/management/commands"
        config_dir = os.path.join(current_cmd_dir, "config")
        prompt_dir = os.path.join(current_cmd_dir, "prompt")
        
        fleet_csv = os.path.join(config_dir, f"{project}_fleet.csv")
        rss_csv = os.path.join(config_dir, f"{project}_rss_sources.csv")

        cta_path = os.path.join(prompt_dir, f"cta_{project}.txt")
        if not os.path.exists(cta_path): cta_path = os.path.join(prompt_dir, "cta_default.txt")
        
        cta_template = ""
        if os.path.exists(cta_path):
            with open(cta_path, "r", encoding='utf-8') as f:
                cta_template = f.read()

        rss_sources = self.load_csv_data(rss_csv)
        all_fleet_data = self.load_csv_data(fleet_csv)

        if not all_fleet_data or not rss_sources:
            self.log(f"❌ 設定ファイル欠如: {project}", self.style.ERROR)
            return

        fleet_data = [s for s in all_fleet_data if not target or s['platform'].upper().startswith(target)]
        random.shuffle(fleet_data)

        rss_urls = [row['url'] for row in rss_sources]
        raw_pool = self.get_fresh_rss_pool(rss_urls)
        rss_pool = [e for e in raw_pool if not Article.objects.filter(source_url=e.link).exists()]
        
        if not rss_pool:
            self.log("🏁 新着記事はありません。")
            return

        api_keys = [os.getenv(f"GEMINI_API_KEY_{i}").strip() for i in range(1, 11) if os.getenv(f"GEMINI_API_KEY_{i}")]
        prompt_path = os.path.join(prompt_dir, f"ai_prompt_{project}.txt")
        if not os.path.exists(prompt_path): prompt_path = os.path.join(prompt_dir, "ai_prompt_news.txt")
        with open(prompt_path, "r", encoding='utf-8') as f: ai_template = f.read()

        stats = {"success": [], "fail": [], "skip": []}

        for site in fleet_data:
            b_key = site['site_key']
            try:
                current_unused = [e for e in rss_pool if not Article.objects.filter(site=b_key, source_url=e.link).exists()]
                if not current_unused:
                    stats["skip"].append(b_key.upper())
                    continue

                target_entry = random.choice(current_unused)
                success = self.process_single_post(b_key, site.copy(), target_entry, ai_template, cta_template, api_keys, current_cmd_dir, project)
                
                if success:
                    stats["success"].append(b_key.upper())
                    rss_pool = [e for e in rss_pool if e.link != target_entry.link]
                else:
                    stats["fail"].append(b_key.upper())
                
                time.sleep(random.randint(15, 45))
            except Exception as e:
                self.log(f"🔥 [{b_key}] Error: {str(e)}", self.style.ERROR)
                stats["fail"].append(b_key.upper())

        self.show_final_report(stats)

    def process_single_post(self, b_key, cfg, entry, ai_template, cta_template, api_keys, cmd_dir, project):
        connection.close()
        self.log(f"🧵 [{b_key.upper()}] 処理開始: {entry.title[:25]}...")
        
        data = self.scrape_article(entry)
        if not data: return False
        
        processor = AIProcessor(api_keys, ai_template)
        ext = processor.generate_blog_content(data, b_key)
        if not ext or not ext.get('title_g'): return False
        
        # 🌟 重要：ArticleMapper.create_article に直接 featured_image を渡す（または内部で扱えるように調整）
        # もし Mapper側が対応していない場合、Articleオブジェクトを直接操作するかMapperを修正する必要があります。
        # ここでは確実に保存されるよう、渡すべき引数を整理します。
        article_id = ArticleMapper.create_article(
            site_id=b_key,
            title=ext.get('title_g', 'No Title').strip(),
            body_text=ext.get('cont_g', ''),
            source_url=data['url'],
            content_type='post',
            # 🌟 OGP画像を DBのメインカラム（featured_image等）に紐付けるためのメタデータ
            extra_metadata={
                'project': project, 
                'is_main_brand': (b_key == 'bicstation'),
                'original_title': data['title'],
                'source_img': data['img'], # 👈 これをMapper内の.create()で featured_image=... に使う
                'scraped_at': datetime.now().isoformat()
            }
        )
        
        if not article_id: return False

        # DBに画像が入ったか確認・強制アップデート（念押し）
        try:
            Article.objects.filter(id=article_id).update(featured_image=data['img'])
            self.log(f"💾 [DB_FIX] featured_image を更新しました: {data['img'][:50]}...")
        except: pass

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
        
        post_config = {**cfg, 'api_key': cfg.get('api_key_or_pw'), 'endpoint': cfg.get('url_or_endpoint'), 'url': cfg.get('url_or_endpoint'), 'blog_id': cfg.get('blog_id_or_rpc')}
        
        try:
            driver = driver_class(post_config)
            if driver.post(title=title, body=html_body + final_cta, image_url=data['img'], source_url=data['url']):
                ArticleMapper.save_post_result(article_id, blog_type=pf, post_url=post_config['url'], is_published=True)
                self.log(f"📊 [{b_key.upper()}] ✅ Success: {internal_url}", self.style.SUCCESS)
                return True
        except Exception as e:
            self.log(f"❌ Driver Error [{b_key}]: {str(e)}", self.style.WARNING)
        return False

    def scrape_article(self, entry):
        """🌟 画像取得・デバッグ・相対パス解決の完全版"""
        try:
            target_url = entry.link
            self.log(f"🔍 [SCRAPE] Target: {target_url}")

            headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}
            res = requests.get(target_url, timeout=12, headers=headers)
            res.encoding = res.apparent_encoding
            soup = BeautifulSoup(res.text, 'html.parser')

            img_url = ""
            og = soup.find("meta", property="og:image") or soup.find("meta", attrs={"name": "og:image"}) or soup.find("meta", property="twitter:image")
            
            if og and og.get("content"):
                img_url = og["content"]
                if img_url.startswith('/'): img_url = urljoin(target_url, img_url)
                self.log(f"✅ [FOUND_IMG]: {img_url[:60]}...")
            
            if not img_url or "no-image" in img_url.lower():
                self.log(f"⚠️ [FALLBACK] 画像未検出のため生成")
                seed = random.randint(1000, 9999)
                img_url = f"https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=1024&sig={seed}"

            area = soup.find('article') or soup.find('main') or soup.find('div', class_=re.compile(r'content|post|entry')) or soup.body
            for tags in area.find_all(['img', 'script', 'style', 'nav', 'header', 'footer', 'aside']): tags.decompose()

            return {'url': target_url, 'title': entry.title, 'img': img_url, 'body': area.get_text(separator=' ', strip=True)[:5500]}
        except Exception as e:
            self.log(f"🚨 [SCRAPE_ERROR]: {str(e)}", self.style.ERROR)
            return None

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

    def show_final_report(self, stats):
        self.stdout.write(f"\n✅ SUCCESS: {len(stats['success'])} | ❌ FAILED: {len(stats['fail'])} | ⏩ SKIP: {len(stats['skip'])}\n")

    def log(self, msg, style_func=None):
        ts = datetime.now().strftime('%H:%M:%S')
        text = f"[{ts}] {msg}"
        if style_func: self.stdout.write(style_func(text))
        else: self.stdout.write(text)