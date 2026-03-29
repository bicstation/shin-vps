# -*- coding: utf-8 -*-
import feedparser
import csv
import os
import re
import random
import time
import urllib.request
from django.core.management.base import BaseCommand
from django.core.management import call_command
from api.models import Article 
from google import genai

class Command(BaseCommand):
    help = '各ブログのペルソナが独自のRSS群から、他と被らない記事を1つ選び抜いて投稿する'

    def add_arguments(self, parser):
        parser.add_argument('--limit', type=int, default=1, help='各ブログの投稿数')

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # 今回の実行セッションで「選定済み」となった記事IDを保持し、重複を物理的に排除する
        self.selected_in_this_run = []
        self.api_keys = [os.getenv(f'GEMINI_API_KEY_{i}') for i in range(1, 11)]
        self.api_keys = [k for k in self.api_keys if k and not k.startswith('GEMINI')]
        if not self.api_keys:
            self.api_keys = [os.getenv('GEMINI_API_KEY')]

    def handle(self, *args, **options):
        # パス設定
        current_dir = os.path.dirname(os.path.abspath(__file__))
        SETTING_DIR = os.path.join(current_dir, 'teitoku_settings')
        RSS_CSV = os.path.join(SETTING_DIR, 'master_rss_sources.csv')
        FLEET_CSV = os.path.join(SETTING_DIR, 'master_fleet.csv')

        self.stdout.write(self.style.SUCCESS('--- [AI Fleet: Individual Mission] 抜錨 ---'))

        # 1. 共通の情報の海を最新にする（仕入れ）
        self.fetch_all_rss(RSS_CSV)

        # 2. ブログマスターを一行ずつ読み込み、その場で完結させる
        if not os.path.exists(FLEET_CSV):
            self.stdout.write(self.style.ERROR(f"File not found: {FLEET_CSV}"))
            return

        with open(FLEET_CSV, "r", encoding="utf-8-sig") as f:
            reader = csv.DictReader(f, delimiter='\t')
            for blog in reader:
                site_key = blog['site_key']
                persona = blog['persona']
                platform = blog['platform']
                allowed_cats = [c.strip() for c in blog['rss_category'].split(',')]

                self.stdout.write(f"\n--- Blog: {site_key} (Persona: {persona[:20]}...) ---")

                # 【重要】他ブログが選んだ記事(self.selected_in_this_run)を除外して候補を抽出
                candidates = Article.objects.filter(
                    extra_metadata__rss_category__in=allowed_cats,
                    is_exported=False
                ).exclude(id__in=self.selected_in_this_run).order_by('-created_at')[:30]

                if not candidates.exists():
                    self.stdout.write(f"  ☕ 候補なし、または全記事選定済み。スキップします。")
                    continue

                # 候補をシャッフルして順位によるバイアスを消す
                candidate_list = list(candidates)
                random.shuffle(candidate_list)

                # --- STEP A: ペルソナによる「唯一の選択」 ---
                selected = self.let_persona_choose(persona, candidate_list)
                
                if selected:
                    # この実行回で二度と選ばれないようロック
                    self.selected_in_this_run.append(selected.id)
                    self.stdout.write(f"  🎯 選択: {selected.title[:40]}")
                    
                    # --- STEP B: 執筆 ---
                    content = self.write_article(persona, selected)
                    
                    # --- STEP C: 投稿 ---
                    if content:
                        try:
                            call_command(
                                f"post_{platform}", 
                                site_key=site_key, 
                                title=selected.title, 
                                content=content, 
                                article_id=selected.id, 
                                image_url=selected.main_image_url
                            )
                            # DBを更新して「済」にする
                            selected.is_exported = True
                            selected.save()
                            self.stdout.write(self.style.SUCCESS(f"  ✅ {site_key} 投稿成功"))
                        except Exception as e:
                            self.stdout.write(self.style.ERROR(f"  ❌ {site_key} 投稿エラー: {e}"))
                
                # ブログごとの処理に余韻（API負荷分散）を持たせる
                time.sleep(3)

        self.stdout.write(self.style.SUCCESS('\n--- 全ブログの個別ミッションが完了しました ---'))

    def let_persona_choose(self, persona, articles):
        """AIにリストを見せて、そのキャラが最も惹かれる1つを番号で選ばせる"""
        client = genai.Client(api_key=random.choice(self.api_keys))
        list_txt = "\n".join([f"[{i}] {a.title}" for i, a in enumerate(articles)])
        
        prompt = (
            f"あなたは【ペルソナ】です:\n{persona}\n\n"
            f"以下のニュースリストから、あなたのブログの読者が最も喜びそうな、あなたの感性に響くネタを1つだけ選んでください。\n"
            f"回答は選んだ番号のみ（例: [3]）を返してください。それ以外の言葉は不要です。\n\n"
            f"【ニュースリスト】\n{list_txt}"
        )
        try:
            res = client.models.generate_content(model='gemini-1.5-flash', contents=prompt)
            match = re.search(r'\[(\d+)\]', res.text)
            idx = int(match.group(1)) if match else 0
            return articles[idx] if idx < len(articles) else articles[0]
        except:
            return articles[0]

    def write_article(self, persona, article):
        """選ばれた獲物をペルソナの味付けで調理する"""
        client = genai.Client(api_key=random.choice(self.api_keys))
        prompt = (
            f"【ペルソナ】\n{persona}\n\n"
            f"【ニュース素材】\nタイトル: {article.title}\n内容: {article.body_text}\n\n"
            f"指示: 上記素材を元に、あなたのキャラ全開の口調で、読者が楽しめるブログ記事をMarkdown形式で書いてください。"
        )
        try:
            res = client.models.generate_content(model='gemini-1.5-flash', contents=prompt)
            return res.text.replace('\0', '')
        except:
            return None

    def fetch_all_rss(self, csv_path):
        """全RSSを巡回し、DBに『情報の海』を作る"""
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
                except:
                    continue

    def extract_img(self, text):
        m = re.search(r'<img src="(.*?)"', text)
        return m.group(1) if m else ""