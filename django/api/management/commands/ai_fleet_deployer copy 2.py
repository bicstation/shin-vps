# -*- coding: utf-8 -*-
import os, random, requests, feedparser, time, csv, re
from datetime import datetime
from django.core.management.base import BaseCommand
from django.db import connection, transaction
from google import genai

# プロジェクト内資産のインポート
from api.models.article import Article
from api.utils.html_utils import HTMLConverter
from api.management.commands.blog_drivers.rss_parsers import RSSParserFactory 
from api.management.commands.blog_drivers.hatena_driver import HatenaDriver
from api.management.commands.blog_drivers.livedoor_driver import LivedoorDriver
from api.management.commands.blog_drivers.blogger_driver import BloggerDriver
from api.management.commands.blog_drivers.ai_processor import AIProcessor
from api.management.commands.blog_drivers.rss_extractors import ExtractorFactory

class Command(BaseCommand):
    help = "Gemini自律選別 × v1.0.502投稿エンジン (タブ区切り・DictReader完全準拠版)"

    def add_arguments(self, parser):
        parser.add_argument('--project', type=str, default=None, help="プロジェクト名 (tiper, saving等)")
        parser.add_argument('--platform', type=str, default=None, help="プラットフォーム制限 (livedoor, hatena等)")
        parser.add_argument('--limit', type=int, default=None, help="最大投稿サイト数を制限")

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.selected_in_this_run = []
        # APIキーの取得と検証
        self.api_keys = [os.getenv(f'GEMINI_API_KEY_{i}') for i in range(1, 11)]
        self.api_keys = [k for k in self.api_keys if k and not k.startswith('GEMINI')]
        if not self.api_keys:
            self.api_keys = [os.getenv('GEMINI_API_KEY')]

    def handle(self, *args, **options):
        if not options['project']:
            self.log("Usage: python manage.py ai_fleet_deployer --project [tiper|...] (--limit 1)", self.style.WARNING)
            return

        # 入力パラメータの浄化
        project_label = self._super_clean(options['project']).lower()
        target_platform = self._super_clean(options['platform']).lower() if options['platform'] else None
        limit = options.get('limit')

        self.log(f"--- 🚀 STRATEGIC FLEET START: [{project_label.upper()}] ---", self.style.SUCCESS)
        
        # パス設定
        current_dir = os.path.dirname(os.path.abspath(__file__))
        config_dir = os.path.join(current_dir, "teitoku_settings")
        prompt_dir = os.path.join(current_dir, "prompt")
        
        fleet_path = os.path.join(config_dir, "master_fleet.csv")
        rss_path = os.path.join(config_dir, "master_rss_sources.csv")
        comment_path = os.path.join(config_dir, f"{project_label}_comments.csv")

        # 1. マスターデータの読み込み (成功実績のある方式)
        all_fleet = self.load_strict_tab_csv(fleet_path)
        rss_master = self.load_strict_tab_csv(rss_path)
        char_comments = self.load_character_comments(comment_path)

        # 2. 対象ブログの抽出
        fleet_data = []
        for f in all_fleet:
            # 読み込み時にキーと値は strip 済み
            if f.get('project') == project_label:
                if target_platform and f.get('platform') != target_platform:
                    continue
                fleet_data.append(f)

        if not fleet_data and all_fleet:
            sample_val = all_fleet[0].get('project', 'KeyNotFound')
            self.log(f"🔎 判定失敗デバッグ: 検索[{project_label}] vs CSV1行目[{sample_val}]", self.style.WARNING)

        if limit:
            self.log(f"⚠️ 実行制限：最初の {limit} サイトのみ処理します。")
            fleet_data = fleet_data[:limit]

        if not fleet_data:
            return self.log(f"❌ 該当データなし (Project: {project_label}, 全データ: {len(all_fleet)}件)", self.style.ERROR)

        # 3. RSSプールの構築
        needed_cats = set()
        for f in fleet_data:
            cat_str = f.get('rss_category', '')
            if cat_str:
                for c in cat_str.split(','):
                    c_clean = c.strip()
                    if c_clean: needed_cats.add(c_clean)
        
        if not needed_cats:
            needed_cats = {self.guess_category(f.get('site_key')) for f in fleet_data}

        rss_pool = self.build_rss_pool(rss_master, list(needed_cats))
        success_count = 0

        # --- 艦隊展開ループ ---
        for idx, site_cfg in enumerate(fleet_data, 1):
            site_key = site_cfg.get('site_key', 'UNKNOWN')
            platform = site_cfg.get('platform', 'livedoor').lower()
            raw_cats = site_cfg.get('rss_category', '').split(',')
            primary_cat = raw_cats[0].strip() if raw_cats and raw_cats[0].strip() else self.guess_category(site_key)
            persona = site_cfg.get('persona', '冷静な分析官') 
            
            self.log(f"🚢 [{idx}/{len(fleet_data)}] {site_key} ({platform}) 展開中...")

            entries = rss_pool.get(primary_cat, [])
            # 重複排除
            candidates = [e for e in entries if e['link'] not in self.selected_in_this_run 
                          and not Article.objects.filter(source_url=e['link']).exists()]

            if not candidates:
                self.log(f"  ⚠️ カテゴリ [{primary_cat}] に新規ネタなし。スキップします。", self.style.WARNING)
                continue

            # 4. Gemini選別
            selected_entry = self.let_persona_choose(persona, candidates[:15])
            
            if selected_entry:
                self.selected_in_this_run.append(selected_entry['link'])
                self.log(f"  🎯 AI選択: {selected_entry['title'][:40]}...")

                # 5. 詳細パース
                parser = RSSParserFactory.get_parser(selected_entry['link'])
                parsed_data = parser.parse(selected_entry['link'])
                if not parsed_data or not parsed_data.get('body'): 
                    self.log(f"  ❌ 本文抽出失敗: {selected_entry['link']}", self.style.ERROR)
                    continue
                if selected_entry.get('rss_img'): 
                    parsed_data['img'] = selected_entry['rss_img']

                # 6. プロンプトテンプレート読込
                try:
                    with open(os.path.join(prompt_dir, f"ai_prompt_{project_label}.txt"), "r", encoding='utf-8') as f: ai_template = f.read()
                    with open(os.path.join(prompt_dir, f"cta_{project_label}.txt"), "r", encoding='utf-8') as f: cta_template = f.read()
                except:
                    ai_template, cta_template = "読者が楽しめるブログ記事をMarkdownで書いてください。", ""

                # 7. 投稿ユニット実行
                selected_comment = random.choice(char_comments) if char_comments else "今注目のニュースです。"
                
                success, result = self.deploy_unit(
                    site_cfg, selected_entry, parsed_data, ai_template, cta_template, 
                    project_label, config_dir, selected_comment, primary_cat
                )

                if success:
                    success_count += 1
                    self.log(f"  ✅ 成功: {result.get('title')[:30]}", self.style.SUCCESS)
                    # 連続投稿による制限回避
                    time.sleep(random.randint(10, 20))

        self.log(f"🏁 ミッション完了: {success_count} SUCCESS", self.style.SUCCESS)

    def _super_clean(self, text):
        """制御文字やBOM、不可視文字を完全に除去"""
        if not text: return ""
        text = str(text).replace('\ufeff', '').strip()
        # 英数字、アンダースコア、ハイフン、ドット以外を除去
        return re.sub(r'[^a-zA-Z0-9_.-]', '', text)

    def load_strict_tab_csv(self, path):
        """csv.DictReaderを使用した厳格なタブ区切り読み込み"""
        if not os.path.exists(path): return []
        data = []
        try:
            with open(path, "r", encoding="utf-8-sig") as f:
                reader = csv.DictReader(f, delimiter='\t')
                for row in reader:
                    # キーと値の両方の空白/不可視文字を掃除
                    clean_row = {str(k).strip(): str(v).strip() for k, v in row.items() if k}
                    if clean_row.get('project') or clean_row.get('site_key'):
                        data.append(clean_row)
            return data
        except Exception as e:
            self.log(f"❌ CSV解析失敗: {e}")
            return []

    def let_persona_choose(self, persona, entries):
        """AIにリストから最も適した1つを選ばせる"""
        if not self.api_keys: return entries[0]
        client = genai.Client(api_key=random.choice(self.api_keys))
        list_txt = "\n".join([f"[{i}] {e['title']}" for i, e in enumerate(entries)])
        prompt = (f"あなたは【{persona}】です。\n"
                  f"以下のニュースリストから、あなたのブログの読者が最も喜びそうなネタを1つだけ選んでください。\n"
                  f"回答は [番号] の形式（例: [3]）で、その番号のみを返してください。\n\n{list_txt}")
        try:
            res = client.models.generate_content(model='gemini-1.5-flash', contents=prompt)
            match = re.search(r'\[(\d+)\]', res.text)
            idx = int(match.group(1)) if match else 0
            return entries[idx] if 0 <= idx < len(entries) else entries[0]
        except: return entries[0]

    def deploy_unit(self, site, entry, parsed_data, ai_template, cta_template, project_label, config_dir, comment, cat_name):
        """AI執筆から投稿までを一括実行"""
        ext = None
        for _ in range(3):
            selected_key = random.choice(self.api_keys)
            try:
                processor = AIProcessor([selected_key], ai_template)
                ext = processor.generate_blog_content({
                    'url': entry['link'], 'title': entry['title'], 
                    'img': parsed_data.get('img'), 'body': parsed_data.get('body'),
                    'is_adult': str(site.get('is_adult', '0')).strip() == '1'
                }, site.get('site_key'))
                if ext: break
            except: time.sleep(2)
        
        if not ext: return False, {}

        platform = site.get('platform', 'livedoor').lower()
        # タイトル選定
        p_title = ext.get('title_h') if platform == 'hatena' and ext.get('title_h') else ext.get('title_g', entry['title'])
        p_body = ext.get('cont_g', ext.get('raw_text', ''))
        
        # AIのメタ情報の残りを除去
        unwanted = [r"📥\s*入力データ.*?\n", r"元ネタ:.*?\n", r"📤\s*出力.*?\n", r"^出力[:：].*?\n"]
        for pattern in unwanted:
            p_body = re.sub(pattern, "", p_body, flags=re.IGNORECASE | re.MULTILINE)
        p_body = p_body.strip()

        # DB保存
        try:
            with transaction.atomic():
                new_art = Article.objects.create(
                    site=project_label, content_type='post',
                    title=p_title[:500], body_text=p_body,
                    main_image_url=parsed_data.get('img'), source_url=entry['link'],
                    extra_metadata={"category": cat_name, "is_adult": site.get('is_adult') == '1'}
                )
                art_id = new_art.id
        except Exception as e:
            self.log(f"DB保存失敗: {e}")
            return False, {}

        # 投稿実行
        try:
            cfg = site.copy()
            # 既存ドライバーが期待するキー名へ変換
            cfg.update({
                'api_key': str(site.get('api_key') or site.get('api_key_or_pw') or '').strip(),
                'endpoint': str(site.get('endpoint') or site.get('url') or '').strip(),
                'user': str(site.get('user') or '').strip(),
                'current_dir': config_dir
            })
            
            driver_class = {'hatena': HatenaDriver, 'blogger': BloggerDriver}.get(platform, LivedoorDriver)
            driver = driver_class(cfg)
            
            img_html = f'<div style="text-align:center; margin-bottom:15px;"><img src="{parsed_data.get("img")}" style="max-width:100%;"></div>' if parsed_data.get("img") else ""
            review_html = f'<div style="background:#f9f9f9; padding:15px; border-left:5px solid #ff6600; margin-bottom:20px;"><strong>🖋 編集部ピックアップ：</strong><br>「{comment}」</div>'
            
            # ドメインマップ
            domain_map = {'tiper': 'https://tiper.live', 'avflash': 'https://avflash.xyz', 'saving': 'https://saving-tech.com'}
            base_url = domain_map.get(project_label, f"https://{project_label}.com")
            full_internal_url = f"{base_url}/news/{art_id}"

            # HTML組み立て
            final_content = img_html + review_html + HTMLConverter.md_to_html(p_body) + cta_template.replace("{{internal_url}}", full_internal_url)
            
            if driver.post(title=p_title, body=final_content, source_url=entry['link'], category=cat_name):
                Article.objects.filter(id=art_id).update(is_exported=True)
                return True, {'title': p_title}
            else:
                Article.objects.filter(id=art_id).delete() # 失敗時はレコード削除
                return False, {}
        except Exception as e:
            self.log(f"Driver Error: {e}")
            return False, {}

    def build_rss_pool(self, rss_master, categories):
        """RSSソースから情報を収集"""
        pool = {}
        for cat in categories:
            if not cat: continue
            entries = []
            rss_sources = [r for r in rss_master if cat in r.get('rss_category', '')]
            for source in rss_sources:
                url = source.get('rss_url', '').strip()
                if not url: continue
                try:
                    res = requests.get(url, timeout=10, headers={'User-Agent': 'Mozilla/5.0'})
                    feed = feedparser.parse(res.text)
                    for e in feed.entries:
                        link = getattr(e, 'link', None) or getattr(e, 'id', None)
                        if not link: continue
                        extractor = ExtractorFactory.get_extractor(url, cat)
                        content_val = e.content[0].value if hasattr(e, 'content') else e.get('description', '')
                        rss_img = extractor.extract(content_val, entry=e)
                        entries.append({'title': e.title, 'link': link, 'rss_img': rss_img})
                except: continue
            pool[cat] = entries
        return pool

    def load_character_comments(self, path):
        """プロジェクトごとのランダムコメント集をロード"""
        if not os.path.exists(path): return []
        try:
            with open(path, "r", encoding="utf-8-sig") as f:
                return [l.strip().strip('"') for l in f if l.strip() and "キャラ設定" not in l]
        except: return []

    def guess_category(self, site_key):
        """サイト名からカテゴリを推測"""
        sk = str(site_key).lower()
        if 'vr' in sk: return 'adult_vr'
        if 'jukujo' in sk: return 'adult_video'
        return 'adult_video'

    def log(self, msg, style_func=None):
        ts = datetime.now().strftime('%H:%M:%S')
        if style_func: self.stdout.write(style_func(f"[{ts}] {msg}"))
        else: self.stdout.write(f"[{ts}] {msg}")