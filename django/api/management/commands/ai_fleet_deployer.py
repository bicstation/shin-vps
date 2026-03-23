# -*- coding: utf-8 -*-
import os, re, random, requests, feedparser, time, csv, hashlib
from datetime import datetime, timedelta
from bs4 import BeautifulSoup
from django.core.management.base import BaseCommand
from django.db import connection
from api.models.article import Article
from api.utils.html_utils import HTMLConverter
from api.management.commands.blog_drivers.hatena_driver import HatenaDriver
from api.management.commands.blog_drivers.livedoor_driver import LivedoorDriver
from api.management.commands.blog_drivers.blogger_driver import BloggerDriver
from api.management.commands.blog_drivers.ai_processor import AIProcessor

class Command(BaseCommand):
    help = 'BICSTATION v39.1: Ultimate Full-Debug, Metadata Mapping & Heavy Logging'

    # 🛡️ サイト属性のマスター定義
    ADULT_PROJECTS = ['tiper', 'avflash', 'adult-test']

    def add_arguments(self, parser):
        parser.add_argument('--project', type=str, default='tiper', help='Project name (bicstation, tiper, etc.)')
        parser.add_argument('--platform', type=str, default='all', help='Target platform (livedoor, hatena, etc.)')

    def log(self, msg, style_func=None):
        ts = datetime.now().strftime('%H:%M:%S')
        text = f"[{ts}] {msg}"
        if style_func:
            self.stdout.write(style_func(text))
        else:
            self.stdout.write(text)

    def handle(self, *args, **options):
        # 🚀 1. 初期化・開始ログ
        start_time = datetime.now()
        project_name = options['project'].lower()
        target_pf = options['platform'].lower()
        
        DOMAIN_MAP = {
            'bicstation': 'bicstation.com',
            'tiper':      'tiper.live',
            'saving':     'bic-saving.com',
            'avflash':    'avflash.xyz',
        }
        self.target_domain = DOMAIN_MAP.get(project_name, f"{project_name}.com")
        self.is_adult_env = project_name in self.ADULT_PROJECTS

        # 作戦開始ヘッダー
        self.stdout.write(f"\n{self.style.SUCCESS('▼' * 100)}")
        self.stdout.write(self.style.SUCCESS(f" 🔱 STRATEGIC DEPLOYMENT SYSTEM v39.1 (ULTIMATE FULL-LOG)"))
        self.stdout.write(f" 📂 PROJECT      : {project_name.upper()}")
        self.stdout.write(f" 🔞 CONTENT TYPE : {'ADULT (Metadata-Flagged)' if self.is_adult_env else 'GENERAL (Safe-Mode)'}")
        self.stdout.write(f" 🌐 DOMAIN       : {self.target_domain}")
        self.stdout.write(f" ⏰ START TIME   : {start_time.strftime('%Y-%m-%d %H:%M:%S')}")
        self.stdout.write(f"{self.style.SUCCESS('▲' * 100)}\n")
        
        current_cmd_dir = os.path.dirname(os.path.abspath(__file__))
        config_dir = os.path.join(current_cmd_dir, "teitoku_settings")
        
        # 🚀 2. データロード
        fleet_data = self.load_csv_data(os.path.join(config_dir, f"{project_name}_fleet.csv"))
        if target_pf != 'all':
            fleet_data = [site for site in fleet_data if site.get('platform', '').lower() == target_pf]

        rss_sources = self.load_csv_data(os.path.join(config_dir, f"{project_name}_rss_sources.csv"))
        rss_urls = [row['url'] for row in rss_sources if 'url' in row]
        
        # 重複チェックをプロジェクト名で統一
        raw_pool = self.get_fresh_rss_pool(rss_urls)
        rss_pool = [e for e in raw_pool if not Article.objects.filter(site=project_name, source_url=e.link).exists()]

        if not rss_pool:
            self.log("🏁 新着記事なし。哨戒を終了します。", self.style.WARNING)
            return

        # 📊 終了予定時間 (ETA) の算出
        est_seconds = len(fleet_data) * 38
        self.eta_time = start_time + timedelta(seconds=est_seconds)
        self.log(f" 📊 艦隊規模: {len(fleet_data)} 隻 / 終了予定: {self.eta_time.strftime('%H:%M:%S')}", self.style.HTTP_INFO)

        api_keys = [os.getenv(f"GEMINI_API_KEY_{i}").strip() for i in range(1, 11) if os.getenv(f"GEMINI_API_KEY_{i}")]
        random.shuffle(fleet_data)
        used_entries = set()

        # 🚀 3. メインループ
        for i, site in enumerate(fleet_data, 1):
            keywords = [k.strip().lower() for k in site.get('routing_keywords', '').split(',') if k.strip()]
            suitable_articles = []
            hit_word = ""

            for entry in rss_pool:
                if entry.link in used_entries: continue
                target_text = (entry.title + getattr(entry, 'summary', '')).lower()
                if not keywords or any(k in target_text for k in keywords):
                    suitable_articles.append(entry)
                    hit_word = next((k for k in keywords if k in target_text), "総合")
                    break
            
            # ミッションヘッダー
            mission_head = f" MISSION [{i}/{len(fleet_data)}] "
            target_info = f" TARGET: {site['site_key'].upper()} ({site['platform']}) "
            self.stdout.write(f"\n{self.style.MIGRATE_LABEL(mission_head)}{self.style.SUCCESS(target_info)}{'━' * (60 - len(mission_head + target_info))}")

            if not suitable_articles:
                self.log(f" ⏩ SKIP : キーワード不一致 ({site.get('routing_keywords', '')[:20]}...)", self.style.NOTICE)
                continue

            entry = random.choice(suitable_articles)
            site_context = {'site_name': site['site_key'], 'persona': site.get('persona', f"{hit_word}特化")}

            # 処理実行
            if self.process_single_post(site, entry, api_keys, project_name, site_context, hit_word):
                used_entries.add(entry.link)
                wait = random.randint(25, 45)
                self.log(f" 💤 Cooldown: {wait}s... (ETA: {self.eta_time.strftime('%H:%M:%S')})")
                time.sleep(wait)

    def process_single_post(self, cfg, entry, api_keys, project_name, context, hit_word):
        connection.close()
        
        # 📝 抽出開始ログ
        self.log(f" 🔍 取得元タイトル: {entry.title[:50]}...")
        data = self.scrape_article_advanced(entry)
        
        if not data or not data.get('img'):
            self.log(" ❌ ABORT: 画像または本文が取得できませんでした。", self.style.ERROR)
            return False
        
        # 🖼️ 詳細ログ
        self.log(f" 🖼️  画像URL確定 : {data['img'][:70]}...")
        self.log(f" 📄 原文冒頭   : {data['body'][:60].replace(chr(10), ' ')}...")

        # AIプロンプト読み込み
        current_cmd_dir = os.path.dirname(os.path.abspath(__file__))
        prompt_path = os.path.join(current_cmd_dir, "prompt", f"ai_prompt_{project_name}.txt")
        if not os.path.exists(prompt_path):
            prompt_path = os.path.join(current_cmd_dir, "prompt", "ai_prompt_adult.txt")
        
        with open(prompt_path, 'r', encoding='utf-8') as f:
            template = f.read()

        processor = AIProcessor(api_keys, template.replace("{{site_name}}", context['site_name']).replace("{{persona}}", context['persona']))
        ext = processor.generate_blog_content(data, cfg['site_key'])
        
        if not ext:
            self.log(" ❌ AI ERROR: コンテンツ生成に失敗しました。", self.style.ERROR)
            return False

        # 生成テキストの抽出
        content = ext.get('cont_g', '')
        title_match = re.search(r'\[TITLE\](.*?)\[/TITLE\]', content, re.DOTALL)
        gen_title = title_match.group(1).strip() if title_match else ext.get('title_g', data['title'])
        body_match = re.search(r'\[BODY\](.*?)\[/BODY\]', content, re.DOTALL)
        clean_body = body_match.group(1).strip() if body_match else content

        # ✨ 生成結果ログ
        self.stdout.write(self.style.HTTP_SUCCESS(f" ✍️  生成タイトル: {gen_title}"))
        self.log(f" 📝 生成本文（冒頭）: {clean_body[:80].replace(chr(10), ' ')}...")

        try:
            # 🚀 4. Django DB 保存 (extra_metadataを活用)
            meta_data = {
                'is_adult': self.is_adult_env, # 🎯 メタデータで管理
                'hit_keyword': hit_word,
                'original_title': data['title'],
                'processed_at': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                'version': '39.1'
            }

            new_article, created = Article.objects.get_or_create(
                source_url=data['url'],
                site=project_name, 
                defaults={
                    'content_type': 'news',
                    'title': gen_title,
                    'body_text': clean_body,
                    'main_image_url': data['img'],
                    'extra_metadata': meta_data, 
                    'is_exported': True
                }
            )
            
            if not created:
                self.log(" ⏩ SKIP: DB重複検知。", self.style.NOTICE)
                return False

            # CTA・HTML変換
            url_hash = hashlib.md5(data['url'].encode()).hexdigest()[:8]
            slug = f"{datetime.now().strftime('%Y%m%d')}_{url_hash}"
            internal_url = f"https://{self.target_domain}/news/{slug}/"
            
            cta_path = os.path.join(current_cmd_dir, "prompt", f"cta_{project_name}.txt")
            cta_template = ""
            if os.path.exists(cta_path):
                with open(cta_path, 'r', encoding='utf-8') as f: cta_template = f.read()
            
            final_cta = cta_template.replace("{{internal_url}}", internal_url).replace("{{affiliate_url}}", data['url']) if cta_template else f'\n<p><a href="{internal_url}">▶ 本編レビューはこちら</a></p>'
            final_html_body = HTMLConverter.md_to_html(clean_body) + final_cta

            # 🚀 5. デプロイ
            driver_cfg = cfg.copy()
            driver_cfg.update({
                'api_key': cfg.get('api_key_or_pw'),
                'endpoint': cfg.get('url_or_endpoint'),
                'user': cfg.get('user_id')
            })
            pf = cfg['platform'].lower()
            driver = {'hatena': HatenaDriver, 'blogger': BloggerDriver}.get(pf, LivedoorDriver)(driver_cfg)
            
            posted_url = driver.post(title=gen_title, body=final_html_body, image_url=data['img'], source_url=data['url'])
            
            if posted_url:
                self.stdout.write(self.style.SUCCESS(f" 🎯 HIT KEYWORD : {hit_word.upper()}"))
                self.stdout.write(self.style.SUCCESS(f" 🔗 POSTED URL  : {posted_url}"))
                self.stdout.write(self.style.SUCCESS(f" 🏆 MISSION COMPLETE: {cfg['site_key'].upper()} ➔ 完了"))
                return True
        except Exception as e:
            self.log(f" 💥 CRITICAL ERROR: {str(e)}", self.style.ERROR)
        return False

    def scrape_article_advanced(self, entry):
        try:
            raw_img_url = ""
            if hasattr(entry, 'package'): raw_img_url = entry.package
            if not raw_img_url:
                content = getattr(entry, 'summary', '')
                if hasattr(entry, 'content'): content = entry.content[0].value
                img_match = re.search(r'src=["\'](.*?)["\']', content)
                if img_match: raw_img_url = img_match.group(1)
            
            if not raw_img_url: return None
            if raw_img_url.startswith('//'): raw_img_url = 'https:' + raw_img_url
            img_url = re.sub(r'(p[s|r|t]|p)\.jpg$', 'pl.jpg', raw_img_url)
            
            soup = BeautifulSoup(getattr(entry, 'summary', ''), 'html.parser')
            for tag in soup.find_all(['img', 'a']): tag.decompose()
            
            return {
                'url': entry.link,
                'title': entry.title,
                'img': img_url,
                'body': soup.get_text().strip()[:1000]
            }
        except:
            return None

    def load_csv_data(self, path):
        if not os.path.exists(path): return []
        with open(path, "r", encoding="utf-8") as f:
            return list(csv.DictReader(f, delimiter='|'))

    def get_fresh_rss_pool(self, urls):
        pool = []
        for url in urls:
            try:
                res = requests.get(url, timeout=12, headers={'User-Agent': 'Mozilla/5.0'})
                pool.extend(feedparser.parse(res.text).entries)
            except:
                continue
        return pool