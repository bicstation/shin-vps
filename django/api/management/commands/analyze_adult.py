# -*- coding: utf-8 -*-
import json
import requests
import re
import os
import time
import itertools
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor, as_completed
from django.core.management.base import BaseCommand
from api.models.adult_products import AdultProduct
from django.utils import timezone
from django.db.models import Q

# === APIキー設定 (6つのキーをローテーション) ===
API_KEYS = [
    os.getenv("GEMINI_API_KEY"),
    os.getenv("GEMINI_API_KEY_1"),
    os.getenv("GEMINI_API_KEY_2"),
    os.getenv("GEMINI_API_KEY_3"),
    os.getenv("GEMINI_API_KEY_4"),
    os.getenv("GEMINI_API_KEY_5"),
]

# 有効なキーのみを抽出
VALID_KEYS = [k for k in API_KEYS if k and len(k) > 10]
key_cycle = itertools.cycle(VALID_KEYS)

# === レート制限・並列設定 ===
MAX_WORKERS = 6
SAFE_RPM_LIMIT = 50 
INTERVAL = 60 / SAFE_RPM_LIMIT 

BASE_PROMPT_DIR = "/home/maya/dev/shin-vps/django/api/management/commands/prompt"
AI_MODEL_FILE = os.path.join(BASE_PROMPT_DIR, "ai_models.txt")

