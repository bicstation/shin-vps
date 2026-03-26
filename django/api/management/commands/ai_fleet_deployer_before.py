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
    help = 'C-Plan: Strategic RSS Fleet Deployer (Image Top & DB Persistence Fix)'

    def add_arguments(self, parser):
        parser.add_argument('--project', type=str, default='bicstation', help='Project name')
        parser.add_argument('--target', type=str, default=None, help='Filter by platform')

    def handle(self, *args, **options):
        project_label = options['project'].lower()
        target_raw = options['target'].lower() if options['target'] else None
        
        self.log(f"--- 🚀 AI Fleet Deployer [{project_label.upper()}] MISSION START ---")
        
        base_path = "/usr/src/app/api/management/commands"
        config_dir = os.path.join(base_path, "teitoku_settings")
        prompt_dir = os.path.join(base_path, "prompt")
        
        fleet_csv = os.path.join(config_dir, f"{project_label}_fleet.csv")
        rss_csv = os.path.join(config_dir, f"{project_label}_rss_sources.csv")
        cta_path = os.path.join(prompt_dir, f"cta_{project_label}.txt")
        prompt_path = os.path.join(prompt_dir, f"ai_prompt_{project_label}.txt")

        fleet_data = self.load_csv_data(fleet_csv)
        rss_sources = self.load_csv_data(rss_csv)
        
        if not fleet_data or not rss_sources:
            return self.log("❌ 設定ファイルが見つかりません。", self.style.ERROR if hasattr(self, 'style') else None)

        if target_raw:
            fleet_data = [
                f for f in fleet_data 
                if f['platform'].lower() == target_raw or f['platform'].lower().startswith(target_raw[:2])
            ]
            if not fleet_data:
                return self.log(f"⚠️ ターゲット '{target_raw}' に合致するサイトがありません。")

        self.log(f"📡 Scanning all RSS sources...")
        all_rss_entries = self.get_all_rss_entries(rss_sources)
        self.log(f"✅ Total {len(all_rss_entries)} entries found.")

        api_keys = [os.getenv(f"GEMINI_API_KEY_{i}").strip() for i in range(1, 11) if os.getenv(f"GEMINI_API_KEY_{i}")]
        if not api_keys:
            return self.log("❌ Gemini APIキーがありません。", self.style.ERROR if hasattr(self, 'style') else None)

        try:
            with open(prompt_path, "r", encoding='utf-8') as f: ai_template = f.read()
            with open(cta_path, "r", encoding='utf-8') as f: cta_template = f.read()
        except Exception as e:
            return self.log(f"❌ テンプレート読込失敗: {e}", self.style.ERROR if hasattr(self, 'style') else None)

        success_count = 0
        used_links_in_session = set()

        for site_cfg in fleet_data:
            b_key = site_cfg['site_key']
            is_adult_site = site_cfg.get('is_adult', '0') == '1'
            keywords = [k.strip() for k in site_cfg.get('routing_keywords', '').split(',') if k.strip()]
            
            mode_label = "🔞 ADULT" if is_adult_site else "🌐 GENERAL"
            self.log(f"🔍 [{b_key}] {mode_label} / Matching...")
            
            target_entry = self.find_best_entry(all_rss_entries, keywords, project_label, used_links_in_session, is_adult_site)

            if not target_entry:
                self.log(f"⚠️ [{b_key}] No matching new entry found.")
                continue

            self.log(f"🚜 [{b_key.upper()}] Deploying: {target_entry['title'][:40]}...")

            if self.deploy_single_post(site_cfg, target_entry, ai_template, cta_template, api_keys, project_label, config_dir, is_adult_site):
                success_count += 1
                used_links_in_session.add(target_entry['link'])
                
                if site_cfg != fleet_data[-1]:
                    time.sleep(random.randint(30, 60))
            else:
                self.log(f"❌ [{b_key.upper()}] Mission Failed.")

        self.log(f"🏁 MISSION COMPLETE. Success: {success_count}/{len(fleet_data)}")

    def deploy_single_post(self, site, entry, ai_template, cta_template, api_keys, project_label, config_dir, is_adult_site):
        connection.close() 
        try:
            parser = RSSParserFactory.get_parser(entry['link'])
            parsed = parser.parse(entry['link'])
            
            if not parsed or not parsed.get('body'): return False
            
            source_img_url = parsed.get('img')
            
            raw_data = {
                'url': entry['link'], 'title': entry['title'], 
                'img': source_img_url, 'body': parsed['body'],
                'is_adult': is_adult_site 
            }

            processor = AIProcessor(api_keys, ai_template)
            ext = processor.generate_blog_content(raw_data, site['site_key'])
            if not ext: return False
            
            # 確定情報の整理
            post_title = ext.get('title_g') or ext.get('title_h') or entry['title']
            raw_body_text = ext.get('cont_g') or ext.get('cont_h') or ext.get('raw_text', '')

            # --- 🛠️ ステップ1: DBにまず保存（idを確定させる） ---
            new_article = Article.objects.create(
                site=project_label,
                content_type='news',
                title=post_title,
                body_text=raw_body_text,
                main_image_url=source_img_url,
                source_url=entry['link'],
                extra_metadata={
                    "hit": site.get('routing_keywords', '').split(',')[0] if site.get('routing_keywords') else "auto",
                    "model": "v47.1-ultimate",
                    "site_key": site['site_key'],
                    "platform": site['platform'],
                    "is_adult": is_adult_site
                }
            )

            # コンテンツ構築 (確定した id を CTA に反映)
            internal_url = f"https://{project_label}.com/news/{new_article.id}"
            pf = site['platform'].lower()
            
            html_body = HTMLConverter.md_to_html(raw_body_text)
            
            # 画像を本文トップに挿入
            top_image_html = ""
            if source_img_url:
                top_image_html = f'<div class="post-image" style="text-align:center; margin-bottom:20px;"><img src="{source_img_url}" style="max-width:100%; height:auto; border-radius:8px;"></div><br>'
            
            final_cta = cta_template.replace("{{internal_url}}", internal_url)
            full_content = top_image_html + html_body + final_cta

            # ドライバー投稿準備
            driver_class = {'hatena': HatenaDriver, 'blogger': BloggerDriver}.get(pf, LivedoorDriver)
            cfg = site.copy()
            cfg.update({
                'api_key': site.get('api_key_or_pw'),
                'url': site.get('url_or_endpoint'),
                'user': site.get('user'),
                'blog_id': site.get('blog_id_or_rpc'),
                'current_dir': config_dir
            })
            
            driver = driver_class(cfg)
            
            # --- 🛠️ ステップ2: 外部投稿の実行 ---
            # ここでもし失敗しても delete() はせず、履歴として残す
            if driver.post(title=post_title, body=full_content, image_url=None, source_url=entry['link']):
                new_article.is_exported = True
                new_article.save()
                self.log(f"✅ [{site['site_key']}] Export Success & Record Saved.")
                return True
            else:
                # 投稿自体に失敗しても、AIが生成した記事データはDBに保持する
                new_article.is_exported = False
                new_article.save()
                self.log(f"⚠️ [{site['site_key']}] Export returned False, but record preserved in DB.")
                return False
                
        except Exception as e:
            self.log(f"🔥 Error: {str(e)}")
            return False

    def find_best_entry(self, entries, keywords, project_label, used_links, is_adult_site):
        for e in entries:
            if e['link'] in used_links: continue
            match = any(kw.lower() in e['title'].lower() for kw in keywords) if keywords else True
            if not match: continue

            # 重複チェック（属性を考慮）
            if not Article.objects.filter(
                site=project_label, 
                source_url=e['link'],
                extra_metadata__is_adult=is_adult_site
            ).exists():
                return e
        return None

    def get_all_rss_entries(self, sources):
        pool = []
        for src in sources:
            url = src.get('url')
            if not url: continue
            try:
                res = requests.get(url, timeout=10, headers={'User-Agent': 'Mozilla/5.0'})
                feed = feedparser.parse(res.text)
                for e in feed.entries:
                    pool.append({'title': e.title, 'link': e.link})
            except: continue
        return pool

    def load_csv_data(self, path):
        if not os.path.exists(path): return []
        with open(path, "r", encoding="utf-8") as f:
            return list(csv.DictReader(f, delimiter='|'))

    def log(self, msg, style_func=None):
        ts = datetime.now().strftime('%H:%M:%S')
        text = f"[{ts}] {msg}"
        if style_func: self.stdout.write(style_func(text))
        else: self.stdout.write(text)