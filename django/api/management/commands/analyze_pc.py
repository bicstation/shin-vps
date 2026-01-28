# -*- coding: utf-8 -*-
import json
import requests
import re
import os
import time
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor, as_completed
from django.core.management.base import BaseCommand
from api.models.pc_products import PCProduct
from django.utils import timezone
from django.db.models import Q

# === APIキー設定（環境変数から6つのキーを取得） ===
API_KEYS = [
    os.getenv("GEMINI_API_KEY"),
    os.getenv("GEMINI_API_KEY_1"),
    os.getenv("GEMINI_API_KEY_2"),
    os.getenv("GEMINI_API_KEY_3"),
    os.getenv("GEMINI_API_KEY_4"),
    os.getenv("GEMINI_API_KEY_5"),
]
# 有効なキーのみを抽出
ACTIVE_KEYS = [k for k in API_KEYS if k]

# === 並列処理の最適化 ===
# キーの数と同じ数だけスレッドを立て、各キーを並列でフル稼働させる
MAX_WORKERS = len(ACTIVE_KEYS) if ACTIVE_KEYS else 1
BASE_PROMPT_DIR = os.path.join(os.path.dirname(__file__), 'prompt')

class Command(BaseCommand):
    help = '環境変数の複数キーを用いて並列解析を行い、スペック抽出とHTML記事生成、ランキング反映を行う'

    def add_arguments(self, parser):
        parser.add_argument('unique_id', type=str, nargs='?')
        parser.add_argument('--limit', type=int, default=1, help='処理する最大件数')
        parser.add_argument('--force', action='store_true', help='解析済みも再解析する')

    def load_prompt(self, filename):
        path = os.path.join(BASE_PROMPT_DIR, filename)
        try:
            with open(path, 'r', encoding='utf-8') as f:
                return f.read()
        except FileNotFoundError:
            return ""

    def handle(self, *args, **options):
        if not ACTIVE_KEYS:
            self.stdout.write(self.style.ERROR("❌ 環境変数にAPIキーが設定されていません。"))
            return

        unique_id = options['unique_id']
        limit = options['limit']
        force = options['force']

        # 1. 解析対象の抽出
        if unique_id:
            products = PCProduct.objects.filter(unique_id=unique_id)
        else:
            query = PCProduct.objects.all()
            if not force:
                # 未解析、またはスコアが0のものを優先
                query = query.filter(Q(last_spec_parsed_at__isnull=True) | Q(spec_score=0))
            products = query[:limit]

        if not products.exists():
            self.stdout.write(self.style.WARNING("🔎 対象製品が見つかりませんでした。"))
            return

        self.stdout.write(self.style.SUCCESS(f"🚀 解析開始: {len(products)}件 / キー数: {len(ACTIVE_KEYS)} / 並列数: {MAX_WORKERS}"))

        # 2. ThreadPoolExecutorによる並列実行
        with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
            future_to_product = {}
            for i, product in enumerate(products):
                # インデックスに応じてAPIキーを割り当て（Round Robin）
                api_key = ACTIVE_KEYS[i % len(ACTIVE_KEYS)]
                
                # リクエストの集中を避けるため、わずかに開始をずらす
                delay = (i % MAX_WORKERS) * 0.8
                
                future = executor.submit(self.analyze_product_task, product, api_key, i+1, len(products), delay)
                future_to_product[future] = product

            for future in as_completed(future_to_product):
                try:
                    future.result()
                except Exception as e:
                    p = future_to_product[future]
                    self.stdout.write(self.style.ERROR(f"❌ 致命的エラー ({p.unique_id}): {str(e)}"))

    def analyze_product_task(self, product, api_key, count, total, delay=0):
        if delay > 0:
            time.sleep(delay)

        self.stdout.write(f"📤 解析中 ({count}/{total}): {product.name} (Key: {api_key[:8]}...)")

        # プロンプト読み込み
        base_pc_prompt = self.load_prompt('analyze_pc_prompt.txt')
        mouse_rules = self.load_prompt('analyze_mouse_prompt.txt')
        
        brand_rules = mouse_rules if "mouse" in product.name.lower() or product.maker == "MouseComputer" else "【標準ルール】正確に解析してください。"

        full_prompt = f"""
{base_pc_prompt.format(maker=product.maker, name=product.name, price=product.price, description=product.description)}

【追加命令：詳細スペック抽出】
以下のJSONを必ず [SPEC_JSON] {{...}} [/SPEC_JSON] の形式で含めてください。
また、ランキング用に5つの評価軸（1-100）を厳格に採点してください。

{{
    "memory_gb": 整数, 
    "storage_gb": 整数, 
    "npu_tops": 小数,
    "cpu_model": "...", 
    "gpu_model": "...",
    "cpu_socket": "...", 
    "chipset": "...", 
    "ram_type": "...",
    "power_wattage": 整数,
    "display_info": "...", 
    "target_segment": "...",
    "is_ai_pc": boolean,
    "score_cpu": 1-100,
    "score_gpu": 1-100,
    "score_cost": 1-100,
    "score_portable": 1-100,
    "score_ai": 1-100
}}

ブランド固有ルール:
{brand_rules}
"""

        # APIリクエスト (Gemma-3を使用)
        model_id = "gemma-3-27b-it"
        api_url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_id}:generateContent?key={api_key}"
        
        try:
            response = requests.post(api_url, json={
                "contents": [{"parts": [{"text": full_prompt}]}],
                "generationConfig": {"temperature": 0.2}
            }, timeout=100)
            
            if response.status_code == 429:
                self.stdout.write(self.style.WARNING(f"⚠️ リミット到達。待機して再試行します。"))
                time.sleep(60)
                return self.analyze_product_task(product, api_key, count, total)

            response.raise_for_status()
            result = response.json()
            full_text = result['candidates'][0]['content']['parts'][0]['text']

            # --- データ抽出 ---
            spec_data = {}
            spec_match = re.search(r'\[SPEC_JSON\](.*?)\[/SPEC_JSON\]', full_text, re.DOTALL)
            if spec_match:
                try:
                    spec_data = json.loads(re.sub(r'//.*', '', spec_match.group(1).strip()))
                except: pass

            def safe_int(val, default=0):
                try: return int(re.sub(r'[^0-9]', '', str(val)))
                except: return default

            # --- スコア算出・ランキング反映 ---
            s_cpu = safe_int(spec_data.get('score_cpu'))
            s_gpu = safe_int(spec_data.get('score_gpu'))
            s_cost = safe_int(spec_data.get('score_cost'))
            s_port = safe_int(spec_data.get('score_portable'))
            s_ai = safe_int(spec_data.get('score_ai'))
            
            # 平均スコアを算出して spec_score に格納
            avg_score = int((s_cpu + s_gpu + s_cost + s_port + s_ai) / 5)

            # DB保存
            product.score_cpu = s_cpu
            product.score_gpu = s_gpu
            product.score_cost = s_cost
            product.score_portable = s_port
            product.score_ai = s_ai
            product.spec_score = avg_score
            
            product.is_active = True  # ランキングに表示
            product.is_posted = True
            
            product.ai_content = full_text
            product.cpu_model = spec_data.get('cpu_model')
            product.gpu_model = spec_data.get('gpu_model')
            product.memory_gb = safe_int(spec_data.get('memory_gb'))
            product.storage_gb = safe_int(spec_data.get('storage_gb'))
            product.cpu_socket = spec_data.get('cpu_socket')
            product.motherboard_chipset = spec_data.get('chipset')
            product.ram_type = spec_data.get('ram_type')
            product.power_recommendation = safe_int(spec_data.get('power_wattage'))
            
            product.last_spec_parsed_at = timezone.now()
            product.save()
            
            self.stdout.write(self.style.SUCCESS(f" ✅ 完了: {product.unique_id} [Score: {avg_score}]"))

        except Exception as e:
            self.stdout.write(self.style.ERROR(f"❌ 失敗 ({product.unique_id}): {str(e)}"))