class Command(BaseCommand):
    help = 'FANZA/DMM/DUGAのデータをブランド別に最適化されたプロンプトでAI解析する (Gemma 3対応版)'

    def add_arguments(self, parser):
        parser.add_argument('product_id', type=str, nargs='?', help='特定の製品ID')
        parser.add_argument('--limit', type=int, default=10, help='処理件数')
        parser.add_argument('--brand', type=str, choices=['DUGA', 'FANZA'], help='ブランド指定')
        parser.add_argument('--force', action='store_true', help='解析済みデータも再解析')

    def load_file_content(self, filename, default_content=""):
        path = os.path.join(BASE_PROMPT_DIR, filename)
        try:
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read().strip()
                return content if content else default_content
        except FileNotFoundError:
            return default_content

    def get_ai_model(self):
        """ai_models.txtからモデル名を取得し、エンドポイント用に整形"""
        # ファイルから取得。デフォルトは指定されていた Gemma 3 系列
        model_content = self.load_file_content("ai_models.txt", "gemma-3-27b-it")
        
        # 1行目を取得し、引用符を除去
        name = model_content.split('\n')[0].strip().replace('"', '').replace("'", "")
        
        # APIエンドポイントのURLに組み込むため、'models/' が付いていない場合は付与する
        if not name.startswith("models/"):
            name = f"models/{name}"
        return name

    def handle(self, *args, **options):
        if not VALID_KEYS:
            self.stdout.write(self.style.ERROR("❌ 有効なAPIキーが設定されていません。"))
            return

        # 整形済みのモデルIDを取得 (例: models/gemma-3-27b-it)
        target_model_id = self.get_ai_model()
        query = AdultProduct.objects.all()

        # フィルタリング
        if options['product_id']:
            query = query.filter(product_id_unique=options['product_id'])
        else:
            if options['brand']:
                query = query.filter(api_source=options['brand'])
            if not options['force']:
                query = query.filter(Q(ai_summary__isnull=True) | Q(ai_summary=""))

        products = list(query[:options['limit']])
        if not products:
            self.stdout.write(self.style.WARNING("🔎 解析対象が見つかりませんでした。"))
            return

        self.stdout.write(self.style.SUCCESS(
            f"🚀 解析開始: {len(products)}件 / モデル: {target_model_id} / 稼働キー: {len(VALID_KEYS)}"
        ))

        with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
            future_to_product = {}
            for i, product in enumerate(products):
                if i > 0:
                    time.sleep(INTERVAL) 
                
                future = executor.submit(self.analyze_adult_task, product, target_model_id, i+1, len(products))
                future_to_product[future] = product

            for future in as_completed(future_to_product):
                p = future_to_product[future]
                try:
                    future.result()
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f"❌ 致命的エラー ({p.product_id_unique}): {e}"))

    def analyze_adult_task(self, product, model_full_id, count, total, retry_count=0):
        # キーのローテーション
        current_api_key = next(key_cycle)
        key_hint = current_api_key[-4:]

        # ブランドに応じたプロンプトファイルの選択
        brand_key = product.api_source.lower()
        prompt_filename = f"adult_analysis_{brand_key}.txt"
        instruction = self.load_file_content(prompt_filename, "アダルト作品ソムリエとして解析しJSONで出力してください。")

        actress_names = ", ".join([a.name for a in product.actresses.all()]) or "情報なし"
        genre_names = ", ".join([g.name for g in product.genres.all()]) or "情報なし"

        # プロンプトの組み立て
        full_prompt = f"""
{instruction}

【ソース】: {product.api_source}
【作品タイトル】: {product.title}
【出演女優】: {actress_names}
【ジャンル】: {genre_names}
【作品内容】: {product.product_description or "タイトルとジャンルから推測して解析してください。"}

必ず [ANALYSIS_JSON] タグ内に JSON 形式で出力してください。

[ANALYSIS_JSON]
{{
  "score_visual": 1-100,
  "score_story": 1-100,
  "score_erotic": 1-100,
  "score_rarity": 1-100,
  "score_cost": 1-100,
  "ai_summary": "作品を魅力的に紹介する要約（150文字程度）",
  "target_segment": "おすすめのユーザー層（20文字以内）"
}}
[/ANALYSIS_JSON]
"""
        # エンドポイントURL構築 (model_full_id は既に models/ を含んでいる)
        endpoint = f"https://generativelanguage.googleapis.com/v1beta/{model_full_id}:generateContent?key={current_api_key}"
        
        try:
            payload = {
                "contents": [{"parts": [{"text": full_prompt}]}],
                "generationConfig": {
                    "temperature": 0.7,
                    "maxOutputTokens": 2048,
                    "response_mime_type": "text/plain"
                },
                "safetySettings": [
                    {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE"},
                    {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE"},
                    {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE"},
                    {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE"}
                ]
            }

            response = requests.post(endpoint, json=payload, timeout=120)

            # リトライ判定 (429, 5xx)
            if (response.status_code in [429, 500, 503, 504]) and retry_count < 5:
                wait_time = (retry_count + 1) * 15
                time.sleep(wait_time)
                return self.analyze_adult_task(product, model_full_id, count, total, retry_count + 1)

            response.raise_for_status()
            result = response.json()
            
            if 'candidates' not in result or not result['candidates'][0].get('content'):
                self.stdout.write(self.style.WARNING(f" ⚠️ 内容ブロック/空応答: {product.product_id_unique}"))
                return

            full_text = result['candidates'][0]['content']['parts'][0]['text']

            # JSON抽出
            spec_match = re.search(r'\[ANALYSIS_JSON\](.*?)\[/ANALYSIS_JSON\]', full_text, re.DOTALL)
            if spec_match:
                json_content = spec_match.group(1).strip()
                json_content = re.sub(r'```json\s*|\s*```', '', json_content)
                json_content = re.sub(r'//.*', '', json_content) 
                
                data = json.loads(json_content)
                
                def safe_int(v):
                    try: return int(v)
                    except: return 0

                product.score_visual = safe_int(data.get('score_visual', 0))
                product.score_story = safe_int(data.get('score_story', 0))
                product.score_erotic = safe_int(data.get('score_erotic', 0))
                product.score_rarity = safe_int(data.get('score_rarity', 0))
                product.score_cost = safe_int(data.get('score_cost', 0))
                
                scores = [product.score_visual, product.score_story, product.score_erotic, product.score_rarity, product.score_cost]
                product.spec_score = int(sum(scores) / 5) if any(scores) else 0
                
                product.ai_summary = data.get('ai_summary', '')
                product.target_segment = (data.get('target_segment') or '一般')[:20]
                
                product.ai_content = full_text
                product.last_spec_parsed_at = timezone.now()
                product.save()

                self.stdout.write(self.style.SUCCESS(f" ✅ [{count}/{total}] {product.api_source} | {product.title[:15]}... [Key:..{key_hint}]"))
            else:
                if retry_count < 2:
                    time.sleep(10)
                    return self.analyze_adult_task(product, model_full_id, count, total, retry_count + 1)
                self.stdout.write(self.style.WARNING(f" ⚠️ JSON未検出: {product.product_id_unique}"))

        except Exception as e:
            if retry_count < 3:
                time.sleep(20)
                return self.analyze_adult_task(product, model_full_id, count, total, retry_count + 1)
            self.stdout.write(self.style.ERROR(f"❌ 解析失敗 ({product.product_id_unique}): {str(e)}"))