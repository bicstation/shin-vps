# -*- coding: utf-8 -*-
import os, re, random, requests, feedparser, time, csv, hashlib
from datetime import datetime
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
    help = 'BICSTATION v38.5: Multi-Domain, Multi-Platform & ITERM Image Scraper'

    def add_arguments(self, parser):
        parser.add_argument('--project', type=str, default='tiper')
        parser.add_argument('--platform', type=str, default='all')

    def log(self, msg, style_func=None):
        ts = datetime.now().strftime('%H:%M:%S')
        text = f"[{ts}] {msg}"
        if style_func:
            self.stdout.write(style_func(text))
        else:
            self.stdout.write(text)

    def handle(self, *args, **options):
        project_name = options['project']
        target_pf = options['platform'].lower()
        
        # 🚀 1. ドメイン・マッピング機能
        DOMAIN_MAP = {
            'bicstation': 'bicstation.com',
            'tiper':      'tiper.live',
            'saving':     'bic-saving.com',
            'avflash':    'avflash.xyz',
        }
        self.target_domain = DOMAIN_MAP.get(project_name, f"{project_name}.com")

        self.stdout.write(f"\n{self.style.SUCCESS('▼' * 80)}")
        self.stdout.write(self.style.SUCCESS(f" 🔱 STRATEGIC DEPLOYMENT SYSTEM v38.5 (ULTIMATE)"))
        self.stdout.write(f" 🌐 DOMAIN   : {self.target_domain}")
        self.stdout.write(f" 📂 PROJECT  : {project_name.upper()}")
        self.stdout.write(f"{self.style.SUCCESS('▲' * 80)}\n")
        
        current_cmd_dir = os.path.dirname(os.path.abspath(__file__))
        config_dir = os.path.join(current_cmd_dir, "teitoku_settings")
        
        # 🚀 2. 戦略換装（プロンプト/CTA自動選択）
        prompt_path = os.path.join(current_cmd_dir, "prompt", f"ai_prompt_{project_name}.txt")
        if not os.path.exists(prompt_path):
            prompt_path = os.path.join(current_cmd_dir, "prompt", "ai_prompt_adult.txt")
        with open(prompt_path, 'r', encoding='utf-8') as f: template = f.read()
        
        cta_path = os.path.join(current_cmd_dir, "prompt", f"cta_{project_name}.txt")
        cta_template = ""
        if os.path.exists(cta_path):
            with open(cta_path, 'r', encoding='utf-8') as f: cta_template = f.read()

        # 🚀 3. CSVデータ（艦隊・RSSソース）の動的ロード
        fleet_data = self.load_csv_data(os.path.join(config_dir, f"{project_name}_fleet.csv"))
        if target_pf != 'all':
            fleet_data = [site for site in fleet_data if site.get('platform', '').lower() == target_pf]

        rss_sources = self.load_csv_data(os.path.join(config_dir, f"{project_name}_rss_sources.csv"))
        rss_urls = [row['url'] for row in rss_sources if 'url' in row]
        
        # 🚀 4. 重複排除済みのRSSプール取得
        raw_pool = self.get_fresh_rss_pool(rss_urls)
        rss_pool = [e for e in raw_pool if not Article.objects.filter(site__contains=project_name, source_url=e.link).exists()]

        if not rss_pool:
            self.log("🏁 新着なし。哨戒終了。", self.style.WARNING)
            return

        api_keys = [os.getenv(f"GEMINI_API_KEY_{i}").strip() for i in range(1, 11) if os.getenv(f"GEMINI_API_KEY_{i}")]
        random.shuffle(fleet_data)
        used_entries = set()

        # 🚀 5. 艦隊出撃（メインループ）
        for i, site in enumerate(fleet_data, 1):
            keywords = [k.strip().lower() for k in site.get('routing_keywords', '').split(',') if k.strip()]
            suitable_articles = []
            hit_word = ""

            for entry in rss_pool:
                if entry.link in used_entries: continue
                target_text = (entry.title + getattr(entry, 'summary', '')).lower()
                # キーワードが空なら全通、あればマッチング
                if not keywords or any(k in target_text for k in keywords):
                    suitable_articles.append(entry)
                    hit_word = next((k for k in keywords if k in target_text), "総合")
                    break
            
            mission_title = f" MISSION [{i}/{len(fleet_data)}] "
            target_title = f" TARGET: {site['site_key'].upper()} "
            self.stdout.write(f"\n{self.style.SQL_KEYWORD(mission_title)}{self.style.SUCCESS(target_title)}{'━' * (50 - len(mission_title + target_title))}")

            if not suitable_articles:
                self.log(f" ⏩ SKIP : 適合なし ({site.get('routing_keywords', '')[:15]}...)", self.style.NOTICE)
                continue

            entry = random.choice(suitable_articles)
            
            # 🚀 6. AI Contextの構築（ペルソナ注入）
            site_context = {
                'site_name': site['site_key'],
                'persona': site.get('persona', f"{hit_word}に特化した情熱的なレビュー")
            }

            if self.process_single_post(site, entry, api_keys, template, cta_template, project_name, site_context, hit_word):
                used_entries.add(entry.link)
                wait = random.randint(20, 45)
                self.log(f" 💤 Cooldown: {wait}s...")
                time.sleep(wait)

    def scrape_article_advanced(self, entry):
        """🚀 7. DMM/itermタグ特化型スクレイピング & 高画質化機能"""
        try:
            raw_img_url = ""
            # iterm:package(DMM拡張)を最優先
            if hasattr(entry, 'package'): 
                raw_img_url = entry.package
            
            # fallback: summary内のimgタグ
            if not raw_img_url:
                content = getattr(entry, 'summary', '')
                if hasattr(entry, 'content'): content = entry.content[0].value
                img_match = re.search(r'src=["\'](.*?)["\']', content)
                if img_match: raw_img_url = img_match.group(1)

            # 🛡️ 物理的ガード: URLがない、またはプロトコル不足なら即破棄 (Invalid URL '' 回避)
            if not raw_img_url: return None
            if raw_img_url.startswith('//'): raw_img_url = 'https:' + raw_img_url
            
            # 🚀 高画質フラグ置換 (ps.jpg -> pl.jpg)
            img_url = re.sub(r'(p[s|r|t]|p)\.jpg$', 'pl.jpg', raw_img_url)

            # 本文クレンジング
            soup = BeautifulSoup(getattr(entry, 'summary', ''), 'html.parser')
            for tag in soup.find_all(['img', 'a']): tag.decompose()
            
            return {
                'url': entry.link,
                'title': entry.title,
                'img': img_url,
                'body': soup.get_text().strip()[:1000]
            }
        except: return None

    def process_single_post(self, cfg, entry, api_keys, template, cta_template, project_name, context, hit_word):
        connection.close()
        
        # 🚀 8. スクレイピング実行
        data = self.scrape_article_advanced(entry)
        if not data or not data.get('img'):
            self.log(" ⚠️ ABORT: 画像取得失敗のため中止。")
            return False

        # 🚀 9. AIコンテンツ生成
        merged_template = template.replace("{{site_name}}", context['site_name']).replace("{{persona}}", context['persona'])
        processor = AIProcessor(api_keys, merged_template)
        ext = processor.generate_blog_content(data, cfg['site_key'])
        if not ext: return False

        content = ext.get('cont_g', '')
        # タイトル抽出ロジック（[TITLE]タグ対応版）
        title_match = re.search(r'\[TITLE\](.*?)\[/TITLE\]', content, re.DOTALL)
        gen_title = title_match.group(1).strip() if title_match else ext.get('title_g', data['title'])
        body_match = re.search(r'\[BODY\](.*?)\[/BODY\]', content, re.DOTALL)
        clean_body = body_match.group(1).strip() if body_match else content

        try:
            # 🚀 10. Django DB 厳密保存 (重複投稿防止の要)
            new_article, created = Article.objects.get_or_create(
                source_url=data['url'],
                site=f"{project_name}_{cfg['site_key']}",
                defaults={
                    'content_type': 'news',
                    'title': gen_title,
                    'body_text': clean_body,
                    'main_image_url': data['img'],
                    'is_exported': True
                }
            )
            if not created: 
                self.log(" ⏩ SKIP: DB重複検知。")
                return False

            # 🚀 11. 動的CTA & 内部リンク生成 (hash slug対応)
            url_hash = hashlib.md5(data['url'].encode()).hexdigest()[:8]
            slug = f"{datetime.now().strftime('%Y%m%d')}_{url_hash}"
            internal_url = f"https://{self.target_domain}/news/{slug}/"
            
            if cta_template:
                final_cta = cta_template.replace("{{internal_url}}", internal_url).replace("{{affiliate_url}}", data['url'])
            else:
                # デフォルトCTA
                final_cta = f'\n<p><a href="{internal_url}">▶ 本編レビューはこちら</a></p>'

            final_html_body = HTMLConverter.md_to_html(clean_body) + final_cta

            # 🚀 12. 各種プラットフォーム用ドライバーの動的換装
            driver_cfg = cfg.copy()
            driver_cfg.update({
                'api_key': cfg.get('api_key_or_pw'), 
                'endpoint': cfg.get('url_or_endpoint'),
                'user': cfg.get('user_id')
            })
            
            pf = cfg['platform'].lower()
            driver_class = {'hatena': HatenaDriver, 'blogger': BloggerDriver}.get(pf, LivedoorDriver)
            driver = driver_class(driver_cfg)
            
            # 🚀 13. デプロイ実行
            posted_url = driver.post(title=gen_title, body=final_html_body, image_url=data['img'], source_url=data['url'])
            
            if posted_url:
                # 実況ログ出力
                self.log(f" 🎯 HIT KEYWORD : {self.style.WARNING(hit_word)}")
                self.log(f" ┏{'━'*74}┓")
                self.log(f" ┃ {self.style.SUCCESS('✅ DEPLOY SUCCESSFUL').ljust(82)}┃")
                self.log(f" ┃ 🔗 {str(posted_url)[:70].ljust(72)}┃")
                self.log(f" ┗{'━'*74}┛")
                return True
        except Exception as e:
            self.log(f" 💥 ERROR: {e}", self.style.ERROR)
        return False

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
            except: continue
        return pool