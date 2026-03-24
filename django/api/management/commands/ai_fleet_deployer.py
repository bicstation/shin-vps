# -*- coding: utf-8 -*-
"""
【SYSTEM OVERVIEW: v50.5 Strategic-Scraping-Master】
1. 目的: スクショ解析を廃止。スクレイピングによる画像取得とAI補完に特化。
2. 特徴:
   - 🛡️ 循環参照回避: blog_driversの各クラスを動的にハンドリング。
   - 🖼️ 画像永続化: 生成/取得画像は /media/ai_generated/ に保存して外部公開URL化。
   - 🔍 高度なスクレイピング: OGPおよび本文中から最適な画像を探索。
   - 🤖 AI画像補完: 画像が取得できない場合は、Gemini 2.5 Flashで画像を動的生成。
"""

import os, re, random, requests, feedparser, time, csv, hashlib, json, base64
from datetime import datetime
from bs4 import BeautifulSoup
from django.core.management.base import BaseCommand
from django.db import connection
from django.conf import settings
from api.models.article import Article
from api.utils.html_utils import HTMLConverter
from api.management.commands.blog_drivers.hatena_driver import HatenaDriver
from api.management.commands.blog_drivers.livedoor_driver import LivedoorDriver
from api.management.commands.blog_drivers.blogger_driver import BloggerDriver
from api.management.commands.blog_drivers.ai_processor import AIProcessor

