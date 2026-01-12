# -*- coding: utf-8 -*-
# /home/maya/shin-vps/django/api/management/commands/ai_post_pc_news.py

import os
import re
import requests
import feedparser
import urllib.parse
import time
import difflib
from bs4 import BeautifulSoup
from django.core.management.base import BaseCommand
from requests.auth import HTTPBasicAuth
from api.models import PCProduct

class Command(BaseCommand):
    help = 'ニュース記事を生成し、記号除去・スペック表完全テーブル化・自社URL最適化・重複回避機能を備えて投稿する'

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
            self.stdout.write(self.style.ERROR(f"❌ プロンプトファイルが見つかりません: {PROMPT_FILE}"))
            return

        # 履歴の読み込み（URLとタイトルの重複チェック用）
        posted_links = set()
        posted_titles = []
        if os.path.exists(HISTORY_FILE):
            with open(HISTORY_FILE, "r", encoding='utf-8') as f:
                for line in f:
                    parts = line.strip().split('\t')
                    if parts:
                        posted_links.add(parts[0].strip())
                        if len(parts) > 1:
                            posted_titles.append(parts[1].strip())

        with open(MODELS_FILE, "r", encoding='utf-8') as f:
            MODELS = [line.strip() for line in f if line.strip()]
        with open(PROMPT_FILE, "r", encoding='utf-8') as f:
            PROMPT_TEMPLATE = f.read()

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
            for source in RSS_SOURCES:
                feed = feedparser.parse(source['url'])
                for entry in feed.entries:
                    link = entry.link.strip()
                    if link in posted_links:
                        continue
                    candidates.append({"url": link})

        # --- 3. 投稿メインループ ---
        success = False
        for item in candidates:
            current_url = item['url']
            if current_url in posted_links:
                continue

            self.stdout.write(f"🌐 解析開始: {current_url}")
            headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
            try:
                res = requests.get(current_url, timeout=15, headers=headers)
                res.encoding = res.apparent_encoding
                soup = BeautifulSoup(res.text, 'html.parser')
                
                raw_title = soup.title.string.split('|')[0].strip() if soup.title else "最新ニュース"
                
                # タイトル類似度チェック (重複投稿防止)
                if any(difflib.SequenceMatcher(None, raw_title, t).ratio() > 0.8 for t in posted_titles):
                    self.stdout.write(f"⏩ タイトル重複のためスキップ: {raw_title}")
                    continue

                # OGP画像取得
                og_image_url = None
                og_tag = soup.find("meta", property="og:image")
                if og_tag:
                    og_image_url = og_tag.get("content")

                for s in soup(['script', 'style', 'nav', 'header', 'footer', 'aside', 'iframe', 'ins']):
                    s.decompose()
                
                main_area = soup.find('article') or soup.find('main') or soup.body
                page_content = main_area.get_text(separator=' ', strip=True) if main_area else ""
                if len(page_content) < 300: continue
            except Exception as e:
                self.stdout.write(f"解析エラー: {e}")
                continue

            # --- 4. AI記事生成 ---
            self.stdout.write(f"🤖 AI執筆中...")
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

            # --- 5. 本文成形とHTML変換ロジック ---
            lines = ai_response.strip().split('\n')
            # タイトルから不要な記号を除去
            final_title = re.sub(r'^[#*\s・]+|[#*\s・]+$', '', lines[0])

            # 特殊タグ抽出
            cat_name = "PCパーツ"
            cat_m = re.search(r'\[CAT\]\s*(.*?)\s*\[/CAT\]', ai_response, re.IGNORECASE)
            if cat_m: cat_name = cat_m.group(1).strip()
            
            tag_m = re.search(r'\[TAG\]\s*(.*?)\s*\[/TAG\]', ai_response, re.IGNORECASE)
            tag_names = [t.strip() for t in tag_m.group(1).split(',') if t.strip()] if tag_m else []

            # 要約抽出
            sum_m = re.search(r'\[SUMMARY\](.*?)\[/SUMMARY\]', ai_response, re.DOTALL | re.IGNORECASE)
            html_body = ""
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

                # 【スペック表・箇条書きの検知とテーブル化】
                spec_match = re.match(r'^[*-]\s*(?:\*\*)?(.*?)(?:\*\*)?[:：]\s*(.*)', line)
                if spec_match:
                    if not in_table:
                        html_body += '<table style="width:100%; border-collapse:collapse; margin:20px 0; border:1px solid #e2e8f0; font-size:0.95em;">'
                        in_table = True
                    key, val = spec_match.groups()
                    html_body += f'<tr style="border-bottom:1px solid #e2e8f0;"><td style="background:#f8fafc; padding:12px; font-weight:bold; width:35%; color:#334155;">{key}</td><td style="padding:12px; color:#1e293b;">{val}</td></tr>'
                    continue
                
                # テーブル終了判定
                if in_table:
                    html_body += '</table>'
                    in_table = False

                # 【見出し処理：# 記号を完全に除去】
                if line.startswith('#'):
                    level = line.count('#')
                    clean_text = line.replace('#', '').strip()
                    if level >= 3:
                        html_body += f'<h3 class="wp-block-heading" style="color:#2563eb;margin-top:30px;font-weight:bold;">{clean_text}</h3>'
                    else:
                        html_body += f'<h2 class="wp-block-heading" style="border-bottom:2px solid #333;padding-bottom:10px;margin-top:40px;font-weight:bold;">{clean_text}</h2>'
                else:
                    html_body += f'<p>{line}</p>'
            
            if in_table: html_body += '</table>'

            # --- 6. 商品カード：自社URL（site_prefix_unique_id） ---
            search_keyword = cat_name if len(cat_name) > 1 else final_title[:10]
            related_products = PCProduct.objects.filter(is_active=True, name__icontains=search_keyword).exclude(stock_status="受注停止中").order_by('-created_at')[:3]

            if related_products:
                html_body += '<h2 class="wp-block-heading" style="margin-top:50px;text-align:center;">🛠 関連おすすめモデル</h2>'
                for prod in related_products:
                    amazon_url = f"https://www.amazon.co.jp/s?k={urllib.parse.quote(prod.name)}"
                    official_url = prod.affiliate_url or prod.url
                    # 自社URLの正規化連結
                    bic_url = f"https://bicstation.com/product/{prod.site_prefix}_{prod.unique_id}/"

                    html_body += f'''
                    <div style="border:1px solid #e2e8f0; border-radius:12px; padding:20px; margin-bottom:30px; background:#fff; box-shadow:0 4px 6px -1px rgba(0,0,0,0.1);">
                        <div style="display:flex; flex-wrap:wrap; align-items:center; gap:20px;">
                            <div style="flex:1; min-width:180px;"><img src="{prod.image_url}" style="width:100%; height:auto; border-radius:8px; object-fit:contain; max-height:200px;"></div>
                            <div style="flex:2; min-width:250px;">
                                <h4 style="margin:0 0 10px 0; color:#1e293b; font-weight:bold;">{prod.name}</h4>
                                <p style="color:#b91c1c; font-weight:bold; font-size:1.4em; margin-bottom:15px;">¥{prod.price:,}</p>
                                <div style="display:grid; grid-template-columns: 1fr; gap:10px;">
                                    <a href="{amazon_url}" target="_blank" style="text-align:center; background:#ff9900; color:#fff; padding:10px; text-decoration:none; border-radius:6px; font-weight:bold;">Amazonで価格を確認</a>
                                    <a href="{official_url}" target="_blank" style="text-align:center; background:#2563eb; color:#fff; padding:10px; text-decoration:none; border-radius:6px; font-weight:bold;">公式サイトで購入</a>
                                    <a href="{bic_url}" style="text-align:center; background:#fff; color:#2563eb; border:1px solid #2563eb; padding:10px; text-decoration:none; border-radius:6px; font-weight:bold;">BicStationで詳細を見る</a>
                                </div>
                            </div>
                        </div>
                    </div>
                    '''

            html_body += f'<p style="font-size:0.8em;margin-top:30px;color:#94a3b8;border-top:1px dotted #ccc;padding-top:10px;">出典: <a href="{current_url}" target="_blank" rel="nofollow">{raw_title}</a></p>'

            # --- 7. アイキャッチ画像の処理 ---
            featured_media_id = 0
            final_img_url = target_image_url or og_image_url or f"https://images.unsplash.com/featured/?{urllib.parse.quote(final_title[:15])}"
            try:
                img_res = requests.get(final_img_url, timeout=20, allow_redirects=True, headers=headers)
                if img_res.status_code == 200:
                    m_headers = {'Content-Disposition': f'attachment; filename="news_{int(time.time())}.jpg"', 'Content-Type': img_res.headers.get('Content-Type', 'image/jpeg')}
                    m_res = requests.post(f"{WP_API_BASE}/media", auth=AUTH, headers=m_headers, data=img_res.content)
                    if m_res.status_code == 201:
                        featured_media_id = m_res.json().get('id', 0)
            except: pass

            # --- 8. WordPressカテゴリ・タグ同期 ---
            def get_wp_id(path, name):
                try:
                    r = requests.get(f"{WP_API_BASE}/{path}?search={urllib.parse.quote(name)}", auth=AUTH).json()
                    for i in r:
                        if i['name'] == name: return i['id']
                    return requests.post(f"{WP_API_BASE}/{path}", json={"name": name}, auth=AUTH).json().get('id')
                except: return None

            cid = get_wp_id("categories", cat_name)
            tids = [get_wp_id("tags", tn) for tn in tag_names]

            # --- 9. WordPress投稿 ---
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
            self.stdout.write("新しい記事は投稿されませんでした。")