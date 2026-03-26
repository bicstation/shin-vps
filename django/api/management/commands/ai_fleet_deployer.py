# -*- coding: utf-8 -*-
import os, random, requests, feedparser, time, csv, re
from datetime import datetime
from django.core.management.base import BaseCommand
from django.db import connection, transaction

from api.models.article import Article
from api.utils.html_utils import HTMLConverter
from api.management.commands.blog_drivers.rss_parsers import RSSParserFactory 
from api.management.commands.blog_drivers.hatena_driver import HatenaDriver
from api.management.commands.blog_drivers.livedoor_driver import LivedoorDriver
from api.management.commands.blog_drivers.blogger_driver import BloggerDriver
from api.management.commands.blog_drivers.ai_processor import AIProcessor

class Command(BaseCommand):
    help = 'C-Plan: Full-Auto Fleet Deployer (Row-by-Row Individual Execution)'

    def add_arguments(self, parser):
        parser.add_argument('--project', type=str, default='tiper', help='Project Name')
        parser.add_argument('--target', type=str, default=None, help='Filter: livedoor, blogger, hatena')

    def handle(self, *args, **options):
        project_label = options['project'].lower()
        target_raw = options['target'].lower() if options['target'] else None
        
        self.log(f"--- 🚀 MISSION START: [{project_label.upper()}] ---", self.style.SUCCESS)
        
        # パス解決
        base_path = "/usr/src/app/api/management/commands"
        config_dir = os.path.join(base_path, "teitoku_settings")
        prompt_dir = os.path.join(base_path, "prompt")
        
        fleet_csv = os.path.join(config_dir, f"{project_label}_fleet.csv")
        rss_csv = os.path.join(config_dir, f"{project_label}_rss_sources.csv")
        
        # 1. データロード
        fleet_data = self.load_csv_data(fleet_csv)
        rss_sources = self.load_csv_data(rss_csv)
        
        if not fleet_data or not rss_sources:
            return self.log(f"❌ Error: Config files missing for {project_label}.")

        # ターゲットフィルタリング（引数指定時）
        if target_raw:
            fleet_data = [f for f in fleet_data if f.get('platform', '').lower().startswith(target_raw[:2])]

        # 2. RSSプール作成
        self.log(f"📡 Pooling RSS for {project_label}...")
        all_rss_entries = self.get_all_rss_entries(rss_sources)
        self.log(f"✅ {len(all_rss_entries)} entries found in pool.")

        # 3. AIテンプレート・APIキー準備
        api_keys = [os.getenv(f"GEMINI_API_KEY_{i}").strip() for i in range(1, 11) if os.getenv(f"GEMINI_API_KEY_{i}")]
        try:
            with open(os.path.join(prompt_dir, f"ai_prompt_{project_label}.txt"), "r", encoding='utf-8') as f: ai_template = f.read()
            with open(os.path.join(prompt_dir, f"cta_{project_label}.txt"), "r", encoding='utf-8') as f: cta_template = f.read()
        except Exception as e:
            return self.log(f"❌ Template Load Error: {e}")

        success_count = 0
        used_links_in_session = set()

        # 4. メインループ（CSVの1行 = 1つの独立したブログ設定として処理）
        for site_cfg in fleet_data:
            site_key = site_cfg.get('site_key', 'gen')
            # その行専用のキーワードを抽出
            keywords = [k.strip() for k in site_cfg.get('routing_keywords', '').split(',') if k.strip()]
            
            self.log(f"🔍 [{site_key}] Matching entry for specific endpoint...")
            target_entry = self.find_best_entry(all_rss_entries, keywords, project_label, used_links_in_session)

            if not target_entry:
                self.log(f"⚠️ [{site_key}] No matching fresh content for these keywords.")
                continue

            # 5. パース実行 (FanzaParser等の自動選択)
            parser = RSSParserFactory.get_parser(target_entry['link'])
            parsed_data = parser.parse(target_entry['link'])

            if not parsed_data or not parsed_data.get('body'):
                self.log(f"🚫 [{site_key}] Parse failed: {target_entry['link']}")
                continue

            # 詳細ログ出力
            self.log("="*60)
            self.log(f"📊 DEPLOY TO  : {site_key.upper()} ({site_cfg.get('platform', '').upper()})")
            self.log(f"🔗 ENDPOINT   : {site_cfg.get('url_or_endpoint')}")
            self.log(f"📝 TARGET TLE : {target_entry['title']}")
            self.log(f"🖼️ IMAGE URL  : {parsed_data.get('img')}")
            self.log("="*60)

            # 6. DB保存 & デプロイ実行
            try:
                with transaction.atomic():
                    if self.deploy_single_post(site_cfg, target_entry, parsed_data, ai_template, cta_template, api_keys, project_label, config_dir):
                        success_count += 1
                        used_links_in_session.add(target_entry['link'])
                        self.log(f"✨ [{site_key.upper()}] MISSION SUCCESS & DB MAPPED.")
                        time.sleep(random.randint(25, 45))
                    else:
                        self.log(f"❌ [{site_key.upper()}] Deployment Failed.")
            except Exception as e:
                self.log(f"🔥 System Error on {site_key}: {e}")

        self.log(f"🏁 [{project_label.upper()}] MISSION COMPLETE. Total Success: {success_count}/{len(fleet_data)}", self.style.SUCCESS)

    def deploy_single_post(self, site, entry, parsed_data, ai_template, cta_template, api_keys, project_label, config_dir):
        # DB接続リフレッシュ
        if connection.connection is not None and not connection.is_usable():
            connection.close()
            
        try:
            is_adult_site = str(site.get('is_adult', '0')).strip() == '1'
            
            # AI Processor
            processor = AIProcessor(api_keys, ai_template)
            ext = processor.generate_blog_content({
                'url': entry['link'], 'title': entry['title'], 
                'img': parsed_data.get('img'), 'body': parsed_data.get('body'),
                'is_adult': is_adult_site 
            }, site.get('site_key'))
            
            if not ext: return False
            
            p_title = (ext.get('title_g') or entry['title'])[:100]
            p_body = ext.get('cont_g') or ext.get('raw_text', '')

            # --- DB保存（project_labelでマッピング） ---
            new_art = Article.objects.create(
                site=project_label, 
                title=p_title, 
                body_text=p_body, 
                main_image_url=parsed_data.get('img'), 
                source_url=entry['link']
            )

            # --- ドライバー設定（CSV行の値をそのまま使用） ---
            pf = site.get('platform', '').lower()
            # url_or_endpoint が存在すれば優先、なければ site_urls
            endpoint_url = site.get('url_or_endpoint') or site.get('site_urls')
            
            # 念のため末尾スラッシュ調整（AtomPubエンドポイント以外の場合）
            if endpoint_url and not endpoint_url.endswith('/') and "atom" not in endpoint_url:
                endpoint_url += '/'

            cfg = {
                'api_key': site.get('api_key_or_pw'),
                'url': endpoint_url,
                'user': site.get('user'),
                'blog_id': site.get('blog_id_or_rpc'),
                'current_dir': config_dir,
                'platform': pf
            }
            
            # ドライバー選択
            driver_map = {'hatena': HatenaDriver, 'blogger': BloggerDriver}
            driver = driver_map.get(pf, LivedoorDriver)(cfg)
            
            # 本文構築
            img_html = f'<div style="text-align:center; margin-bottom:15px;"><img src="{parsed_data.get("img")}" style="max-width:100%;"></div><br>' if parsed_data.get('img') else ""
            final_content = img_html + HTMLConverter.md_to_html(p_body) + cta_template.replace("{{internal_url}}", f"https://{project_label}.com/news/{new_art.id}")
            
            # 外部投稿
            if driver.post(title=p_title, body=final_content, source_url=entry['link']):
                new_art.is_exported = True
                new_art.save()
                return True
            else:
                new_art.delete() # 失敗時はDBレコードを削除して再試行を可能にする
                return False
        except Exception as e:
            self.log(f"🚨 Deployment Sub-Error: {e}")
            return False

    def get_all_rss_entries(self, sources):
        pool = []
        # RSSから年齢制限などを回避するための汎用クッキー
        cookies = {'ckcy': '1', 'age_check_done': '1', 'is_adult': '1', 'check_age': '1'}
        for src in sources:
            url = src.get('url') or next((v for v in src.values() if str(v).startswith('http')), None)
            if not url: continue
            try:
                res = requests.get(url, timeout=12, cookies=cookies, headers={'User-Agent': 'Mozilla/5.0'})
                feed = feedparser.parse(res.text)
                for e in feed.entries:
                    link = getattr(e, 'link', None) or getattr(e, 'id', None)
                    if link: pool.append({'title': e.title, 'link': link})
            except: continue
        return pool

    def find_best_entry(self, entries, keywords, project_label, used_links):
        for e in entries:
            # 今セッションですでに使ったリンクはスキップ
            if e['link'] in used_links: continue
            # キーワード指定がある場合、タイトルに含まれているかチェック
            if keywords and not any(kw.lower() in e['title'].lower() for kw in keywords): continue
            # DBに同一URL（同一プロジェクト内）が存在するかチェック
            if not Article.objects.filter(site=project_label, source_url=e['link']).exists():
                return e
        return None

    def load_csv_data(self, path):
        if not os.path.exists(path): return []
        data = []
        try:
            with open(path, "r", encoding="utf-8-sig") as f:
                content = f.read().strip()
                if not content: return []
                # デリミタの自動判別（パイプ優先）
                delim = '|' if '|' in content.split('\n')[0] else ','
                f.seek(0)
                reader = csv.DictReader(f, delimiter=delim)
                for row in reader:
                    # キーと値の空白を除去して辞書化
                    data.append({str(k).strip(): str(v).strip() for k, v in row.items() if k})
            return data
        except Exception: return []

    def log(self, msg, style_func=None):
        ts = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        text = f"[{ts}] {msg}"
        if style_func: self.stdout.write(style_func(text))
        else: self.stdout.write(text)