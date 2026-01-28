# -*- coding: utf-8 -*-
import os
import re
import json
import random
import requests
import feedparser
import urllib.parse
import time
from bs4 import BeautifulSoup
from concurrent.futures import ThreadPoolExecutor, as_completed
from django.core.management.base import BaseCommand
from requests.auth import HTTPBasicAuth
from api.models.pc_products import PCProduct

# === APIキー設定（環境変数から取得） ===
API_KEYS = [
    os.getenv("GEMINI_API_KEY"),
    os.getenv("GEMINI_API_KEY_1"),
    os.getenv("GEMINI_API_KEY_2"),
    os.getenv("GEMINI_API_KEY_3"),
    os.getenv("GEMINI_API_KEY_4"),
    os.getenv("GEMINI_API_KEY_5"),
]
ACTIVE_KEYS = [k for k in API_KEYS if k]
MAX_WORKERS = min(len(ACTIVE_KEYS), 3) if ACTIVE_KEYS else 1

class Command(BaseCommand):
    help = 'ニュース記事を生成し、スペック表・商品カードを含めてWPへ並列投稿する'

    def add_arguments(self, parser):
        parser.add_argument('--url', type=str, help='特定の記事URLを直接指定')
        parser.add_argument('--image', type=str, help='アイキャッチ画像URLを直接指定')
        parser.add_argument('--limit', type=int, default=1, help='投稿件数')

    def handle(self, *args, **options):
        if not ACTIVE_KEYS:
            self.stdout.write(self.style.ERROR("❌ APIキーが設定されていません。"))
            return

        # 1. ユーザー・環境設定
        WP_USER = "bicstation"
        WP_APP_PASSWORD = "9re0 t3de WCe1 u1IL MudX 31IY"
        W_DOM = "blog.tiper.live"
        AUTH = HTTPBasicAuth(WP_USER, WP_APP_PASSWORD)
        WP_API_BASE = f"https://{W_DOM}/wp-json/wp/v2"

        # WordPress上の投稿ユーザーIDを取得（ユーザー名からIDを特定）
        author_id = 1  # デフォルト
        try:
            u_res = requests.get(f"{WP_API_BASE}/users/me", auth=AUTH, timeout=10)
            if u_res.status_code == 200:
                author_id = u_res.json().get('id', 1)
        except: pass

        current_dir = os.path.dirname(os.path.abspath(__file__))
        MODELS_FILE = os.path.join(current_dir, "ai_models.txt")
        PROMPT_FILE = os.path.join(current_dir, "ai_prompt_news.txt")
        HISTORY_FILE = os.path.join(current_dir, "post_history.txt")

        # 設定ファイル読み込み
        with open(MODELS_FILE, "r", encoding='utf-8') as f:
            MODELS = [line.strip() for line in f if line.strip()]
        with open(PROMPT_FILE, "r", encoding='utf-8') as f:
            PROMPT_TEMPLATE = f.read()

        posted_links = set()
        if os.path.exists(HISTORY_FILE):
            with open(HISTORY_FILE, "r", encoding='utf-8') as f:
                for line in f:
                    parts = line.strip().split('\t')
                    if parts: posted_links.add(parts[0].strip())

        # 2. 記事候補の取得
        target_url = options.get('url')
        target_limit = options.get('limit', 1)
        candidates = []

        if target_url:
            candidates.append({"url": target_url.strip()})
        else:
            RSS_SOURCES = [
                {"name": "PC Watch", "url": "https://pc.watch.impress.co.jp/data/rss/1.0/pcw/feed.rdf"},
                {"name": "ASCII.jp", "url": "https://ascii.jp/pc/rss.xml"},
                {"name": "ITmedia", "url": "https://rss.itmedia.co.jp/rss/2.0/pcuser.xml"}
            ]
            for source in RSS_SOURCES:
                feed = feedparser.parse(source['url'])
                for entry in feed.entries:
                    link = entry.link.strip()
                    if link not in posted_links: candidates.append({"url": link})
        
        random.shuffle(candidates)
        targets = candidates[:target_limit]

        if not targets:
            self.stdout.write("🔎 未投稿の記事は見搬つかりませんでした。")
            return

        self.stdout.write(self.style.SUCCESS(f"🚀 投稿プロセス開始 (計{len(targets)}件 / 並列{MAX_WORKERS})"))

        # 3. 並列処理の実行
        with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
            future_to_url = {}
            for i, item in enumerate(targets):
                api_key = ACTIVE_KEYS[i % len(ACTIVE_KEYS)]
                delay = i * 8
                future = executor.submit(
                    self.process_single_news, 
                    item['url'], api_key, PROMPT_TEMPLATE, MODELS, 
                    options.get('image'), delay, HISTORY_FILE, AUTH, WP_API_BASE, author_id
                )
                future_to_url[future] = item['url']

            for future in as_completed(future_to_url):
                try:
                    future.result()
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f"❌ 致命的エラー: {e}"))

    def process_single_news(self, current_url, api_key, PROMPT_TEMPLATE, MODELS, target_image_url, delay, HISTORY_FILE, AUTH, WP_API_BASE, author_id):
        if delay > 0: time.sleep(delay)
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}

        # --- 1. ニュース解析 ---
        res = requests.get(current_url, timeout=15, headers=headers)
        res.encoding = res.apparent_encoding
        soup = BeautifulSoup(res.text, 'html.parser')
        raw_title = soup.title.string.split('|')[0].strip() if soup.title else "最新ニュース"

        og_image_url = None
        og_tag = soup.find("meta", property="og:image")
        if og_tag: og_image_url = og_tag.get("content")

        for s in soup(['script', 'style', 'nav', 'header', 'footer', 'aside', 'iframe', 'ins']): s.decompose()
        main_area = soup.find('article') or soup.find('main') or soup.body
        page_content = main_area.get_text(separator=' ', strip=True) if main_area else ""
        if len(page_content) < 300: return

        # --- 2. AI生成 (複数モデル試行) ---
        prompt = PROMPT_TEMPLATE.replace("{raw_title}", raw_title).replace("{page_content[:3500]}", page_content[:3500])
        ai_response = ""
        for model in MODELS:
            api_url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
            try:
                r = requests.post(api_url, json={"contents": [{"parts": [{"text": prompt}]}]}, timeout=180)
                rem = r.headers.get('x-ratelimit-remaining-requests', '-')
                if r.status_code == 200:
                    ai_response = r.json()['candidates'][0]['content']['parts'][0]['text']
                    self.stdout.write(self.style.SUCCESS(f"✅ 生成成功: {model} (Remaining: {rem})"))
                    break
            except: continue
        if not ai_response: return

        # --- 3. クレンジング・抽出 ---
        ai_response = re.sub(r'<!DOCTYPE html>|<html[^>]*>|<\/html>|<head>[\s\S]*?<\/head>|<body[^>]*>|<\/body>', '', ai_response, flags=re.IGNORECASE)
        ai_response = re.sub(r'```(html|json)?', '', ai_response).replace('```', '').strip()

        cat_m = re.search(r'\[CAT\]\s*(.*?)\s*\[/CAT\]', ai_response, re.IGNORECASE)
        tag_m = re.search(r'\[TAG\]\s*(.*?)\s*\[/TAG\]', ai_response, re.IGNORECASE)
        sum_m = re.search(r'\[SUMMARY\](.*?)\[/SUMMARY\]', ai_response, re.DOTALL | re.IGNORECASE)
        
        cat_name = cat_m.group(1).split(',')[0].strip() if cat_m else "PCニュース"
        tag_names = [t.strip() for t in tag_m.group(1).split(',') if t.strip()] if tag_m else []
        final_title = re.sub(r'^[#*\s・]+|[#*\s・]+$', '', ai_response.strip().split('\n')[0])

        # --- 4. 本文HTML構築（スペック表復元） ---
        html_body = ""
        if sum_m:
            html_body += '<div style="background:#f1f5f9;border-left:5px solid #0f172a;padding:20px;margin-bottom:30px;border-radius:4px;">'
            html_body += '<h4 style="margin:0 0 10px 0;">📝 ニュースのポイント</h4><ul style="padding-left:20px;">'
            for line in sum_m.group(1).strip().split('\n'):
                p = line.strip().lstrip('*-・• ')
                if p: html_body += f"<li>{p}</li>"
            html_body += '</ul></div>'

        main_text = re.sub(r'\[CAT\].*?\[/CAT\]|\[TAG\].*?\[/TAG\]|\[SUMMARY\].*?\[/SUMMARY\]', '', ai_response, flags=re.DOTALL | re.IGNORECASE)
        in_table = False
        for line in main_text.split('\n'):
            line = line.strip()
            if not line or line == final_title: continue
            spec_match = re.match(r'^[*-]\s*(?:\*\*)?(.*?)(?:\*\*)?[:：]\s*(.*)', line)
            if spec_match:
                if not in_table:
                    html_body += '<table style="width:100%; border-collapse:collapse; margin:20px 0; border:1px solid #e2e8f0;">'
                    in_table = True
                k, v = spec_match.groups()
                html_body += f'<tr><td style="background:#f8fafc; padding:10px; font-weight:bold; width:35%;">{k.replace("**","")}</td><td style="padding:10px;">{v.replace("**","")}</td></tr>'
                continue
            if in_table:
                html_body += '</table>'
                in_table = False
            if line.startswith('#'):
                html_body += f'<h2 style="border-bottom:2px solid #333; padding-bottom:10px; margin-top:40px;">{line.replace("#","").strip()}</h2>'
            else:
                html_body += f'<p>{line}</p>'
        if in_table: html_body += '</table>'

        # --- 5. 関連商品 & カード ---
        rel_products = PCProduct.objects.filter(is_active=True, name__icontains=cat_name[:4]).exclude(stock_status="受注停止中").order_by('-created_at')[:2]
        if rel_products:
            html_body += '<h2 style="margin-top:50px; text-align:center;">🛠 関連おすすめモデル</h2>'
            for prod in rel_products:
                amz = f"https://px.a8.net/svt/ejp?a8mat=1NWETK+A4FFE2+249K+BWGDT&a8ejpredirect=https%3A%2F%2Fwww.amazon.co.jp%2Fs%3Fk%3D{urllib.parse.quote(prod.name)}"
                html_body += f'''
                <div style="border:1px solid #e5e7eb; border-radius:18px; padding:25px; margin-bottom:35px; background:#fff; box-shadow:0 10px 20px rgba(0,0,0,0.05);">
                    <div style="display:flex; flex-wrap:wrap; gap:20px; align-items:center; margin-bottom:20px;">
                        <img src="{prod.image_url}" style="width:140px; border-radius:8px;">
                        <div style="flex:1;">
                            <h4 style="margin:0;">{prod.name}</h4>
                            <div style="color:#dc2626; font-weight:900; font-size:1.6em;">¥{prod.price:,}</div>
                        </div>
                    </div>
                    <a href="{amz}" target="_blank" style="display:block; background:#FF9900; color:#fff; text-align:center; padding:15px; text-decoration:none; border-radius:10px; font-weight:bold;">Amazonで価格をチェック</a>
                </div>'''

        html_body += f'<p style="font-size:0.8em; margin-top:30px; color:#999; border-top:1px dotted #ccc;">出典: <a href="{current_url}" target="_blank">{raw_title}</a></p>'

        # --- 6. WP投稿 (メディア・カテゴリ・作成者) ---
        featured_media_id = 0
        img_url = target_image_url or og_image_url or f"https://images.unsplash.com/featured/?computer"
        try:
            img_data = requests.get(img_url, timeout=20, headers=headers).content
            m_res = requests.post(f"{WP_API_BASE}/media", auth=AUTH, headers={'Content-Disposition': 'attachment; filename="n.jpg"', 'Content-Type': 'image/jpeg'}, data=img_data)
            featured_media_id = m_res.json().get('id', 0)
        except: pass

        def get_wp_id(path, name):
            try:
                r = requests.get(f"{WP_API_BASE}/{path}?search={urllib.parse.quote(name)}", auth=AUTH).json()
                for i in r:
                    if i['name'] == name: return i['id']
                return requests.post(f"{WP_API_BASE}/{path}", json={"name": name}, auth=AUTH).json().get('id')
            except: return None

        cid = get_wp_id("categories", cat_name)
        tids = [get_wp_id("tags", tn) for tn in tag_names]

        post_payload = {
            "title": final_title, "content": html_body, "status": "publish",
            "categories": [cid] if cid else [], "tags": [t for t in tids if t],
            "featured_media": featured_media_id, "author": author_id
        }
        
        wp_res = requests.post(f"{WP_API_BASE}/posts", json=post_payload, auth=AUTH)
        if wp_res.status_code == 201:
            with open(HISTORY_FILE, "a", encoding='utf-8') as f:
                f.write(f"{current_url}\t{final_title}\n")
            self.stdout.write(self.style.SUCCESS(f"🚀 投稿成功: {final_title} (Author ID: {author_id})"))