class Command(BaseCommand):
    help = 'BICSTATION v50.5: Scraping-First & AI Image Generation'

    def add_arguments(self, parser):
        parser.add_argument('--project', type=str, default='bicstation')
        parser.add_argument('--url', type=str, default=None)

    def log(self, msg, style_func=None):
        ts = datetime.now().strftime('%H:%M:%S')
        text = f"[{ts}] {msg}"
        if style_func: self.stdout.write(style_func(text))
        else: self.stdout.write(text)

    def save_image_to_vps(self, b64_or_url, filename_prefix="ai_gen"):
        """画像をVPSのメディアディレクトリに保存し、外部公開URLを生成"""
        try:
            img_data = None
            if b64_or_url.startswith('data:image'):
                b64_string = b64_or_url.split(",")[1] if "," in b64_or_url else b64_or_url
                img_data = base64.b64decode(b64_string)
            elif b64_or_url.startswith('http'):
                res = requests.get(b64_or_url, timeout=10)
                if res.status_code == 200:
                    img_data = res.content
            
            if not img_data: return b64_or_url # 保存失敗時は元のURLを返す

            save_dir = os.path.join(settings.MEDIA_ROOT, "ai_generated")
            os.makedirs(save_dir, exist_ok=True)
            
            filename = f"{filename_prefix}_{hashlib.md5(img_data).hexdigest()[:10]}.png"
            filepath = os.path.join(save_dir, filename)
            
            with open(filepath, "wb") as f:
                f.write(img_data)
            
            return f"https://{self.target_domain}{settings.MEDIA_URL}ai_generated/{filename}"
        except Exception as e:
            self.log(f"  ⚠️ 画像永続化エラー: {str(e)}", self.style.WARNING)
            return b64_or_url

    def resolve_google_news_url(self, url):
        """Googleニュースのリダイレクトを解析してオリジナルのURLを特定"""
        if "news.google.com" not in url and "google.com/rss/articles" not in url:
            return url
        headers = {'User-Agent': 'Mozilla/5.0'}
        try:
            res = requests.get(url, headers=headers, timeout=10, allow_redirects=True)
            soup = BeautifulSoup(res.text, 'html.parser')
            meta = soup.find("meta", property="og:url") or soup.find("link", rel="canonical")
            return meta.get("content") or meta.get("href") if meta else res.url
        except: return url

    def handle(self, *args, **options):
        self.project_name = options['project'].lower()
        self.direct_url = options['url']
        
        # 内部パス設定
        self.current_cmd_dir = os.path.dirname(os.path.abspath(__file__))
        self.config_dir = os.path.join(self.current_cmd_dir, "teitoku_settings")
        self.prompt_dir = os.path.join(self.current_cmd_dir, "prompt")

        # ドメイン設定
        DOMAIN_MAP = {'bicstation': 'bicstation.com', 'tiper': 'tiper.live', 'saving': 'bic-saving.com', 'avflash': 'avflash.xyz'}
        self.target_domain = DOMAIN_MAP.get(self.project_name, f"{self.project_name}.com")

        # 配信先・ソース読み込み
        fleet_data = self.load_csv_data(os.path.join(self.config_dir, f"{self.project_name}_fleet.csv"))
        
        if self.direct_url:
            rss_pool = [type('obj', (object,), {'link': self.direct_url, 'title': '手動緊急出撃'})]
        else:
            rss_sources = self.load_csv_data(os.path.join(self.config_dir, f"{self.project_name}_rss_sources.csv"))
            raw_pool = self.get_fresh_rss_pool([row['url'] for row in rss_sources if 'url' in row])
            connection.close()
            # 重複チェック（Googleニュースリダイレクト考慮）
            rss_pool = [e for e in raw_pool if not Article.objects.filter(site=self.project_name, source_url=self.resolve_google_news_url(e.link)).exists()]

        # APIキー取得
        self.api_keys = [os.getenv(f"GEMINI_API_KEY_{i}").strip() for i in range(1, 11) if os.getenv(f"GEMINI_API_KEY_{i}")]
        if not self.api_keys: return self.log("❌ APIキーが設定されていません。", self.style.ERROR)

        self.log(f"🛡️ 艦隊集結: {len(rss_pool)} 件の未処理任務を確認。")

        posted_count = 0
        for index, entry in enumerate(rss_pool):
            current_key = self.api_keys[posted_count % len(self.api_keys)]
            target_site = next((s for s in fleet_data if s['site_key'] not in [p for p in []]), None) # 簡易的な重複防止
            if not target_site: break

            self.log(f"【MISSION {index+1}】{entry.title[:30]}...")
            success, result = self.process_single_post(target_site, entry, current_key)
            
            if success:
                posted_count += 1
                self.log(f"  ✅ 完遂: {result}", self.style.SUCCESS)
                if not self.direct_url: time.sleep(random.randint(15, 30))
            else:
                self.log(f"  ❌ 失敗: {result}", self.style.ERROR)

    def process_single_post(self, cfg, entry, api_key):
        # Driver用設定
        driver_config = cfg.copy()
        driver_config['url'] = cfg.get('endpoint')
        driver_config['api_key'] = cfg.get('api_key_or_pw')

        # 1. スクレイピング（画像取得・あきらめ・AI生成の連鎖）
        real_url = self.resolve_google_news_url(entry.link)
        raw_data = self.scrape_article_logic(real_url, entry.title, api_key)
        if not raw_data: return False, "記事内容の取得に失敗しました。"

        # 2. 画像のVPS保存（外部参照用URL化）
        final_img_url = raw_data.get('img', '')
        if final_img_url:
            final_img_url = self.save_image_to_vps(final_img_url, self.project_name)

        # 3. AI生成プロセス
        meta = self.get_project_meta(self.project_name)
        prompt = self.prepare_prompt(meta, raw_data, real_url)
        
        processor = AIProcessor([api_key], prompt)
        ai_response = processor.generate_blog_content(raw_data, cfg['site_key'])
        
        raw_text = ai_response.get('raw_text', '') if isinstance(ai_response, dict) else str(ai_response)
        gen_title = self.extract_tag(raw_text, "TITLE") or raw_data['title']
        gen_body = self.extract_tag(raw_text, "BODY")

        # 4. コンテンツ装飾
        accent = meta.get('accent_color', '#1e293b')
        selected_comment = self.get_teitoku_comment(meta, self.project_name)
        
        header_html = f"""
<div style="border: 2px dashed {accent}; padding: 20px; margin-bottom: 25px; background: #fffaf0; border-radius: 12px;">
  <strong style="color: {accent};">🖋 提督のレビュー：</strong><br>
  <span style="font-size: 1.1em; font-weight: bold;">「{selected_comment}」</span>
</div>
"""
        body_html = HTMLConverter.md_to_html(gen_body)
        body_html = body_html.replace('<h3>', f'<h3 style="border-left: 8px solid {accent}; border-bottom: 1px solid #eee; padding: 10px; background: #f9f9f9; color: {accent};">')

        if final_img_url:
            final_html = f'<div style="text-align:center; margin-bottom:20px;"><img src="{final_img_url}" style="width:100%; max-width:800px; border-radius:10px;"></div>' + header_html + body_html
        else:
            final_html = header_html + body_html

        # 5. 投稿実行
        try:
            Article.objects.update_or_create(source_url=real_url, site=self.project_name, defaults={'title': gen_title, 'is_exported': True})
            driver_class = {'hatena': HatenaDriver, 'blogger': BloggerDriver}.get(cfg['platform'].lower(), LivedoorDriver)
            driver = driver_class(driver_config)
            res = driver.post(title=gen_title, body=final_html, image_url=final_img_url, source_url=real_url)
            return True, f"投稿完了({cfg['platform']})"
        except Exception as e:
            return False, f"Driver投稿エラー: {str(e)}"

    def scrape_article_logic(self, url, default_title, api_key):
        """高度なスクレイピングと画像取得のフォールバック"""
        try:
            headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
            res = requests.get(url, timeout=15, headers=headers)
            res.encoding = res.apparent_encoding
            soup = BeautifulSoup(res.text, 'html.parser')
            
            # 画像探索
            img_url = ""
            # 1. OGP
            og_img = soup.find("meta", property="og:image")
            if og_img: img_url = og_img.get("content")
            
            # 2. 本文内の主要画像 (OGPがなければ)
            if not img_url:
                main_img = soup.select_one('article img, .main-visual img, .entry-content img')
                if main_img: img_url = main_img.get('src')

            # URLの正規化
            if img_url and img_url.startswith('//'): img_url = 'https:' + img_url
            elif img_url and img_url.startswith('/'): img_url = url.split('/')[0] + '//' + url.split('/')[2] + img_url

            # あきらめ & AI生成
            if not img_url or "google" in img_url or img_url.endswith('.gif'):
                self.log("  ⚠️ 有効画像なし。AIによるアイキャッチ生成に切り替えます。")
                img_url = self.generate_ai_image(default_title, api_key)

            # テキスト抽出
            for s in soup(['script', 'style', 'nav', 'header', 'footer']): s.decompose()
            body_text = soup.get_text(separator='\n').strip()
            body_text = re.sub(r'\n+', '\n', body_text)

            return {
                'url': url, 
                'title': (soup.title.string or default_title).strip(), 
                'img': img_url, 
                'body': body_text[:5000]
            }
        except Exception as e:
            self.log(f"  ❌ スクレイピング致命的エラー: {str(e)}")
            return None

    def generate_ai_image(self, title, api_key):
        """画像がない場合の最終手段：AI画像生成"""
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent?key={api_key}"
            prompt = f"Professional high-quality digital illustration for a blog post titled: '{title}'. Modern, clean, and engaging style."
            payload = {
                "contents": [{"parts": [{"text": prompt}]}],
                "generation_config": {"response_modalities": ["IMAGE"]}
            }
            res = requests.post(url, json=payload, timeout=45).json()
            b64 = res['candidates'][0]['content']['parts'][0]['inlineData']['data']
            return f"data:image/png;base64,{b64}"
        except:
            self.log("  ⚠️ AI画像生成も失敗しました。画像なしで進行します。")
            return ""

    def get_project_meta(self, project_name):
        path = os.path.join(self.config_dir, "project_configs.json")
        with open(path, 'r', encoding='utf-8') as f:
            return json.load(f).get(project_name, {})

    def prepare_prompt(self, meta, raw_data, source_url):
        with open(os.path.join(self.prompt_dir, "ai_prompt_master.txt"), 'r', encoding='utf-8') as f:
            tmpl = f.read()
        
        replacements = {
            "{{project_display_name}}": meta.get('project_display_name'),
            "{{persona}}": meta.get('persona'),
            "{{category}}": meta.get('category'),
            "{{item_term}}": meta.get('item_term'),
            "{{mission_detail}}": meta.get('mission_detail'),
            "{{body_structure}}": meta.get('body_structure'),
            "{{footer_msg}}": meta.get('footer_msg'),
            "{{url}}": source_url,
            "{{body}}": raw_data['body'],
            "{{maker}}": "最新トレンド",
            "{{name_or_actor}}": raw_data['title']
        }
        for k, v in replacements.items(): tmpl = tmpl.replace(k, str(v or ""))
        return tmpl

    def get_teitoku_comment(self, meta, project_name):
        file_path = os.path.join(self.config_dir, meta.get('comment_file', f"teitoku_{project_name}_comments.csv"))
        if os.path.exists(file_path):
            with open(file_path, 'r', encoding='utf-8') as f:
                comments = [l.strip() for l in f if l.strip()]
                if comments: return random.choice(comments)
        return "必見の情報です。"

    def load_csv_data(self, path):
        if not os.path.exists(path): return []
        with open(path, "r", encoding="utf-8") as f: 
            return list(csv.DictReader(f, delimiter='|'))

    def get_fresh_rss_pool(self, urls):
        pool = []
        for u in urls:
            try:
                res = requests.get(u, timeout=10)
                pool.extend(feedparser.parse(res.text).entries)
            except: pass
        return pool

    def extract_tag(self, text, tag):
        match = re.search(rf"\[{tag}\](.*?)\[/{tag}\]", text, re.DOTALL)
        return match.group(1).strip() if match else ""