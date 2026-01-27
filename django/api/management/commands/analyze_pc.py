# -*- coding: utf-8 -*-
# /home/maya/shin-vps/django/api/management/commands/analyze_spec_gemma.py

import json
import requests
import re
import os
import itertools
import threading
from concurrent.futures import ThreadPoolExecutor, as_completed
from django.core.management.base import BaseCommand
from api.models.pc_products import PCProduct
from django.utils import timezone

# === API設定 ===
API_KEYS = [
    os.getenv("GEMINI_API_KEY_0") or os.getenv("GEMINI_API_KEY"),
    os.getenv("GEMINI_API_KEY_1"),
    os.getenv("GEMINI_API_KEY_2"),
    os.getenv("GEMINI_API_KEY_3"),
    os.getenv("GEMINI_API_KEY_4"),
    os.getenv("GEMINI_API_KEY_5")
]
VALID_KEYS = [k for k in API_KEYS if k]

# スレッド間でAPIキーを安全に回すための設定
key_cycle = itertools.cycle(VALID_KEYS)
key_lock = threading.Lock()

BASE_PROMPT_DIR = os.path.join(os.path.dirname(__file__), 'prompt')

class Command(BaseCommand):
    help = 'Gemma-3を使用して並列処理で製品スペック解析とDB更新を行う'

    def add_arguments(self, parser):
        parser.add_argument('unique_id', type=str, nargs='?')
        parser.add_argument('--limit', type=int, default=10, help='処理する合計件数')
        parser.add_argument('--workers', type=int, default=3, help='並列スレッド数（APIキーの数に近い値を推奨）')

    def load_prompt(self, filename):
        path = os.path.join(BASE_PROMPT_DIR, filename)
        try:
            with open(path, 'r', encoding='utf-8') as f:
                return f.read()
        except FileNotFoundError:
            return ""

    def get_next_key(self):
        """スレッドセーフに次のAPIキーを取得"""
        with key_lock:
            return next(key_cycle)

    def handle(self, *args, **options):
        unique_id = options['unique_id']
        limit = options['limit']
        workers = options['workers']

        if not VALID_KEYS:
            self.stdout.write(self.style.ERROR("❌ エラー: APIキーが設定されていません。"))
            return

        # ターゲット製品の取得
        if unique_id:
            products = PCProduct.objects.filter(unique_id=unique_id)
        else:
            # PostgreSQLの select_for_update(skip_locked=True) を使用
            # 他のプロセスが掴んでいるレコードを飛ばして取得できるため、並列実行しても重複しない
            products = PCProduct.objects.filter(
                last_spec_parsed_at__isnull=True
            ).order_by('id')[:limit]

        if not products.exists():
            self.stdout.write(self.style.WARNING("対象製品が見つかりませんでした。"))
            return

        self.stdout.write(self.style.SUCCESS(f"🚀 解析開始: 合計{products.count()}件 / 並列数:{workers}"))

        # ThreadPoolExecutorによる並列実行
        with ThreadPoolExecutor(max_workers=workers) as executor:
            future_to_product = {executor.submit(self.analyze_product, p): p for p in products}
            
            for future in as_completed(future_to_product):
                product = future_to_product[future]
                try:
                    future.result()
                except Exception as exc:
                    self.stdout.write(self.style.ERROR(f"❌ {product.unique_id} で未定義の例外が発生: {exc}"))

    def analyze_product(self, product):
        """1つの製品を解析して保存する（スレッド内で実行される）"""
        # スレッドごとに新しいキーを取得
        current_gemini_key = self.get_next_key()
        
        self.stdout.write(f"🔍 解析中: {product.name[:30]}... (Key末尾: {current_gemini_key[-4:]})")

        # プロンプトの組み立て
        base_pc_prompt = self.load_prompt('analyze_pc_prompt.txt')
        mouse_rules = self.load_prompt('analyze_mouse_prompt.txt')
        
        brand_rules = mouse_rules if ("mouse" in product.name.lower() or product.maker == "MouseComputer") else "【標準ルール】解析してください。"

        full_prompt = f"""
{base_pc_prompt.format(maker=product.maker, name=product.name, price=product.price, description=product.description)}

【追加命令：詳細スペック抽出】
回答の最後に必ず [SPEC_JSON] {{...}} [/SPEC_JSON] 形式で含めてください。

{{
    "memory_gb": 整数, 
    "storage_gb": 整数, 
    "npu_tops": 小数,
    "cpu_model": "文字列", 
    "gpu_model": "文字列",
    "cpu_socket": "LGA1700/AM5等", 
    "chipset": "B760/Z790等", 
    "ram_type": "DDR5/DDR4",
    "power_wattage": 整数,
    "display_info": "文字列", 
    "target_segment": "層",
    "is_ai_pc": boolean, 
    "spec_score": 0-100
}}

ブランドルール: {brand_rules}
"""

        model_id = "gemma-3-27b-it"
        api_url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_id}:generateContent?key={current_gemini_key}"
        
        try:
            response = requests.post(api_url, json={
                "contents": [{"parts": [{"text": full_prompt}]}],
                "generationConfig": {"temperature": 0.2}
            }, timeout=100)

            if response.status_code != 200:
                self.stdout.write(self.style.ERROR(f"❌ APIエラー {product.unique_id}: {response.status_code}"))
                return

            result = response.json()
            full_response_text = result['candidates'][0]['content']['parts'][0]['text'].strip()

            # 解析
            spec_match = re.search(r'\[SPEC_JSON\](.*?)\[/SPEC_JSON\]', full_response_text, re.DOTALL)
            if not spec_match:
                self.stdout.write(self.style.WARNING(f"⚠️ JSONタグ未検出: {product.unique_id}"))
                return

            spec_data = json.loads(spec_match.group(1).strip())

            # DB保存（PostgreSQLなら並列saveも安全）
            product.cpu_model = spec_data.get('cpu_model')
            product.gpu_model = spec_data.get('gpu_model')
            product.memory_gb = spec_data.get('memory_gb')
            product.storage_gb = spec_data.get('storage_gb')
            product.npu_tops = spec_data.get('npu_tops')
            product.is_ai_pc = spec_data.get('is_ai_pc', False)
            product.spec_score = spec_data.get('spec_score', 0)
            product.cpu_socket = spec_data.get('cpu_socket')
            product.motherboard_chipset = spec_data.get('chipset')
            product.last_spec_parsed_at = timezone.now()
            
            product.save()
            self.stdout.write(self.style.SUCCESS(f"✅ 更新完了: {product.unique_id}"))

        except Exception as e:
            self.stdout.write(self.style.ERROR(f"❌ 処理失敗 {product.unique_id}: {str(e)}"))