# -*- coding: utf-8 -*-
import os, random, requests, feedparser, time, csv, re
from datetime import datetime
from django.core.management.base import BaseCommand
from django.db import connection

from api.models.article import Article
from api.utils.html_utils import HTMLConverter
from api.management.commands.blog_drivers.hatena_driver import HatenaDriver
from api.management.commands.blog_drivers.livedoor_driver import LivedoorDriver
from api.management.commands.blog_drivers.blogger_driver import BloggerDriver
from api.management.commands.blog_drivers.ai_processor import AIProcessor
from api.management.commands.blog_drivers.rss_parsers import RSSParserFactory

class Command(BaseCommand):
    help = 'C-Plan: Strategic RSS Fleet Deployer (Universal Project Support & Age-Check Bypass)'

    def add_arguments(self, parser):
        parser.add_argument('--project', type=str, default='bicstation', help='Project name (e.g., bicstation, tiper)')
        parser.add_argument('--target', type=str, default=None, help='Filter by platform (e.g., livedoor, hatena)')

    def handle(self, *args, **options):
        project_label = options['project'].lower()
        target_raw = options['target'].lower() if options['target'] else None
        
        self.log(f"--- 🚀 AI Fleet Deployer [{project_label.upper()}] MISSION START ---")
        
        # パス設定（コンテナ内の構造に準拠）
        base_path = "/usr/src/app/api/management/commands"
        config_dir = os.path.join(base_path, "teitoku_settings")
        prompt_dir = os.path.join(base_path, "prompt")
        
        fleet_csv = os.path.join(config_dir, f"{project_label}_fleet.csv")
        rss_csv = os.path.join(config_dir, f"{project_label}_rss_sources.csv")
        cta_path = os.path.join(prompt_dir, f"cta_{project_label}.txt")
        prompt_path = os.path.join(prompt_dir, f"ai_prompt_{project_label}.txt")

        # 1. データロード（全プロジェクト共通）
        fleet_data = self.load_csv_data(fleet_csv)
        rss_sources = self.load_csv_data(rss_csv)
        
        self.log(f"📁 Config Check: Fleet={len(fleet_data)} sites, RSS={len(rss_sources)} sources loaded.")
        
        if not fleet_data or not rss_sources:
            return self.log(f"❌ Critical Error: CSV loading failed for {project_label}. Check paths.")

        # ターゲット指定がある場合はフィルタリング
        if target_raw:
            fleet_data = [f for f in fleet_data if f.get('platform', '').lower().startswith(target_raw[:2])]

        # 2. RSSスキャン（全ソース共通・年齢確認突破ロジック入り）
        self.log(f"📡 Scanning {len(rss_sources)} RSS sources...")
        all_rss_entries = self.get_all_rss_entries(rss_sources)
        self.log(f"✅ Total {len(all_rss_entries)} entries successfully pooled.")

        if not all_rss_entries:
            return self.log("🏁 No entries found. Ending mission.")

        # 3. 共通リソースの準備 (API Key, Prompts)
        api_keys = [os.getenv(f"GEMINI_API_KEY_{i}").strip() for i in range(1, 11) if os.getenv(f"GEMINI_API_KEY_{i}")]
        if not api_keys: return self.log("❌ Gemini API keys not set in environment.")

        try:
            with open(prompt_path, "r", encoding='utf-8') as f: ai_template = f.read()
            with open(cta_path, "r", encoding='utf-8') as f: cta_template = f.read()
        except Exception as e:
            return self.log(f"❌ Template Load Error: {e}")

        success_count = 0
        used_links_in_session = set()

        # 4. デプロイループ (全サイト対応)
        for site_cfg in fleet_data:
            site_key = site_cfg.get('site_key', 'unknown')
            is_adult = str(site_cfg.get('is_adult', '0')) == '1'
            # bicstationなどで使用するキーワードマッチングを維持
            keywords = [k.strip() for k in site_cfg.get('routing_keywords', '').split(',') if k.strip()]
            
            mode_label = "🔞 ADULT" if is_adult else "🌐 GENERAL"
            self.log(f"🔍 [{site_key}] {mode_label} / Matching...")
            
            target_entry = self.find_best_entry(all_rss_entries, keywords, project_label, used_links_in_session, is_adult)

            if not target_entry:
                self.log(f"⚠️ [{site_key}] No matching new entry found.")
                continue

            self.log(f"🚜 [{site_key.upper()}] Deploying: {target_entry['title'][:45]}...")

            if self.deploy_single_post(site_cfg, target_entry, ai_template, cta_template, api_keys, project_label, config_dir, is_adult):
                success_count += 1
                used_links_in_session.add(target_entry['link'])
                time.sleep(random.randint(20, 45)) # 短時間の待機でBAN防止
            else:
                self.log(f"❌ [{site_key.upper()}] Post Failed.")

        self.log(f"🏁 MISSION COMPLETE. Success: {success_count}/{len(fleet_data)}")

    def get_all_rss_entries(self, sources):
        pool = []
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
            'Accept': 'application/xml,application/rss+xml,text/xml;q=0.9,*/*;q=0.8'
        }
        # 強力な年齢確認突破用Cookie (DMM, MGS, etc.)
        bypass_cookies = {'ckcy': '1', 'age_check_done': '1', 'is_adult': '1', 'check_age': '1', 'mgs_age_check': '1'}
        
        for src in sources:
            url = src.get('url')
            if not url or not url.startswith('http'): continue
            
            try:
                self.log(f"   📡 Fetching: {url[:60]}...")
                res = requests.get(url, timeout=15, headers=headers, cookies=bypass_cookies, allow_redirects=True)
                
                if res.status_code != 200:
                    self.log(f"      ❌ HTTP {res.status_code}")
                    continue

                raw_text = res.text.strip()
                # HTMLリダイレクトに捕まっていないかチェック
                if '<html' in raw_text[:300].lower() and ('age_check' in res.url or 'confirm' in res.url):
                    self.log(f"      ⚠️ Stuck at Verification page.")
                    continue

                feed = feedparser.parse(raw_text)
                count_before = len(pool)
                
                # 標準パース
                if feed.entries:
                    for e in feed.entries:
                        link = getattr(e, 'link', None) or getattr(e, 'id', None) or getattr(e, 'guid', None)
                        if link: pool.append({'title': e.title, 'link': link})
                
                # 正規表現による緊急抽出（フィードが特殊な形式の場合）
                if len(pool) == count_before:
                    items = re.findall(r'<item.*?>.*?</item>', raw_text, re.DOTALL)
                    for item in items:
                        t = re.search(r'<title>(.*?)</title>', item)
                        l = re.search(r'<(?:link|guid|id)>(.*?)</(?:link|guid|id)>', item)
                        if t and l:
                            # CDATAタグ等の除去
                            title_clean = re.sub(r'<!\[CDATA\[(.*?)\]\]>', r'\1', t.group(1))
                            title_clean = re.sub(r'<.*?>', '', title_clean).strip()
                            pool.append({'title': title_clean, 'link': l.group(1).strip()})

                self.log(f"      ✅ Found {len(pool) - count_before} entries.")
            except Exception as ex:
                self.log(f"      🔥 Fetch Error: {str(ex)[:100]}")
        return pool

    def deploy_single_post(self, site, entry, ai_template, cta_template, api_keys, project_label, config_dir, is_adult_site):
        # データベース接続の安定化
        connection.close() 
        try:
            # 1. コンテンツ抽出
            parser = RSSParserFactory.get_parser(entry['link'])
            parsed = parser.parse(entry['link'])
            if not parsed or not parsed.get('body'):
                self.log(f"      ❌ Content Extraction Failed.")
                return False
            
            source_img_url = parsed.get('img')
            
            # 2. AI処理
            processor = AIProcessor(api_keys, ai_template)
            raw_data = {
                'url': entry['link'], 'title': entry['title'], 
                'img': source_img_url, 'body': parsed['body'],
                'is_adult': is_adult_site 
            }
            ext = processor.generate_blog_content(raw_data, site['site_key'])
            if not ext: return False
            
            post_title = ext.get('title_g') or ext.get('title_h') or entry['title']
            raw_body_text = ext.get('cont_g') or ext.get('cont_h') or ext.get('raw_text', '')

            # 3. 内部DB保存
            new_article = Article.objects.create(
                site=project_label,
                content_type='news',
                title=post_title,
                body_text=raw_body_text,
                main_image_url=source_img_url,
                source_url=entry['link'],
                extra_metadata={
                    "site_key": site['site_key'],
                    "is_adult": is_adult_site,
                    "hit_keyword": site.get('routing_keywords', '').split(',')[0]
                }
            )

            # 4. HTML組み立て
            html_body = HTMLConverter.md_to_html(raw_body_text)
            top_image_html = f'<div style="text-align:center; margin-bottom:20px;"><img src="{source_img_url}" style="max-width:100%; border-radius:8px;"></div><br>' if source_img_url else ""
            final_cta = cta_template.replace("{{internal_url}}", f"https://{project_label}.com/news/{new_article.id}")
            full_content = top_image_html + html_body + final_cta

            # 5. 各プラットフォームドライバ実行
            pf = site['platform'].lower()
            driver_class = {'hatena': HatenaDriver, 'blogger': BloggerDriver}.get(pf, LivedoorDriver)
            
            driver_config = site.copy()
            driver_config.update({
                'api_key': site.get('api_key_or_pw'),
                'url': site.get('url_or_endpoint'),
                'blog_id': site.get('blog_id_or_rpc'),
                'current_dir': config_dir
            })
            
            driver = driver_class(driver_config)
            
            if driver.post(title=post_title, body=full_content, image_url=None, source_url=entry['link']):
                new_article.is_exported = True
                new_article.save()
                return True
            else:
                new_article.delete() 
                return False
        except Exception as e:
            self.log(f"      🔥 Deploy Process Error: {str(e)}")
            return False

    def find_best_entry(self, entries, keywords, project_label, used_links, is_adult):
        for e in entries:
            if e['link'] in used_links: continue
            
            # キーワードマッチング (タイトルに含まれるか)
            if keywords:
                if not any(kw.lower() in e['title'].lower() for kw in keywords):
                    continue

            # DB重複チェック (プロジェクト単位)
            if not Article.objects.filter(site=project_label, source_url=e['link']).exists():
                return e
        return None

    def load_csv_data(self, path):
        if not os.path.exists(path):
            self.log(f"❌ File not found: {path}")
            return []
        data = []
        try:
            with open(path, "r", encoding="utf-8") as f:
                lines = f.readlines()
                if not lines: return []
                f.seek(0)
                # パイプ | または カンマ , を自動判定
                delim = '|' if '|' in lines[0] else ','
                reader = csv.DictReader(f, delimiter=delim)
                for row in reader:
                    # 列名 'url' がない場合の補完（最終列をURLとみなす）
                    if 'url' not in row or not row['url']:
                        vals = list(row.values())
                        if vals: row['url'] = vals[-1]
                    
                    if row.get('url') and str(row['url']).startswith('http'):
                        data.append(row)
            return data
        except Exception as e:
            self.log(f"🔥 CSV Load Error: {e}")
            return []

    def log(self, msg):
        ts = datetime.now().strftime('%H:%M:%S')
        self.stdout.write(f"[{ts}] {msg}")