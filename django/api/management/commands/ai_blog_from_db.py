# -*- coding: utf-8 -*-
import os
import re
import json
import random
import requests
import urllib.parse
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from django.core.management.base import BaseCommand
from api.models.pc_products import PCProduct 
from django.db.models import Q as DjangoQ 
from django.utils.timezone import now
from requests.auth import HTTPBasicAuth
from django.core.files.temp import NamedTemporaryFile

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

# === 並列処理の最適化 ===
# キーの数に合わせて並列数を調整（投稿はメディア送信等も含むため最大3-4程度がWP側の負荷的に安定します）
MAX_WORKERS = min(len(ACTIVE_KEYS), 4) if ACTIVE_KEYS else 1

class Command(BaseCommand):
    help = '環境変数の複数キーを用いて並列にAI記事を生成し、WPへ自動投稿する'

    def add_arguments(self, parser):
        parser.add_argument('--maker', type=str, help='メーカー指定')
        parser.add_argument('--limit', type=int, default=1, help='投稿件数')

    def handle(self, *args, **options):
        if not ACTIVE_KEYS:
            self.stdout.write(self.style.ERROR("❌ 環境変数にAPIキーが設定されていません。"))
            return

        specified_maker = options.get('maker')
        limit = options.get('limit', 1)

        # 1. 投稿対象の選定
        query = DjangoQ(is_active=True, is_posted=False)
        if specified_maker:
            query &= DjangoQ(maker__iexact=specified_maker)
        
        products = list(PCProduct.objects.filter(query).exclude(stock_status="受注停止中")[:limit])

        if not products:
            self.stdout.write(self.style.WARNING("🔎 投稿対象の製品が見つかりませんでした。"))
            return

        self.stdout.write(self.style.SUCCESS(f"🚀 投稿プロセス開始: {len(products)}件 / 並列数: {MAX_WORKERS}"))

        # 2. 並列実行
        with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
            future_to_product = {}
            for i, product in enumerate(products):
                api_key = ACTIVE_KEYS[i % len(ACTIVE_KEYS)]
                # WPへの連続投稿による負荷を避けるため、ディレイを長めに設定
                delay = i * 5 
                future = executor.submit(self.process_post_task, product, api_key, delay)
                future_to_product[future] = product

            for future in as_completed(future_to_product):
                try:
                    future.result()
                except Exception as e:
                    p = future_to_product[future]
                    self.stdout.write(self.style.ERROR(f"❌ {p.unique_id}: {str(e)}"))

    def process_post_task(self, product, api_key, delay):
        if delay > 0:
            time.sleep(delay)

        # 共通設定（認証・URL）
        SCH, CLN, SLS, QMK, EQU, AMP = "https", ":", "/", "?", "=", "&"
        WP_USER = "bicstation"
        WP_APP_PASSWORD = "9re0 t3de WCe1 u1IL MudX 31IY"
        W_DOM = "blog.tiper.live"
        WP_API_BASE = f"{SCH}{CLN}{SLS}{SLS}{W_DOM}{SLS}wp-json{SLS}wp{SLS}v2"
        WP_POST_URL = f"{WP_API_BASE}{SLS}bicstation" 
        WP_MEDIA_URL = f"{WP_API_BASE}{SLS}media"
        AUTH = HTTPBasicAuth(WP_USER, WP_APP_PASSWORD)

        # プロンプト設定
        BASE_DIR = os.path.dirname(os.path.abspath(__file__))
        PROMPT_FILE_PATH = os.path.join(BASE_DIR, "prompt", "ai_prompt.txt")
        MODELS_FILE_PATH = os.path.join(BASE_DIR, "prompt", "ai_models.txt")

        with open(PROMPT_FILE_PATH, 'r', encoding='utf-8') as f:
            base_prompt_template = f.read()
        with open(MODELS_FILE_PATH, 'r', encoding='utf-8') as f:
            MODELS = [line.strip() for line in f if line.strip()]
        model_id = MODELS[0] if MODELS else "gemini-1.5-flash"

        def get_or_create_term(taxonomy, name):
            if not name: return None
            name = str(name).strip()
            try:
                search_url = f"{WP_API_BASE}/{taxonomy}{QMK}search{EQU}{urllib.parse.quote(name)}"
                res = requests.get(search_url, auth=AUTH, timeout=15)
                if res.status_code == 200 and res.json():
                    return res.json()[0]['id']
                create_res = requests.post(f"{WP_API_BASE}/{taxonomy}", json={"name": name}, auth=AUTH, timeout=15)
                if create_res.status_code == 201:
                    return create_res.json().get('id')
            except: pass
            return None

        # カテゴリ・タグ取得
        target_cats = [get_or_create_term('categories', product.maker.upper())]
        is_software = (product.unified_genre == 'software')
        is_desktop = any(k in product.name.lower() for k in ["desktop", "tower", "station", "aio"])
        tag_label = "ソフトウェア" if is_software else ("デスクトップPC" if is_desktop else "ノートパソコン")
        target_tags = [get_or_create_term('tags', tag_label)]

        # アイキャッチ
        media_id = None
        if product.image_url:
            try:
                img_res = requests.get(product.image_url, timeout=20)
                if img_res.status_code == 200:
                    with NamedTemporaryFile(delete=False, suffix=".jpg") as img_temp:
                        img_temp.write(img_res.content)
                        temp_path = img_temp.name
                    with open(temp_path, 'rb') as f:
                        files = {'file': (f"{product.unique_id}.jpg", f, 'image/jpeg')}
                        m_res = requests.post(WP_MEDIA_URL, auth=AUTH, files=files, timeout=30)
                    if os.path.exists(temp_path): os.unlink(temp_path)
                    if m_res.status_code == 201:
                        media_id = m_res.json().get('id')
            except: pass

        # AI生成
        prompt = base_prompt_template.format(
            maker=product.maker, name=product.name,
            price=f"{product.price:,}", description=product.description or ""
        )

        api_url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_id}:generateContent?key={api_key}"
        try:
            response = requests.post(api_url, json={"contents": [{"parts": [{"text": prompt}]}]}, timeout=180)
            res_json = response.json()
            ai_raw_text = res_json['candidates'][0]['content']['parts'][0]['text']
        except:
            return

        # テキスト解析とスペック抽出
        clean_text = re.sub(r'```(html|json)?', '', ai_raw_text).replace('```', '').strip()
        json_match = re.search(r'\[SPEC_JSON\](.*?)\[/SPEC_JSON\]', clean_text, re.DOTALL)
        
        if json_match:
            try:
                spec_data = json.loads(json_match.group(1).strip())
                # ランキング用データの更新
                s_cpu = int(spec_data.get('score_cpu', 0))
                s_gpu = int(spec_data.get('score_gpu', 0))
                s_cost = int(spec_data.get('score_cost', 0))
                s_port = int(spec_data.get('score_portable', 0))
                s_ai = int(spec_data.get('score_ai', 0))
                
                product.score_cpu, product.score_gpu = s_cpu, s_gpu
                product.score_cost, product.score_portable, product.score_ai = s_cost, s_port, s_ai
                product.spec_score = int((s_cpu + s_gpu + s_cost + s_port + s_ai) / 5)
                
                if spec_data.get('cpu_model'): product.cpu_model = spec_data['cpu_model']
                if spec_data.get('is_ai_pc') is not None: product.is_ai_pc = spec_data['is_ai_pc']
                product.save()
                clean_text = clean_text.replace(json_match.group(0), "").strip()
            except: pass

        # HTMLデザイン構築
        lines = [l.strip() for l in clean_text.split('\n') if l.strip()]
        title = next((re.sub(r'<[^>]*?>', '', l).replace('#', '').strip() for l in lines[:3] if len(l) > 5), product.name)
        
        summary_match = re.search(r'\[SUMMARY_DATA\](.*?)\[/SUMMARY_DATA\]', clean_text, re.DOTALL)
        summary_raw = summary_match.group(1).strip() if summary_match else ""
        main_body = clean_text.replace(summary_match.group(0) if summary_match else "", "").strip()

        # デザインブロック
        sid, pid = "3697471", "892455531"
        affiliate_url = f"https://ck.jp.ap.valuecommerce.com/servlet/referral?sid={sid}&pid={pid}&vc_url={urllib.parse.quote(product.url)}"
        bic_url = f"https://bicstation.com/product/{product.unique_id}/"
        
        summary_items = "".join([f"<li>{l.strip()}</li>" for l in summary_raw.splitlines() if ":" in l or "-" in l])
        summary_block = f'<div style="background:#f8fafc; padding:25px; border-left:6px solid #3b82f6; border-radius:12px; margin-bottom:40px;"><h4>🚀 主要ポイント</h4><ul>{summary_items}</ul></div>'
        
        card_block = f"""<div style="margin:50px 0; padding:30px; border-radius:24px; background:#1e293b; color:#fff;">
            <div style="display:flex; flex-wrap:wrap; gap:30px; align-items:center;">
                <div style="flex:1; text-align:center;"><img src="{product.image_url}" style="max-width:100%; border-radius:12px; background:#fff; padding:10px;"></div>
                <div style="flex:1.5;">
                    <h3 style="color:#3b82f6;">{product.name}</h3>
                    <p style="font-size:2em; font-weight:800; color:#ef4444;">{product.price:,}円</p>
                    <div style="display:flex; flex-direction:column; gap:10px;">
                        <a href="{affiliate_url}" target="_blank" style="background:#ef4444; color:#fff; text-align:center; padding:15px; border-radius:10px; text-decoration:none; font-weight:bold;">公式サイトで見る</a>
                        <a href="{bic_url}" style="background:#475569; color:#fff; text-align:center; padding:12px; border-radius:10px; text-decoration:none;">詳細スペックを確認</a>
                    </div>
                </div>
            </div>
        </div>"""

        full_wp_content = f"{summary_block}\n{main_body}\n{card_block}"

        # WP投稿実行
        wp_payload = {
            "title": title, "content": full_wp_content, "status": "publish",
            "featured_media": media_id, "categories": [c for c in target_cats if c], "tags": [t for t in target_tags if t]
        }
        
        try:
            wp_res = requests.post(WP_POST_URL, json=wp_payload, auth=AUTH, timeout=30)
            if wp_res.status_code == 201:
                product.is_posted = True
                product.save()
                self.stdout.write(self.style.SUCCESS(f"✅ 投稿完了: {title} (Key: {api_key[:8]}...)"))
            else:
                self.stdout.write(self.style.ERROR(f"❌ WPエラー: {wp_res.status_code}"))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"❌ 投稿失敗: {str(e)}"))