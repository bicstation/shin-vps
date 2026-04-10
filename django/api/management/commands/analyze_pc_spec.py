# -*- coding: utf-8 -*-
# /home/maya/shin-vps/django/api/management/commands/analyze_pc_spec.py

import json
import requests
import re
import os
import time
import itertools
import threading
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor, as_completed
from django.core.management.base import BaseCommand
from api.models.pc_products import PCProduct
from django.utils import timezone
from django.db.models import Q

# === APIキー設定 (10個のキーに対応) ===
API_KEYS = [os.getenv(f"GEMINI_API_KEY_{i}", "") for i in range(10)]
LEGACY_KEY = os.getenv("GEMINI_API_KEY", "AIzaSyC080GbwuffBIgwq0_lNoJ25BIHQYJ3tRs")
if LEGACY_KEY not in API_KEYS:
    API_KEYS.append(LEGACY_KEY)

VALID_KEYS = [k for k in API_KEYS if k and len(k) > 10]

# スレッドセーフなキーローテーション
class ThreadSafeIter:
    def __init__(self, it):
        self.it = it
        self.lock = threading.Lock()
    def __iter__(self): return self
    def __next__(self):
        with self.lock:
            return next(self.it)

key_cycle = ThreadSafeIter(itertools.cycle(VALID_KEYS))

# === レート制限の設定 ===
MAX_WORKERS = len(VALID_KEYS) if len(VALID_KEYS) > 0 else 1
SAFE_KEY_RPM = 6  
SAFE_TOTAL_RPM = len(VALID_KEYS) * SAFE_KEY_RPM
INTERVAL = 60 / SAFE_TOTAL_RPM if SAFE_TOTAL_RPM > 0 else 2.0

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROMPT_BASE_DIR = os.path.join(BASE_DIR, "prompt")

