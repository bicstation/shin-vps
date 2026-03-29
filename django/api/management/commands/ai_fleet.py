# -*- coding: utf-8 -*-
import feedparser, csv, os, re, random, time, urllib.request
from django.core.management.base import BaseCommand
from django.core.management import call_command
from api.models import Article 
from google import genai
# v1.0.502の資産をインポート
from api.utils.html_utils import HTMLConverter

class Command(BaseCommand):
    help = 'ペルソナが選別・執筆し、各プラットフォームへ自動投稿する'

    def add_arguments(self, parser):
        parser.add_argument('--limit', type=int, default=1, help='各ブログの投稿数')

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.selected_in_this_run = []
        self.api_keys = [os.getenv(f'GEMINI_API_KEY_{i}') for i in range(1, 11)]
        self.api_keys = [k for k in self.api_keys if k and not k.startswith('GEMINI')]
        if not self.api_keys:
            self.api_keys = [os.getenv('GEMINI_API_KEY')]

    def handle(self, *args, **options):
        current_dir = os.path.dirname(os.path.abspath(__file__))
        SETTING_DIR = os.path.join(current_dir, 'teitoku_settings')
        RSS_CSV = os.path.join(SETTING_DIR, 'master_rss_sources.csv')
        FLEET_CSV = os.path.join(SETTING_DIR, 'master_fleet.csv')

        self.stdout.write(self.style.SUCCESS('--- [AI Fleet: Mission Start] ---'))

        # 1. 情報の仕入れ（情報の海を更新）
        self.fetch_all_rss(RSS_CSV)

        # 2. 艦隊（ブログ群）を回す
        if not os.path.exists(FLEET_CSV): return

        with open(FLEET_CSV, "r", encoding="utf-8-sig") as f:
            reader = csv.DictReader(f, delimiter='\t')
            for blog in reader:
                site_key = blog['site_key']
                persona = blog['persona']
                platform = blog['platform']
                allowed_cats = [c.strip() for c in blog['rss_category'].split(',')]

                self.stdout.write(f"\n🚢 Blog: {site_key} ({platform})")

                # --- STEP A: 候補抽出と選別 ---
                candidates = Article.objects.filter(
                    extra_metadata__rss_category__in=allowed_cats,
                    is_exported=False
                ).exclude(id__in=self.selected_in_this_run).order_by('-created_at')[:30]

                if not candidates.exists():
                    self.stdout.write(f"  ☕ ネタ切れ。スキップ。")
                    continue

                candidate_list = list(candidates)
                random.shuffle(candidate_list)
                selected = self.let_persona_choose(persona, candidate_list)
                
                if selected:
                    self.selected_in_this_run.append(selected.id)
                    self.stdout.write(f"  🎯 選択: {selected.title[:40]}")
                    
                    # --- STEP B: 執筆（AI味付け） ---
                    raw_content = self.write_article(persona, selected)
                    
                    # --- STEP C: 投稿（v1.0.502ドライバ呼び出し） ---
                    if raw_content:
                        # MarkdownをHTMLに変換（既存のHTMLConverterを使用）
                        html_content = HTMLConverter.md_to_html(raw_content)
                        
                        # 画像があれば先頭に挿入
                        if selected.main_image_url:
                            img_tag = f'<div style="text-align:center;"><img src="{selected.main_image_url}" style="max-width:100%;"></div><br>'
                            html_content = img_tag + html_content

                        try:
                            # 既存の投稿コマンド（post_livedoor等）を呼び出す
                            call_command(
                                f"post_{platform}", 
                                site_key=site_key, 
                                title=selected.title, 
                                content=html_content, 
                                article_id=selected.id
                            )
                            # 成功したらフラグを立てる
                            selected.is_exported = True
                            selected.save()
                            self.stdout.write(self.style.SUCCESS(f"  ✅ 投稿完了"))
                        except Exception as e:
                            self.stdout.write(self.style.ERROR(f"  ❌ 投稿エラー: {e}"))
                
                time.sleep(5) # API負荷分散

    def let_persona_choose(self, persona, articles):
        client = genai.Client(api_key=random.choice(self.api_keys))
        list_txt = "\n".join([f"[{i}] {a.title}" for i, a in enumerate(articles)])
        prompt = (f"あなたは【{persona}】です。\n以下のリストから読者が最も喜びそうなネタを1つ選んで [番号] のみ答えてください。\n\n{list_txt}")
        try:
            res = client.models.generate_content(model='gemini-1.5-flash', contents=prompt)
            idx = int(re.search(r'\[(\d+)\]', res.text).group(1))
            return articles[idx]
        except: return articles[0]

    def write_article(self, persona, article):
        client = genai.Client(api_key=random.choice(self.api_keys))
        prompt = (f"【ペルソナ】\n{persona}\n\n【ニュース】\n{article.title}\n{article.body_text}\n\n"
                  f"指示: キャラ全開の口調でMarkdown形式でブログを書いてください。")
        try:
            res = client.models.generate_content(model='gemini-1.5-flash', contents=prompt)
            return res.text
        except: return None

    def fetch_all_rss(self, csv_path):
        """RSSから情報を仕入れる既存ロジック"""
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
                            Article.objects.get_or_create(
                                source_url=entry.get('link'),
                                defaults={
                                    'site': row.get('project', 'unknown'),
                                    'title': entry.get('title', ''),
                                    'body_text': entry.get('description', entry.get('summary', '')),
                                    'main_image_url': self.extract_img(entry.get('description', '')),
                                    'extra_metadata': {'rss_category': row.get('rss_category')}
                                }
                            )
                except: continue

    def extract_img(self, text):
        m = re.search(r'<img src="(.*?)"', text)
        return m.group(1) if m else ""