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

# === API設定 ===
GEMINI_API_KEY = "AIzaSyC080GbwuffBIgwq0_lNoJ25BIHQYJ3tRs"

# === レート制限の設定 ===
# Gemma 3系統(RPD 14,400)を活用するため並列数を調整
MAX_WORKERS = 2       # 503エラー抑制のため控えめに設定
SAFE_RPM_LIMIT = 15   # 1分間に15リクエスト程度
INTERVAL = 60 / SAFE_RPM_LIMIT

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROMPT_BASE_DIR = os.path.join(BASE_DIR, "prompt")

class Command(BaseCommand):
    help = '並立処理と流量制限を用いて、PC製品をAI解析する（Gemma 3 / Gemini 2.5 対応版）'

    def add_arguments(self, parser):
        parser.add_argument('unique_id', type=str, nargs='?')
        parser.add_argument('--limit', type=int, default=1, help='処理件数')
        parser.add_argument('--maker', type=str, help='メーカー指定')
        # リモート側の変更から引数機能を取り込み
        parser.add_argument('--model', type=str, help='使用するGeminiモデルID')

    def load_prompt_file(self, filename):
        path = os.path.join(PROMPT_BASE_DIR, filename)
        try:
            with open(path, 'r', encoding='utf-8') as f:
                return f.read()
        except FileNotFoundError:
            return ""

    def handle(self, *args, **options):
        unique_id = options['unique_id']
        limit = options['limit']
        maker_arg = options['maker']
        model_arg = options['model']

        query = PCProduct.objects.filter(last_spec_parsed_at__isnull=True)
        if unique_id:
            query = PCProduct.objects.filter(unique_id=unique_id)
        elif maker_arg:
            query = query.filter(maker__iexact=maker_arg)

        products = list(query[:limit])
        if not products:
            self.stdout.write(self.style.WARNING("対象製品が見つかりませんでした。"))
            return

        # モデル選択ロジック: 引数優先 > ファイル1行目 > デフォルト
        if model_arg:
            model_id = model_arg
        else:
            models_content = self.load_prompt_file('ai_models.txt')
            model_id = models_content.split('\n')[0].strip() if models_content else "gemma-3-27b-it"

        self.stdout.write(self.style.SUCCESS(f"🚀 解析開始: 全 {len(products)} 件 / モデル: {model_id}"))
        self.stdout.write(f"📊 設定: {MAX_WORKERS}並列 / 目標RPM: {SAFE_RPM_LIMIT}\n")

        self.counter = 0
        with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
            future_to_product = {}
            for product in products:
                time.sleep(INTERVAL) 
                self.counter += 1
                future = executor.submit(self.analyze_product, product, maker_arg, model_id, self.counter, len(products))
                future_to_product[future] = product

            for future in as_completed(future_to_product):
                product = future_to_product[future]
                try:
                    future.result()
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f"❌ 致命的エラー ({product.unique_id}): {str(e)}"))

    def analyze_product(self, product, maker_arg, model_id, count, total):
        base_pc_prompt = self.load_prompt_file('analyze_pc_prompt.txt')
        target_maker = (maker_arg or product.maker or "standard").lower()
        maker_prompt_file = f"analyze_{target_maker}_prompt.txt"
        brand_rules = self.load_prompt_file(maker_prompt_file)

        if not brand_rules:
            brand_rules = "【標準ルール】名称や型番からスペックを論理的に推論してください。"

        try:
            # HEAD側のリッチな数値フォーマットを採用
            formatted_base = base_pc_prompt.format(
                maker=product.maker, 
                name=product.name, 
                price=f"{product.price:,}",
                description=product.description
            )
        except:
            formatted_base = base_pc_prompt

        full_prompt = f"{formatted_base}\n\nブランドルール:\n{brand_rules}"

        api_url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_id}:generateContent?key={GEMINI_API_KEY}"
        
        try:
            current_time = datetime.now().strftime("%H:%M:%S")
            self.stdout.write(f"[{current_time}] 📤 リクエスト ({count}/{total}): {product.name}")

            response = requests.post(api_url, json={
                "contents": [{"parts": [{"text": full_prompt}]}],
                "generationConfig": {"temperature": 0.3}
            }, timeout=120)
            
            # 503リトライ対応ロジックを採用
            if response.status_code in [429, 500, 503]:
                wait_time = 30 if response.status_code == 429 else 10
                self.stdout.write(self.style.WARNING(f"⏳ サーバー一時エラー ({response.status_code})。{wait_time}秒待機してリトライ..."))
                time.sleep(wait_time)
                return self.analyze_product(product, maker_arg, model_id, count, total)
            
            response.raise_for_status()
            res_json = response.json()
            full_text = res_json['candidates'][0]['content']['parts'][0]['text']

            # --- データ抽出 ---
            spec_data = {}
            spec_match = re.search(r'\[SPEC_JSON\](.*?)\[/SPEC_JSON\]', full_text, re.DOTALL)
            if spec_match:
                try:
                    spec_data = json.loads(spec_match.group(1).strip())
                except:
                    # リモート側の簡易クリーンアップ案も念のため内部で考慮
                    try:
                        clean_json = re.sub(r'//.*', '', spec_match.group(1).strip())
                        spec_data = json.loads(clean_json)
                    except:
                        self.stdout.write(self.style.WARNING(f"⚠️ JSONパース失敗 ({product.unique_id})"))

            summary_match = re.search(r'\[SUMMARY_DATA\](.*?)\[/SUMMARY_DATA\]', full_text, re.DOTALL)
            summary_text = summary_match.group(1).strip() if summary_match else ""

            html_content = re.sub(r'\[SUMMARY_DATA\].*?\[/SUMMARY_DATA\]', '', full_text, flags=re.DOTALL)
            html_content = re.sub(r'\[SPEC_JSON\].*?\[/SPEC_JSON\]', '', html_content, flags=re.DOTALL).strip()

            # 数値変換の安全ガード
            def safe_int(val, default=0):
                try: return int(re.sub(r'[^0-9]', '', str(val))) if val else default
                except: return default

            product.cpu_model = spec_data.get('cpu_model', product.cpu_model)
            product.gpu_model = spec_data.get('gpu_model', product.gpu_model)
            product.memory_gb = safe_int(spec_data.get('memory_gb'), product.memory_gb)
            product.storage_gb = safe_int(spec_data.get('storage_gb'), product.storage_gb)
            product.display_info = spec_data.get('display_info', product.display_info)
            product.spec_score = safe_int(spec_data.get('spec_score'), 0)
            product.is_ai_pc = spec_data.get('is_ai_pc', False)
            
            try:
                product.npu_tops = float(spec_data.get('npu_tops', 0.0))
            except:
                product.npu_tops = 0.0

            product.cpu_socket = spec_data.get('cpu_socket')
            product.motherboard_chipset = spec_data.get('chipset')
            product.ram_type = spec_data.get('ram_type')
            product.power_recommendation = safe_int(spec_data.get('power_wattage'), None)
            
            product.ai_summary = summary_text
            product.ai_content = html_content
            product.target_segment = spec_data.get('target_segment')
            product.last_spec_parsed_at = timezone.now()
            product.save()

            self.stdout.write(self.style.SUCCESS(f" ✅ 解析完了: {product.unique_id}"))

        except Exception as e:
            self.stdout.write(self.style.ERROR(f"❌ 解析失敗 ({product.unique_id}): {str(e)}"))