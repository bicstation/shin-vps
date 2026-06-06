# /home/maya/shin-dev/shin-vps/django/api/management/commands/analyze_pc_ai_summary .py
# -*- coding: utf-8 -*-
import json
import requests
import re
import os
import time
from django.core.management.base import BaseCommand
from api.models.pc_products import PCProduct
from django.utils import timezone
from django.db.models import Q
from django.db import close_old_connections  # 追加: スレッド安全のため
from concurrent.futures import ThreadPoolExecutor, as_completed

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
# MAX_WORKERS = len(ACTIVE_KEYS) if ACTIVE_KEYS else 1
# MAX_WORKERS = 5
MAX_WORKERS = min( 4,len(ACTIVE_KEYS) )
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

        if unique_id:
            products = PCProduct.objects.filter(unique_id=unique_id)
        else:
            query = PCProduct.objects.all()
            
            if not force:

                query = query.filter(
                    Q(ai_summary__isnull=True)
                    |
                    Q(ai_summary="")
                )

                query = query.exclude(
                    cpu_model=""
                )

                query = query.exclude(
                    memory_gb=0
                )

                query = query.exclude(
                    storage_gb=0
                )
 
            products = query[:limit]

        if not products.exists():
            self.stdout.write(self.style.WARNING("🔎 対象製品が見つかりませんでした。"))
            return

        self.stdout.write(self.style.SUCCESS(f"🚀 解析開始: {len(products)}件 / キー数: {len(ACTIVE_KEYS)} / 並列数: {MAX_WORKERS} "))

        with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
            future_to_product = {}
            for i, product in enumerate(products):
                api_key = ACTIVE_KEYS[i % len(ACTIVE_KEYS)]
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
        # 異なるスレッドで古いDB接続を引き継がないようにクローズ
        close_old_connections()

        # model_id = "gemma-4-31b-it"
        # model_id = "gemini-2.5-flash"
        # model_id = "gemma-4-31b-it"
        model_id = "gemini-2.5-flash-lite"
        api_url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_id}:generateContent?key={api_key}"


        if delay > 0:
            time.sleep(delay)

        self.stdout.write(f"📤 解析中 ({count}/{total}): モデル名({model_id})  {product.name} (Key: {api_key[:8]}...)")
        
        full_prompt = f"""
        PCスペックから要約を作成せよ。

        返答はJSONのみ。

        {{
            "summary":"",
            "target_user":"",
            "strengths":[],
            "weaknesses":[],
            "usage_tags":[]
        }}

        CPU:{product.cpu_model}
        GPU:{product.gpu_model}
        MEMORY:{product.memory_gb}
        STORAGE:{product.storage_gb}
        DISPLAY:{product.display_info}
        """
        

        max_retries = 3
        attempt = 0
        
        while attempt < max_retries:
            try:
                response = requests.post(api_url, json={
                    "contents": [{"parts": [{"text": full_prompt}]}],
                    "generationConfig": {
                        "temperature": 0,
                        "responseMimeType": "application/json"
                    }
                }, timeout=100)
                
                if response.status_code == 429:
                    attempt += 1
                    self.stdout.write(self.style.WARNING(f"⚠️ 429 リミット到達 ({product.unique_id})。{attempt}/{max_retries} 回目の待機再試行..."))
                    time.sleep(60)
                    continue

                response.raise_for_status()
                break  # 成功したらループを抜ける
            except Exception as e:
                if attempt >= max_retries - 1:
                    self.stdout.write(self.style.ERROR(f"❌ リクエスト失敗 ({product.unique_id}): {str(e)}"))
                    close_old_connections()
                    print(response.status_code)
                    print(response.text)
                    return
                
                attempt += 1
                time.sleep(5)

        try:
            result = response.json()
            full_text = result['candidates'][0]['content']['parts'][0]['text']
            # print("\n========== SUMMARY RAW ==========")
            # print(full_text)
            # print("================================\n")
  
            # --- データ抽出 ---
  
            json_match = re.search(
                r'\{[\s\S]*\}',
                full_text
            )

            if not json_match:

                self.stdout.write(
                    self.style.WARNING(
                        f"JSON取得失敗: {product.unique_id}"
                    )
                )

                print("\n===== RAW =====")
                print(full_text)
                print("================\n")

                return

            try:

                summary_data = json.loads(
                    json_match.group(0)
                )

            except Exception as e:

                self.stdout.write(
                    self.style.WARNING(
                        f"JSON解析失敗: {product.unique_id} {e}"
                    )
                )

                print("\n===== JSON候補 =====")
                print(json_match.group(0))
                print("===================\n")

                return
            
            # DB保存
           
            product.is_active = True
            product.is_posted = True
            
            product.weaknesses = json.dumps(
                summary_data.get("weaknesses", []),
                ensure_ascii=False
            )

            product.usage_tags = json.dumps(
                summary_data.get("usage_tags", []),
                ensure_ascii=False
            )
            
            product.ai_summary = summary_data.get("summary")
            product.target_user = summary_data.get("target_user")
            product.strengths = summary_data.get("strengths")
            product.weaknesses = summary_data.get("weaknesses")
            product.usage_tags = summary_data.get("usage_tags")
            
            strengths = summary_data.get("strengths", [])

            if not isinstance(strengths, list):
                strengths = [str(strengths)]

            product.strengths = json.dumps(
                strengths,
                ensure_ascii=False
            )
                        
            product.save()
            
            self.stdout.write(self.style.SUCCESS(f" ✅ DB保存完了({count}/{total}): {product.unique_id} [CPU: {product.cpu_model} GPU: {product.gpu_model}]"))

            # --- スコア算出・ランキング反映 ---      
            self.stdout.write(
                f"[{product.unique_id}] "
                f"SUMMARY:{summary_data.get('summary')} | "
                f"TARGET:{summary_data.get('target_user')}"
                f"STRENGTHS:{summary_data.get('strengths')} | "
                f"WEAKNESSES:{summary_data.get('weaknesses')} | "
                f"TAGS:{summary_data.get('usage_tags')}"
                
            )
            self.stdout.write("--------------------------------------------------------------")


        except Exception as e:
            self.stdout.write(self.style.ERROR(f"❌ 解析データ処理失敗 ({product.unique_id}): {str(e)}"))
        finally:
            # 処理終了時にもクリーンアップ
            close_old_connections()