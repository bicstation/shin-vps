# -*- coding: utf-8 -*-
import os
import re
import json
import random
import requests
import urllib.parse
import time
import hashlib
import base64
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor, as_completed
from django.core.management.base import BaseCommand
from api.models.pc_products import PCProduct 
from django.db.models import Q as DjangoQ 
from django.utils.timezone import now

# === APIキー設定 ===
API_KEYS = [
    os.getenv("GEMINI_API_KEY_1"),
    os.getenv("GEMINI_API_KEY_2"),
    os.getenv("GEMINI_API_KEY_3"),
    os.getenv("GEMINI_API_KEY_4"),
    os.getenv("GEMINI_API_KEY_5"),
    os.getenv("GEMINI_API_KEY_6"),
    os.getenv("GEMINI_API_KEY_7"),
    os.getenv("GEMINI_API_KEY_8"),
    os.getenv("GEMINI_API_KEY_9"),
    os.getenv("GEMINI_API_KEY_10"),
]
ACTIVE_KEYS = [k for k in API_KEYS if k]
MAX_WORKERS = min(len(ACTIVE_KEYS), 4) if ACTIVE_KEYS else 1

# === ブログ投稿用定数 ===
LD_ID = "pbic-bcorjo9q"
LD_API_KEY = "YPas7QEHs5"
LD_URL = f"https://livedoor.blogcms.jp/atompub/{LD_ID}/article"

HT_ID = "bicstation"
HT_BLOG_DOMAIN = "bicstation.hatenablog.com"
HT_API_KEY = "se0o5znod6"
HT_URL = f"https://blog.hatena.ne.jp/{HT_ID}/{HT_BLOG_DOMAIN}/atom/entry"

