# -*- coding: utf-8 -*-
"""
================================================================================
C-PLAN: SUPREME FLEET DEPLOYER - HATENA & BLOGGER FULL SYNC EDITION
================================================================================
【修正内容】
1. CSVの 'user' 列を HatenaDriver に渡すよう修正
2. 'url_or_endpoint' を 'endpoint' キーに変換して Driver へブリッジ
3. AI生成結果から [CONTENT_HATENA] を自動抽出するロジックを統合
================================================================================
"""

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
    help = "Deploy articles to Hatena, Blogger, and Livedoor with platform optimization."

    def add_arguments(self, parser):
        parser.add_argument('--project', type=str, default=None)
        parser.add_argument('--target', type=str, default=None)
        parser.add_argument('--site', type=str, default=None)

    def handle(self, *args, **options):
        if not options['project']:
            self.print_custom_help()
            return

        project_label = options['project'].lower()
        target_platform = options['target'].lower() if options['target'] else None
        target_site_key = options['site'].lower() if options['site'] else None
        
        self.log(f"--- 🚀 MISSION START: [{project_label.upper()}] ---", self.style.SUCCESS)
        
        base_path = "/usr/src/app/api/management/commands"
        config_dir = os.path.join(base_path, "teitoku_settings")
        prompt_dir = os.path.join(base_path, "prompt")
        
        # 1. データロード
        fleet_data = self.load_csv_data(os.path.join(config_dir, f"{project_label}_fleet.csv"))
        rss_sources = self.load_csv_data(os.path.join(config_dir, f"{project_label}_rss_sources.csv"))
        char_comments = self.load_character_comments(os.path.join(config_dir, f"{project_label}_comments.csv"))
        
        if not fleet_data:
            return self.log(f"❌ Fleetデータが見つかりません。", self.style.ERROR)

        # 2. フィルタリング
        if target_site_key:
            fleet_data = [f for f in fleet_data if f.get('site_key', '').lower() == target_site_key]
        elif target_platform:
            fleet_data = [f for f in fleet_data if target_platform in f.get('platform', '').lower()]

        if not fleet_data:
            return self.log(f"⚠️ 条件に一致するサイトがありません。")

        # 3. RSS巡回
        self.log(f"📡 RSSフィードを巡回中...")
        all_rss_entries = self.get_all_rss_entries(rss_sources)
        self.log(f"✅ プール内記事数: {len(all_rss_entries)}")

        # 4. API & Template 準備
        api_keys = [{"key": os.getenv(f"GEMINI_API_KEY_{i}").strip()} 
                    for i in range(1, 11) if os.getenv(f"GEMINI_API_KEY_{i}")]
        if not api_keys:
            return self.log("❌ APIキーが未設定です。", self.style.ERROR)

        try:
            with open(os.path.join(prompt_dir, f"ai_prompt_{project_label}.txt"), "r", encoding='utf-8') as f: ai_template = f.read()
            with open(os.path.join(prompt_dir, f"cta_{project_label}.txt"), "r", encoding='utf-8') as f: cta_template = f.read()
        except Exception as e:
            return self.log(f"❌ テンプレート読込失敗: {e}", self.style.ERROR)

        success_count = 0
        used_links = set()

        # 5. メインループ
        for idx, site_cfg in enumerate(fleet_data, 1):
            site_key = site_cfg.get('site_key', 'UNKNOWN')
            platform = site_cfg.get('platform', '').lower()
            
            self.log(f"🔄 [{idx}/{len(fleet_data)}] 展開開始: {site_key} ({platform})")
            
            kws = [k.strip() for k in site_cfg.get('routing_keywords', '').split(',') if k.strip()]
            target_entry = self.find_best_entry(all_rss_entries, kws, project_label, used_links)

            if not target_entry:
                self.log(f"⏭️ キーワード不一致のためスキップ。")
                continue

            # コンテンツ解析
            parser = RSSParserFactory.get_parser(target_entry['link'])
            parsed_data = parser.parse(target_entry['link'])
            
            if not parsed_data or not parsed_data.get('body'):
                self.log(f"⚠️ 本文取得失敗: {target_entry['title']}")
                continue

            selected_comment = random.choice(char_comments) if char_comments else "注目の最新ニュースです。"

            # 🚀 デプロイ実行
            success, result = self.deploy_balanced_unit(site_cfg, target_entry, parsed_data, ai_template, cta_template, api_keys, project_label, config_dir, selected_comment)
            
            if success:
                success_count += 1
                used_links.add(target_entry['link'])
                self.log(f"✨ [{site_key}] 投稿完了！: {result.get('title')}", self.style.SUCCESS)
                time.sleep(random.randint(20, 35))
            else:
                self.log(f"❌ [{site_key}] 投稿失敗")

        self.log(f"============================================================")
        self.log(f"🏁 MISSION COMPLETE: {success_count} / {len(fleet_data)} 成功", self.style.SUCCESS)
        self.log(f"============================================================")

    def deploy_balanced_unit(self, site, entry, parsed_data, ai_template, cta_template, api_keys, project_label, config_dir, comment):
        if connection.connection is not None and not connection.is_usable():
            connection.close()
            
        ext = None
        for attempt in range(3):
            selected = random.choice(api_keys)
            try:
                processor = AIProcessor([selected['key']], ai_template)
                ext = processor.generate_blog_content({
                    'url': entry['link'], 'title': entry['title'], 
                    'img': parsed_data.get('img'), 'body': parsed_data.get('body'),
                    'is_adult': str(site.get('is_adult', '0')).strip() == '1'
                }, site.get('site_key'))
                if ext: break
            except:
                time.sleep(5)
        
        if not ext: return False, {}

        # --- プラットフォーム別抽出 ---
        platform = site.get('platform', '').lower()
        if platform == 'hatena':
            p_title = ext.get('title_h') or ext.get('title_g') or entry['title']
            p_body = ext.get('cont_h') or ext.get('cont_g') or ext.get('raw_text', '')
        else:
            p_title = ext.get('title_g') or entry['title']
            p_body = ext.get('cont_g') or ext.get('raw_text', '')

        # DB記録
        try:
            with transaction.atomic():
                new_art = Article.objects.create(
                    site=project_label, 
                    title=p_title[:100],
                    body_text=p_body,
                    main_image_url=parsed_data.get('img'), 
                    source_url=entry['link']
                )
                art_id = new_art.id
        except Exception as e:
            return False, {}

        # 外部デプロイ (修正の核心部)
        try:
            cfg = site.copy()
            # HatenaDriverが必要とするキー(user, api_key, endpoint)をCSVからマッピング
            cfg.update({
                'api_key': str(site.get('api_key_or_pw', '')).strip(),
                'endpoint': str(site.get('url_or_endpoint', '')).strip(), # CSVの url_or_endpoint を endpoint へ
                'user': str(site.get('user', '')).strip(),               # CSVの user 列を明示的に追加
                'blog_id': str(site.get('blog_id_or_rpc', '')).strip(),
                'current_dir': config_dir
            })
            
            # ドライバ選択
            driver_class = {'hatena': HatenaDriver, 'blogger': BloggerDriver}.get(platform, LivedoorDriver)
            driver = driver_class(cfg)
            
            domain_map = {'tiper': 'https://tiper.live', 'saving': 'https://bic-saving.com', 'bicstation': 'https://bicstation.com', 'avflash': 'https://avflash.xyz'}
            base_url = domain_map.get(project_label, f"https://{project_label}.com")
            full_internal_url = f"{base_url}/news/{art_id}"

            img_html = f'<div style="text-align:center; margin-bottom:15px;"><img src="{parsed_data.get("img")}" style="max-width:100%;"></div><br>' if parsed_data.get("img") else ""
            review_html = f'<div style="background:#fefefe; padding:15px; border:1px solid #ddd; border-left:5px solid #ff6600; margin-bottom:20px;"><strong>🖋 編集部レビュー：</strong><br>「{comment}」</div>'
            final_content = img_html + review_html + HTMLConverter.md_to_html(p_body) + cta_template.replace("{{internal_url}}", full_internal_url)
            
            if driver.post(title=p_title, body=final_content, source_url=entry['link']):
                Article.objects.filter(id=art_id).update(is_exported=True)
                return True, {'title': p_title, 'body': p_body, 'img': parsed_data.get('img')}
            else:
                Article.objects.filter(id=art_id).delete()
                return False, {}
        except Exception as e:
            Article.objects.filter(id=art_id).delete()
            return False, {}

    def load_csv_data(self, path):
        if not os.path.exists(path): return []
        try:
            with open(path, "r", encoding="utf-8-sig") as f:
                reader = csv.DictReader(f, delimiter='|')
                return [{str(k).strip(): str(v).strip() for k, v in row.items() if k} for row in reader]
        except:
            return []

    def get_all_rss_entries(self, sources):
        pool = []
        for src in sources:
            url = src.get('url') or next((v for v in src.values() if "http" in str(v)), None)
            if not url: continue
            try:
                res = requests.get(url, timeout=15, headers={'User-Agent': 'Mozilla/5.0'})
                feed = feedparser.parse(res.text)
                for e in feed.entries:
                    link = getattr(e, 'link', None) or getattr(e, 'id', None)
                    if link:
                        summary = getattr(e, 'summary', '') or getattr(e, 'description', '')
                        pool.append({'title': e.title, 'link': link, 'raw_body': re.sub(r'<[^>]+>', '', summary).strip()})
            except: continue
        return pool

    def find_best_entry(self, entries, keywords, project_label, used_links):
        for e in entries:
            if e['link'] in used_links: continue
            if keywords and not any(kw.lower() in e['title'].lower() for kw in keywords): continue
            if not Article.objects.filter(site=project_label, source_url=e['link']).exists():
                return e
        return None

    def load_character_comments(self, path):
        if not os.path.exists(path): return []
        try:
            with open(path, "r", encoding="utf-8-sig") as f:
                return [l.strip().strip('"') for l in f if l.strip() and "キャラ設定" not in l]
        except: return []

    def log(self, msg, style_func=None):
        ts = datetime.now().strftime('%H:%M:%S')
        if style_func: self.stdout.write(style_func(f"[{ts}] {msg}"))
        else: self.stdout.write(f"[{ts}] {msg}")

    def print_custom_help(self):
        self.stdout.write(self.style.WARNING("\n📖 【C-PLAN 艦隊運用ガイド v3.9】"))
        self.stdout.write("  python manage.py ai_fleet_deployer --project saving --site h_money")