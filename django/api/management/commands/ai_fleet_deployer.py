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
    help = 'C-Plan: Full-Auto Fleet Deployer (API Load-Balancing & Individual Mapping)'

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

        if target_raw:
            fleet_data = [f for f in fleet_data if f.get('platform', '').lower().startswith(target_raw[:2])]

        # 2. RSSプール作成
        self.log(f"📡 Pooling RSS for {project_label}...")
        all_rss_entries = self.get_all_rss_entries(rss_sources)
        self.log(f"✅ {len(all_rss_entries)} entries found in pool.")

        # 3. 10個のAPIキーを環境変数からロード
        available_keys = [os.getenv(f"GEMINI_API_KEY_{i}").strip() for i in range(1, 11) if os.getenv(f"GEMINI_API_KEY_{i}")]
        if not available_keys:
            return self.log("❌ CRITICAL: No Gemini API Keys found in environment variables (1-10).")
        self.log(f"🔑 API Keys Ready: {len(available_keys)} keys loaded for load-balancing.")

        # AIテンプレートロード
        try:
            with open(os.path.join(prompt_dir, f"ai_prompt_{project_label}.txt"), "r", encoding='utf-8') as f: ai_template = f.read()
            with open(os.path.join(prompt_dir, f"cta_{project_label}.txt"), "r", encoding='utf-8') as f: cta_template = f.read()
        except Exception as e:
            return self.log(f"❌ Template Load Error: {e}")

        success_count = 0
        used_links_in_session = set()

        # 4. メインループ（CSVの1行 = 1ブログとして独立処理）
        for site_cfg in fleet_data:
            site_key = site_cfg.get('site_key', 'gen')
            keywords = [k.strip() for k in site_cfg.get('routing_keywords', '').split(',') if k.strip()]
            
            self.log(f"🔍 [{site_key}] Matching entry for specific endpoint...")
            target_entry = self.find_best_entry(all_rss_entries, keywords, project_label, used_links_in_session)

            if not target_entry:
                self.log(f"⚠️ [{site_key}] No fresh match.")
                continue

            # 5. パース実行 (FANZA/RSS Parser)
            parser = RSSParserFactory.get_parser(target_entry['link'])
            parsed_data = parser.parse(target_entry['link'])
            
            # FANZA dummy画像置換 (CID抽出ロジック)
            cid_match = re.search(r'cid=([^/&?]+)', target_entry['link']) or re.search(r'/cid/([^/&?]+)', target_entry['link'])
            if cid_match and ("dummy" in str(parsed_data.get('img', '')) or not parsed_data.get('img')):
                cid = cid_match.group(1)
                parsed_data['img'] = f"https://p.dmm.co.jp/p/mono/movie/adult/{cid}/{cid}pl.jpg"

            if not parsed_data or not parsed_data.get('body'):
                continue

            self.log("="*60)
            self.log(f"📊 DEST: {site_key.upper()} ({site_cfg.get('platform', '').upper()})")
            self.log(f"🔗 URL : {site_cfg.get('url_or_endpoint') or site_cfg.get('site_urls')}")
            self.log(f"📝 TLE : {target_entry['title'][:50]}...")
            self.log(f"🖼️ IMG : {parsed_data.get('img')}")
            self.log("="*60)

            # 6. API分散デプロイ
            try:
                with transaction.atomic():
                    if self.deploy_balanced_post(site_cfg, target_entry, parsed_data, ai_template, cta_template, available_keys, project_label, config_dir):
                        success_count += 1
                        used_links_in_session.add(target_entry['link'])
                        self.log(f"✨ [{site_key.upper()}] SUCCESS & DB MAPPED.")
                        time.sleep(random.randint(20, 40))
                    else:
                        self.log(f"❌ [{site_key.upper()}] Deployment Failed.")
            except Exception as e:
                self.log(f"🔥 Transaction Error: {e}")

        self.log(f"🏁 [{project_label.upper()}] COMPLETE: {success_count}/{len(fleet_data)}", self.style.SUCCESS)

    def deploy_balanced_post(self, site, entry, parsed_data, ai_template, cta_template, api_keys, project_label, config_dir):
        if connection.connection is not None and not connection.is_usable():
            connection.close()
            
        # --- AI生成 (10個のキーからランダムに選び、503時はリトライ) ---
        ext = None
        max_retries = 5
        for attempt in range(max_retries):
            # 呼び出しごとにキーをランダムシャッフルして選択
            current_key = random.choice(api_keys)
            try:
                processor = AIProcessor([current_key], ai_template)
                ext = processor.generate_blog_content({
                    'url': entry['link'], 'title': entry['title'], 
                    'img': parsed_data.get('img'), 'body': parsed_data.get('body'),
                    'is_adult': str(site.get('is_adult', '0')).strip() == '1'
                }, site.get('site_key'))
                
                if ext: break # 成功
            except Exception as e:
                # 503/429/Overloaded 等のエラー時はキーを切り替えてリトライ
                wait_time = (attempt + 1) * 10
                self.log(f"⏳ API Error (Key Switch): {str(e)[:40]}... Retrying with different key in {wait_time}s.")
                time.sleep(wait_time)

        if not ext: return False

        try:
            p_title = (ext.get('title_g') or entry['title'])[:100]
            p_body = ext.get('cont_g') or ext.get('raw_text', '')

            # DB保存
            new_art = Article.objects.create(
                site=project_label, title=p_title, body_text=p_body, 
                main_image_url=parsed_data.get('img'), source_url=entry['link']
            )

            # エンドポイント確定
            raw_url = site.get('url_or_endpoint') or site.get('site_urls')
            if raw_url and not raw_url.endswith('/') and "atom" not in raw_url:
                raw_url += '/'

            cfg = site.copy()
            cfg.update({
                'api_key': site.get('api_key_or_pw'), 'url': raw_url,
                'user': site.get('user'), 'blog_id': site.get('blog_id_or_rpc'), 'current_dir': config_dir
            })
            
            pf = site.get('platform', '').lower()
            driver = {'hatena': HatenaDriver, 'blogger': BloggerDriver}.get(pf, LivedoorDriver)(cfg)
            
            # HTML構築
            img_html = f'<div style="text-align:center; margin-bottom:15px;"><img src="{parsed_data.get("img")}" style="max-width:100%;"></div><br>'
            final_content = img_html + HTMLConverter.md_to_html(p_body) + cta_template.replace("{{internal_url}}", f"https://{project_label}.com/news/{new_art.id}")
            
            if driver.post(title=p_title, body=final_content, source_url=entry['link']):
                new_art.is_exported = True; new_art.save(); return True
            
            new_art.delete(); return False
        except Exception as e:
            self.log(f"🚨 Sub-Error: {e}"); return False

    def get_all_rss_entries(self, sources):
        pool = []
        cookies = {'ckcy': '1', 'age_check_done': '1', 'is_adult': '1'}
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
            if e['link'] in used_links: continue
            if keywords and not any(kw.lower() in e['title'].lower() for kw in keywords): continue
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
                delim = '|' if '|' in content.split('\n')[0] else ','
                f.seek(0)
                reader = csv.DictReader(f, delimiter=delim)
                for row in reader:
                    data.append({str(k).strip(): str(v).strip() for k, v in row.items() if k})
            return data
        except: return []

    def log(self, msg, style_func=None):
        ts = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        if style_func: self.stdout.write(style_func(f"[{ts}] {msg}"))
        else: self.stdout.write(f"[{ts}] {msg}")