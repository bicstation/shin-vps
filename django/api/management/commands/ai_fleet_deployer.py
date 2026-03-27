# -*- coding: utf-8 -*-
"""
================================================================================
C-PLAN: SUPREME FLEET DEPLOYER - FULL VISIBILITY & DEBUG EDITION
================================================================================
【強化ポイント】
1. 投稿詳細ログ: 投稿先URL、生成タイトル、本文抜粋(80文字)を表示。
2. 画像ステータス: 画像URLの有無を [🖼️ あり/❌ なし] で明示。
3. 既存機能完全維持: --help、CSVパイプパース、DB不整合防止、案内人コメント。
4. Blogger対応: isDraft=False による即時公開設定を統合。
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
    help = "Deploy articles with full content visibility and robust error handling."

    def add_arguments(self, parser):
        parser.add_argument('--project', type=str, default=None, help='Project Name (e.g., saving)')
        parser.add_argument('--target', type=str, default=None, help='Filter platform')
        parser.add_argument('--site', type=str, default=None, help='Specific site_key')

    def print_custom_help(self):
        """ヘルプガイドの表示"""
        self.stdout.write(self.style.WARNING("\n📖 【C-PLAN 艦隊運用ガイド】"))
        self.stdout.write("使用例:")
        self.stdout.write("  python manage.py ai_fleet_deployer --project saving --site blogger_money")
        self.stdout.write("  python manage.py ai_fleet_deployer --project bicstation --target livedoor\n")
        self.stdout.write("オプション:")
        self.stdout.write("  --project : 必須。設定ファイル名に対応")
        self.stdout.write("  --target  : プラットフォーム(livedoor/hatena/blogger)で絞り込み")
        self.stdout.write("  --site    : 特定のsite_keyのみ実行\n")

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
            fleet_data = [f for f in fleet_data if target_platform in f.get('platform', '').lower() or target_platform in f.get('site_key', '').lower()]

        if not fleet_data:
            return self.log(f"⚠️ 条件に一致するサイトがありません。")

        # 3. RSS巡回
        self.log(f"📡 RSSフィードを巡回中...")
        all_rss_entries = self.get_all_rss_entries(rss_sources)
        self.log(f"✅ プール内記事数: {len(all_rss_entries)}")

        # 4. API & Template 準備
        api_keys = [{"id": i, "key": os.getenv(f"GEMINI_API_KEY_{i}").strip()} 
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
        total_sites = len(fleet_data)

        # 5. メインループ
        for idx, site_cfg in enumerate(fleet_data, 1):
            site_key = site_cfg.get('site_key', 'UNKNOWN')
            platform = site_cfg.get('platform', 'N/A')
            site_url = site_cfg.get('site_urls', 'N/A')
            
            self.log(f"🔄 [{idx}/{total_sites}] 展開開始: {site_key} ({platform})")
            
            kws = [k.strip() for k in site_cfg.get('routing_keywords', '').split(',') if k.strip()]
            target_entry = self.find_best_entry(all_rss_entries, kws, project_label, used_links)

            if not target_entry:
                self.log(f"⏭️ キーワード不一致のためスキップ。")
                continue

            # コンテンツ解析
            parser = RSSParserFactory.get_parser(target_entry['link'])
            parsed_data = parser.parse(target_entry['link'])
            if (not parsed_data or not parsed_data.get('body')) and target_entry.get('raw_body'):
                parsed_data = parsed_data or {}
                parsed_data['body'] = target_entry['raw_body']

            if not parsed_data or not parsed_data.get('body'):
                self.log(f"⚠️ 本文取得失敗: {target_entry['title']}")
                continue

            selected_comment = random.choice(char_comments) if char_comments else "注目の最新ニュースです。"

            # 🚀 デプロイ実行
            success, result = self.deploy_balanced_unit(site_cfg, target_entry, parsed_data, ai_template, cta_template, api_keys, project_label, config_dir, selected_comment)
            
            if success:
                success_count += 1
                used_links.add(target_entry['link'])
                
                # --- 詳細ログ表示 ---
                snippet = re.sub(r'<[^>]+>', '', result.get('body', ''))[:80].replace('\n', ' ')
                img_status = f"🖼️ {result.get('img')}" if result.get('img') else "❌ 画像なし"
                
                self.log(f"🔗 投稿先: https://{site_url}", self.style.HTTP_INFO)
                self.log(f"📝 題名: {result.get('title')}", self.style.SUCCESS)
                self.log(f"📄 抜粋: {snippet}...")
                self.log(f"📸 状態: {img_status}")
                self.log(f"✨ [{site_key}] 投稿完了！", self.style.SUCCESS)
                
                time.sleep(random.randint(20, 35))
            else:
                self.log(f"❌ [{site_key}] 投稿フェーズでエラーが発生しました。")

        self.log(f"============================================================")
        self.log(f"🏁 MISSION COMPLETE: {success_count} / {total_sites} 成功", self.style.SUCCESS)
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

        # DB記録
        try:
            with transaction.atomic():
                new_art = Article.objects.create(
                    site=project_label, 
                    title=(ext.get('title_g') or entry['title'])[:100],
                    body_text=ext.get('cont_g') or ext.get('raw_text', ''),
                    main_image_url=parsed_data.get('img'), 
                    source_url=entry['link']
                )
                art_id, p_body, p_title = new_art.id, new_art.body_text, new_art.title
        except Exception as e:
            self.log(f"🔥 DB Error: {e}"); return False, {}

        # 外部デプロイ
        try:
            api_key = str(site.get('api_key_or_pw') or "").strip()
            url_endpoint = str(site.get('url_or_endpoint') or "").strip()
            blog_id = str(site.get('blog_id_or_rpc') or "").strip()
            
            if not api_key or not url_endpoint:
                return False, {}

            cfg = site.copy()
            cfg.update({'api_key': api_key, 'url': url_endpoint, 'blog_id': blog_id, 'current_dir': config_dir})
            
            pf = site.get('platform', '').lower()
            driver = {'hatena': HatenaDriver, 'blogger': BloggerDriver}.get(pf, LivedoorDriver)(cfg)
            
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
                Article.objects.filter(id=art_id).delete(); return False, {}
        except Exception as e:
            Article.objects.filter(id=art_id).delete(); return False, {}

    def load_csv_data(self, path):
        if not os.path.exists(path): return []
        try:
            with open(path, "r", encoding="utf-8-sig") as f:
                reader = csv.DictReader(f, delimiter='|')
                return [{str(k).strip(): str(v).strip() for k, v in row.items() if k} for row in reader]
        except Exception as e:
            self.log(f"🚨 CSVロード失敗 [{os.path.basename(path)}]: {e}")
            return []

    def get_all_rss_entries(self, sources):
        pool = []
        headers = {'User-Agent': 'Mozilla/5.0'}
        for src in sources:
            url = src.get('url') or next((v for v in src.values() if "http" in str(v)), None)
            if not url: continue
            try:
                res = requests.get(url, timeout=15, headers=headers)
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