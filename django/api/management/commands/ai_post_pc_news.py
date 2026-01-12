# -*- coding: utf-8 -*-
# /mnt/e/dev/shin-vps/django/api/management/commands/ai_post_pc_news.py

import os
import re
import requests
import feedparser
import urllib.parse
import time
from django.core.management.base import BaseCommand
from requests.auth import HTTPBasicAuth
from api.models.pc_products import PCProduct
from django.core.files.temp import NamedTemporaryFile

class Command(BaseCommand):
    help = 'RSSニュースまたは指定URLをAI生成し投稿する（任意でアイキャッチURL指定可）'

    def add_arguments(self, parser):
        # 任意引数の追加
        parser.add_argument('--url', type=str, help='特定の記事URLを直接指定して投稿する')
        parser.add_argument('--image', type=str, help='アイキャッチ画像のURLを直接指定する')

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
            self.stdout.write(self.style.ERROR(f"設定ファイルが見つかりません: {current_dir}"))
            return

        with open(MODELS_FILE, "r", encoding='utf-8') as f:
            MODELS = [line.strip() for line in f if line.strip()]
        with open(PROMPT_FILE, "r", encoding='utf-8') as f:
            PROMPT_TEMPLATE = f.read()

        # --- 2. ターゲット記事の決定 ---
        target_url = options.get('url')
        target_image_url = options.get('image')
        target_title = ""
        target_description = ""
        source_name = "Custom Source"

        if target_url:
            # 引数でURLが指定された場合
            self.stdout.write(f"📌 指定URLモード: {target_url}")
            # 指定URLから簡易的にタイトル等を取得（feedparserで試行、ダメならURL自体をタイトル代用）
            d = feedparser.parse(target_url)
            if d.entries:
                target_title = d.entries[0].title
                target_description = d.entries[0].description
            else:
                target_title = "注目の最新ニュース"
                target_description = "こちらのニュースについて詳しく解説します。"
        else:
            # 引数なし：既存のRSS探索ロジック
            posted_links = set()
            if os.path.exists(HISTORY_FILE):
                with open(HISTORY_FILE, "r", encoding='utf-8') as f:
                    posted_links = set(line.strip() for line in f if line.strip())

            RSS_SOURCES = [
                {"name": "PC Watch", "url": "https://pc.watch.impress.co.jp/data/rss/1.0/pcw/feed.rdf"},
                {"name": "ASCII.jp", "url": "https://ascii.jp/pc/rss.xml"},
                {"name": "ITmedia PC USER", "url": "https://rss.itmedia.co.jp/rss/2.0/pcuser.xml"}
            ]

            self.stdout.write("複数ソースから未投稿記事を探索中...")
            target_entry = None
            for source in RSS_SOURCES:
                feed = feedparser.parse(source['url'])
                for entry in feed.entries:
                    if entry.link not in posted_links:
                        target_entry = entry
                        source_name = source['name']
                        break
                if target_entry: break
            
            if not target_entry:
                self.stdout.write(self.style.SUCCESS("新しい未投稿記事はありません。"))
                return
            
            target_url = target_entry.link
            target_title = target_entry.title
            target_description = target_entry.description

        self.stdout.write(f"🎯 処理対象: {target_title}")

        # --- 3. AI記事生成 ---
        prompt = PROMPT_TEMPLATE.replace("{title}", target_title).replace("{description}", target_description).replace("{link}", target_url)
        ai_response = ""
        for model in MODELS:
            self.stdout.write(f"AIモデル {model} で生成試行中...")
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={GEMINI_API_KEY}"
            try:
                res = requests.post(url, json={"contents": [{"parts": [{"text": prompt}]}]}, timeout=60)
                if res.status_code == 200:
                    ai_response = res.json()['candidates'][0]['content']['parts'][0]['text']
                    self.stdout.write(self.style.SUCCESS(f"AI本文生成完了 ({model})"))
                    break
            except: continue
        
        if not ai_response: return

        # --- 4. カテゴリ・タグ・クリーニング処理 ---
        ai_response = ai_response.replace('```html', '').replace('```', '')
        cat_name = "PCパーツ"
        c_m = re.search(r'\[CAT\]\s*(.*?)\s*\[/CAT\]', ai_response, re.IGNORECASE)
        if c_m: cat_name = c_m.group(1).strip()
        else:
            c_m_alt = re.search(r'(?:カテゴリ|Category)\s*[:：]\s*(.*)', ai_response)
            if c_m_alt: cat_name = c_m_alt.group(1).strip()
        
        tag_names = []
        t_m = re.search(r'\[TAG\]\s*(.*?)\s*\[/TAG\]', ai_response, re.IGNORECASE)
        if t_m: tag_names = [t.strip() for t in t_m.group(1).split(',')]

        clean_content = re.sub(r'\[CAT\].*?\[/CAT\]|\[TAG\].*?\[/TAG\]|\[SUMMARY\].*?\[/SUMMARY\]', '', ai_response, flags=re.DOTALL | re.IGNORECASE)
        clean_content = re.sub(r'(?:カテゴリ|タグ|Category|Tag)\s*[:：].*', '', clean_content).strip()

        # --- 5. HTML本文の組み立て ---
        html_body = ""
        s_m = re.search(r'\[SUMMARY\](.*?)\[/SUMMARY\]', ai_response, re.DOTALL | re.IGNORECASE)
        if s_m:
            html_body += '<div class="wp-block-group has-background" style="background-color:#f8fafc;border-radius:12px;padding:25px"><h4>🚀 要点まとめ</h4><ul>'
            for s_l in s_m.group(1).strip().split('\n'):
                point = s_l.strip().lstrip('*-・• ')
                if point: html_body += f"<li>{point}</li>"
            html_body += '</ul></div>'

        for line in clean_content.split('\n'):
            l = line.strip()
            if not l or l == target_title: continue
            if l.startswith('##'): html_body += f'<h2 class="wp-block-heading">{l.replace("##","").strip()}</h2>'
            elif l.startswith('###'): html_body += f'<h3 class="wp-block-heading">{l.replace("###","").strip()}</h3>'
            else: html_body += f'<p>{l}</p>'
        
        html_body += f'<p>出典: <a href="{target_url}" target="_blank">{source_name}</a></p>'

        # --- 6. アイキャッチ画像の動的処理 ---
        featured_media_id = 0
        
        # 決定ロジック: 引数指定URL > 動的キーワード生成
        final_img_url = target_image_url
        if not final_img_url:
            search_keywords = re.findall(r'[a-zA-Z]{3,}', target_title)
            if len(search_keywords) < 2: search_keywords += ["technology", "gadget"]
            query = ",".join(search_keywords[:3])
            final_img_url = f"https://source.unsplash.com/featured/1200x630/?{query}"
            self.stdout.write(f"🎨 アイキャッチ生成キーワード: {query}")
        else:
            self.stdout.write(f"🖼️ アイキャッチ指定URLを使用: {final_img_url}")

        try:
            img_res = requests.get(final_img_url, headers={'User-Agent': 'Mozilla/5.0'}, timeout=25)
            if img_res.status_code == 200:
                with NamedTemporaryFile(suffix=".jpg", delete=False) as tmp:
                    tmp.write(img_res.content)
                    tmp_path = tmp.name
                with open(tmp_path, 'rb') as f:
                    media_res = requests.post(f"{WP_API_BASE}/media", auth=AUTH, files={'file': (f"eyecatch_{int(time.time())}.jpg", f, 'image/jpeg')}, data={'title': target_title})
                if os.path.exists(tmp_path): os.remove(tmp_path)
                if media_res.status_code == 201:
                    featured_media_id = media_res.json().get('id')
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"画像処理エラー: {str(e)}"))

        # --- 7. 商品カード ---
        prod = PCProduct.objects.filter(is_active=True).order_by('?').first()
        card_html = ""
        if prod:
            bic_detail_url = f"https://bicstation.com/product/{prod.unique_id}/"
            p_price = f"{prod.price:,}円〜" if prod.price else "公式サイトへ"
            card_html = f"""<div style="margin: 40px 0; padding: 25px; border: 1px solid #e2e8f0; border-radius: 20px; background-color: #ffffff;"><div style="display: flex; flex-wrap: wrap; align-items: center; gap: 24px;"><div style="flex: 1; text-align: center;"><img src="{prod.image_url or ''}" style="max-width: 100%; border-radius: 12px;"></div><div style="flex: 2;"><p style="font-size:0.8em;color:#64748b;">おすすめの関連製品</p><h3 style="margin: 0; color: #1e3a8a;">{prod.name}</h3><p style="color: #ef4444; font-weight: bold;">価格：{p_price}</p><div style="display: flex; gap: 12px; margin-top: 20px;"><a href="{prod.affiliate_url or prod.url}" target="_blank" style="flex: 1; background: #ef4444; color: #fff; text-align: center; padding: 10px; border-radius: 9999px; text-decoration: none;">公式サイト</a><a href="{bic_detail_url}" style="flex: 1; background: #1f2937; color: #fff; text-align: center; padding: 10px; border-radius: 9999px; text-decoration: none;">詳細スペック</a></div></div></div></div>"""

        # --- 8. 投稿 ---
        def get_wp_id(path, name):
            try:
                r = requests.get(f"{WP_API_BASE}/{path}?search={urllib.parse.quote(name)}", auth=AUTH)
                if r.status_code == 200 and r.json():
                    for t in r.json():
                        if t['name'] == name: return t['id']
                return requests.post(f"{WP_API_BASE}/{path}", json={"name": name}, auth=AUTH).json().get('id')
            except: return None

        cid = get_wp_id("categories", cat_name)
        tids = [get_wp_id("tags", tn) for tn in tag_names if tn]

        post_data = {
            "title": target_title,
            "content": html_body + card_html,
            "status": "publish",
            "categories": [cid] if cid else [],
            "tags": [tid for tid in tids if tid],
            "featured_media": featured_media_id
        }
        
        final_res = requests.post(f"{WP_API_BASE}/posts", json=post_data, auth=AUTH)
        if final_res.status_code == 201:
            self.stdout.write(self.style.SUCCESS(f"投稿成功: {cat_name} | {target_title}"))
            # RSS自動モードの時だけ履歴に記録
            if not options.get('url'):
                with open(HISTORY_FILE, "a", encoding='utf-8') as f:
                    f.write(target_url + "\n")