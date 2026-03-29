# -*- coding: utf-8 -*-
import os, random, requests, feedparser, time, csv, re, unicodedata
from datetime import datetime
from django.core.management.base import BaseCommand
from django.db import connection, transaction
from django.utils.text import slugify

# モデルのインポート
from api.models.article import Article

from api.utils.html_utils import HTMLConverter
from api.management.commands.blog_drivers.rss_parsers import RSSParserFactory 
from api.management.commands.blog_drivers.hatena_driver import HatenaDriver
from api.management.commands.blog_drivers.livedoor_driver import LivedoorDriver
from api.management.commands.blog_drivers.blogger_driver import BloggerDriver
from api.management.commands.blog_drivers.ai_processor import AIProcessor
from api.management.commands.blog_drivers.rss_extractors import ExtractorFactory

class Command(BaseCommand):
    help = "Deploy articles to fleet sites with real-time progress monitoring and keyword matching."

    # --- カテゴリ表示名のマッピング辞書 ---
    CATEGORY_MAP = {
        "adult_video": "新作・おすすめAV",
        "adult_rental": "新作レンタル情報",
        "adult_reserve": "予約特典・限定版",
        "adult_anime": "大人向けアニメ",
        "adult_vr": "VR専用・没入体験",
        "adult_game": "PCゲーム・美少女ゲー",
        "adult_doujin": "同人ソフト・CG",
        "adult_lovecul": "美少女・ラブラブ文化",
        "adult_book": "成人向けコミック・雑誌",
        "adult_goods": "最新大人用トイ・グッズ",
        "tech_pc": "PC・自作パーツ",
        "tech_news": "IT最新ニュース",
        "tech_gadget": "最新ガジェット・家電",
        "tech_apple": "Apple・iPhone情報",
        "tech_mobile": "スマホ・モバイル通信",
        "tech_network": "ネットワーク・インフラ",
        "tech_business": "ITビジネス・業界動向",
        "tech_hobby": "ホビー・デジタル技術",
        "finance_tech": "フィンテック・最新決済",
        "finance_jp": "国内経済・投資",
        "finance_global": "海外市場・世界経済",
        "finance_mobile": "キャッシュレス・ポイ活",
        "finance_gadget": "金融・お得ツール",
    }

    def add_arguments(self, parser):
        parser.add_argument('--project', type=str, default=None)
        parser.add_argument('--site', type=str, default=None)
        parser.add_argument('--platform', type=str, default=None)

    def handle(self, *args, **options):
        if not options['project']:
            self.print_custom_help()
            return

        project_label = options['project'].lower()
        target_site_key = options['site'].lower() if options['site'] else None
        target_platform = options['platform'].lower() if options['platform'] else None
        
        self.log(f"============================================================", self.style.SUCCESS)
        self.log(f"--- 🚀 STRATEGIC DEPLOYMENT START: [{project_label.upper()}] ---", self.style.SUCCESS)
        self.log(f"============================================================", self.style.SUCCESS)
        
        config_dir = "/usr/src/app/api/management/commands/teitoku_settings"
        if not os.path.exists(config_dir):
            config_dir = "/home/maya/shin-dev/shin-vps/django/api/management/commands/teitoku_settings"
        
        prompt_dir = "/usr/src/app/api/management/commands/prompt"
        fleet_path = os.path.join(config_dir, "master_fleet.csv")
        rss_path = os.path.join(config_dir, "master_rss_sources.csv")
        comment_path = os.path.join(config_dir, f"{project_label}_comments.csv")

        all_fleet = self.load_master_csv(fleet_path)
        rss_master = self.load_master_csv(rss_path)
        char_comments = self.load_character_comments(comment_path)

        fleet_data = [f for f in all_fleet if str(f.get('project', '')).strip().lower() == project_label]
        if target_platform:
            fleet_data = [f for f in fleet_data if str(f.get('platform', '')).strip().lower() == target_platform]
        if target_site_key:
            fleet_data = [f for f in fleet_data if str(f.get('site_key', '')).strip().lower() == target_site_key]

        if not fleet_data:
            return self.log(f"❌ 該当データなし (Project: {project_label})", self.style.ERROR)

        api_keys = [{"key": os.getenv(f"GEMINI_API_KEY_{i}").strip()} for i in range(1, 11) if os.getenv(f"GEMINI_API_KEY_{i}")]
        
        try:
            with open(os.path.join(prompt_dir, f"ai_prompt_{project_label}.txt"), "r", encoding='utf-8') as f: ai_template = f.read()
            with open(os.path.join(prompt_dir, f"cta_{project_label}.txt"), "r", encoding='utf-8') as f: cta_template = f.read()
        except Exception as e:
            return self.log(f"❌ テンプレート読込失敗: {e}", self.style.ERROR)

        needed_cats = set()
        for f in fleet_data:
            rc = f.get('rss_category') or self.guess_category(f.get('site_key'))
            for part in rc.split(','):
                needed_cats.add(part.strip())

        self.log(f"📡 RSSフィード収集中... (対象カテゴリ: {', '.join(needed_cats)})")
        rss_pool = self.build_rss_pool(rss_master, list(needed_cats))

        success_count = 0
        used_links = set()

        for idx, site_cfg in enumerate(fleet_data, 1):
            site_key = site_cfg.get('site_key', 'UNKNOWN')
            platform = site_cfg.get('platform', '').lower()
            raw_cat_str = site_cfg.get('rss_category') or self.guess_category(site_key)
            site_categories = [c.strip() for c in raw_cat_str.split(',')]
            
            raw_kw_str = site_cfg.get('keywords', '')
            keywords = [k.strip() for k in raw_kw_str.replace('、', ',').split(',') if k.strip()]
            
            self.log(f"🔄 [{idx}/{len(fleet_data)}] {site_key} ({platform}) を哨戒中...")
            
            target_entries = []
            for cat in site_categories:
                target_entries.extend(rss_pool.get(cat, []))
            
            unique_entries = list({e['link']: e for e in target_entries}.values())
            self.log(f"   🔎 候補記事 {len(unique_entries)} 件を精査します...")

            posted_successfully = False
            for e_idx, entry in enumerate(unique_entries, 1):
                if e_idx % 5 == 0 or e_idx == 1:
                    self.log(f"   ⏳ 思考中... ({e_idx}/{len(unique_entries)}) 目標: {entry['title'][:25]}...")

                if entry['link'] in used_links: continue
                if Article.objects.filter(site=project_label, source_url=entry['link']).exists(): continue

                parser = RSSParserFactory.get_parser(entry['link'])
                parsed_data = parser.parse(entry['link'])
                if not parsed_data or not parsed_data.get('body'): 
                    continue

                # --- 🛠 本文の文字化け・ゴミをAIに渡す前に徹底除去 ---
                raw_body = parsed_data.get('body', '')
                # 日本語(ひらがな・カタカナ・漢字)・英数字・一般的な記号のみを許可（バイナリ文字化けを排除）
                clean_body = re.sub(r'[^\x00-\x7F\u3040-\u30FF\u4E00-\u9FFF\uFF00-\uFFEF]+', '', raw_body)
                parsed_data['body'] = clean_body[:3000] # 文字数制限でAIの混乱を防ぐ

                if entry.get('rss_img'):
                    parsed_data['img'] = entry['rss_img']

                if keywords:
                    search_text = unicodedata.normalize('NFKC', (entry['title'] + " " + parsed_data['body'])).lower()
                    search_text = search_text.replace('ｖｒ', 'vr').replace('ヴイアール', 'vr')
                    if not any(kw.lower() in search_text for kw in keywords):
                        continue
                
                self.log(f"   🎯 ターゲット捕捉: {entry['title'][:40]}", self.style.SUCCESS)
                selected_comment = random.choice(char_comments) if char_comments else "おすすめの最新情報です。"
                
                main_cat_id = site_categories[0]
                success, result = self.deploy_unit(site_cfg, entry, parsed_data, ai_template, cta_template, api_keys, project_label, config_dir, selected_comment, main_cat_id)

                if success:
                    used_links.add(entry['link'])
                    success_count += 1
                    posted_successfully = True
                    self.log(f"   ✅ 投稿完了: {result.get('title')[:30]}", self.style.SUCCESS)
                    wait_time = random.randint(20, 35)
                    self.log(f"   💤 次の哨戒まで待機中... ({wait_time}s)")
                    time.sleep(wait_time)
                    break 

            if not posted_successfully:
                self.log(f"   ⚠️ 条件に合う記事が見つかりませんでした (キーワード数: {len(keywords)})", self.style.WARNING)

        self.log(f"============================================================", self.style.SUCCESS)
        self.log(f"🏁 全作戦終了: {success_count} / {len(fleet_data)} 件 成功", self.style.SUCCESS)
        self.log(f"============================================================", self.style.SUCCESS)

    def deploy_unit(self, site, entry, parsed_data, ai_template, cta_template, api_keys, project_label, config_dir, comment, cat_id):
        display_category = self.CATEGORY_MAP.get(cat_id, cat_id)
        ext = None
        self.log(f"   🧠 AIがコンテンツを生成しています...")
        
        for _ in range(3):
            if not api_keys: break
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
                time.sleep(2)
        
        if not ext: return False, {}

        platform = site.get('platform', '').lower()
        p_title = ext.get('title_h') if platform == 'hatena' and ext.get('title_h') else ext.get('title_g', entry['title'])
        p_body = ext.get('cont_g', ext.get('raw_text', ''))
        
        # --- 🛠 AI生成物の最終クリーニング (命令文の漏洩を削除) ---
        p_body = p_body.replace('\ufffd', '') # 不明な文字の削除
        
        unwanted_patterns = [
            r"(?i)^#*\s*📥?\s*入力データ.*(\n|$)", 
            r"(?i)^#*\s*📤?\s*出力.*(\n|$)",
            r"(?i)^#*\s*【?\s*出力.*】?.*(\n|$)",
            r"(?i)^#*\s*元ネタ[:：].*(\n|$)",
            r"(?i)^#*\s*メーカー[:：].*(\n|$)",
            r"(?i)^#*\s*出演者[:：].*(\n|$)",
            r"(?i)^#*\s*対象[:：].*(\n|$)",
            r"(?i)^出力[:：].*(\n|$)",
            r"(?i)^#*\s*出力フォーマット.*(\n|$)",
            r"(?i)^#*\s*編集部レビュー[:：]?.*(\n|$)" # AIが自ら書いてしまったレビュー見出しを削除
        ]
        for pattern in unwanted_patterns:
            p_body = re.sub(pattern, "", p_body, flags=re.IGNORECASE | re.MULTILINE)

        p_body = p_body.strip().lstrip(' \n\r\t#*-')

        meta = {
            "category": display_category,
            "category_id": cat_id,
            "tags": entry.get('raw_tags', []),
            "is_adult": str(site.get('is_adult', '0')).strip() == '1',
            "original_title": entry['title'],
            "extracted_at": datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        }

        art_id = None
        try:
            with transaction.atomic():
                new_art = Article.objects.create(
                    site=project_label,
                    content_type='news' if project_label in ['saving', 'it', 'tiper'] else 'post',
                    title=p_title[:500],
                    body_text=p_body,
                    main_image_url=parsed_data.get('img'),
                    source_url=entry['link'],
                    extra_metadata=meta 
                )
                art_id = new_art.id
        except Exception as e:
            self.log(f"❌ DB Save Error: {e}")
            return False, {}

        target_url = str(site.get('endpoint') or site.get('url') or '').strip()
        target_api = str(site.get('api_key') or site.get('api_key_or_pw') or '').strip()
        target_user = str(site.get('user') or '').strip()
        
        if not target_url.startswith('http'):
            if art_id: Article.objects.filter(id=art_id).delete()
            return False, {}

        try:
            cfg = site.copy()
            cfg.update({'api_key': target_api, 'endpoint': target_url, 'user': target_user, 'current_dir': config_dir})
            
            driver_class = LivedoorDriver
            if platform == 'hatena': driver_class = HatenaDriver
            elif platform == 'blogger': driver_class = BloggerDriver
            
            driver = driver_class(cfg)
            
            domain_map = {'tiper': 'https://tiper.live', 'avflash': 'https://avflash.xyz'}
            base_url = domain_map.get(project_label, f"https://{project_label}.com")
            full_internal_url = f"{base_url}/news/{art_id}"

            # --- 🛠 HTMLレイアウト構築 ---
            img_html = f'<div style="text-align:center; margin-bottom:15px;"><img src="{parsed_data.get("img")}" style="max-width:100%; border-radius:8px; box-shadow:0 4px 8px rgba(0,0,0,0.1);"></div><br>' if parsed_data.get("img") else ""
            
            # レビュー部分（ここから文字化けを一掃）
            review_html = f'''<div style="background:#f9f9f9; padding:18px; border:1px solid #eee; border-left:6px solid #ff6600; margin-bottom:25px; border-radius:4px;">
<strong style="color:#ff6600; font-size:1.1em;">🖋 編集部レビュー：</strong><br>
<span style="color:#333; line-height:1.6;">「{comment}」</span>
</div>'''

            tax_html = f'<p style="font-size:0.85em; color:#999; margin-top:30px; border-top:1px dotted #ccc; padding-top:10px;">カテゴリー: {display_category}</p>'
            
            final_content = img_html + review_html + HTMLConverter.md_to_html(p_body) + tax_html + cta_template.replace("{{internal_url}}", full_internal_url)
            
            if driver.post(title=p_title, body=final_content, source_url=entry['link'], category=display_category):
                Article.objects.filter(id=art_id).update(is_exported=True)
                return True, {'title': p_title}
            else:
                Article.objects.filter(id=art_id).delete()
                return False, {}
        except Exception as e:
            self.log(f"    ❌ Driver Error: {e}")
            if art_id: Article.objects.filter(id=art_id).delete()
            return False, {}

    def build_rss_pool(self, rss_master, categories):
        pool = {}
        for cat in categories:
            if not cat: continue
            entries = []
            rss_sources = [r for r in rss_master if str(r.get('rss_category')).strip() == cat]
            for source in rss_sources:
                url = source.get('rss_url')
                try:
                    res = requests.get(url, timeout=10, headers={'User-Agent': 'Mozilla/5.0'})
                    feed = feedparser.parse(res.text)
                    for e in feed.entries:
                        link = getattr(e, 'link', None) or getattr(e, 'id', None)
                        if not link: continue
                        content_val = ""
                        if hasattr(e, 'content'): content_val = e.content[0].value
                        elif hasattr(e, 'description'): content_val = e.description
                        extractor = ExtractorFactory.get_extractor(url, cat)
                        rss_img = extractor.extract(content_val, entry=e)
                        raw_tags = [t.term for t in e.tags] if hasattr(e, 'tags') else []
                        entries.append({'title': e.title, 'link': link, 'rss_img': rss_img, 'raw_tags': raw_tags})
                except: continue
            pool[cat] = entries
        return pool

    def load_master_csv(self, path):
        if not os.path.exists(path): return []
        data = []
        try:
            with open(path, "r", encoding="utf-8-sig") as f:
                content = f.read()
                dialect = csv.Sniffer().sniff(content[:2048])
                f.seek(0)
                reader = csv.DictReader(f, dialect=dialect)
                for row in reader:
                    if row.get('project') or row.get('rss_url'):
                        clean_row = {k.strip(): v.strip() for k, v in row.items() if k}
                        data.append(clean_row)
        except Exception as e:
            try:
                with open(path, "r", encoding="utf-8-sig") as f:
                    lines = f.readlines()
                    if not lines: return []
                    header = [h.strip() for h in lines[0].split('\t')]
                    for line in lines[1:]:
                        vals = [v.strip() for v in line.split('\t')]
                        if len(vals) < len(header): continue
                        data.append(dict(zip(header, vals)))
            except: self.log(f"❌ CSV Load Error: {e}")
        return data

    def load_character_comments(self, path):
        if not os.path.exists(path): return []
        try:
            with open(path, "r", encoding="utf-8-sig") as f:
                return [l.strip().strip('"') for l in f if l.strip() and "キャラ設定" not in l]
        except: return []

    def guess_category(self, site_key):
        sk = str(site_key).lower()
        if 'vr' in sk: return 'adult_vr'
        if 'apple' in sk or 'iphone' in sk: return 'tech_apple'
        return 'adult_video'

    def log(self, msg, style_func=None):
        ts = datetime.now().strftime('%H:%M:%S')
        if style_func: self.stdout.write(style_func(f"[{ts}] {msg}"))
        else: self.stdout.write(f"[{ts}] {msg}")

    def print_custom_help(self):
        self.stdout.write(self.style.WARNING("Usage: python manage.py ai_fleet_deployer --project [tiper|avflash|saving]"))