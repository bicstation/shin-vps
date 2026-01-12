# -*- coding: utf-8 -*-
# /mnt/e/dev/shin-vps/django/api/management/commands/ai_post_pc_news.py
# 特徴：RSS未投稿選別 ＋ 動的アイキャッチ（Unsplash） ＋ カテゴリ・タグ自動抽出 ＋ 商品カード

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
    help = 'RSSから未投稿記事を投稿し、タイトルに関連する画像を自動生成して投稿するフルロジック'

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

        posted_links = set()
        if os.path.exists(HISTORY_FILE):
            with open(HISTORY_FILE, "r", encoding='utf-8') as f:
                posted_links = set(line.strip() for line in f if line.strip())

        # --- 2. RSSフィードの取得 ---
        RSS_SOURCES = [
            {"name": "PC Watch", "url": "https://pc.watch.impress.co.jp/data/rss/1.0/pcw/feed.rdf"},
            {"name": "ASCII.jp", "url": "https://ascii.jp/pc/rss.xml"},
            {"name": "ITmedia PC USER", "url": "https://rss.itmedia.co.jp/rss/2.0/pcuser.xml"}
        ]

        target_entry = None
        source_name = ""

        self.stdout.write("複数ソースから未投稿記事を探索中...")
        for source in RSS_SOURCES:
            self.stdout.write(f"RSSチェック中: {source['name']}")
            feed = feedparser.parse(source['url'])
            if not feed.entries:
                continue
            
            for entry in feed.entries:
                if entry.link not in posted_links:
                    target_entry = entry
                    source_name = source['name']
                    break
            if target_entry:
                break
        
        if not target_entry:
            self.stdout.write(self.style.SUCCESS("新しい未投稿記事はありません。"))
            return

        self.stdout.write(f"\n未投稿記事を特定: 【{source_name}】 {target_entry.title}")

        # --- 3. AI記事生成 ---
        prompt = PROMPT_TEMPLATE.replace("{title}", target_entry.title).replace("{description}", target_entry.description).replace("{link}", target_entry.link)
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
        
        if not ai_response:
            self.stdout.write(self.style.ERROR("AI生成に失敗しました。"))
            return

        # --- 4. カテゴリ・タグ・クリーニング処理 ---
        # HTMLタグの除去など
        ai_response = ai_response.replace('```html', '').replace('```', '')

        # カテゴリ抽出
        cat_name = "PCパーツ"
        c_m = re.search(r'\[CAT\](.*?)\[/CAT\]', ai_response)
        if c_m: cat_name = c_m.group(1).strip()
        
        # タグ抽出
        tag_names = []
        t_m = re.search(r'\[TAG\](.*?)\[/TAG\]', ai_response)
        if t_m: tag_names = [t.strip() for t in t_m.group(1).split(',')]

        # --- 5. HTML本文の組み立て ---
        html_body = ""
        s_m = re.search(r'\[SUMMARY\](.*?)\[/SUMMARY\]', ai_response, re.DOTALL)
        if s_m:
            html_body += '<div class="wp-block-group has-background" style="background-color:#f8fafc;border-radius:12px;padding:25px">'
            html_body += '<h4>🚀 要点まとめ</h4><ul>'
            for s_l in s_m.group(1).strip().split('\n'):
                point = s_l.strip().lstrip('*-・• ')
                if point: html_body += f"<li>{point}</li>"
            html_body += '</ul></div>'

        # AIの回答からメタタグ部分を除去して本文のみにする
        clean_content = re.sub(r'\[CAT\].*?\[/CAT\]|\[TAG\].*?\[/TAG\]|\[SUMMARY\].*?\[/SUMMARY\]', '', ai_response, flags=re.DOTALL)
        
        for line in clean_content.strip().split('\n'):
            l = line.strip()
            if not l or l == target_entry.title: continue
            if l.startswith('##'):
                html_body += f'<h2 class="wp-block-heading">{l.replace("##","").strip()}</h2>'
            elif l.startswith('###'):
                html_body += f'<h3 class="wp-block-heading">{l.replace("###","").strip()}</h3>'
            else:
                html_body += f'<p>{l}</p>'
        
        html_body += f'<p>出典: <a href="{target_entry.link}" target="_blank">{source_name}</a></p>'

        # --- 6. アイキャッチ画像の動的処理 ---
        featured_media_id = 0
        img_url = None
        
        # RSSに画像があるか確認
        if 'links' in target_entry:
            for link in target_entry.links:
                if 'image' in link.get('type', ''):
                    img_url = link.get('href')
                    break
        
        # RSSに画像がない、または取得に失敗しそうな場合はUnsplashから動的に取得
        if not img_url:
            # タイトルから英単語を抽出して検索クエリにする
            search_keywords = re.findall(r'[a-zA-Z0-9]{3,}', target_entry.title)
            query = ",".join(search_keywords[:3]) if search_keywords else "computer,technology"
            img_url = f"https://source.unsplash.com/featured/1200x630/?{query}"
            self.stdout.write(f"アイキャッチを動的に生成中（キーワード: {query}）")

        try:
            headers = {'User-Agent': 'Mozilla/5.0'}
            img_res = requests.get(img_url, headers=headers, timeout=25)
            if img_res.status_code == 200:
                with NamedTemporaryFile(suffix=".jpg", delete=False) as tmp:
                    tmp.write(img_res.content)
                    tmp_path = tmp.name
                with open(tmp_path, 'rb') as f:
                    media_res = requests.post(
                        f"{WP_API_BASE}/media", 
                        auth=AUTH, 
                        files={'file': (f"eyecatch_{int(time.time())}.jpg", f, 'image/jpeg')}, 
                        data={'title': target_entry.title}
                    )
                if os.path.exists(tmp_path): os.remove(tmp_path)
                if media_res.status_code == 201:
                    featured_media_id = media_res.json().get('id')
                    self.stdout.write(self.style.SUCCESS(f"アイキャッチ設定完了 ID: {featured_media_id}"))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"画像処理エラー: {str(e)}"))

        # --- 7. 商品カード（bicstation内部リンク） ---
        prod = PCProduct.objects.filter(is_active=True).order_by('?').first()
        card_html = ""
        if prod:
            bic_detail_url = f"https://bicstation.com/product/{prod.unique_id}/"
            final_affiliate_url = prod.affiliate_url if prod.affiliate_url else prod.url
            p_price = f"{prod.price:,}円〜" if prod.price else "公式サイトへ"

            card_html = f"""
            <div style="margin: 40px 0; padding: 25px; border: 1px solid #e2e8f0; border-radius: 20px; background-color: #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
                <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 24px;">
                    <div style="flex: 1; min-width: 200px; text-align: center;">
                        <img src="{prod.image_url or ''}" style="max-width: 100%; height: auto; border-radius: 12px;" alt="{prod.name}">
                    </div>
                    <div style="flex: 2; min-width: 250px;">
                        <p style="font-size:0.8em;color:#64748b;margin-bottom:5px;">おすすめの関連製品</p>
                        <h3 style="margin: 0 0 12px 0; color: #1e3a8a; font-size:1.4em;">{prod.name}</h3>
                        <p style="color: #ef4444; font-weight: bold; font-size: 1.3em; margin: 15px 0;">特別価格：{p_price}</p>
                        <div style="display: flex; gap: 12px; margin-top: 25px;">
                            <a href="{final_affiliate_url}" target="_blank" rel="nofollow noopener" style="flex: 1; background: #ef4444; color: #ffffff; text-align: center; padding: 12px 5px; border-radius: 9999px; text-decoration: none; font-weight: bold; font-size: 0.9em;">公式サイト ＞</a>
                            <a href="{bic_detail_url}" style="flex: 1; background: #1f2937; color: #ffffff; text-align: center; padding: 12px 5px; border-radius: 9999px; text-decoration: none; font-weight: bold; font-size: 0.9em;">詳細スペック ＞</a>
                        </div>
                    </div>
                </div>
            </div>"""

        # --- 8. WordPressへ投稿 ---
        def get_wp_id(path, name):
            try:
                r = requests.get(f"{WP_API_BASE}/{path}?search={urllib.parse.quote(name)}", auth=AUTH)
                if r.status_code == 200 and r.json():
                    for t in r.json():
                        if t['name'] == name: return t['id']
                r = requests.post(f"{WP_API_BASE}/{path}", json={"name": name}, auth=AUTH)
                return r.json().get('id')
            except: return None

        cid = get_wp_id("categories", cat_name)
        tids = [get_wp_id("tags", tn) for tn in tag_names if tn]

        post_data = {
            "title": target_entry.title,
            "content": html_body + card_html,
            "status": "publish",
            "categories": [cid] if cid else [],
            "tags": [tid for tid in tids if tid],
            "featured_media": featured_media_id
        }
        
        final_res = requests.post(f"{WP_API_BASE}/posts", json=post_data, auth=AUTH)
        
        if final_res.status_code == 201:
            self.stdout.write(self.style.SUCCESS(f"投稿成功: {target_entry.title}"))
            with open(HISTORY_FILE, "a", encoding='utf-8') as f:
                f.write(target_entry.link + "\n")
        else:
            self.stdout.write(self.style.ERROR(f"投稿失敗: {final_res.status_code}"))

        self.stdout.write(self.style.SUCCESS("すべての処理が完了しました。"))