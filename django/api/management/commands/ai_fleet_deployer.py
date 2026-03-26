# -*- coding: utf-8 -*-
"""
================================================================================
C-PLAN: ULTIMATE FLEET DEPLOYER - VERSION 2026.03
================================================================================
【更新内容】
1. 案内人コメント対応: {project}_comments.csv からランダムに一言を抽出し、レビューとして挿入。
2. 文字化け(Mojibake)完全防衛: requests.apparent_encoding と多段階デコードを実装。
3. TOAST破損防止: DB保存を外部API送信から完全に切り離し、最短時間でコミット。
4. フィルタリング強化: --site 引数によるピンポイント投稿が可能。
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
    help = """
    Ultimate Fleet Deployer:
    --project [tiper, saving] : プロジェクトCSVの選択
    --target  [livedoor, hatena] : プラットフォーム絞り込み
    --site    [site_key] : 特定の1サイトのみ実行
    """

    def add_arguments(self, parser):
        parser.add_argument('--project', type=str, default='tiper', help='Project Name')
        parser.add_argument('--target', type=str, default=None, help='Filter platform')
        parser.add_argument('--site', type=str, default=None, help='Specific site_key')

    def handle(self, *args, **options):
        project_label = options['project'].lower()
        target_platform = options['target'].lower() if options['target'] else None
        target_site_key = options['site'].lower() if options['site'] else None
        
        self.log(f"--- 🚀 MISSION START: [{project_label.upper()}] ---", self.style.SUCCESS)
        
        base_path = "/usr/src/app/api/management/commands"
        config_dir = os.path.join(base_path, "teitoku_settings")
        prompt_dir = os.path.join(base_path, "prompt")
        
        # CSVパス設定
        fleet_csv = os.path.join(config_dir, f"{project_label}_fleet.csv")
        rss_csv = os.path.join(config_dir, f"{project_label}_rss_sources.csv")
        comment_csv = os.path.join(config_dir, f"{project_label}_comments.csv")
        
        # 1. データロード
        fleet_data = self.load_csv_data(fleet_csv)
        rss_sources = self.load_csv_data(rss_csv)
        char_comments = self.load_character_comments(comment_csv)
        
        if not fleet_data: return self.log(f"❌ Fleet CSV Load Error: {fleet_csv}")
        self.log(f"🗨️ Character Comments: {len(char_comments)} lines loaded.")

        # フィルタリング
        if target_site_key:
            fleet_data = [f for f in fleet_data if f.get('site_key', '').lower() == target_site_key]
        elif target_platform:
            fleet_data = [f for f in fleet_data if f.get('platform', '').lower().startswith(target_platform[:2])]

        if not fleet_data: return self.log("⚠️ No matching site found.")

        # 2. RSSプール作成
        self.log(f"📡 Pooling RSS for {project_label}...")
        all_rss_entries = self.get_all_rss_entries(rss_sources)
        self.log(f"✅ {len(all_rss_entries)} entries found in pool.")

        # 3. APIキー準備
        api_keys = [{"id": i, "key": os.getenv(f"GEMINI_API_KEY_{i}").strip()} 
                    for i in range(1, 11) if os.getenv(f"GEMINI_API_KEY_{i}")]
        if not api_keys: return self.log("❌ No Gemini API Keys found.")

        try:
            with open(os.path.join(prompt_dir, f"ai_prompt_{project_label}.txt"), "r", encoding='utf-8') as f: ai_template = f.read()
            with open(os.path.join(prompt_dir, f"cta_{project_label}.txt"), "r", encoding='utf-8') as f: cta_template = f.read()
        except Exception as e: return self.log(f"❌ Template Load Error: {e}")

        success_count, used_links = 0, set()

        # 4. メインループ
        for site_cfg in fleet_data:
            site_key = site_cfg.get('site_key', 'gen')
            kws = [k.strip() for k in site_cfg.get('routing_keywords', '').split(',') if k.strip()]
            
            self.log(f"🔍 [{site_key.upper()}] Finding match...")
            target_entry = self.find_best_entry(all_rss_entries, kws, project_label, used_links)

            if not target_entry: continue

            # コンテンツ取得
            parser = RSSParserFactory.get_parser(target_entry['link'])
            parsed_data = parser.parse(target_entry['link'])
            
            # 本文が空ならRSSから持ってきた生データ(raw_body)で補完
            if (not parsed_data or not parsed_data.get('body')) and target_entry.get('raw_body'):
                parsed_data = parsed_data or {}
                parsed_data['body'] = target_entry['raw_body']

            if not parsed_data or not parsed_data.get('body'):
                self.log(f"🚫 [{site_key}] Parse failed.")
                continue

            # 画像Rescue (DMM/FANZA)
            cid_m = re.search(r'cid=([^/&?]+)', target_entry['link']) or re.search(r'/cid/([^/&?]+)', target_entry['link'])
            if cid_m and ("dummy" in str(parsed_data.get('img')) or not parsed_data.get('img')):
                cid = cid_m.group(1)
                parsed_data['img'] = f"https://p.dmm.co.jp/p/mono/movie/adult/{cid}/{cid}pl.jpg"

            self.log("="*60)
            self.log(f"📊 DEST: {site_key.upper()} | 📝 TLE: {target_entry['title'][:40]}...")
            self.log("="*60)

            # 案内人コメントを1つ選出
            selected_comment = random.choice(char_comments) if char_comments else "業界注目の最新作。要チェックです。"

            # 5. 実行
            if self.deploy_balanced_unit(site_cfg, target_entry, parsed_data, ai_template, cta_template, api_keys, project_label, config_dir, selected_comment):
                success_count += 1
                used_links.add(target_entry['link'])
                self.log(f"✨ [{site_key.upper()}] MISSION SUCCESS.")
                time.sleep(random.randint(20, 35))
            else:
                self.log(f"❌ [{site_key.upper()}] Deployment Failed.")

        self.log(f"🏁 [{project_label.upper()}] COMPLETE: {success_count}/{len(fleet_data)}")

    def deploy_balanced_unit(self, site, entry, parsed_data, ai_template, cta_template, api_keys, project_label, config_dir, comment):
        if connection.connection is not None and not connection.is_usable():
            connection.close()
            
        # PHASE 1: AI生成
        ext = None
        for attempt in range(5):
            selected = random.choice(api_keys)
            try:
                self.log(f"🤖 AI Request (Key ID: {selected['id']})")
                processor = AIProcessor([selected['key']], ai_template)
                ext = processor.generate_blog_content({
                    'url': entry['link'], 'title': entry['title'], 
                    'img': parsed_data.get('img'), 'body': parsed_data.get('body'),
                    'is_adult': str(site.get('is_adult', '0')).strip() == '1'
                }, site.get('site_key'))
                if ext: break
            except Exception as e:
                self.log(f"⏳ API Error: {str(e)[:40]}")
                time.sleep(10)
        
        if not ext: return False

        # PHASE 2: DB記録 (最短化)
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
            self.log(f"🔥 DB Write Error: {e}"); return False

        # PHASE 3: 外部デプロイ (案内人コメントを結合)
        try:
            cfg = site.copy()
            cfg.update({'api_key': site.get('api_key_or_pw'), 'url': site.get('url_or_endpoint'), 'current_dir': config_dir})
            
            pf = site.get('platform', '').lower()
            driver = {'hatena': HatenaDriver, 'blogger': BloggerDriver}.get(pf, LivedoorDriver)(cfg)
            
            # HTML構築
            img_html = f'<div style="text-align:center; margin-bottom:15px;"><img src="{parsed_data.get("img")}" style="max-width:100%;"></div><br>'
            # 案内人コメントを「レビュー」として上部に挿入
            review_html = f'<div style="background:#f9f9f9; padding:15px; border-left:5px solid #ff6600; margin-bottom:20px;"><strong>🖋 編集長の一言レビュー：</strong><br>「{comment}」</div>'
            
            final_content = img_html + review_html + HTMLConverter.md_to_html(p_body) + cta_template.replace("{{internal_url}}", f"https://{project_label}.com/news/{art_id}")
            
            if driver.post(title=p_title, body=final_content, source_url=entry['link']):
                Article.objects.filter(id=art_id).update(is_exported=True)
                return True
            else:
                Article.objects.filter(id=art_id).delete(); return False
        except Exception as e:
            self.log(f"🚨 Error: {e}")
            Article.objects.filter(id=art_id).delete(); return False

    def get_all_rss_entries(self, sources):
        pool = []
        cookies = {'ckcy': '1', 'age_check_done': '1', 'is_adult': '1'}
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0'}

        for src in sources:
            url = src.get('url') or next((v for v in src.values() if "http" in str(v)), None)
            if not url: continue
            try:
                res = requests.get(url, timeout=15, cookies=cookies, headers=headers)
                # 文字化け対策
                res.encoding = res.apparent_encoding
                if 'ISO' in (res.encoding or '').upper(): res.encoding = 'utf-8'
                
                feed = feedparser.parse(res.text)
                for e in feed.entries:
                    link = getattr(e, 'link', None) or getattr(e, 'id', None)
                    if link:
                        summary = getattr(e, 'summary', '') or getattr(e, 'description', '')
                        pool.append({
                            'title': e.title, 
                            'link': link,
                            'raw_body': re.sub(r'<[^>]+>', '', summary).strip()
                        })
            except: continue
        return pool

    def load_character_comments(self, path):
        if not os.path.exists(path): return []
        comments = []
        try:
            with open(path, "r", encoding="utf-8-sig") as f:
                for line in f:
                    line = line.strip()
                    if line and "キャラ設定" not in line:
                        # カンマ等が含まれる場合のクリーンアップ
                        clean_line = line.strip('"').strip(',')
                        comments.append(clean_line)
            return comments
        except: return []

    def find_best_entry(self, entries, keywords, project_label, used_links):
        for e in entries:
            if e['link'] in used_links: continue
            if keywords and not any(kw.lower() in e['title'].lower() for kw in keywords): continue
            if not Article.objects.filter(site=project_label, source_url=e['link']).exists(): return e
        return None

    def load_csv_data(self, path):
        if not os.path.exists(path): return []
        try:
            with open(path, "r", encoding="utf-8-sig") as f:
                content = f.read().strip(); f.seek(0)
                delim = '|' if '|' in content.split('\n')[0] else ','
                return [{str(k).strip(): str(v).strip() for k, v in row.items() if k} for row in csv.DictReader(f, delimiter=delim)]
        except: return []

    def log(self, msg, style_func=None):
        ts = datetime.now().strftime('%H:%M:%S')
        if style_func: self.stdout.write(style_func(f"[{ts}] {msg}"))
        else: self.stdout.write(f"[{ts}] {msg}")