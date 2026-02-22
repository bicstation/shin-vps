# -*- coding: utf-8 -*-
import json
import requests
import re
import os
import time
import itertools
import sys
import logging
from datetime import datetime, timedelta
from concurrent.futures import ThreadPoolExecutor, as_completed
from django.core.management.base import BaseCommand
from api.models import AdultProduct, FanzaFloorMaster
from django.utils import timezone
from django.db.models import Q, Count

# ロギング設定：標準出力(stdout)へ即時反映
logger = logging.getLogger(__name__)
handler = logging.StreamHandler(sys.stdout)
handler.setFormatter(logging.Formatter('%(message)s'))
logger.addHandler(handler)
logger.setLevel(logging.INFO)

# === APIキー設定 (10個完全対応) ===
API_KEYS = [
    os.getenv("GEMINI_API_KEY"),
    os.getenv("GEMINI_API_KEY_1"),
    os.getenv("GEMINI_API_KEY_2"),
    os.getenv("GEMINI_API_KEY_3"),
    os.getenv("GEMINI_API_KEY_4"),
    os.getenv("GEMINI_API_KEY_5"),
    os.getenv("GEMINI_API_KEY_6"),
    os.getenv("GEMINI_API_KEY_7"),
    os.getenv("GEMINI_API_KEY_8"),
    os.getenv("GEMINI_API_KEY_9"),
]
VALID_KEYS = [k for k in API_KEYS if k and len(k) > 10]
key_cycle = itertools.cycle(VALID_KEYS)

# === パフォーマンス・レート制限設定 ===
MAX_WORKERS = 10           # 並列実行数
SAFE_RPM_LIMIT = 60       # 全体でのRPM制限
INTERVAL = 60 / SAFE_RPM_LIMIT 

CURRENT_FILE_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_PROMPT_DIR = os.path.join(CURRENT_FILE_DIR, "prompt")

