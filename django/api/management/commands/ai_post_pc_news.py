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
from api.models.pc_products import PCProduct
from django.core.files.temp import NamedTemporaryFile

class Command(BaseCommand):
    help = 'URLから記事を生成・投稿する。失敗した場合は別の記事を試行する機能付き。'

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

        current_dir = os.path.dirname(os.path.abspath(__file__))
        MODELS_FILE = os.path.join(current_dir, "ai_models.txt")
        PROMPT_FILE = os.path.join(current_dir, "ai_prompt.txt")
        HISTORY_FILE = os.path.join(current_dir, "post_history.txt")

        if not os.path.exists(MODELS_FILE) or not os.path.exists(PROMPT_FILE):
            self.stdout.write(self.style.ERROR("設定ファイルが見つかりません。"))
            return

        with open(MODELS_FILE, "r", encoding='utf-8') as f:
            MODELS = [line.strip() for line in f if line.strip()]
        with open(PROMPT_FILE, "r", encoding='utf-8') as f:
            PROMPT_TEMPLATE = f.read()

        # 既投稿リストの読み込み
        posted_links = set()
        if os.path.exists(HISTORY_FILE):
            with open(HISTORY_FILE, "r", encoding='utf-8') as f:
                posted_links = set(line.strip() for line in f if line.strip())

        # --- 2. 記事候補のリストアップ ---
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

        if not candidates:
            self.stdout.write("新着記事はありません。")
            return

        # --- 3. 投稿ループ（成功するまで繰り返す） ---
        success = False
        for item in candidates:
            current_url = item['url']
            source_name = item['source']
            page_content = ""
            target_title = ""

            self.stdout.write(f"🌐 ページ解析中 ({source_name}): {current_url}")
            
            # --- スクレイピング実行 ---
            headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}
            try:
                res = requests.get(current_url, timeout=15, headers=headers)
                res.encoding = res.apparent_encoding
                soup = BeautifulSoup(res.text, 'html.parser')
                if soup.title:
                    target_title = soup.title.string.split('|')[0].split('-')[0].split('：')[0].strip()
                
                for s in soup(['script', 'style', 'nav', 'header', 'footer', 'aside', 'iframe', 'ins']):
                    s.decompose()

                main_area = soup.find('article') or soup.find('main') or soup.find('div', class_='entry-content') or soup.body
                if main_area:
                    page_content = main_area.get_text(separator=' ', strip=True)
                    page_content = re.sub(r'\s+', ' ', page_content)

                if len(page_content) < 300:
                    self.stdout.write(self.style.WARNING("⚠️ 本文不足のためスキップします。"))
                    continue

            except Exception as e:
                self.stdout.write(self.style.ERROR(f"解析エラー: {e}"))
                continue

            # --- AI記事生成 ---
            self.stdout.write(f"🎯 処理対象: {target_title}")
            instruction = "以下の内容に基づき日本語でブログを作成してください。不明な点は想像で書かず、事実のみ構成してください。\n\n"
            prompt = f"{instruction}URL: {current_url}\nタイトル: {target_title}\nページ内容: {page_content[:3500]}\n\n{PROMPT_TEMPLATE}"

            ai_response = ""
            for model in MODELS:
                api_url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={GEMINI_API_KEY}"
                try:
                    r = requests.post(api_url, json={"contents": [{"parts": [{"text": prompt}]}]}, timeout=60)
                    if r.status_code == 200:
                        ai_response = r.json()['candidates'][0]['content']['parts'][0]['text']
                        self.stdout.write(f"🤖 {model} で生成成功")
                        break
                except: continue
            
            if not ai_response: continue

            # --- クリーニング & HTML整形 ---
            ai_response = ai_response.replace('```html', '').replace('```', '')
            cat_name = "PCパーツ"
            c_m = re.search(r'\[CAT\]\s*(.*?)\s*\[/CAT\]', ai_response, re.IGNORECASE)
            if c_m: cat_name = c_m.group(1).strip()
            
            clean_content = re.sub(r'\[CAT\].*?\[/CAT\]|\[TAG\].*?\[/TAG\]|\[SUMMARY\].*?\[/SUMMARY\]', '', ai_response, flags=re.DOTALL | re.IGNORECASE)

            html_body = ""
            s_m = re.search(r'\[SUMMARY\](.*?)\[/SUMMARY\]', ai_response, re.DOTALL | re.IGNORECASE)
            if s_m:
                html_body += '<div style="background:#f0f9ff;border-radius:12px;padding:25px;border-left:5px solid #0ea5e9;margin-bottom:20px;"><h4>🚀 ニュースの要点</h4><ul>'
                for line in s_m.group(1).strip().split('\n'):
                    p = line.strip().lstrip('*-・• ')
                    if p: html_body += f"<li>{p}</li>"
                html_body += '</ul></div>'

            for line in clean_content.split('\n'):
                l = line.strip()
                if not l or l == target_title: continue
                if l.startswith('##'): html_body += f'<h2 class="wp-block-heading">{l.replace("##","").strip()}</h2>'
                elif l.startswith('###'): html_body += f'<h3 class="wp-block-heading">{l.replace("###","").strip()}</h3>'
                else: html_body += f'<p>{l}</p>'
            html_body += f'<p style="font-size:0.8em;margin-top:20px;">出典: <a href="{current_url}" target="_blank">{target_title}</a></p>'

            # --- アイキャッチ画像 ---
            featured_media_id = 0
            final_img_url = target_image_url or f"https://source.unsplash.com/featured/1200x630/?{urllib.parse.quote(target_title)}"
            try:
                img_res = requests.get(final_img_url, timeout=20)
                if img_res.status_code == 200:
                    with NamedTemporaryFile(suffix=".jpg", delete=False) as tmp:
                        tmp.write(img_res.content)
                        tmp_path = tmp.name
                    with open(tmp_path, 'rb') as f:
                        m_res = requests.post(f"{WP_API_BASE}/media", auth=AUTH, files={'file': ('eyecatch.jpg', f, 'image/jpeg')}, data={'title': target_title})
                    featured_media_id = m_res.json().get('id', 0)
            except: pass

            # --- 商品カード ---
            prod = PCProduct.objects.filter(is_active=True).order_by('?').first()
            card_html = ""
            if prod:
                card_html = f'<div style="margin:40px 0;padding:25px;border:1px solid #e2e8f0;border-radius:20px;background:#fff;"><div style="display:flex;flex-wrap:wrap;gap:24px;align-items:center;"><div style="flex:1;text-align:center;"><img src="{prod.image_url}" style="max-width:150px;border-radius:12px;"></div><div style="flex:2;"><h3>{prod.name}</h3><p style="color:#ef4444;font-weight:bold;">参考価格：{prod.price:,}円〜</p><a href="{prod.affiliate_url or prod.url}" target="_blank" style="display:inline-block;background:#ef4444;color:#fff;padding:10px 25px;border-radius:9999px;text-decoration:none;">詳細をチェック</a></div></div></div>'

            # --- WordPress投稿実行 ---
            def get_wp_id(path, name):
                try:
                    r = requests.get(f"{WP_API_BASE}/{path}?search={urllib.parse.quote(name)}", auth=AUTH).json()
                    if r: return r[0]['id']
                    return requests.post(f"{WP_API_BASE}/{path}", json={"name": name}, auth=AUTH).json().get('id')
                except: return None

            cid = get_wp_id("categories", cat_name)
            post_data = {
                "title": target_title,
                "content": html_body + card_html,
                "status": "publish",
                "categories": [cid] if cid else [],
                "featured_media": featured_media_id
            }
            
            final_res = requests.post(f"{WP_API_BASE}/posts", json=post_data, auth=AUTH)
            
            if final_res.status_code == 201:
                self.stdout.write(self.style.SUCCESS(f"🚀 投稿成功: {target_title}"))
                # 履歴に保存
                with open(HISTORY_FILE, "a", encoding='utf-8') as f:
                    f.write(current_url + "\n")
                success = True
                break # 成功したのでループ終了
            else:
                self.stdout.write(self.style.ERROR(f"❌ 投稿失敗({final_res.status_code}): {final_res.text[:200]}"))
                self.stdout.write("別の記事で再試行します...")

        if not success:
            self.stdout.write(self.style.ERROR("🚨 全ての候補で投稿に失敗しました。"))