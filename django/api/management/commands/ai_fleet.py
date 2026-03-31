# -*- coding: utf-8 -*-
import feedparser, csv, os, re, random, time, urllib.request, requests, json, unicodedata
from datetime import datetime
from django.core.management.base import BaseCommand
from django.db import transaction
from api.models.article import Article 

# --- 外部ドライバー群 ---
from api.management.commands.blog_drivers.livedoor_driver import LivedoorDriver
from api.management.commands.blog_drivers.blogger_driver import BloggerDriver
from api.management.commands.blog_drivers.hatena_driver import HatenaDriver
from api.management.commands.blog_drivers.wordpress_driver import WordPressDriver
from api.management.commands.blog_drivers.data_mapper import ArticleMapper
from api.management.commands.blog_drivers.rss_parsers import RSSParserFactory

class Command(BaseCommand):
    help = 'Gemma 3 艦隊司令部 v1.5.0 (即時巡回・ペルソナ選別投稿モデル)'

    # Next.js側と共通の正式なサイト識別子リスト
    ALLOWED_SITES = ['bicstation', 'saving', 'tiper', 'avflash']

    def add_arguments(self, parser):
        parser.add_argument('--project', type=str, help='実行するサイトキーを指定 (tiper等)')
        parser.add_argument('--limit', type=int, default=1, help='1サイトあたりの最大投稿数')

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.api_keys = [os.getenv(f'GEMINI_API_KEY_{i}') for i in range(1, 11)]
        self.api_keys = [k for k in self.api_keys if k and not k.startswith('GEMINI')]
        if not self.api_keys: self.api_keys = [os.getenv('GEMINI_API_KEY')]
        
        self.base_path = os.path.dirname(os.path.abspath(__file__))
        self.PROMPT_DIR = os.path.join(self.base_path, 'prompt')
        self.SETTING_DIR = os.path.join(self.base_path, 'teitoku_settings')

    def handle(self, *args, **options):
        target_site = options.get('project')
        post_limit = options.get('limit')

        self.log(f"--- 🚀 MISSION START: v1.5.0 (Target: {target_site or 'ALL'}) ---", self.style.SUCCESS)
        
        RSS_CSV = os.path.join(self.SETTING_DIR, 'master_rss_sources.csv')
        FLEET_CSV = os.path.join(self.SETTING_DIR, 'master_fleet.csv')

        if not os.path.exists(FLEET_CSV):
            self.log(f"❌ {FLEET_CSV} が見つかりません。", self.style.ERROR)
            return

        # 1. 艦隊（ブログ設定）の確認から開始
        with open(FLEET_CSV, "r", encoding="utf-8-sig") as f:
            # タブ区切りを想定。空白混入対策のため柔軟に読み込み
            fleet_reader = csv.DictReader(f, delimiter='\t')
            for blog_config in fleet_reader:
                # 前後の空白を除去して正規化
                site_key = (blog_config.get('site_key') or '').strip().lower()
                platform = (blog_config.get('platform') or 'livedoor').strip().lower()

                # フィルタリング
                if not site_key: continue
                if site_key not in self.ALLOWED_SITES:
                    self.log(f"[DEBUG] {site_key} は許可リストにないためスキップします。")
                    continue
                if target_site and site_key != target_site.lower():
                    continue

                self.log(f"🚢 【巡回開始】: {site_key} ({platform})")

                # 2. そのサイトに紐づくRSSを巡回し、投稿まで実行
                self.deploy_mission(site_key, platform, blog_config, post_limit, RSS_CSV)

        self.log("--- 🏁 全ミッション終了 ---", self.style.SUCCESS)

    def deploy_mission(self, site_key, platform, blog_config, limit, rss_csv_path):
        """指定サイトのRSSを読み込み、ペルソナが選別して投稿する"""
        
        # 2-1. RSSソースの抽出
        rss_urls = []
        if os.path.exists(rss_csv_path):
            with open(rss_csv_path, "r", encoding="utf-8-sig") as f:
                rss_reader = csv.DictReader(f, delimiter='\t')
                for row in rss_reader:
                    if (row.get('project') or '').strip().lower() == site_key:
                        url = (row.get('rss_url') or '').strip()
                        if url: rss_urls.append(url)
        
        if not rss_urls:
            self.log(f"  ⚠️ {site_key}: RSSソースが設定されていません。")
            return

        self.log(f"  [DEBUG] {len(rss_urls)} 件のRSSをフェッチ中...")

        # 2-2. 記事（ネタ）の収集
        all_entries = []
        for url in rss_urls:
            try:
                res = requests.get(url, headers={'User-Agent': 'Mozilla/5.0'}, timeout=15)
                feed = feedparser.parse(res.content)
                for entry in feed.entries:
                    # 重複チェック（投稿済みでないか）
                    if not Article.objects.filter(source_url=entry.link, site=site_key).exists():
                        all_entries.append(entry)
            except Exception as e:
                self.log(f"  [DEBUG] RSS取得エラー ({url}): {str(e)}")

        if not all_entries:
            self.log(f"  ⚠️ {site_key}: 新規の未投稿記事が見つかりませんでした。")
            return

        self.log(f"  📥 {len(all_entries)} 件の新規ネタを確認。ペルソナ選別を開始します。")

        # 2-3. 投稿ループ
        success_count = 0
        for i in range(limit):
            if success_count >= limit or not all_entries:
                break

            # ペルソナに選ばせる（上位20件から選定）
            candidates = all_entries[:20]
            selected_entry = self.let_persona_choose_rest(blog_config.get('persona'), candidates)
            
            if not selected_entry:
                break
            
            self.log(f"  🎯 選定記事: {selected_entry.title[:40]}...")

            # 2-4. 本文パースと執筆
            p_data = self.get_parsed_data(selected_entry)
            
            prompt_content = self.load_external_file(self.PROMPT_DIR, f"ai_prompt_{site_key}.txt")
            cta_content = self.load_external_file(self.PROMPT_DIR, f"cta_{site_key}.txt")
            
            write_res = self.generate_with_gemma_strategy(
                site_key, prompt_content, cta_content, selected_entry.title, p_data, blog_config
            )

            if write_res:
                final_title = self.extract_tag(write_res, "TITLE") or selected_entry.title
                final_body = self.extract_tag(write_res, "BODY")
                final_cat = self.extract_tag(write_res, "CAT") or "最新情報"
                
                # コメント取得と結合
                teitoku_comment = self.get_random_teitoku_comment(site_key)
                full_html = self.assemble_final_html(final_body, p_data.get('img'), teitoku_comment)

                # 2-5. ブログへ射出
                try:
                    DriverClass = {
                        'livedoor': LivedoorDriver, 
                        'blogger': BloggerDriver, 
                        'hatena': HatenaDriver, 
                        'wordpress': WordPressDriver
                    }.get(platform)

                    if DriverClass:
                        driver = DriverClass(blog_config)
                        if driver.post(title=final_title, body=full_html, image_url=p_data.get('img', ''), source_url=selected_entry.link, category=final_cat):
                            # 投稿成功後にDBに記録（以前の仕様）
                            self.save_to_db(selected_entry, site_key, final_title, full_html, p_data.get('img'), platform)
                            self.log(f"  ✅ 成功: {final_title[:20]}", self.style.SUCCESS)
                            success_count += 1
                            # 次の投稿まで待機
                            if i < limit - 1: time.sleep(random.randint(30, 60))
                except Exception as e:
                    self.log(f"  ❌ 投稿エラー: {str(e)}", self.style.ERROR)
            
            # 使用したネタを除去
            all_entries = [e for e in all_entries if e.link != selected_entry.link]

    def get_parsed_data(self, entry):
        """RSSエントリから詳細情報を抽出"""
        data = {
            'body': getattr(entry, 'description', getattr(entry, 'summary', entry.title)).replace('\x00', ''),
            'img': ''
        }
        try:
            parser = RSSParserFactory.get_parser(entry.link)
            parsed = parser.parse(entry.link)
            if parsed and len(parsed.get('body', '')) > 20:
                data = parsed
        except:
            pass
        return data

    def save_to_db(self, entry, site_key, title, body, img, platform):
        """投稿完了後にDBにエントリを作成し、重複防止する"""
        with transaction.atomic():
            new_id = ArticleMapper.create_article(
                site_id=site_key, title=title, body_text=body, 
                source_url=entry.link, main_image_url=img
            )
            ArticleMapper.save_post_result(new_id, blog_type=platform, is_published=True)
            # 元記事があれば「エクスポート済み」に
            Article.objects.filter(source_url=entry.link).update(is_exported=True)

    def generate_with_gemma_strategy(self, site_key, prompt_base, cta, title, p_data, config):
        key = random.choice(self.api_keys)
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemma-3-27b-it:generateContent?key={key}"
        
        full_instruction = f"""
{prompt_base}
タイトル: {title}
内容詳細: {p_data['body'][:1000]}
ペルソナ: {config.get('persona')}
⚠️ [TITLE][BODY][CAT]形式で出力せよ。
{cta}
"""
        try:
            r = requests.post(url, json={"contents": [{"parts": [{"text": full_instruction}]}]}, timeout=60)
            if r.status_code == 200:
                return r.json()['candidates'][0]['content']['parts'][0]['text']
            else:
                self.log(f"  [DEBUG] Gemma API Error: {r.status_code}")
        except Exception as e:
            self.log(f"  [DEBUG] Gemma接続失敗: {str(e)}")
        return None

    def extract_tag(self, text, tag):
        match = re.search(f"\\[{tag}\\](.*?)\\[/{tag}\\]", text, re.DOTALL)
        return match.group(1).strip() if match else ""

    def assemble_final_html(self, body_content, img_url, comment):
        img_tag = f'<p align="center"><img src="{img_url}" style="max-width:100%; border-radius:10px;"></p>' if img_url else ""
        comment_html = f'''
<div style="border: 2px dashed #ff4500; padding: 15px; margin: 20px 0; background: #fffaf0; border-radius: 10px;">
  <strong style="color: #ff4500;">🖋 編集長レビュー：</strong><br>
  <span style="font-size: 1.1em; font-weight: bold;">「{comment}」</span>
</div>
'''
        return (img_tag + comment_html + body_content).strip()

    def get_random_teitoku_comment(self, site_key):
        comment_file = os.path.join(self.SETTING_DIR, f"teitoku_{site_key}_comments.csv")
        if not os.path.exists(comment_file): return "注目の最新ニュースです。"
        try:
            with open(comment_file, "r", encoding="utf-8") as f:
                comments = [line.strip() for line in f if line.strip()]
                return random.choice(comments) if comments else "必見です。"
        except: return "要チェックです。"

    def load_external_file(self, directory, filename):
        path = os.path.join(directory, filename)
        if os.path.exists(path):
            with open(path, 'r', encoding='utf-8') as f: return f.read().strip()
        return ""

    def let_persona_choose_rest(self, persona, articles):
        if not articles: return None
        key = random.choice(self.api_keys)
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={key}"
        list_txt = "\n".join([f"[{i}] {a.title}" for i, a in enumerate(articles)])
        prompt = f"あなたは【{persona}】です。次の記事リストから最も興味深いものを1つ選び、その[番号]だけ答えて。\n\n{list_txt}"
        try:
            r = requests.post(url, json={"contents": [{"parts": [{"text": prompt}]}]}, timeout=25)
            m = re.search(r'\[(\d+)\]', r.json()['candidates'][0]['content']['parts'][0]['text'])
            idx = int(m.group(1)) if m else 0
            return articles[idx] if idx < len(articles) else articles[0]
        except:
            return articles[0]

    def log(self, msg, style_func=None):
        ts = datetime.now().strftime('%H:%M:%S')
        if style_func: self.stdout.write(style_func(f"[{ts}] {msg}"))
        else: self.stdout.write(f"[{ts}] {msg}")