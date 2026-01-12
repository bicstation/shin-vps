# -*- coding: utf-8 -*-
# /home/maya/shin-vps/django/api/management/commands/ai_post_pc_news.py

import os
import re
import requests
import feedparser
import urllib.parse
import time
import random
from bs4 import BeautifulSoup
from django.core.management.base import BaseCommand
from requests.auth import HTTPBasicAuth
from api.models import PCProduct

class Command(BaseCommand):
    help = 'ニュース記事を生成し、A8.net Amazonリンクと洗練された商品カードを含めて投稿する'

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
        PROMPT_FILE = os.path.join(current_dir, "ai_prompt_news.txt")
        HISTORY_FILE = os.path.join(current_dir, "post_history.txt")

        if not os.path.exists(PROMPT_FILE):
            self.stdout.write(self.style.ERROR(f"❌ プロンプトファイルが見つかりません"))
            return

        posted_links = set()
        if os.path.exists(HISTORY_FILE):
            with open(HISTORY_FILE, "r", encoding='utf-8') as f:
                for line in f:
                    parts = line.strip().split('\t')
                    if parts: posted_links.add(parts[0].strip())

        with open(MODELS_FILE, "r", encoding='utf-8') as f:
            MODELS = [line.strip() for line in f if line.strip()]
        with open(PROMPT_FILE, "r", encoding='utf-8') as f:
            PROMPT_TEMPLATE = f.read()

        def is_already_on_wp(title):
            try:
                search_url = f"{WP_API_BASE}/posts?search={urllib.parse.quote(title)}&status=publish"
                r = requests.get(search_url, auth=AUTH, timeout=10).json()
                for p in r:
                    if p['title']['rendered'] == title: return True
                return False
            except: return False

        # --- 2. 記事候補の取得 ---
        target_url = options.get('url')
        target_image_url = options.get('image')
        candidates = []

        if target_url:
            candidates.append({"url": target_url.strip()})
        else:
            RSS_SOURCES = [
                {"name": "PC Watch", "url": "https://pc.watch.impress.co.jp/data/rss/1.0/pcw/feed.rdf"},
                {"name": "ASCII.jp", "url": "https://ascii.jp/pc/rss.xml"},
                {"name": "ITmedia", "url": "https://rss.itmedia.co.jp/rss/2.0/pcuser.xml"}
            ]
            random.shuffle(RSS_SOURCES)
            for source in RSS_SOURCES:
                feed = feedparser.parse(source['url'])
                entries = feed.entries
                random.shuffle(entries)
                for entry in entries:
                    link = entry.link.strip()
                    if link not in posted_links: candidates.append({"url": link})
                if len(candidates) > 10: break

        # --- 3. メインループ ---
        success = False
        random.shuffle(candidates)

        for item in candidates:
            current_url = item['url']
            if current_url in posted_links: continue

            self.stdout.write(f"🌐 解析開始: {current_url}")
            headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
            try:
                res = requests.get(current_url, timeout=15, headers=headers)
                res.encoding = res.apparent_encoding
                soup = BeautifulSoup(res.text, 'html.parser')
                raw_title = soup.title.string.split('|')[0].strip() if soup.title else "最新ニュース"
                
                if is_already_on_wp(raw_title):
                    posted_links.add(current_url)
                    continue

                og_image_url = None
                og_tag = soup.find("meta", property="og:image")
                if og_tag: og_image_url = og_tag.get("content")

                for s in soup(['script', 'style', 'nav', 'header', 'footer', 'aside', 'iframe', 'ins']): s.decompose()
                main_area = soup.find('article') or soup.find('main') or soup.body
                page_content = main_area.get_text(separator=' ', strip=True) if main_area else ""
                if len(page_content) < 300: continue
            except: continue

            # --- 4. AI記事生成 ---
            prompt = PROMPT_TEMPLATE.replace("{raw_title}", raw_title).replace("{page_content[:3500]}", page_content[:3500])
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

            # --- 5. カテゴリー・タグの洗浄 ---
            cat_name = "PCパーツ"
            cat_m = re.search(r'\[CAT\]\s*(.*?)\s*\[/CAT\]', ai_response, re.IGNORECASE)
            tag_m = re.search(r'\[TAG\]\s*(.*?)\s*\[/TAG\]', ai_response, re.IGNORECASE)
            initial_tags = [t.strip() for t in tag_m.group(1).split(',') if t.strip()] if tag_m else []

            if cat_m:
                cat_list = [c.strip() for c in cat_m.group(1).replace('、', ',').split(',') if c.strip()]
                if cat_list:
                    cat_name = cat_list[0]
                    if len(cat_list) > 1: initial_tags.extend(cat_list[1:])

            tag_names = list(set(initial_tags))

            # --- 6. 本文成形 ---
            lines = ai_response.strip().split('\n')
            final_title = re.sub(r'^[#*\s・]+|[#*\s・]+$', '', lines[0])

            html_body = ""
            sum_m = re.search(r'\[SUMMARY\](.*?)\[/SUMMARY\]', ai_response, re.DOTALL | re.IGNORECASE)
            if sum_m:
                html_body += '<div style="background:#f1f5f9;border-left:5px solid #0f172a;padding:20px;margin-bottom:30px;border-radius:4px;">'
                html_body += '<h4 style="margin:0 0 10px 0;color:#0f172a;font-size:1.1em;">📝 ニュースの要約ポイント</h4><ul style="margin-bottom:0;padding-left:20px;">'
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
                        html_body += '<table style="width:100%; border-collapse:collapse; margin:20px 0; border:1px solid #e2e8f0; font-size:0.95em;">'
                        in_table = True
                    k, v = spec_match.groups()
                    html_body += f'<tr style="border-bottom:1px solid #e2e8f0;"><td style="background:#f8fafc; padding:12px; font-weight:bold; width:35%; color:#334155;">{k.replace("**","")}</td><td style="padding:12px; color:#1e293b;">{v.replace("**","")}</td></tr>'
                    continue
                if in_table:
                    html_body += '</table>'
                    in_table = False
                if line.startswith('#'):
                    clean = line.replace('#', '').strip()
                    html_body += f'<h2 class="wp-block-heading" style="border-bottom:2px solid #333;padding-bottom:10px;margin-top:40px;font-weight:bold;">{clean}</h2>'
                else:
                    html_body += f'<p>{line}</p>'
            if in_table: html_body += '</table>'

            # --- 7. 商品マッチング（デザイン強化版） ---
            keywords = ["ノートPC","デスクトップ", "ワークステーション","SSD", "RTX", "モニター", "キーボード", "ケーブル", "充電器", "マウス"]
            search_keyword = next((k for k in keywords if k in final_title), final_title[:10])
            related_products = PCProduct.objects.filter(is_active=True, name__icontains=search_keyword).exclude(stock_status="受注停止中").order_by('-created_at')[:3]

            if not related_products:
                related_products = PCProduct.objects.filter(is_active=True, name__icontains=cat_name).exclude(stock_status="受注停止中").order_by('-created_at')[:3]

            if related_products:
                html_body += '<h2 class="wp-block-heading" style="margin-top:50px;text-align:center;font-weight:bold;color:#1e293b;">🛠 関連おすすめモデル</h2>'
                for prod in related_products:
                    # リンク生成
                    encoded_name = urllib.parse.quote(prod.name)
                    # Amazon A8リンク (リダイレクト形式)
                    amazon_a8_url = f"https://px.a8.net/svt/ejp?a8mat=1NWETK+A4FFE2+249K+BWGDT&a8ejpredirect=https%3A%2F%2Fwww.amazon.co.jp%2Fs%3Fk%3D{encoded_name}%26tag%3Da8-affi-321713-22"
                    official_url = prod.affiliate_url or prod.url
                    bic_url = f"https://bicstation.com/product/{prod.site_prefix}_{prod.unique_id}/"
                    
                    # トラッキングピクセル
                    a8_pixel = '<img border="0" width="1" height="1" src="https://www15.a8.net/0.gif?a8mat=1NWETK+A4FFE2+249K+BWGDT" alt="">'

                    html_body += f'''
                    <div style="border:1px solid #e5e7eb; border-radius:16px; padding:24px; margin-bottom:32px; background:#ffffff; box-shadow:0 10px 15px -3px rgba(0,0,0,0.05);">
                        <div style="display:flex; flex-wrap:wrap; align-items:center; gap:24px;">
                            <div style="flex:1; min-width:200px; text-align:center;">
                                <img src="{prod.image_url}" style="width:100%; max-width:220px; height:auto; border-radius:12px; object-fit:contain;">
                            </div>
                            <div style="flex:2; min-width:280px;">
                                <div style="font-size:0.85em; color:#6b7280; margin-bottom:4px;">{prod.maker}</div>
                                <h4 style="margin:0 0 12px 0; color:#111827; font-size:1.25em; font-weight:700; line-height:1.4;">{prod.name}</h4>
                                <div style="display:flex; align-items:baseline; gap:8px; margin-bottom:20px;">
                                    <span style="color:#dc2626; font-weight:800; font-size:1.6em;">¥{prod.price:,}</span>
                                    <span style="font-size:0.8em; color:#9ca3af;">(税込)</span>
                                </div>
                                
                                <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap:12px;">
                                    <a href="{amazon_a8_url}" target="_blank" rel="nofollow" style="background:#FF9900; color:#fff; text-align:center; padding:12px 8px; text-decoration:none; border-radius:8px; font-weight:bold; font-size:0.9em; box-shadow:0 2px 4px rgba(255,153,0,0.2);">Amazonで探す</a>
                                    <a href="{official_url}" target="_blank" rel="nofollow" style="background:#e41313; color:#fff; text-align:center; padding:12px 8px; text-decoration:none; border-radius:8px; font-weight:bold; font-size:0.9em; box-shadow:0 2px 4px rgba(228,19,19,0.2);">公式サイト</a>
                                    <a href="{bic_url}" style="background:#2563eb; color:#fff; text-align:center; padding:12px 8px; text-decoration:none; border-radius:8px; font-weight:bold; font-size:0.9em; box-shadow:0 2px 4px rgba(37,99,235,0.2);">BicStation詳細</a>
                                </div>
                                {a8_pixel}
                            </div>
                        </div>
                    </div>
                    '''

            html_body += f'<p style="font-size:0.8em;margin-top:40px;color:#94a3b8;border-top:1px dotted #ccc;padding-top:10px;">出典: <a href="{current_url}" target="_blank" rel="nofollow">{raw_title}</a></p>'

            # --- 8. アイキャッチ画像の処理 ---
            featured_media_id = 0
            final_img_url = target_image_url or og_image_url or f"https://images.unsplash.com/featured/?{urllib.parse.quote(final_title[:15])}"
            try:
                img_res = requests.get(final_img_url, timeout=20, allow_redirects=True, headers=headers)
                if img_res.status_code == 200:
                    m_res = requests.post(f"{WP_API_BASE}/media", auth=AUTH, headers={'Content-Disposition': 'attachment; filename="news.jpg"', 'Content-Type': 'image/jpeg'}, data=img_res.content)
                    featured_media_id = m_res.json().get('id', 0)
            except: pass

            # --- 9. カテゴリ・タグ取得 ---
            def get_wp_id(path, name):
                try:
                    r = requests.get(f"{WP_API_BASE}/{path}?search={urllib.parse.quote(name)}", auth=AUTH).json()
                    for i in r:
                        if i['name'] == name: return i['id']
                    return requests.post(f"{WP_API_BASE}/{path}", json={"name": name}, auth=AUTH).json().get('id')
                except: return None

            cid = get_wp_id("categories", cat_name)
            tids = [get_wp_id("tags", tn) for tn in tag_names]

            # --- 10. WordPress最終投稿 ---
            if is_already_on_wp(final_title): continue

            post_payload = {
                "title": final_title,
                "content": html_body,
                "status": "publish",
                "categories": [cid] if cid else [],
                "tags": [t for t in tids if t],
                "featured_media": featured_media_id
            }
            
            final_res = requests.post(f"{WP_API_BASE}/posts", json=post_payload, auth=AUTH)
            if final_res.status_code == 201:
                self.stdout.write(self.style.SUCCESS(f"🚀 投稿成功: {final_title}"))
                with open(HISTORY_FILE, "a", encoding='utf-8') as f:
                    f.write(f"{current_url}\t{final_title}\n")
                success = True
                break

        if not success:
            self.stdout.write("新しい未投稿の記事は見つかりませんでした。")