class Command(BaseCommand):
    help = '10個のAPIキーをローテーションし、既存・新規問わずSEOタイトルとスペックを更新する'

    def add_arguments(self, parser):
        parser.add_argument('unique_id', type=str, nargs='?')
        parser.add_argument('--limit', type=int, default=1, help='処理件数')
        parser.add_argument('--maker', type=str, help='メーカー指定')
        parser.add_argument('--model', type=str, help='GeminiモデルID')
        parser.add_argument('--force', action='store_true', help='強制再解析')
        parser.add_argument('--null-only', action='store_true', help='未解析のみ対象')
        # 💡 既存の行（解析済み）もSEOタイトルのために更新対象にするオプション
        parser.add_argument('--update-all', action='store_true', help='解析済みも含め全件をSEOタイトル更新対象にする')

    def load_prompt_file(self, filename):
        path = os.path.join(PROMPT_BASE_DIR, filename)
        try:
            with open(path, 'r', encoding='utf-8') as f: return f.read()
        except FileNotFoundError: return ""

    def get_maker_slug(self, maker_name):
        if not maker_name: return "standard"
        m = str(maker_name).lower()
        mapping = {
            'fmv': 'fmv', 'fujitsu': 'fmv', '富士通': 'fmv',
            'dynabook': 'dynabook', 'asus': 'asus', 'hp': 'hp',
            'dell': 'dell', 'lenovo': 'lenovo', 'mouse': 'mouse',
            'nec': 'nec', 'ark': 'ark'
        }
        for k, v in mapping.items():
            if k in m: return v
        return "standard"

    def handle(self, *args, **options):
        if not VALID_KEYS:
            self.stdout.write(self.style.ERROR("❌ 有効なAPIキーがありません。"))
            return

        query = PCProduct.objects.all()

        # --- 💡 クエリフィルタの動的切り替え ---
        if options['update_all']:
            # 全件を対象（解析済みであってもSEOタイトルのために回す）
            self.stdout.write(self.style.WARNING("⚠️ --update-all モード: 既存の解析済みデータも更新対象です。"))
        elif options['null_only']:
            query = query.filter(last_spec_parsed_at__isnull=True)
        elif not options['force']:
            # デフォルト：未解析、またはスコアが0のもののみ
            query = query.filter(
                Q(last_spec_parsed_at__isnull=True) | Q(score_cpu=0) | Q(score_ai=0)
            )

        if options['unique_id']:
            query = query.filter(unique_id=options['unique_id'])
        elif options['maker']:
            query = query.filter(maker__icontains=options['maker'])

        products = list(query[:options['limit']])
        if not products:
            self.stdout.write(self.style.WARNING("🔎 対象製品が見つかりませんでした。"))
            return

        model_id = options['model'] or (self.load_prompt_file('ai_models.txt').split('\n')[0].strip() or "gemini-1.5-flash")

        self.stdout.write(self.style.SUCCESS(
            f"🚀 解析開始: 全 {len(products)} 件 (Workers: {MAX_WORKERS} / Model: {model_id})"
        ))

        self.counter = 0
        with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
            future_to_product = {}
            for i, product in enumerate(products):
                if i > 0: time.sleep(INTERVAL) 
                self.counter += 1
                future = executor.submit(self.analyze_product, product, model_id, self.counter, len(products))
                future_to_product[future] = product

            for future in as_completed(future_to_product):
                try:
                    future.result()
                except Exception as e:
                    p = future_to_product[future]
                    self.stdout.write(self.style.ERROR(f"❌ 致命的エラー ({p.unique_id}): {str(e)}"))

    def analyze_product(self, product, model_id, count, total, retry_count=0):
        current_api_key = next(key_cycle)
        key_hint = current_api_key[-4:]

        base_pc_prompt = self.load_prompt_file('analyze_pc_prompt.txt') or "メーカー:{maker}\n製品名:{name}\n価格:{price}\n説明:{description}\n上記を解析せよ。"
        target_maker_slug = self.get_maker_slug(product.maker)
        brand_rules = self.load_prompt_file(f"analyze_{target_maker_slug}_prompt.txt") or self.load_prompt_file('analyze_pc_prompt.txt')
        
        structure_instruction = """
必ず以下のJSON形式を [SPEC_JSON] タグ内に含めてください。
[SPEC_JSON]
{
  "seo_title": "【元の製品名を先頭に維持】したまま、後ろに最強スペックと魅力を付け足した45〜55文字のタイトル",
  "cpu_model": "型番",
  "gpu_model": "型番",
  "memory_gb": 数値,
  "storage_gb": 数値,
  "display_info": "15.6型 4K等",
  "is_ai_pc": bool,
  "npu_tops": 数値,
  "score_cpu": 1-100,
  "score_gpu": 1-100,
  "score_cost": 1-100,
  "score_portable": 1-100,
  "score_ai": 1-100,
  "os_support": "Windows 11等",
  "is_download": bool,
  "license_term": "永続/3年等",
  "device_count": 数値,
  "edition": "Pro/Home等",
  "cpu_socket": "LGA1700等",
  "chipset": "Z790等",
  "ram_type": "DDR5等",
  "power_wattage": 数値,
  "spec_score": 1-100,
  "target_segment": "ゲーミング/ビジネス等"
}
[/SPEC_JSON]

紹介文（HTML形式）の後に [SUMMARY_DATA] タグを入れてください。
[SUMMARY_DATA]
POINT1: 特徴1
POINT2: 特徴2
POINT3: 特徴3
TARGET: おすすめ対象
[/SUMMARY_DATA]
"""
        formatted_base = base_pc_prompt.replace("{maker}", str(product.maker))\
                                       .replace("{name}", str(product.name))\
                                       .replace("{price}", f"{product.price or 0:,}")\
                                       .replace("{description}", str(product.description or ""))

        full_prompt = f"{formatted_base}\n\nブランド別ルール:\n{brand_rules}\n\n{structure_instruction}"
        api_url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_id}:generateContent?key={current_api_key}"
        
        try:
            response = requests.post(api_url, json={
                "contents": [{"parts": [{"text": full_prompt}]}],
                "generationConfig": {"temperature": 0.2}
            }, timeout=120)
            
            if response.status_code in [429, 500, 503, 504]:
                if retry_count < 3:
                    time.sleep(15)
                    return self.analyze_product(product, model_id, count, total, retry_count + 1)
                return

            response.raise_for_status()
            res_json = response.json()
            full_text = res_json['candidates'][0]['content']['parts'][0]['text']

            # --- JSON抽出 ---
            spec_data = {}
            spec_match = re.search(r'\[SPEC_JSON\](.*?)\[/SPEC_JSON\]', full_text, re.DOTALL)
            if spec_match:
                try:
                    clean_json = re.sub(r'//.*', '', spec_match.group(1).strip())
                    spec_data = json.loads(clean_json.replace('、', ',').replace('：', ':'))
                except: pass

            summary_match = re.search(r'\[SUMMARY_DATA\](.*?)\[/SUMMARY_DATA\]', full_text, re.DOTALL)
            summary_text = summary_match.group(0).strip() if summary_match else ""

            # --- 💡 SEOタイトル更新 ---
            new_title = spec_data.get('seo_title')
            if new_title and len(new_title) > 10:
                product.name = new_title

            # --- フィールド保存 ---
            def safe_int(val, default=0):
                try:
                    num = re.sub(r'[^0-9]', '', str(val))
                    return int(num) if num else default
                except: return default

            product.cpu_model = spec_data.get('cpu_model', product.cpu_model)
            product.gpu_model = spec_data.get('gpu_model', product.gpu_model)
            product.memory_gb = safe_int(spec_data.get('memory_gb'), product.memory_gb)
            product.storage_gb = safe_int(spec_data.get('storage_gb'), product.storage_gb)
            product.score_cpu = safe_int(spec_data.get('score_cpu'), 0)
            product.score_gpu = safe_int(spec_data.get('score_gpu'), 0)
            product.score_cost = safe_int(spec_data.get('score_cost'), 0)
            product.score_portable = safe_int(spec_data.get('score_portable'), 0)
            product.score_ai = safe_int(spec_data.get('score_ai'), 0)
            product.is_ai_pc = spec_data.get('is_ai_pc', False)
            product.ai_summary = summary_text
            product.ai_content = f"{summary_text}\n\n{full_text}" # HTML部分はfull_textから抽出等、適宜調整
            product.last_spec_parsed_at = timezone.now()
            
            product.save()
            self.stdout.write(self.style.SUCCESS(f" ✅ 更新完了 ({count}/{total}): {product.unique_id}"))

        except Exception as e:
            self.stdout.write(self.style.ERROR(f"❌ 解析失敗 ({product.unique_id}): {str(e)}"))