class Command(BaseCommand):
    help = '【フルスペック版】10キー並列・フロア別プロンプト・動的スコア解析'

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
        except Exception:
            return default_content

    def get_ai_model(self):
        model_content = self.load_file_content("ai_models.txt", "gemma-3-27b-it")
        name = model_content.split('\n')[0].strip().strip('"').strip("'")
        return name if name.startswith("models/") else f"models/{name}"

    def handle(self, *args, **options):
        if not VALID_KEYS:
            logger.error("❌ 有効なAPIキーが設定されていません。")
            return

        target_model_id = self.get_ai_model()

        # 現状の集計
        stats = AdultProduct.objects.values('api_source').annotate(count=Count('id'))
        logger.info("\n--- [DB内ブランド集計] ---")
        for s in stats:
            logger.info(f" ・{s['api_source'] or 'Unknown'}: {s['count']}件")

        # クエリ構築
        query = AdultProduct.objects.all()
        if options['product_id']:
            query = query.filter(product_id_unique=options['product_id'])
        else:
            if options['brand']:
                query = query.filter(api_source__icontains=options['brand'].lower())
            if not options['force']:
                query = query.filter(Q(ai_summary__isnull=True) | Q(ai_summary="") | Q(score_erotic=0))

        products = list(query[:options['limit']])
        if not products:
            logger.warning("🔎 解析対象が見つかりませんでした。")
            return

        total_count = len(products)
        logger.info(f"🚀 解析開始: {total_count}件 / モデル: {target_model_id} / 稼働キー: {len(VALID_KEYS)}\n")

        self.start_time = time.time()
        self.finished_count = 0

        # 並列実行
        with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
            future_to_product = {}
            for product in products:
                future = executor.submit(self.analyze_product_task, product, target_model_id)
                future_to_product[future] = product
                time.sleep(INTERVAL) 

            for future in as_completed(future_to_product):
                self.finished_count += 1
                product = future_to_product[future]
                try:
                    success, preview_text = future.result()
                    elapsed = time.time() - self.start_time
                    avg = elapsed / self.finished_count
                    eta_seconds = avg * (total_count - self.finished_count)
                    eta = (datetime.now() + timedelta(seconds=eta_seconds)).strftime('%H:%M')
                    
                    if success:
                        logger.info(f" ✅ [{self.finished_count}/{total_count}] ETA:{eta} | {product.api_source} | {product.title[:15]}... -> {preview_text[:15]}...")
                    else:
                        logger.error(f" ⚠️  スキップ: {preview_text}")
                except Exception as e:
                    logger.error(f" ❌ エラー: {str(e)}")

    def analyze_product_task(self, product, model_full_id, retry_count=0):
        current_api_key = next(key_cycle)
        floor_val = getattr(product, 'floor_name', getattr(product, 'floor', "ビデオ")) or "ビデオ"
        
        # フロアマスタから指示文とキーワードを取得
        floor_info = FanzaFloorMaster.objects.filter(floor_name__icontains=floor_val).first()
        if floor_info and floor_info.ai_system_prompt:
            instruction = floor_info.ai_system_prompt
            keywords = floor_info.ai_tone_keywords or "なし"
        else:
            instruction = self.load_file_content("adult_analysis_fanza.txt", "あなたはプロの商品紹介ライターです。")
            keywords = "なし"

        actress_names = ", ".join([a.name for a in product.actresses.all()]) or "情報なし"
        genre_names = ", ".join([g.name for g in product.genres.all()]) or "情報なし"
        description = (product.rich_description or product.product_description or "")[:3000]

        # 動的スコア定義を含む最強のプロンプト
        full_prompt = f"""役割: {instruction}
重視キーワード: {keywords}

【商品データ】
ソース: {product.api_source} / カテゴリ: {floor_val}
タイトル: {product.title}
出演者: {actress_names}
ジャンル: {genre_names}
内容: {description}

必ず [ANALYSIS_JSON]...[/ANALYSIS_JSON] 形式でJSONを出力してください。
スコア(1-100)は「{floor_val}」というジャンルに合わせて各項目を解釈してください：
- score_visual: ビジュアル品質 / デザイン完成度
- score_story: 構成・シナリオ / 商品の内容的満足度
- score_erotic: 刺激・魅力 / ファンサービス度
- score_rarity: 希少性 / レア度
- score_fetish: 特徴の強さ / マニアックなこだわり
- score_cost_performance: コスパ / 入手価値

【出力項目】
- ai_custom_title: あなたの役割に基づいたキャッチーな新タイトル
- ai_summary: あなたの役割に基づいた、熱量の高い詳細な紹介文
- chat_logs: キャラクター数名による、この商品についての対話形式コメント（配列）
- target_segment: この商品を最もおすすめしたいターゲット層
"""
        endpoint = f"https://generativelanguage.googleapis.com/v1beta/{model_full_id}:generateContent?key={current_api_key}"
        
        try:
            response = requests.post(endpoint, json={
                "contents": [{"parts": [{"text": full_prompt}]}],
                "generationConfig": {"temperature": 0.7, "maxOutputTokens": 2048},
                "safetySettings": [{"category": c, "threshold": "BLOCK_NONE"} for c in [
                    "HARM_CATEGORY_HARASSMENT", "HARM_CATEGORY_HATE_SPEECH", 
                    "HARM_CATEGORY_SEXUALLY_EXPLICIT", "HARM_CATEGORY_DANGEROUS_CONTENT"
                ]]
            }, timeout=60)

            if response.status_code != 200:
                if response.status_code in [429, 500, 503] and retry_count < 2:
                    time.sleep(5)
                    return self.analyze_product_task(product, model_full_id, retry_count + 1)
                return False, f"HTTP {response.status_code}"

            result = response.json()
            full_text = result['candidates'][0]['content']['parts'][0]['text']
            json_match = re.search(r'\{.*\}', full_text, re.DOTALL)
            
            if json_match:
                data = json.loads(json_match.group())

                # 数値データの保存
                product.score_visual = int(data.get('score_visual', 0))
                product.score_story = int(data.get('score_story', 0))
                product.score_erotic = int(data.get('score_erotic', 0))
                product.score_rarity = int(data.get('score_rarity', 0))
                product.score_fetish = int(data.get('score_fetish', 0))
                product.score_cost_performance = int(data.get('score_cost_performance', 0))

                # 平均スコア
                s_vals = [product.score_visual, product.score_story, product.score_erotic, product.score_rarity, product.score_fetish]
                valid_vals = [v for v in s_vals if v > 0]
                product.spec_score = int(sum(valid_vals) / len(valid_vals)) if valid_vals else 0

                # テキストデータの保存（全てのAI生成項目を漏らさず格納）
                product.ai_summary = data.get('ai_custom_title', product.title)[:500]
                product.ai_content = data.get('ai_summary', '')
                product.ai_chat_comments = data.get('chat_logs', [])
                product.target_segment = data.get('target_segment', '一般')[:255]
                product.last_spec_parsed_at = timezone.now()
                product.save()

                return True, product.ai_content
            return False, "JSON Parse Error"

        except Exception as e:
            return False, str(e)