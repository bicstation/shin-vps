# -*- coding: utf-8 -*-
import feedparser, csv, os, re, random, time, requests, json, unicodedata
from datetime import datetime
from django.core.management.base import BaseCommand
from django.db import transaction
from api.models.article import Article 
from api.utils.html_utils import HTMLConverter

# --- Google API ライブラリ ---
from googleapiclient.discovery import build
from google.oauth2 import service_account

# --- 外部ドライバー群 ---
from api.management.commands.blog_drivers.livedoor_driver import LivedoorDriver
from api.management.commands.blog_drivers.blogger_driver import BloggerDriver
from api.management.commands.blog_drivers.hatena_driver import HatenaDriver
from api.management.commands.blog_drivers.wordpress_driver import WordPressDriver
from api.management.commands.blog_drivers.data_mapper import ArticleMapper
from api.management.commands.blog_drivers.rss_parsers import RSSParserFactory

class Command(BaseCommand):
    # .envから司令部名を取得（デフォルトは Marya）
    CMD_NAME = os.getenv('CMD_NAME', 'Marya')
    VERSION = "v1.5.1"
    help = f'Gemma 3 艦隊司令部 {VERSION} ({CMD_NAME} Edition)'

    ALLOWED_SITES = ['bicstation', 'saving', 'tiper', 'avflash']

    def add_arguments(self, parser):
        parser.add_argument('--project', type=str, help='実行するサイトキーを指定')
        parser.add_argument('--platform', type=str, help='ブログ基盤を指定')
        parser.add_argument('--limit', type=int, default=1, help='最大投稿数')
        parser.add_argument('--skip-rss', action='store_true', help='RSS取得をスキップ')

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.selected_in_this_run = []
        # APIキーのロード
        self.api_keys = [os.getenv(f'GEMINI_API_KEY_{i}') for i in range(1, 11)]
        self.api_keys = [k for k in self.api_keys if k and not k.startswith('GEMINI')]
        if not self.api_keys: self.api_keys = [os.getenv('GEMINI_API_KEY')]
        
        # パス設定（Docker環境で確実に設定ファイルを掴むための絶対パス）
        self.base_path = os.path.dirname(os.path.abspath(__file__))
        self.SETTING_DIR = os.path.join(self.base_path, 'teitoku_settings')
        self.PROMPT_DIR = os.path.join(self.base_path, 'prompt')
        # Google Indexing JSONパス
        self.GOOGLE_KEY_PATH = os.path.join(self.base_path, 'bs_json', 'google-indexing-key.json')

    def handle(self, *args, **options):
        target_site = options.get('project')
        target_platform = options.get('platform')
        post_limit = options.get('limit')
        skip_rss = options.get('skip_rss')

        # 司令部名を表示に反映
        self.log(f"--- 🚀 MISSION START: {self.VERSION} (Commander: {self.CMD_NAME} | Target: {target_site or 'ALL'}) ---", self.style.SUCCESS)
        
        RSS_CSV = os.path.join(self.SETTING_DIR, 'master_rss_sources.csv')
        FLEET_CSV = os.path.join(self.SETTING_DIR, 'master_fleet.csv')

        # 1. RSSフェッチ
        if not skip_rss:
            self.fetch_all_rss(RSS_CSV)

        if not os.path.exists(FLEET_CSV):
            self.log(f"❌ Fleet CSVが見つかりません: {FLEET_CSV}", self.style.ERROR)
            return

        # 2. 投稿ループ
        with open(FLEET_CSV, "r", encoding="utf-8-sig") as f:
            reader = csv.DictReader(f, delimiter='\t')
            for blog_config in reader:
                site_key = blog_config.get('site_key')
                platform = blog_config.get('platform', 'livedoor').lower()

                if site_key not in self.ALLOWED_SITES: continue
                if target_site and site_key != target_site: continue
                if target_platform and platform != target_platform.lower(): continue

                self.log(f"🚢 【巡回開始】: {site_key} ({platform})")
                
                for i in range(post_limit):
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
                            DriverClass = {
                                'livedoor': LivedoorDriver, 
                                'blogger': BloggerDriver, 
                                'hatena': HatenaDriver, 
                                'wordpress': WordPressDriver
                            }.get(platform)
                            
                            if not DriverClass: continue
                            
                            driver = DriverClass(blog_config)
                            posted_url = driver.post(title=final_title, body=full_post_body, image_url=img_url or "", source_url=selected.source_url, category=final_cat)
                            
                            if posted_url:
                                self.mark_as_success(selected, site_key, final_title, full_post_body, img_url, platform)
                                self.log(f"  ✅ 投稿成功({i+1}/{post_limit}): {final_title[:20]}", self.style.SUCCESS)
                                
                                # Google Indexing API 通知
                                if isinstance(posted_url, str) and posted_url.startswith('http'):
                                    self.submit_to_google_indexing(posted_url)

                        except Exception as e:
                            self.log(f"  ❌ ドライバエラー: {str(e)}", self.style.ERROR)
                    
                    if i < post_limit - 1:
                        time.sleep(random.randint(20, 40))

    def submit_to_google_indexing(self, target_url):
        """Google Indexing APIに即時クロールを依頼"""
        if not os.path.exists(self.GOOGLE_KEY_PATH):
            return

        try:
            scopes = ['https://www.googleapis.com/auth/indexing']
            credentials = service_account.Credentials.from_service_account_file(
                self.GOOGLE_KEY_PATH, scopes=scopes
            )
            service = build('indexing', 'v3', credentials=credentials)
            body = {'url': target_url, 'type': 'URL_UPDATED'}
            service.urlNotifications().publish(body=body).execute()
            self.log(f"  🚀 [Indexing API] 通知完了: {target_url}", self.style.SUCCESS)
        except Exception as e:
            self.log(f"  ⚠️ [Indexing API] 失敗: {str(e)}", self.style.WARNING)

    def fetch_all_rss(self, csv_path):
        """年齢確認Cookie(ckcy=1)をセットしてRSSを取得"""
        if not os.path.exists(csv_path): return
        self.log(f"📡 RSSフェッチ開始（司令部: {self.CMD_NAME}）")
        
        with open(csv_path, "r", encoding="utf-8-sig") as f:
            reader = csv.DictReader(f, delimiter='\t')
            for row in reader:
                project_name = row['project']
                if project_name not in self.ALLOWED_SITES: continue

                try:
                    # 盾（User-Agent）と通行証（Cookie）を装備
                    cookies = {'ckcy': '1'}
                    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}
                    
                    response = requests.get(row['rss_url'], headers=headers, cookies=cookies, timeout=15)
                    
                    if response.status_code == 200:
                        feed = feedparser.parse(response.content)
                        count = 0
                        for entry in feed.entries:
                            # 既存重複チェックをしつつ保存
                            obj, created = Article.objects.get_or_create(
                                source_url=entry.link, 
                                defaults={
                                    'site': project_name, 
                                    'title': entry.title, 
                                    'body_text': getattr(entry, 'description', entry.title), 
                                    'extra_metadata': {'rss_category': row.get('rss_category', 'general')}
                                }
                            )
                            if created: count += 1
                        
                        if count > 0:
                            self.log(f"  📥 {project_name}: {count}件の新規物資を確保。")
                    else:
                        self.log(f"  ⚠️ {project_name} 接続失敗 (HTTP {response.status_code})", self.style.WARNING)
                except Exception as e:
                    self.log(f"  ❌ {project_name} 取得エラー: {str(e)}", self.style.ERROR)
                    continue

    def get_random_teitoku_comment(self, site_key):
        comment_file = os.path.join(self.SETTING_DIR, f"teitoku_{site_key}_comments.csv")
        if not os.path.exists(comment_file): return "要チェックの最新トレンドです！"
        try:
            with open(comment_file, "r", encoding="utf-8") as f:
                comments = [line.strip() for line in f if line.strip()]
                return random.choice(comments) if comments else "必見の内容です。"
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
        # Gemma 3 モデルを明示的に使用
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemma-3-27b-it:generateContent?key={key}"
        
        full_instruction = f"""
{prompt_base}
📥 補足データ
タイトル: {title}
内容詳細: {p_data['body'][:800]}
ペルソナ: {config.get('persona')}
⚠️【重要】[TITLE][BODY][CAT]形式を厳守し、最後に以下を配置せよ:
{cta}
"""
        try:
            r = requests.post(url, json={"contents": [{"parts": [{"text": full_instruction}]}], "generationConfig": {"temperature": 0.7}}, timeout=60)
            if r.status_code == 200:
                return r.json()['candidates'][0]['content']['parts'][0]['text']
            else:
                self.log(f"  ⚠️ Gemma API Error: {r.status_code}", self.style.WARNING)
        except: pass
        return None

    def extract_tag(self, text, tag):
        match = re.search(f"\\[{tag}\\](.*?)\\[/{tag}\\]", text, re.DOTALL)
        return match.group(1).strip() if match else ""

    def assemble_final_html(self, body_content, img_url, comment):
        img_tag = f'<p align="center"><img src="{img_url}" style="max-width:100%; border-radius:10px;"></p>' if img_url else ""
        comment_html = f'''
<div style="border: 2px dashed #ff4500; padding: 15px; margin: 20px 0; background: #fffaf0; border-radius: 10px;">
  <strong style="color: #ff4500;">🖋 司令部（{self.CMD_NAME}）レビュー：</strong><br>
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