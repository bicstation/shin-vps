# -*- coding: utf-8 -*-
# BIC-FLEET Engine v1.2: Integrated Project Mapping Edition
# 修正内容: 引数 project による全プロセスの一括マッピング + タイトルタグ洗浄

import os, re, random, requests, feedparser, time, csv
from datetime import datetime, timedelta
from django.core.management.base import BaseCommand
from django.db import connection
from bs4 import BeautifulSoup 
from urllib.parse import urljoin

from api.models.article import Article
from api.utils.html_utils import HTMLConverter
from api.management.commands.blog_drivers.hatena_driver import HatenaDriver
from api.management.commands.blog_drivers.livedoor_driver import LivedoorDriver
from api.management.commands.blog_drivers.blogger_driver import BloggerDriver
from api.management.commands.blog_drivers.data_mapper import ArticleMapper
from api.management.commands.blog_drivers.ai_processor import AIProcessor

class Command(BaseCommand):
    help = 'BIC-FLEET v1.2: Project-Aware Deployment Engine (Full Spec)'
    VALID_PROJECTS = ['bicstation', 'tiper', 'avflash', 'saving']

    def add_arguments(self, parser):
        parser.add_argument('--project', type=str, default='bicstation', help='プロジェクト名')
        parser.add_argument('--target', '-t', type=str, default=None, help='投稿先指定: LD, BG, HT')

    def handle(self, *args, **options):
        project = options['project'].lower()
        if project not in self.VALID_PROJECTS:
            self.log(f"❌ 不正なプロジェクト名です: '{project}'", self.style.ERROR)
            return

        target = options['target'].upper() if options['target'] else None
        self.log(f"--- 🚀 BIC-FLEET Engine v1.2 [{project.upper()}] START ---", self.style.SUCCESS)
        
        # パス設定
        current_cmd_dir = "/usr/src/app/api/management/commands"
        config_dir = os.path.join(current_cmd_dir, "config")
        prompt_dir = os.path.join(current_cmd_dir, "prompt")
        
        fleet_csv = os.path.join(config_dir, f"{project}_fleet.csv")
        rss_csv = os.path.join(config_dir, f"{project}_rss_sources.csv")

        if not os.path.exists(fleet_csv) or not os.path.exists(rss_csv):
            self.log(f"❌ 設定ファイル欠如: {project}_fleet.csv / {project}_rss_sources.csv", self.style.ERROR)
            return

        rss_sources = self.load_csv_data(rss_csv)
        all_fleet_data = self.load_csv_data(fleet_csv)
        fleet_data = [s for s in all_fleet_data if not target or s['platform'].upper().startswith(target)]
        
        if not fleet_data:
            self.log(f"⚠️ ターゲット '{target}' に合致するサイトがありません。", self.style.WARNING)
            return
            
        random.shuffle(fleet_data)

        # RSS取得と重複チェック
        rss_urls = [row['url'] for row in rss_sources]
        raw_pool = self.get_fresh_rss_pool(rss_urls)
        rss_pool = [e for e in raw_pool if not Article.objects.filter(source_url=e.link).exists()]
        
        if not rss_pool:
            self.log("🏁 新着記事はありません。")
            return

        # AIプロンプト/CTA準備
        api_keys = [os.getenv(f"GEMINI_API_KEY_{i}").strip() for i in range(1, 11) if os.getenv(f"GEMINI_API_KEY_{i}")]
        ai_template = self.get_template(os.path.join(prompt_dir, f"ai_prompt_{project}.txt"), os.path.join(prompt_dir, "ai_prompt_news.txt"))
        cta_template = self.get_template(os.path.join(prompt_dir, f"cta_{project}.txt"), os.path.join(prompt_dir, "cta_default.txt"))

        stats = {"success": [], "fail": [], "skip": []}
        total_sites = len(fleet_data)
        start_ts = datetime.now()

        for i, site in enumerate(fleet_data, 1):
            b_key = site['site_key']
            remaining = total_sites - i
            eta = (datetime.now() + timedelta(seconds=remaining * 50)).strftime('%H:%M')
            
            self.stdout.write(self.style.HTTP_INFO(f"\n[{i}/{total_sites}] 🏹 Target: {b_key.upper()} (Project: {project.upper()}) (ETA: {eta})"))

            try:
                # サイト別重複チェック
                current_unused = [e for e in rss_pool if not Article.objects.filter(site=b_key, source_url=e.link).exists()]
                if not current_unused:
                    self.log(f"⏭️  {b_key}: 既に最新記事が投稿済みです。")
                    stats["skip"].append(b_key.upper())
                    continue

                target_entry = random.choice(current_unused)
                
                # 個別投稿処理（project引数を渡して一貫性を持たせる）
                success_url = self.process_single_post(b_key, site.copy(), target_entry, ai_template, cta_template, api_keys, current_cmd_dir, project)
                
                if success_url:
                    stats["success"].append(f"{b_key.upper()} -> {success_url}")
                    rss_pool = [e for e in rss_pool if e.link != target_entry.link]
                else:
                    stats["fail"].append(b_key.upper())
                
                if i < total_sites:
                    wait_time = random.randint(15, 45)
                    self.log(f"💤 次の配信まで {wait_time}秒 待機します...")
                    time.sleep(wait_time)

            except Exception as e:
                self.log(f"🔥 [{b_key}] 致命的エラー: {str(e)}", self.style.ERROR)
                stats["fail"].append(b_key.upper())

        self.show_final_report(stats, start_ts)

    def process_single_post(self, b_key, cfg, entry, ai_template, cta_template, api_keys, cmd_dir, project):
        connection.close()
        self.log(f"🧵 処理開始: {entry.title[:30]}...")
        
        # 1. スクレイピング
        data = self.scrape_article(entry)
        if not data: return None
        
        # 2. AIリライト
        processor = AIProcessor(api_keys, ai_template)
        ext = processor.generate_blog_content(data, b_key)
        if not ext or not ext.get('title_g'): return None
        
        # 🛡️ タイトルの洗浄: [site_key] などのタグを正規表現で完全に除去
        raw_title = ext.get('title_g', 'No Title').strip()
        clean_title = re.sub(r'^\[.*?\]\s*', '', raw_title)

        # 3. DB保存
        article_id = ArticleMapper.create_article(
            site_id=b_key, 
            title=clean_title,
            body_text=ext.get('cont_g', ''),
            main_image_url=data['img'], 
            source_url=data['url'],
            content_type='post',
            extra_metadata={
                'project': project,
                'is_main_brand': True, # 引数 project に基づく配信なのでメインブランド扱い
                'original_title': data['title'],
                'source_img': data['img'],
                'scraped_at': datetime.now().isoformat()
            }
        )
        if not article_id: return None

        # 4. ドライバー投稿
        domain_map = {'bicstation': 'bicstation.com', 'saving': 'bic-saving.com', 'tiper': 'tiper.live', 'avflash': 'avflash.net'}
        domain = domain_map.get(project, 'bicstation.com')
        internal_url = f"https://{domain}/news/{article_id}"
        
        pf = cfg['platform'].lower()
        cfg['current_dir'] = cmd_dir 
        
        driver_class = {'hatena': HatenaDriver, 'blogger': BloggerDriver}.get(pf, LivedoorDriver)
        raw_body = ext.get('cont_h') if pf == 'hatena' and ext.get('cont_h') else ext.get('cont_g')
        
        html_body = HTMLConverter.md_to_html(raw_body)
        final_cta = cta_template.replace("{{internal_url}}", internal_url)
        
        # 🔱 サイト設定の動的マッピング
        # site_name を引数の project に基づいて上書き
        display_name = project.replace('bicstation', 'Bic Station').replace('saving', 'Bic Saving').capitalize()
        if project == 'avflash': display_name = 'AV Flash'

        post_config = {
            **cfg, 
            'api_key': cfg.get('api_key_or_pw') or cfg.get('api_key'), 
            'endpoint': cfg.get('url_or_endpoint') or cfg.get('endpoint'), 
            'url': cfg.get('url_or_endpoint') or cfg.get('url', ''),
            'blog_id': cfg.get('blog_id_or_rpc') or cfg.get('blog_id'),
            'site_name': display_name # 外部サービスへ渡すサイト名
        }

        try:
            driver = driver_class(post_config)
            # 洗浄済みタイトル (clean_title) で投稿
            if driver.post(title=clean_title, body=html_body + final_cta, image_url=data['img'], source_url=data['url']):
                ArticleMapper.save_post_result(article_id, blog_type=pf, post_url=post_config.get('url', ''), is_published=True)
                self.log(f"✅ 配信成功: {internal_url} as {display_name}", self.style.SUCCESS)
                return internal_url
        except Exception as e:
            self.log(f"❌ 外部投稿失敗 [{b_key}]: {str(e)}", self.style.WARNING)
            
        return None

    def scrape_article(self, entry):
        try:
            target_url = entry.link
            headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}
            res = requests.get(target_url, timeout=12, headers=headers)
            res.encoding = res.apparent_encoding
            soup = BeautifulSoup(res.text, 'html.parser')

            img_url = ""
            og = soup.find("meta", property="og:image") or soup.find("meta", attrs={"name": "og:image"})
            if og and og.get("content"):
                img_url = urljoin(target_url, og["content"])
            else:
                first_img = soup.find('img', src=re.compile(r'^http'))
                if first_img:
                    img_url = first_img['src']
                else:
                    seed = random.randint(1000, 9999)
                    img_url = f"https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=1024&sig={seed}"

            area = soup.find('article') or soup.find('main') or soup.find('div', class_=re.compile(r'content|post|entry')) or soup.body
            if area:
                for tags in area.find_all(['script', 'style', 'nav', 'header', 'footer', 'aside']):
                    tags.decompose()
                body_text = area.get_text(separator=' ', strip=True)[:5500]
            else:
                body_text = ""

            return {'url': target_url, 'title': entry.title, 'img': img_url, 'body': body_text}
        except Exception as e:
            self.log(f"🚨 スクレイピングエラー: {str(e)}", self.style.ERROR)
            return None

    def get_template(self, primary, secondary):
        path = primary if os.path.exists(primary) else secondary
        if not os.path.exists(path): return ""
        with open(path, "r", encoding="utf-8") as f: return f.read()

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

    def show_final_report(self, stats, start_ts):
        end_ts = datetime.now()
        duration = end_ts - start_ts
        self.stdout.write(self.style.SUCCESS(f"\n{'='*60}"))
        self.stdout.write(self.style.SUCCESS(f"🏁 ALL MISSIONS COMPLETED at {end_ts.strftime('%H:%M:%S')}"))
        self.stdout.write(self.style.SUCCESS(f"⏱️  Total Duration: {str(duration).split('.')[0]}"))
        self.stdout.write(self.style.SUCCESS(f"{'='*60}"))
        
        self.stdout.write(f"\n📬 DEPLOYMENT LOG:")
        for entry in stats['success']:
            self.stdout.write(f"  SUCCESS: {entry}")
            
        self.stdout.write(f"\n⏭️  SKIPPED: {len(stats['skip'])} | ❌ FAILED: {len(stats['fail'])}")
        self.stdout.write(self.style.SUCCESS(f"{'='*60}\n"))

    def log(self, msg, style_func=None):
        ts = datetime.now().strftime('%H:%M:%S')
        text = f"[{ts}] {msg}"
        if style_func: self.stdout.write(style_func(text))
        else: self.stdout.write(text)