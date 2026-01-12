# -*- coding: utf-8 -*-
# /usr/src/app/api/management/commands/ai_post_pc_news.py

import os
import re
import requests
import feedparser
import urllib.parse
import time
from bs4 import BeautifulSoup
from django.core.management.base import BaseCommand
from requests.auth import HTTPBasicAuth
from django.core.files.temp import NamedTemporaryFile

class Command(BaseCommand):
    help = '外部プロンプトを使用して専門ライター風に記事を生成し、カテゴリ・画像を自動反映する'

    def add_arguments(self, parser):
        parser.add_argument('--url', type=str, help='特定の記事URLを直接指定')
        parser.add_argument('--image', type=str, help='アイキャッチ画像URLを直接指定')

    def handle(self, *args, **options):
        # --- 1. 基本設定 ---
        WP_USER = "bicstation"
        WP_APP_PASSWORD = "9re0 t3de WCe1 u1IL MudX 31IY"
        W_DOM = "blog.tiper.live"
        GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
        AUTH = HTTPBasicAuth(WP_USER, WP_APP_PASSWORD)
        WP_API_BASE = f"https://{W_DOM}/wp-json/wp/v2"

        # ファイルパスの設定
        current_dir = os.path.dirname(os.path.abspath(__file__))
        MODELS_FILE = os.path.join(current_dir, "ai_models.txt")
        # 指定されたプロンプトファイルパス
        PROMPT_FILE = "/mnt/c/dev/SHIN-VPS/django/api/management/commands/ai_prompt_news.txt"
        HISTORY_FILE = os.path.join(current_dir, "post_history.txt")

        # 設定ファイルの読み込み
        if not os.path.exists(PROMPT_FILE):
            self.stdout.write(self.style.ERROR(f"プロンプトファイルが見つかりません: {PROMPT_FILE}"))
            return

        with open(MODELS_FILE, "r", encoding='utf-8') as f:
            MODELS = [line.strip() for line in f if line.strip()]
        with open(PROMPT_FILE, "r", encoding='utf-8') as f:
            PROMPT_TEMPLATE = f.read()

        posted_links = set()
        if os.path.exists(HISTORY_FILE):
            with open(HISTORY_FILE, "r", encoding='utf-8') as f:
                posted_links = set(line.strip() for line in f if line.strip())

        # --- 2. 記事候補の取得 ---
        target_url = options.get('url')
        target_image_url = options.get('image')
        candidates = []

        if target_url:
            candidates.append({"url": target_url, "source": "直接指定"})
        else:
            RSS_SOURCES = [
                {"name": "PC Watch", "url": "https://pc.watch.impress.co.jp/data/rss/1.0/pcw/feed.rdf"},
                {"name": "ASCII.jp", "url": "https://ascii.jp/pc/rss.xml"},
                {"name": "ITmedia", "url": "https://rss.itmedia.co.jp/rss/2.0/pcuser.xml"}
            ]
            for source in RSS_SOURCES:
                feed = feedparser.parse(source['url'])
                for entry in feed.entries:
                    if entry.link not in posted_links:
                        candidates.append({"url": entry.link, "source": source['name']})

        # --- 3. 投稿メインループ ---
        success = False
        for item in candidates:
            current_url = item['url']
            self.stdout.write(f"🌐 解析開始: {current_url}")
            
            headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}
            try:
                res = requests.get(current_url, timeout=15, headers=headers)
                res.encoding = res.apparent_encoding
                soup = BeautifulSoup(res.text, 'html.parser')
                raw_title = soup.title.string.split('|')[0].strip() if soup.title else "最新ニュース"
                
                for s in soup(['script', 'style', 'nav', 'header', 'footer', 'aside', 'iframe', 'ins']):
                    s.decompose()
                
                main_area = soup.find('article') or soup.find('main') or soup.body
                page_content = main_area.get_text(separator=' ', strip=True) if main_area else ""
                if len(page_content) < 300: continue
            except Exception as e:
                self.stdout.write(f"解析エラー: {e}")
                continue

            # --- 4. AI記事生成 ---
            self.stdout.write(f"🤖 AI執筆中 (プロンプトファイル使用)...")
            # プロンプト内の変数を置換
            prompt = PROMPT_TEMPLATE.format(
                raw_title=raw_title,
                page_content=page_content[:3500],
                current_url=current_url
            )

            ai_response = ""
            for model in MODELS:
                api_url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={GEMINI_API_KEY}"
                try:
                    r = requests.post(api_url, json={"contents": [{"parts": [{"text": prompt}]}]}, timeout=60)
                    if r.status_code == 200:
                        ai_response = r.json()['candidates'][0]['content']['parts'][0]['text']
                        break
                except: continue
            
            if not ai_response: continue

            # --- 5. AI応答の解析 & HTML成形 ---
            lines = ai_response.strip().split('\n')
            # 1行目をタイトルとして取得（装飾を除去）
            final_title = re.sub(r'^[#*\s]+|[#*\s]+$', '', lines[0])

            # カテゴリとタグの抽出
            cat_name = "PCパーツ"
            tag_names = []
            cat_m = re.search(r'\[CAT\]\s*(.*?)\s*\[/CAT\]', ai_response, re.IGNORECASE)
            if cat_m: cat_name = cat_m.group(1).strip()
            
            tag_m = re.search(r'\[TAG\]\s*(.*?)\s*\[/TAG\]', ai_response, re.IGNORECASE)
            if tag_m: tag_names = [t.strip() for t in tag_m.group(1).split(',') if t.strip()]

            # メタ情報の除去
            body_only = re.sub(r'\[CAT\].*?\[/CAT\]|\[TAG\].*?\[/TAG\]', '', ai_response, flags=re.DOTALL | re.IGNORECASE)

            # SUMMARYセクションの装飾
            html_body = ""
            sum_m = re.search(r'\[SUMMARY\](.*?)\[/SUMMARY\]', body_only, re.DOTALL | re.IGNORECASE)
            if sum_m:
                html_body += '<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:20px;margin-bottom:20px;">'
                html_body += '<h4 style="margin-top:0;">📝 専門ライターの要約ポイント</h4><ul>'
                for line in sum_m.group(1).strip().split('\n'):
                    p = line.strip().lstrip('*-・• ')
                    if p: html_body += f"<li>{p}</li>"
                html_body += '</ul></div>'
            
            # メインコンテンツの抽出とHTML変換
            main_text = re.sub(r'\[SUMMARY\].*?\[/SUMMARY\]', '', body_only, flags=re.DOTALL | re.IGNORECASE)
            for line in main_text.split('\n'):
                l = line.strip()
                if not l or l == final_title: continue
                if l.startswith('##'): html_body += f'<h2 class="wp-block-heading">{l.replace("##","").strip()}</h2>'
                elif l.startswith('###'): html_body += f'<h3 class="wp-block-heading">{l.replace("###","").strip()}</h3>'
                else: html_body += f'<p>{l}</p>'
            
            html_body += f'<p style="font-size:0.8em;margin-top:20px;color:#666;">出典: <a href="{current_url}" target="_blank">{raw_title}</a></p>'

            # --- 6. アイキャッチ画像の処理 ---
            featured_media_id = 0
            img_query = urllib.parse.quote(final_title[:15])
            img_url = target_image_url or f"https://images.unsplash.com/featured/?{img_query}"
            
            try:
                img_res = requests.get(img_url, timeout=20)
                if img_res.status_code == 200:
                    with NamedTemporaryFile(suffix=".jpg", delete=False) as tmp:
                        tmp.write(img_res.content)
                        tmp_path = tmp.name
                    with open(tmp_path, 'rb') as f:
                        m_res = requests.post(f"{WP_API_BASE}/media", auth=AUTH, files={'file': ('eyecatch.jpg', f, 'image/jpeg')}, data={'title': final_title})
                        featured_media_id = m_res.json().get('id', 0)
                    if os.path.exists(tmp_path): os.remove(tmp_path)
            except Exception as e:
                self.stdout.write(f"画像取得エラー: {e}")

            # --- 7. カテゴリ・タグのID取得（存在しなければ作成） ---
            def get_or_create_wp_id(path, name):
                try:
                    search_res = requests.get(f"{WP_API_BASE}/{path}?search={urllib.parse.quote(name)}", auth=AUTH).json()
                    for item in search_res:
                        if item['name'] == name: return item['id']
                    create_res = requests.post(f"{WP_API_BASE}/{path}", json={"name": name}, auth=AUTH).json()
                    return create_res.get('id')
                except: return None

            cid = get_or_create_wp_id("categories", cat_name)
            tids = [get_or_create_wp_id("tags", tn) for tn in tag_names if tn]

            # --- 8. WordPressへ投稿 ---
            post_payload = {
                "title": final_title,
                "content": html_body,
                "status": "publish",
                "categories": [cid] if cid else [],
                "tags": [tid for tid in tids if tid],
                "featured_media": featured_media_id
            }
            
            final_res = requests.post(f"{WP_API_BASE}/posts", json=post_payload, auth=AUTH)
            if final_res.status_code == 201:
                self.stdout.write(self.style.SUCCESS(f"🚀 投稿成功: [{cat_name}] {final_title}"))
                with open(HISTORY_FILE, "a", encoding='utf-8') as f:
                    f.write(current_url + "\n")
                success = True
                break
            else:
                self.stdout.write(self.style.ERROR(f"❌ 投稿失敗: {final_res.status_code} - {final_res.text[:100]}"))

        if not success:
            self.stdout.write("新着記事の投稿は行われませんでした。")