class Command(BaseCommand):
    help = 'Geminiで解析し、自社DB(MD保存)・Livedoor・はてなブログへ同時投稿する'

    def add_arguments(self, parser):
        parser.add_argument('--maker', type=str, help='メーカー指定')
        parser.add_argument('--limit', type=int, default=1, help='投稿件数')
        parser.add_argument('--target', type=str, default='all', help='投稿先: all, db, livedoor, hatena (カンマ区切り可)')

    def handle(self, *args, **options):
        if not ACTIVE_KEYS:
            self.stdout.write(self.style.ERROR("❌ APIキーが設定されていません。"))
            return

        limit = options.get('limit', 1)
        targets = options.get('target').split(',')

        # 1. 投稿対象の選定
        query = DjangoQ(is_active=True, is_posted=False)
        if options.get('maker'):
            query &= DjangoQ(maker__iexact=options.get('maker'))
        
        products = list(PCProduct.objects.filter(query).exclude(stock_status="受注停止中")[:limit])

        if not products:
            self.stdout.write(self.style.WARNING("🔎 投稿対象が見つかりませんでした。"))
            return

        self.stdout.write(self.style.SUCCESS(f"🚀 配信プロセス開始: {len(products)}件 / ターゲット: {targets}"))

        # 2. 並列実行
        with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
            future_to_product = {}
            for i, product in enumerate(products):
                api_key = ACTIVE_KEYS[i % len(ACTIVE_KEYS)]
                delay = i * 10 # 外部ブログへの負荷分散
                future = executor.submit(self.process_dispatch_task, product, api_key, delay, targets)
                future_to_product[future] = product

            for future in as_completed(future_to_product):
                try:
                    future.result()
                except Exception as e:
                    p = future_to_product[future]
                    self.stdout.write(self.style.ERROR(f"❌ {p.unique_id}: {str(e)}"))

    def generate_wsse(self, user_id, api_key):
        created = datetime.now().isoformat() + "Z"
        nonce = hashlib.sha1(str(random.random()).encode()).digest()
        digest = hashlib.sha1(nonce + created.encode() + api_key.encode()).digest()
        return (
            f'UsernameToken Username="{user_id}", '
            f'PasswordDigest="{base64.b64encode(digest).decode()}", '
            f'Nonce="{base64.b64encode(nonce).decode()}", Created="{created}"'
        )

    def post_to_atompub(self, url, user_id, api_key, title, content_html):
        headers = {
            'X-WSSE': self.generate_wsse(user_id, api_key),
            'Content-Type': 'application/atom+xml',
        }
        xml_payload = f"""<?xml version="1.0" encoding="utf-8"?>
        <entry xmlns="http://www.w3.org/2005/Atom">
          <title>{title}</title>
          <content type="text/html"><![CDATA[{content_html}]]></content>
          <app:control xmlns:app="http://www.w3.org/2007/app"><app:draft>no</app:draft></app:control>
        </entry>""".encode('utf-8')
        try:
            res = requests.post(url, data=xml_payload, headers=headers, timeout=30)
            return res.status_code in [200, 201]
        except: return False

    def process_dispatch_task(self, product, api_key, delay, targets):
        if delay > 0: time.sleep(delay)

        # プロンプト読み込み
        BASE_DIR = os.path.dirname(os.path.abspath(__file__))
        PROMPT_FILE_PATH = os.path.join(BASE_DIR, "prompt", "ai_prompt.txt")
        with open(PROMPT_FILE_PATH, 'r', encoding='utf-8') as f:
            prompt = f.read().format(
                maker=product.maker, name=product.name,
                price=f"{product.price:,}", description=product.description or ""
            )

        # Gemini APIリクエスト
        api_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
        try:
            response = requests.post(api_url, json={"contents": [{"parts": [{"text": prompt}]}]}, timeout=120)
            ai_raw_text = response.json()['candidates'][0]['content']['parts'][0]['text']
        except: return

        # --- コンテンツ解析 ---
        spec_match = re.search(r'\[SPEC_JSON\](.*?)\[/SPEC_JSON\]', ai_raw_text, re.DOTALL)
        summary_match = re.search(r'\[SUMMARY_DATA\](.*?)\[/SUMMARY_DATA\]', ai_raw_text, re.DOTALL)
        summary_raw = summary_match.group(1).strip() if summary_match else ""

        # 本文抽出（引き算）
        main_body = re.sub(r'\[SPEC_JSON\].*?\[/SPEC_JSON\]', '', ai_raw_text, flags=re.DOTALL)
        main_body = re.sub(r'\[SUMMARY_DATA\].*?\[/SUMMARY_DATA\]', '', main_body, flags=re.DOTALL)
        main_body = re.sub(r'```(html|json)?', '', main_body).replace('```', '').strip()

        # --- DB更新 (Markdown) ---
        if 'all' in targets or 'db' in targets:
            if spec_match:
                try:
                    sd = json.loads(spec_match.group(1).strip())
                    scores = [int(sd.get(k, 0)) for k in ['score_cpu', 'score_gpu', 'score_cost', 'score_portable', 'score_ai']]
                    product.score_cpu, product.score_gpu, product.score_cost, product.score_portable, product.score_ai = scores
                    product.spec_score = int(sum(scores) / 5)
                    if sd.get('cpu_model'): product.cpu_model = sd['cpu_model']
                except: pass
            
            product.ai_summary = summary_raw
            product.ai_content = f"### 🚀 主要ポイント\n{summary_raw}\n\n{main_body}"
            product.is_posted = True
            product.last_spec_parsed_at = now()
            product.save()
            self.stdout.write(self.style.SUCCESS(f"💾 DB保存完了: {product.unique_id}"))

        # --- 外部ブログ用HTML構築 ---
        affiliate_url = f"https://ck.jp.ap.valuecommerce.com/servlet/referral?sid=3697471&pid=892455531&vc_url={urllib.parse.quote(product.url)}"
        summary_html = "".join([f"<li>{l.strip()}</li>" for l in summary_raw.splitlines() if l.strip()])
        
        content_html = f"""
        <div style="background:#f8fafc; padding:20px; border-left:5px solid #3b82f6; border-radius:10px;">
            <h3 style="margin-top:0;">🚀 この商品のポイント</h3>
            <ul>{summary_html}</ul>
        </div>
        <div style="margin-top:20px; line-height:1.8;">{main_body.replace('\n', '<br>')}</div>
        <div style="margin-top:40px; padding:25px; background:#f1f5f9; border-radius:15px; text-align:center;">
            <img src="{product.image_url}" style="max-width:200px;"><br>
            <h4 style="margin:15px 0;">{product.name}</h4>
            <p style="font-size:1.5em; color:#ef4444; font-weight:bold;">{product.price:,}円</p>
            <a href="{affiliate_url}" target="_blank" style="display:inline-block; background:#ef4444; color:white; padding:12px 30px; border-radius:8px; text-decoration:none; font-weight:bold;">公式サイトで詳細を見る</a>
            <p style="margin-top:20px;"><a href="https://bicstation.com/product/{product.unique_id}/" style="color:#64748b;">より詳しいスペック比較はこちら (BicStation)</a></p>
        </div>
        """

        # --- 外部ブログ投稿実行 ---
        if 'all' in targets or 'livedoor' in targets:
            if self.post_to_atompub(LD_URL, LD_ID, LD_API_KEY, f"【最新】{product.name} レビュー", content_html):
                self.stdout.write(self.style.SUCCESS(f"✅ Livedoor投稿: {product.unique_id}"))

        if 'all' in targets or 'hatena' in targets:
            time.sleep(5)
            if self.post_to_atompub(HT_URL, HT_ID, HT_API_KEY, f"【性能検証】{product.name} の性能スコア", content_html):
                self.stdout.write(self.style.SUCCESS(f"✅ Hatena投稿: {product.unique_id}"))