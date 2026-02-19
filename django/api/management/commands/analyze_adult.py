# -*- coding: utf-8 -*-
import json
import requests
import re
import os
import time
import itertools
from datetime import datetime, timedelta
from concurrent.futures import ThreadPoolExecutor, as_completed
from django.core.management.base import BaseCommand
from api.models import AdultProduct
from django.utils import timezone
from django.db.models import Q, Count

# === APIキー設定 ===
API_KEYS = [
    os.getenv("GEMINI_API_KEY"),
    os.getenv("GEMINI_API_KEY_1"),
    os.getenv("GEMINI_API_KEY_2"),
    os.getenv("GEMINI_API_KEY_3"),
    os.getenv("GEMINI_API_KEY_4"),
    os.getenv("GEMINI_API_KEY_5"),
]

VALID_KEYS = [k for k in API_KEYS if k and len(k) > 10]
key_cycle = itertools.cycle(VALID_KEYS)

# === 並列・レート制限設定 ===
MAX_WORKERS = 12
SAFE_RPM_LIMIT = 50 
INTERVAL = 60 / SAFE_RPM_LIMIT 

CURRENT_FILE_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_PROMPT_DIR = os.path.join(CURRENT_FILE_DIR, "prompt")

class Command(BaseCommand):
    help = 'DUGAを含む全ブランドのAI詳細解析を実行し、新設された5項目スコアをDBに格納する'

    def add_arguments(self, parser):
        parser.add_argument('product_id', type=str, nargs='?', help='特定の製品ID')
        parser.add_argument('--limit', type=int, default=50, help='処理件数')
        parser.add_argument('--brand', type=str, help='対象ブランド (fanza, duga, dmm)')
        parser.add_argument('--force', action='store_true', help='解析済みデータも再解析')

    def load_file_content(self, filename, default_content=""):
        full_path = os.path.join(BASE_PROMPT_DIR, filename)
        try:
            if os.path.exists(full_path):
                with open(full_path, 'r', encoding='utf-8') as f:
                    return f.read().strip()
            return default_content
        except:
            return default_content

    def get_ai_model(self):
        # ai_models.txt からモデル名を取得 (デフォルトは gemini-1.5-flash)
        model_content = self.load_file_content("ai_models.txt", "gemini-1.5-flash")
        name = model_content.split('\n')[0].strip().strip('"').strip("'")
        return name if name.startswith("models/") else f"models/{name}"

    def handle(self, *args, **options):
        if not VALID_KEYS:
            self.stdout.write(self.style.ERROR("❌ 有効なAPIキーが設定されていません。"))
            return

        target_model_id = self.get_ai_model()

        # 🚀 現状の可視化
        stats = AdultProduct.objects.values('api_source').annotate(count=Count('id'))
        self.stdout.write(self.style.HTTP_INFO("\n--- [DB内ブランド集計] ---"))
        for s in stats:
            brand_display = s['api_source'] or "Unknown"
            self.stdout.write(f" ・{brand_display}: {s['count']}件")

        query = AdultProduct.objects.all()

        if options['product_id']:
            query = query.filter(product_id_unique=options['product_id'])
        else:
            if options['brand']:
                query = query.filter(api_source__icontains=options['brand'].lower())
            
            if not options['force']:
                # 新設スコア（score_erotic等）がまだ0のものも対象に含める
                query = query.filter(
                    Q(ai_summary__isnull=True) | Q(ai_summary="") | 
                    Q(last_spec_parsed_at__isnull=True) |
                    Q(score_erotic=0)
                )

        products = list(query[:options['limit']])
        if not products:
            self.stdout.write(self.style.WARNING("🔎 解析対象が見つかりませんでした。"))
            return

        total_count = len(products)
        self.stdout.write(self.style.SUCCESS(
            f"🚀 解析開始: {total_count}件 / モデル: {target_model_id} / 稼働キー: {len(VALID_KEYS)}"
        ))

        self.start_time = time.time()
        self.finished_count = 0

        with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
            future_to_product = {}
            for i, product in enumerate(products):
                if i > 0: time.sleep(INTERVAL) 
                future = executor.submit(self.analyze_product_task, product, target_model_id, total_count)
                future_to_product[future] = product

            for future in as_completed(future_to_product):
                try:
                    future.result()
                except Exception as e:
                    p = future_to_product[future]
                    self.stdout.write(self.style.ERROR(f"❌ エラー ({p.product_id_unique}): {e}"))

    def analyze_product_task(self, product, model_full_id, total, retry_count=0):
        current_api_key = next(key_cycle)
        
        brand_raw = (product.api_source or "").lower()
        if 'fanza' in brand_raw:
            prompt_file = "adult_analysis_fanza.txt"
        elif 'duga' in brand_raw:
            prompt_file = "adult_analysis_duga.txt"
        else:
            prompt_file = "general_analysis_dmm.txt"
        
        instruction = self.load_file_content(prompt_file)
        actress_names = ", ".join([a.name for a in product.actresses.all()]) or "情報なし"
        genre_names = ", ".join([g.name for g in product.genres.all()]) or "情報なし"
        content_description = product.rich_description or product.product_description or "タイトルから推測してください。"
        
        # 🚀 5項目スコアを意識した出力をAIに促すプロンプト
        full_prompt = f"""{instruction}
# 解析対象データ
ソース: {product.api_source}
タイトル: {product.title}
出演者: {actress_names}
ジャンル: {genre_names}
内容紹介: {content_description[:3500]}

必ず以下のキーを含む [ANALYSIS_JSON] を出力してください。
スコアは1-100の数値で判定してください。
- ai_custom_title: キャッチコピー
- ai_summary: 詳細な紹介文
- score_visual: 映像美
- score_story: ストーリー性
- score_erotic: 刺激・エロティズム
- score_rarity: レア度・希少性
- score_fetish: フェチ度
- score_cost_performance: コスパ
- chat_logs: ユーザー風の擬似コメント(配列)
- target_segment: おすすめターゲット
"""
        endpoint = f"https://generativelanguage.googleapis.com/v1beta/{model_full_id}:generateContent?key={current_api_key}"
        try:
            payload = {
                "contents": [{"parts": [{"text": full_prompt}]}],
                "generationConfig": {
                    "temperature": 0.7, "maxOutputTokens": 2048, "response_mime_type": "text/plain"
                },
                "safetySettings": [
                    {"category": c, "threshold": "BLOCK_NONE"} 
                    for c in ["HARM_CATEGORY_HARASSMENT", "HARM_CATEGORY_HATE_SPEECH", 
                             "HARM_CATEGORY_SEXUALLY_EXPLICIT", "HARM_CATEGORY_DANGEROUS_CONTENT"]
                ]
            }

            response = requests.post(endpoint, json=payload, timeout=60)
            if response.status_code in [429, 500, 503] and retry_count < 3:
                time.sleep(20 * (retry_count + 1))
                return self.analyze_product_task(product, model_full_id, total, retry_count + 1)

            response.raise_for_status()
            result = response.json()
            
            candidates = result.get('candidates', [])
            if not candidates: return
            full_text = candidates[0]['content']['parts'][0]['text']

            json_str = ""
            if match := re.search(r'\[ANALYSIS_JSON\](.*?)\[/ANALYSIS_JSON\]', full_text, re.DOTALL):
                json_str = match.group(1).strip()
            elif match := re.search(r'```json\s*(.*?)\s*```', full_text, re.DOTALL):
                json_str = match.group(1).strip()
            
            if json_str:
                json_str = re.sub(r'//.*', '', json_str) # コメント削除
                data = json.loads(json_str)

                # --- 1. スコア格納 (新設5項目 + 合計) ---
                product.score_visual = int(data.get('score_visual', 0))
                product.score_story = int(data.get('score_story', 0))
                product.score_erotic = int(data.get('score_erotic', 0))
                product.score_rarity = int(data.get('score_rarity', 0))
                product.score_fetish = int(data.get('score_fetish', 0))
                product.score_cost_performance = int(data.get('score_cost_performance', 0))

                # spec_score は 5項目の平均値を自動算出
                s_vals = [product.score_visual, product.score_story, product.score_erotic, product.score_rarity, product.score_fetish]
                valid_vals = [v for v in s_vals if v > 0]
                product.spec_score = int(sum(valid_vals) / len(valid_vals)) if valid_vals else 0

                # --- 2. テキスト系格納 ---
                product.ai_summary = data.get('ai_custom_title', product.title)[:500]
                product.ai_content = data.get('ai_summary', '')
                product.ai_chat_comments = data.get('chat_logs', [])
                product.target_segment = data.get('target_segment', '一般')[:255]
                
                product.last_spec_parsed_at = timezone.now()
                product.save()

                self.finished_count += 1
                avg_time = (time.time() - self.start_time) / self.finished_count
                eta = datetime.now() + timedelta(seconds=avg_time * (total - self.finished_count))

                self.stdout.write(self.style.SUCCESS(
                    f" ✅ [{self.finished_count}/{total}] {product.api_source} | {product.ai_summary[:20]}... (ETA: {eta.strftime('%H:%M')})"
                ))
            else:
                raise ValueError("JSON構造を抽出できませんでした。")

        except Exception as e:
            if retry_count < 2:
                time.sleep(5)
                return self.analyze_product_task(product, model_full_id, total, retry_count + 1)
            self.stdout.write(self.style.ERROR(f"❌ 解析失敗 ({product.product_id_unique}): {str(e)}"))