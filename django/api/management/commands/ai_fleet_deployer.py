# -*- coding: utf-8 -*-
import feedparser, csv, os, re, random, time, urllib.request, requests, json, unicodedata
from datetime import datetime
from django.core.management.base import BaseCommand
from django.db import transaction
from api.models.article import Article 
from api.utils.html_utils import HTMLConverter

# --- 外部ドライバー群 ---
from api.management.commands.blog_drivers.livedoor_driver import LivedoorDriver
from api.management.commands.blog_drivers.blogger_driver import BloggerDriver
from api.management.commands.blog_drivers.hatena_driver import HatenaDriver
from api.management.commands.blog_drivers.wordpress_driver import WordPressDriver
from api.management.commands.blog_drivers.data_mapper import ArticleMapper
from api.management.commands.blog_drivers.rss_parsers import RSSParserFactory

class Command(BaseCommand):
    help = 'Gemma 3 艦隊司令部 v1.4.2 (Next.js SiteID防衛・ターゲット投稿システム)'

    # Next.js側と共通の正式なサイト識別子リスト（これ以外はDBに入れない/投稿しない）
    ALLOWED_SITES = ['bicstation', 'saving', 'tiper', 'avflash']

    def add_arguments(self, parser):
        """コマンドライン引数の定義"""
        parser.add_argument('--project', type=str, help='実行するサイトキーを指定 (tiper, bicstation等)')
        parser.add_argument('--platform', type=str, help='実行するブログ基盤を指定 (livedoor, wordpress等)')
        parser.add_argument('--limit', type=int, default=1, help='1サイトあたりの最大投稿数')
        parser.add_argument('--skip-rss', action='store_true', help='RSS取得をスキップしてDBから即投稿')

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.selected_in_this_run = []
        # APIキーのロード
        self.api_keys = [os.getenv(f'GEMINI_API_KEY_{i}') for i in range(1, 11)]
        self.api_keys = [k for k in self.api_keys if k and not k.startswith('GEMINI')]
        if not self.api_keys: self.api_keys = [os.getenv('GEMINI_API_KEY')]
        
        # パス設定
        self.base_path = os.path.dirname(os.path.abspath(__file__))
        self.PROMPT_DIR = os.path.join(self.base_path, 'prompt')
        self.SETTING_DIR = os.path.join(self.base_path, 'teitoku_settings')

    def handle(self, *args, **options):
        target_site = options.get('project')
        target_platform = options.get('platform')
        post_limit = options.get('limit')
        skip_rss = options.get('skip_rss')

        self.log(f"--- 🚀 MISSION START: v1.4.2 (Target: {target_site or 'ALL'}) ---", self.style.SUCCESS)
        
        RSS_CSV = os.path.join(self.SETTING_DIR, 'master_rss_sources.csv')
        FLEET_CSV = os.path.join(self.SETTING_DIR, 'master_fleet.csv')

        # 1. RSSフェッチ（許可リストによる水際対策付き）
        if not skip_rss:
            self.fetch_all_rss(RSS_CSV)
        else:
            self.log("⏩ RSSフェッチをスキップし、既存のDBデータを使用します。")

        if not os.path.exists(FLEET_CSV): return

        # 2. 投稿ループ
        with open(FLEET_CSV, "r", encoding="utf-8-sig") as f:
            reader = csv.DictReader(f, delimiter='\t')
            for blog_config in reader:
                site_key = blog_config.get('site_key')
                platform = blog_config.get('platform', 'livedoor').lower()

                # 【防衛】許可リストにないサイトはスキップ
                if site_key not in self.ALLOWED_SITES:
                    continue

                # 引数フィルタリング
                if target_site and site_key != target_site: continue
                if target_platform and platform != target_platform.lower(): continue

                self.log(f"🚢 【巡回】: {site_key} ({platform})")
                
                # 指定数分投稿を試行
                for i in range(post_limit):
                    # 【整合】Next.jsで重要な 'site' カラムで候補を抽出
                    candidates = Article.objects.filter(
                        site=site_key, 
                        is_exported=False
                    ).exclude(id__in=self.selected_in_this_run).order_by('-created_at')[:20]

                    if not candidates.exists():
                        self.log(f"  ⚠️ {site_key}: 候補記事切れです。")
                        break

                    selected = self.let_persona_choose_rest(blog_config.get('persona'), list(candidates))
                    if not selected or ArticleMapper.check_exists(site_key, selected.source_url):
                        continue

                    self.selected_in_this_run.append(selected.id)

                    # 執筆準備
                    clean_title = re.sub(r'[^\w\s\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]', ' ', selected.title).strip()
                    clean_title = re.sub(r'\s+', ' ', clean_title)
                    if len(clean_title) > 85: clean_title = clean_title[:82] + "..."

                    prompt_content = self.load_external_file(self.PROMPT_DIR, f"ai_prompt_{site_key}.txt")
                    cta_content = self.load_external_file(self.PROMPT_DIR, f"cta_{site_key}.txt")
                    teitoku_comment = self.get_random_teitoku_comment(site_key)

                    parser = RSSParserFactory.get_parser(selected.source_url)
                    p_data = parser.parse(selected.source_url)
                    if not p_data or not p_data.get('body'): continue

                    # Gemma 3 執筆
                    write_res = self.generate_with_gemma_strategy(
                        site_key, prompt_content, cta_content, clean_title, p_data, blog_config
                    )
                    
                    if write_res:
                        img_url = p_data.get('img') or selected.main_image_url
                        body_html = self.extract_tag(write_res, "BODY")
                        final_title = self.extract_tag(write_res, "TITLE") or clean_title
                        final_cat = self.extract_tag(write_res, "CAT") or "最新情報"

                        full_post_body = self.assemble_final_html(body_html, img_url, teitoku_comment)

                        try:
                            DriverClass = {'livedoor': LivedoorDriver, 'blogger': BloggerDriver, 'hatena': HatenaDriver, 'wordpress': WordPressDriver}.get(platform)
                            if not DriverClass: continue
                            
                            driver = DriverClass(blog_config)
                            if driver.post(title=final_title, body=full_post_body, image_url=img_url or "", source_url=selected.source_url, category=final_cat):
                                self.mark_as_success(selected, site_key, final_title, full_post_body, img_url, platform)
                                self.log(f"  ✅ 成功({i+1}/{post_limit}): {final_title[:20]}", self.style.SUCCESS)
                        except Exception as e:
                            self.log(f"  ❌ エラー: {str(e)}", self.style.ERROR)
                    
                    if i < post_limit - 1:
                        time.sleep(random.randint(20, 40))

                time.sleep(random.randint(5, 10))

    def fetch_all_rss(self, csv_path):
        """RSS取得時、ALLOWED_SITES（Next.js判別用）以外はDBに入れない"""
        if not os.path.exists(csv_path): return
        self.log("📡 RSSフェッチ開始（サイト識別子チェック有効）")
        with open(csv_path, "r", encoding="utf-8-sig") as f:
            reader = csv.DictReader(f, delimiter='\t')
            for row in reader:
                project_name = row['project']
                # 【防衛】許可リストにないサイトの記事はDBに保存しない
                if project_name not in self.ALLOWED_SITES:
                    continue

                try:
                    req = urllib.request.Request(row['rss_url'], headers={'User-Agent': 'Mozilla/5.0'})
                    with urllib.request.urlopen(req, timeout=10) as r:
                        feed = feedparser.parse(r.read())
                        for entry in feed.entries:
                            Article.objects.get_or_create(
                                source_url=entry.link, 
                                defaults={
                                    'site': project_name, # Next.js表示用の重要カラム
                                    'title': entry.title, 
                                    'body_text': entry.description, 
                                    'extra_metadata': {'rss_category': row['rss_category']}
                                }
                            )
                except: continue

    def get_random_teitoku_comment(self, site_key):
        comment_file = os.path.join(self.SETTING_DIR, f"teitoku_{site_key}_comments.csv")
        if not os.path.exists(comment_file): return "要チェックの最新トレンドです！"
        try:
            with open(comment_file, "r", encoding="utf-8") as f:
                comments = [line.strip() for line in f if line.strip()]
                return random.choice(comments) if comments else "必見のクオリティです。"
        except: return "注目の内容です。"

    def load_external_file(self, directory, filename):
        path = os.path.join(directory, filename)
        if os.path.exists(path):
            try:
                with open(path, 'r', encoding='utf-8') as f: return f.read().strip()
            except: pass
        return ""

    def generate_with_gemma_strategy(self, site_key, prompt_base, cta, title, p_data, config):
        key = random.choice(self.api_keys)
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemma-3-27b-it:generateContent?key={key}"
        
        full_instruction = f"""
{prompt_base}
📥 補足データ
タイトル: {title}
内容詳細: {p_data['body'][:800]}
ペルソナ: {config.get('persona')}
⚠️【重要】変数は実名化し、[TITLE][BODY][CAT]形式を厳守。最後に以下を配置:
{cta}
"""
        try:
            r = requests.post(url, json={"contents": [{"parts": [{"text": full_instruction}]}], "generationConfig": {"temperature": 0.8}}, timeout=60)
            if r.status_code == 200:
                return r.json()['candidates'][0]['content']['parts'][0]['text']
        except: pass
        return None

    def extract_tag(self, text, tag):
        match = re.search(f"\\[{tag}\\](.*?)\\[/{tag}\\]", text, re.DOTALL)
        return match.group(1).strip() if match else ""

    def assemble_final_html(self, body_content, img_url, comment):
        img_tag = f'<p align="center"><img src="{img_url}" style="max-width:100%; border-radius:10px;"></p>' if img_url else ""
        comment_html = f'''
<div style="border: 2px dashed #ff4500; padding: 15px; margin: 20px 0; background: #fffaf0; border-radius: 10px;">
  <strong style="color: #ff4500;">🖋 編集長の一言レビュー：</strong><br>
  <span style="font-size: 1.1em; font-weight: bold;">「{comment}」</span>
</div>
'''
        return (img_tag + comment_html + body_content).strip()

    def let_persona_choose_rest(self, persona, articles):
        key = random.choice(self.api_keys)
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={key}"
        list_txt = "\n".join([f"[{i}] {a.title}" for i, a in enumerate(articles)])
        prompt = f"あなたは【{persona}】です。最も惹かれる番号を1つ選び [番号] の形式で答えて。\n\n{list_txt}"
        try:
            r = requests.post(url, json={"contents": [{"parts": [{"text": prompt}]}]}, timeout=25)
            if r.status_code == 200:
                m = re.search(r'\[(\d+)\]', r.json()['candidates'][0]['content']['parts'][0]['text'])
                idx = int(m.group(1)) if m else 0
                return articles[idx] if idx < len(articles) else articles[0]
        except: pass
        return articles[0]

    def mark_as_success(self, selected, site_key, title, body, img, platform):
        with transaction.atomic():
            new_id = ArticleMapper.create_article(site_id=site_key, title=title, body_text=body, source_url=selected.source_url, main_image_url=img)
            ArticleMapper.save_post_result(new_id, blog_type=platform, is_published=True)
            selected.is_exported = True
            selected.save()

    def log(self, msg, style_func=None):
        ts = datetime.now().strftime('%H:%M:%S')
        if style_func: self.stdout.write(style_func(f"[{ts}] {msg}"))
        else: self.stdout.write(f"[{ts}] {msg}")