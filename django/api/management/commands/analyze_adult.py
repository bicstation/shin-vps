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
from api.models.adult_products import AdultProduct
from django.utils import timezone
from django.db.models import Q, Count

# === APIキー設定 (6つのキーをローテーション) ===
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

# === レート制限・並列設定 ===
MAX_WORKERS = 4 
SAFE_RPM_LIMIT = 50 
INTERVAL = 60 / SAFE_RPM_LIMIT 

# === パス設定 ===
CURRENT_FILE_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_PROMPT_DIR = os.path.join(CURRENT_FILE_DIR, "prompt")

class Command(BaseCommand):
    help = 'AI対話ログを含む詳細解析を実行し、全てのAIカラムを完全に補完する'

    def add_arguments(self, parser):
        parser.add_argument('product_id', type=str, nargs='?', help='特定の製品ID')
        parser.add_argument('--limit', type=int, default=10, help='処理件数')
        parser.add_argument('--brand', type=str, help='解析対象のブランド (fanza, duga, dmm)')
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
        model_content = self.load_file_content("ai_models.txt", "gemma-3-27b-it")
        first_line = model_content.split('\n')[0].strip()
        name = first_line.replace('"', '').replace("'", "")
        if not name.startswith("models/"):
            name = f"models/{name}"
        return name

    def handle(self, *args, **options):
        if not VALID_KEYS:
            self.stdout.write(self.style.ERROR("❌ 有効なAPIキーが設定されていません。"))
            return

        target_model_id = self.get_ai_model()

        # DB現状可視化
        stats = AdultProduct.objects.values('api_source').annotate(count=Count('id'))
        self.stdout.write(self.style.HTTP_INFO("--- [DB内ブランド集計] ---"))
        for s in stats:
            self.stdout.write(f" ・{s['api_source']}: {s['count']}件")
        self.stdout.write(self.style.HTTP_INFO("--------------------------"))

        query = AdultProduct.objects.all()

        if options['product_id']:
            query = query.filter(product_id_unique=options['product_id'])
        else:
            if options['brand']:
                query = query.filter(api_source__icontains=options['brand'].lower())
            
            if not options['force']:
                query = query.filter(
                    Q(ai_summary__isnull=True) | Q(ai_summary="") | 
                    Q(ai_content__isnull=True) | Q(ai_content="") |
                    Q(last_spec_parsed_at__isnull=True)
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
                if i > 0:
                    time.sleep(INTERVAL) 
                
                future = executor.submit(self.analyze_product_task, product, target_model_id, total_count)
                future_to_product[future] = product

            for future in as_completed(future_to_product):
                try:
                    future.result()
                except Exception as e:
                    p = future_to_product[future]
                    self.stdout.write(self.style.ERROR(f"❌ 致命的エラー ({p.product_id_unique}): {e}"))

    def analyze_product_task(self, product, model_full_id, total, retry_count=0):
        current_api_key = next(key_cycle)
        
        brand_raw = product.api_source.lower()
        if 'fanza' in brand_raw:
            prompt_file = "adult_analysis_fanza.txt"
        elif 'duga' in brand_raw:
            prompt_file = "adult_analysis_duga.txt"
        else:
            prompt_file = "general_analysis_dmm.txt"
        
        instruction = self.load_file_content(prompt_file)
        if not instruction:
            self.stdout.write(self.style.ERROR(f"❌ プロンプトファイルが空、または見つかりません: {prompt_file}"))
            return

        actress_names = ", ".join([a.name for a in product.actresses.all()]) or "情報なし"
        genre_names = ", ".join([g.name for g in product.genres.all()]) or "情報なし"

        # AIに渡す情報の整理（rich_descriptionを優先）
        content_description = product.rich_description or product.product_description or "タイトルから推測してください。"
        
        full_prompt = f"""
{instruction}

# 解析対象データ
ソース: {product.api_source}
タイトル: {product.title}
出演者: {actress_names}
ジャンル: {genre_names}
内容紹介（ソース）: {content_description[:4000]}

必ず [ANALYSIS_JSON] セクション内に、指定されたJSON構造のみを出力してください。
"""
        endpoint = f"https://generativelanguage.googleapis.com/v1beta/{model_full_id}:generateContent?key={current_api_key}"
        
        try:
            payload = {
                "contents": [{"parts": [{"text": full_prompt}]}],
                "generationConfig": {
                    "temperature": 0.8, "maxOutputTokens": 2048, "response_mime_type": "text/plain"
                },
                "safetySettings": [
                    {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE"},
                    {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE"},
                    {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE"},
                    {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE"}
                ]
            }

            response = requests.post(endpoint, json=payload, timeout=120)

            if response.status_code in [429, 500, 503, 504] and retry_count < 5:
                time.sleep((retry_count + 1) * 15)
                return self.analyze_product_task(product, model_full_id, total, retry_count + 1)

            response.raise_for_status()
            result = response.json()
            
            if 'candidates' not in result or not result['candidates'][0].get('content'):
                return

            full_text = result['candidates'][0]['content']['parts'][0]['text']
            spec_match = re.search(r'\[ANALYSIS_JSON\](.*?)\[/ANALYSIS_JSON\]', full_text, re.DOTALL)
            
            if spec_match:
                json_content = spec_match.group(1).strip()
                json_content = re.sub(r'//.*', '', json_content) # コメント削除
                
                try:
                    data = json.loads(json_content)
                except json.JSONDecodeError:
                    # 不完全なJSONの簡易リカバリ
                    json_content = re.sub(r',\s*}', '}', json_content)
                    json_content = re.sub(r',\s*]', ']', json_content)
                    data = json.loads(json_content)

                def safe_int(v):
                    try: return int(v)
                    except: return 0

                # --- 1. スコア算出 (全プロンプトのキーバリエーションを網羅) ---
                s_keys = [
                    'score_visual', 'score_story', 
                    'score_erotic', 'score_acting', 'score_erotic_or_acting',
                    'score_rarity', 'score_direction', 'score_rarity_or_direction',
                    'score_cost', 'score_value', 'score_cost_or_value'
                ]
                s_values = [safe_int(data.get(k)) for k in s_keys if data.get(k) is not None]
                product.spec_score = int(sum(s_values) / len(s_values)) if s_values else 0

                # --- 2. AIカラムへのマッピング（最重要） ---
                # ai_custom_title (キャッチコピー) -> DB: ai_summary (32文字程度の見出し)
                product.ai_summary = data.get('ai_custom_title', product.title)[:500]
                
                # ai_summary (JSON内の長文レビュー) -> DB: ai_content (本文カラム)
                product.ai_content = data.get('ai_summary', '')
                
                # chat_logs (対話リスト) -> DB: ai_chat_comments (JSONFieldにそのまま格納)
                product.ai_chat_comments = data.get('chat_logs', [])
                
                # target_segment (ターゲット層) -> DB: target_segment
                target = data.get('target_segment', '一般')
                product.target_segment = target[:255] if target else '一般'
                
                product.last_spec_parsed_at = timezone.now()
                product.save()

                # --- 進捗・予測計算 ---
                self.finished_count += 1
                now = datetime.now()
                elapsed = time.time() - self.start_time
                avg_time = elapsed / self.finished_count
                remaining_count = total - self.finished_count
                eta_time = now + timedelta(seconds=avg_time * remaining_count)

                self.stdout.write(self.style.SUCCESS(
                    f" ✅ [{self.finished_count}/{total}] {now.strftime('%H:%M:%S')} (完了予測: {eta_time.strftime('%H:%M')}) | {product.api_source} | {product.ai_summary[:15]}..."
                ))
            else:
                if retry_count < 1: # JSONが見当たらない場合一度だけリトライ
                    return self.analyze_product_task(product, model_full_id, total, retry_count + 1)
                self.stdout.write(self.style.WARNING(f" ⚠️ JSON未検出: {product.product_id_unique}"))

        except Exception as e:
            if retry_count < 2:
                time.sleep(10)
                return self.analyze_product_task(product, model_full_id, total, retry_count + 1)
            self.stdout.write(self.style.ERROR(f"❌ 解析失敗 ({product.product_id_unique}): {str(e)}"))