# -*- coding: utf-8 -*-
import feedparser, csv, os, re, random, time, urllib.request, json
from datetime import datetime
from django.core.management.base import BaseCommand
from django.core.management import call_command
from api.models.article import Article 
from google import genai
from google.genai import types
from api.utils.html_utils import HTMLConverter

class Command(BaseCommand):
    help = 'ペルソナ選別・執筆・自動投稿システム（Livedoor 400エラー完全鎮圧版）'

    def add_arguments(self, parser):
        parser.add_argument('--limit', type=int, default=1, help='各ブログの投稿数')

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.selected_in_this_run = []
        # APIキーの取得（環境変数 GEMINI_API_KEY_1～10 または GEMINI_API_KEY）
        self.api_keys = [os.getenv(f'GEMINI_API_KEY_{i}') for i in range(1, 11)]
        self.api_keys = [k for k in self.api_keys if k and not k.startswith('GEMINI')]
        if not self.api_keys:
            self.api_keys = [os.getenv('GEMINI_API_KEY')]
        
        # 安全設定：AIの拒絶を最小限に抑える
        self.safety_config = types.GenerateContentConfig(
            safety_settings=[
                types.SafetySetting(category="HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold="BLOCK_NONE"),
                types.SafetySetting(category="HARM_CATEGORY_HATE_SPEECH", threshold="BLOCK_NONE"),
                types.SafetySetting(category="HARM_CATEGORY_HARASSMENT", threshold="BLOCK_NONE"),
                types.SafetySetting(category="HARM_CATEGORY_DANGEROUS_CONTENT", threshold="BLOCK_NONE"),
            ]
        )

    def handle(self, *args, **options):
        current_dir = os.path.dirname(os.path.abspath(__file__))
        SETTING_DIR = os.path.join(current_dir, 'teitoku_settings')
        RSS_CSV = os.path.join(SETTING_DIR, 'master_rss_sources.csv')
        FLEET_CSV = os.path.join(SETTING_DIR, 'master_fleet.csv')

        self.log("--- 🚀 MISSION START: v1.1.9 (Full Clean) ---", self.style.SUCCESS)

        # 1. 情報の仕入れ
        self.fetch_all_rss(RSS_CSV)

        # 2. 艦隊巡回
        if not os.path.exists(FLEET_CSV):
            return self.log(f"NotFound: {FLEET_CSV}", self.style.ERROR)

        with open(FLEET_CSV, "r", encoding="utf-8-sig") as f:
            reader = csv.DictReader(f, delimiter='\t')
            for blog in reader:
                site_key = blog.get('site_key')
                persona = blog.get('persona')
                platform = blog.get('platform', 'livedoor').lower()
                allowed_cats = [c.strip() for c in blog.get('rss_category', '').split(',') if c.strip()]

                self.log(f"🚢 【巡回】: {site_key} ({platform})")

                # ネタ抽出
                candidates = Article.objects.filter(
                    extra_metadata__rss_category__in=allowed_cats,
                    is_exported=False
                ).exclude(id__in=self.selected_in_this_run).order_by('-created_at')[:30]

                if not candidates.exists():
                    self.log("  ☕ ネタ切れ。スキップ。")
                    continue

                # ペルソナ選別
                selected = self.let_persona_choose(persona, list(candidates))
                if not selected:
                    continue

                self.selected_in_this_run.append(selected.id)
                self.log(f"  🎯 選択: {selected.title[:40]}")
                
                # --- 浄化プロセス：タイトル ---
                post_title = selected.title.replace('\n', ' ').strip()
                if len(post_title) > 95: post_title = post_title[:92] + "..."

                # --- 執筆プロセス ---
                raw_markdown = self.write_article(persona, selected)
                
                if raw_markdown:
                    # --- 浄化プロセス：本文 ---
                    clean_html = self.sanitize_to_html(raw_markdown, selected.main_image_url)

                    if not clean_html or len(clean_html) < 100:
                        self.log("  ⚠️ 本文不備のためスキップ", self.style.WARNING)
                        continue

                    try:
                        # 既存ドライバ（post_xxx）の呼び出し
                        call_command(
                            f"post_{platform}", 
                            site_key=site_key, 
                            title=post_title, 
                            content=clean_html, 
                            article_id=selected.id
                        )
                        
                        selected.is_exported = True
                        selected.save()
                        self.log(f"  ✅ 成功: {post_title[:20]}", self.style.SUCCESS)
                    except Exception as e:
                        self.log(f"  ❌ 投稿エラー: {str(e)}", self.style.ERROR)
                
                time.sleep(random.randint(10, 20)) # API負荷分散

    def sanitize_to_html(self, md_body, img_url):
        """Livedoor 400エラーの原因を物理的に排除してHTML化"""
        # 1. Markdown -> HTML 変換
        html = HTMLConverter.md_to_html(md_body)
        
        # 2. 制御文字（XML不正文字）を完全に抹殺
        html = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]', '', html)
        
        # 3. &記号の正規化（XMLパース破壊防止）
        html = html.replace('&', '&amp;')
        html = html.replace('&amp;amp;', '&amp;') # 二重変換防止
        
        # 4. 画像タグの挿入（浄化済みURLを使用）
        if img_url:
            if img_url.startswith('//'): img_url = 'https:' + img_url
            img_tag = f'<div style="text-align:center;margin-bottom:20px;"><img src="{img_url}" style="max-width:100%;"></div><br>'
            html = img_tag + html
            
        return html.strip()

    def let_persona_choose(self, persona, articles):
        client = genai.Client(api_key=random.choice(self.api_keys))
        list_txt = "\n".join([f"[{i}] {a.title}" for i, a in enumerate(articles)])
        prompt = (f"あなたは【{persona}】です。\n以下のリストから惹かれるネタを1つ選び [番号] のみ答えてください。\n\n{list_txt}")
        try:
            res = client.models.generate_content(model='gemini-1.5-flash', contents=prompt, config=self.safety_config)
            match = re.search(r'\[(\d+)\]', res.text)
            idx = int(match.group(1)) if match else 0
            return articles[idx]
        except:
            return articles[0]

    def write_article(self, persona, article):
        client = genai.Client(api_key=random.choice(self.api_keys))
        # 拒絶を避けるため、直接的な指示をマイルド化
        prompt = (f"あなたは【{persona}】です。以下のニュースを元に、情緒豊かなブログをMarkdownで書いてください。\n"
                  f"【ニュースタイトル】: {article.title}\n"
                  f"【詳細】: {article.body_text[:500]}\n\n"
                  f"指示: 読者に語りかける口調で。直接的な性的表現は避け、雰囲気や期待感を比喩で表現してください。")
        try:
            res = client.models.generate_content(model='gemini-1.5-flash', contents=prompt, config=self.safety_config)
            if not res.text or "申し訳ありません" in res.text:
                return None
            return res.text
        except:
            return None

    def fetch_all_rss(self, csv_path):
        if not os.path.exists(csv_path): return
        with open(csv_path, "r", encoding="utf-8-sig") as f:
            reader = csv.DictReader(f, delimiter='\t')
            for row in reader:
                url = row.get('rss_url', '').strip()
                if not url: continue
                try:
                    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
                    with urllib.request.urlopen(req, timeout=10) as r:
                        feed = feedparser.parse(r.read())
                        for entry in feed.entries:
                            desc = entry.get('description', entry.get('summary', ''))
                            Article.objects.get_or_create(
                                source_url=entry.get('link'),
                                defaults={
                                    'site': row.get('project', 'unknown'),
                                    'title': entry.get('title', ''),
                                    'body_text': desc,
                                    'main_image_url': self.extract_img(desc),
                                    'extra_metadata': {'rss_category': row.get('rss_category')}
                                }
                            )
                except: continue

    def extract_img(self, text):
        m = re.search(r'<img src="(.*?)"', text)
        return m.group(1) if m else ""

    def log(self, msg, style_func=None):
        ts = datetime.now().strftime('%H:%M:%S')
        if style_func: self.stdout.write(style_func(f"[{ts}] {msg}"))
        else: self.stdout.write(f"[{ts}] {msg}")