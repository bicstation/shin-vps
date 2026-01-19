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

# API設定
GEMINI_API_KEY = "AIzaSyC080GbwuffBIgwq0_lNoJ25BIHQYJ3tRs"

# レート制限の設定
MAX_WORKERS = 5       # 並列リクエスト数
SAFE_RPM_LIMIT = 25   # 1分間に送る最大リクエスト数
INTERVAL = 60 / SAFE_RPM_LIMIT  # 1リクエストあたりの最低待機時間（秒）

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROMPT_BASE_DIR = os.path.join(BASE_DIR, "prompt")

class Command(BaseCommand):
    help = '並列処理と流量制限を用いて、PC製品をAI解析する（モデル指定対応版）'

    def add_arguments(self, parser):
        parser.add_argument('unique_id', type=str, nargs='?')
        parser.add_argument('--limit', type=int, default=1, help='処理件数')
        parser.add_argument('--maker', type=str, help='メーカー指定')
        # --model 引数を追加
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

        # 1. 解析対象のクエリ構築
        query = PCProduct.objects.filter(last_spec_parsed_at__isnull=True)
        if unique_id:
            query = PCProduct.objects.filter(unique_id=unique_id)
        elif maker_arg:
            query = query.filter(maker__iexact=maker_arg)

        products = list(query[:limit])
        if not products:
            self.stdout.write(self.style.WARNING("対象製品が見つかりませんでした。"))
            return

        # 2. モデルIDの決定ロジック
        # 引数があれば優先、なければai_models.txtの1行目、それもなければ1.5-flashをデフォルトに
        if model_arg:
            model_id = model_arg
        else:
            models_content = self.load_prompt_file('ai_models.txt')
            if models_content:
                model_id = models_content.split('\n')[0].strip()
            else:
                model_id = "gemini-1.5-flash"

        self.stdout.write(self.style.SUCCESS(f"🚀 解析開始: 全 {len(products)} 件 / モデル: {model_id}"))
        self.stdout.write(f"📊 設定: {MAX_WORKERS}並列 / 安全RPM制限: {SAFE_RPM_LIMIT}\n")

        self.counter = 0

        with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
            future_to_product = {}
            
            for product in products:
                # RPM制限のための待機
                time.sleep(INTERVAL) 
                
                self.counter += 1
                current_time = datetime.now().strftime("%H:%M:%S")
                self.stdout.write(f"[{current_time}] 📤 リクエスト投入 ({self.counter}/{len(products)}): {product.name}")
                
                future = executor.submit(self.analyze_product, product, maker_arg, model_id, self.counter)
                future_to_product[future] = product

            for future in as_completed(future_to_product):
                product = future_to_product[future]
                try:
                    future.result()
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f"❌ 致命的エラー ({product.unique_id}): {str(e)}"))

    def analyze_product(self, product, maker_arg, model_id, count):
        """1件の製品をAIで解析・保存する"""
        
        base_pc_prompt = self.load_prompt_file('analyze_pc_prompt.txt')
        target_maker = (maker_arg or product.maker or "standard").lower()
        maker_prompt_file = f"analyze_{target_maker}_prompt.txt"
        brand_rules = self.load_prompt_file(maker_prompt_file)

        if not brand_rules:
            brand_rules = "【標準ルール】名称や型番からスペックを論理的に推論してください。"

        try:
            # プロンプトの組み立て
            formatted_base = base_pc_prompt.format(
                maker=product.maker, 
                name=product.name, 
                price=product.price, 
                description=product.description
            )
        except Exception:
            formatted_base = base_pc_prompt

        full_prompt = (
            f"{formatted_base}\n\n"
            "必ず以下のタグを含めて出力してください。\n"
            "[SUMMARY_DATA]ここに製品の要約[/SUMMARY_DATA]\n"
            "[SPEC_JSON]{\"cpu_model\": \"...\", ...}[/SPEC_JSON]\n\n"
            f"ブランド個別ルール:\n{brand_rules}"
        )

        api_url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_id}:generateContent?key={GEMINI_API_KEY}"
        
        try:
            response = requests.post(api_url, json={
                "contents": [{"parts": [{"text": full_prompt}]}],
                "generationConfig": {
                    "temperature": 0.2,
                    "responseMimeType": "text/plain"
                }
            }, timeout=90)
            
            if response.status_code == 429:
                self.stdout.write(self.style.WARNING(f"⏳ Rate Limit 到着 ({product.unique_id})。30秒待機してリトライします..."))
                time.sleep(30)
                return self.analyze_product(product, maker_arg, model_id, count)
            
            response.raise_for_status()
            res_json = response.json()
            
            # APIのレスポンス構造からテキストを抽出
            if 'candidates' in res_json and res_json['candidates']:
                full_text = res_json['candidates'][0]['content']['parts'][0]['text']
            else:
                raise Exception(f"APIレスポンスが空です: {res_json}")

            # --- データ抽出 ---
            spec_data = {}
            spec_match = re.search(r'\[SPEC_JSON\](.*?)\[/SPEC_JSON\]', full_text, re.DOTALL)
            if spec_match:
                try:
                    spec_data = json.loads(spec_match.group(1).strip())
                except json.JSONDecodeError:
                    # JSONが壊れている場合の簡易クリーンアップ
                    clean_json = re.sub(r'//.*', '', spec_match.group(1).strip())
                    spec_data = json.loads(clean_json)

            summary_match = re.search(r'\[SUMMARY_DATA\](.*?)\[/SUMMARY_DATA\]', full_text, re.DOTALL)
            summary_text = summary_match.group(1).strip() if summary_match else ""

            # 本文（HTMLコンテンツ）の抽出
            html_content = re.sub(r'\[SUMMARY_DATA\].*?\[/SUMMARY_DATA\]', '', full_text, flags=re.DOTALL)
            html_content = re.sub(r'\[SPEC_JSON\].*?\[/SPEC_JSON\]', '', html_content, flags=re.DOTALL).strip()

            # --- DB保存 ---
            product.cpu_model = spec_data.get('cpu_model', product.cpu_model)
            product.gpu_model = spec_data.get('gpu_model', product.gpu_model)
            product.memory_gb = spec_data.get('memory_gb', product.memory_gb)
            product.storage_gb = spec_data.get('storage_gb', product.storage_gb)
            product.display_info = spec_data.get('display_info', product.display_info)
            product.spec_score = spec_data.get('spec_score', 0)
            product.is_ai_pc = spec_data.get('is_ai_pc', False)
            product.npu_tops = spec_data.get('npu_tops', 0.0)
            product.cpu_socket = spec_data.get('cpu_socket')
            product.motherboard_chipset = spec_data.get('chipset')
            product.ram_type = spec_data.get('ram_type')
            product.power_recommendation = spec_data.get('power_wattage')
            product.ai_summary = summary_text
            product.ai_content = html_content
            product.target_segment = spec_data.get('target_segment')
            product.last_spec_parsed_at = timezone.now()
            product.save()

            done_time = datetime.now().strftime("%H:%M:%S")
            self.stdout.write(self.style.SUCCESS(f"[{done_time}] ✅ 解析完了 ({count}): {product.unique_id}"))

        except Exception as e:
            self.stdout.write(self.style.ERROR(f"❌ 解析失敗 ({product.unique_id}): {str(e)}"))