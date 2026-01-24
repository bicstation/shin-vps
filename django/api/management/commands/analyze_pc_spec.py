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
from api.models.pc_products import PCProduct
from django.utils import timezone
from django.db.models import Q

# === API設定 (2つのキーを読み込み) ===
API_KEYS = [
    os.getenv("GEMINI_API_KEY_0") or os.getenv("GEMINI_API_KEY"), # 既存のキー
    os.getenv("GEMINI_API_KEY_1") ,                               # 新しいキー
    os.getenv("GEMINI_API_KEY_2")  
]
# 有効なキーのみでサイクルを作成
VALID_KEYS = [k for k in API_KEYS if k]
key_cycle = itertools.cycle(VALID_KEYS)

# === レート制限の設定 (2キー体制に合わせて最適化) ===
# 2つのキーがあるため、同時並列数を少し増やして速度を上げます
MAX_WORKERS = 4       # 2キー合計で4並列程度が安全
SAFE_RPM_LIMIT = 24   # 2キー合計で1分間に24リクエスト（1キーあたり12）
INTERVAL = 60 / SAFE_RPM_LIMIT  # 全体で約2.5秒に1リクエストのペース

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROMPT_BASE_DIR = os.path.join(BASE_DIR, "prompt")

class Command(BaseCommand):
    help = '2つのAPIキーを交互に使用し、PC製品およびソフトウェアをAI解析・5軸スコアリングする'

    def add_arguments(self, parser):
        parser.add_argument('unique_id', type=str, nargs='?')
        parser.add_argument('--limit', type=int, default=1, help='処理件数')
        parser.add_argument('--maker', type=str, help='メーカー指定（フィルタ用）')
        parser.add_argument('--model', type=str, help='使用するGeminiモデルID')
        parser.add_argument('--force', action='store_true', help='解析済みデータも再解析対象に含める')
        parser.add_argument('--null-only', action='store_true', help='解析日時が空のもののみを対象にする')

    def load_prompt_file(self, filename):
        path = os.path.join(PROMPT_BASE_DIR, filename)
        try:
            with open(path, 'r', encoding='utf-8') as f:
                return f.read()
        except FileNotFoundError:
            return ""

    def get_maker_slug(self, maker_name):
        if not maker_name:
            return "standard"
        m = str(maker_name).lower()
        if any(x in m for x in ['fmv', 'fujitsu', '富士通']): return "fmv"
        if any(x in m for x in ['dynabook', 'ダイナブック']): return "dynabook"
        if any(x in m for x in ['sourcenext', 'ソースネクスト']): return "sourcenext"
        if any(x in m for x in ['trend', 'トレンドマイクロ']): return "trendmicro"
        if 'asus' in m: return "asus"
        if 'sony' in m: return "sony"
        if 'hp' in m: return "hp"
        if 'dell' in m: return "dell"
        if 'lenovo' in m: return "lenovo"
        if 'mouse' in m or 'マウス' in m: return "mouse"
        if 'nec' in m: return "nec"
        if 'ark' in m or 'アーク' in m: return "ark"
        slug = re.sub(r'[^a-z0-9]', '', m)
        return slug if slug else "standard"

    def handle(self, *args, **options):
        unique_id = options['unique_id']
        limit = options['limit']
        maker_arg = options['maker']
        model_arg = options['model']
        force = options['force']
        null_only = options['null_only']

        if not VALID_KEYS:
            self.stdout.write(self.style.ERROR("❌ エラー: APIキーが設定されていません。"))
            return

        # 1. 基本クエリの構築
        query = PCProduct.objects.all()
        
        # 2. 解析対象の判定ロジック
        if null_only:
            query = query.filter(last_spec_parsed_at__isnull=True)
        elif not force:
            query = query.filter(
                Q(last_spec_parsed_at__isnull=True) | 
                Q(score_cpu=0) | Q(score_gpu=0) | Q(score_cost=0) | Q(score_portable=0) | Q(score_ai=0)
            )

        # 3. フィルタリング
        if unique_id:
            query = query.filter(unique_id=unique_id)
        elif maker_arg:
            m = maker_arg.lower()
            if m in ['fmv', 'fujitsu', '富士通']:
                query = query.filter(Q(maker__icontains='FMV') | Q(maker__icontains='富士通'))
            elif m in ['dynabook', 'ダイナブック']:
                query = query.filter(Q(maker__icontains='dynabook'))
            # ... (他のメーカー指定は既存通り)
            else:
                query = query.filter(maker__icontains=maker_arg)

        products = list(query[:limit])
        if not products:
            self.stdout.write(self.style.WARNING("🔎 解析待ち製品が見つかりませんでした。"))
            return

        # AIモデル決定
        if model_arg:
            model_id = model_arg
        else:
            models_content = self.load_prompt_file('ai_models.txt')
            model_id = models_content.split('\n')[0].strip() if models_content else "gemini-1.5-flash"

        self.stdout.write(self.style.SUCCESS(
            f"🚀 解析開始: 全 {len(products)} 件 / スレッド数: {MAX_WORKERS} / 利用可能キー: {len(VALID_KEYS)} / モデル: {model_id}"
        ))

        self.counter = 0
        with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
            future_to_product = {}
            for i, product in enumerate(products):
                if i > 0:
                    time.sleep(INTERVAL) 
                
                self.counter += 1
                # 実行時に次のキーを取得して渡す
                current_key = next(key_cycle)
                future = executor.submit(self.analyze_product, product, model_id, self.counter, len(products), current_key)
                future_to_product[future] = product

            for future in as_completed(future_to_product):
                product = future_to_product[future]
                try:
                    future.result()
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f"❌ 致命的エラー ({product.unique_id}): {str(e)}"))

    def analyze_product(self, product, model_id, count, total, api_key, retry_count=0):
        # 1. プロンプト組み立て
        base_pc_prompt = self.load_prompt_file('analyze_pc_prompt.txt') or "メーカー:{maker}\n製品名:{name}\n価格:{price}\n説明:{description}\n上記を解析せよ。"
        target_maker_slug = self.get_maker_slug(product.maker)
        maker_prompt_file = f"analyze_{target_maker_slug}_prompt.txt"
        brand_rules = self.load_prompt_file(maker_prompt_file) or self.load_prompt_file('analyze_pc_prompt.txt')

        structure_instruction = """
必ず以下のJSON形式を [SPEC_JSON] タグ内に含めてください。
[SPEC_JSON]
{
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

紹介文（HTML形式、CSSクラスなしのクリーンなタグのみ）の後に、以下の注目ポイントを [SUMMARY_DATA] タグ内に含めてください：
[SUMMARY_DATA]
POINT1: 特徴1
POINT2: 特徴2
POINT3: 特徴3
TARGET: おすすめ対象
[/SUMMARY_DATA]
"""
        formatted_base = base_pc_prompt.replace("{maker}", str(product.maker))\
                                       .replace("{name}", str(product.name))\
                                       .replace("{price}", f"{product.price:,}")\
                                       .replace("{description}", str(product.description or ""))

        full_prompt = f"{formatted_base}\n\nブランド別追加ルール:\n{brand_rules}\n\n{structure_instruction}"
        
        actual_model = model_id if model_id.startswith("models/") else f"models/{model_id}"
        api_url = f"https://generativelanguage.googleapis.com/v1beta/{actual_model}:generateContent"
        
        headers = {
            "Content-Type": "application/json",
            "x-goog-api-key": api_key
        }
        
        payload = {
            "contents": [
                {
                    "role": "user",
                    "parts": [{"text": full_prompt}]
                }
            ],
            "generationConfig": {
                "temperature": 0.2,
                "topP": 0.95,
                "maxOutputTokens": 4096,
                "responseMimeType": "text/plain"
            }
        }
        
        try:
            current_time = datetime.now().strftime("%H:%M:%S")
            # どのキー(末尾4文字)を使っているかログに表示
            key_hint = api_key[-4:]
            self.stdout.write(f"[{current_time}] 📤 解析中 ({count}/{total}) [Key:..{key_hint}]: [{product.maker}] {product.name}")

            response = requests.post(api_url, headers=headers, json=payload, timeout=120)
            
            # リトライが必要なステータスコード
            if response.status_code in [429, 500, 503]:
                if retry_count < 3:
                    # 429(レート制限)の場合は別のキーに切り替えて即座にリトライを試みる
                    new_key = next(key_cycle)
                    wait_time = (retry_count + 1) * 10
                    self.stdout.write(self.style.WARNING(f"⚠️ 制限回避 ({product.unique_id}): キーを切り替えて {wait_time}秒後リトライ"))
                    time.sleep(wait_time)
                    return self.analyze_product(product, model_id, count, total, new_key, retry_count + 1)

            response.raise_for_status()
            res_json = response.json()
            full_text = res_json['candidates'][0]['content']['parts'][0]['text']

            # --- データ抽出・DB保存 (以下、既存ロジックを維持) ---
            spec_data = {}
            spec_match = re.search(r'\[SPEC_JSON\](.*?)\[/SPEC_JSON\]', full_text, re.DOTALL)
            if spec_match:
                try:
                    clean_json = re.sub(r'//.*', '', spec_match.group(1).strip())
                    spec_data = json.loads(clean_json)
                except: pass

            summary_match = re.search(r'\[SUMMARY_DATA\](.*?)\[/SUMMARY_DATA\]', full_text, re.DOTALL)
            summary_text = summary_match.group(0).strip() if summary_match else ""

            html_content = full_text
            if summary_match: html_content = html_content.replace(summary_match.group(0), '')
            if spec_match: html_content = html_content.replace(spec_match.group(0), '')
            html_content = html_content.strip()

            def safe_int(val, default=0):
                if val is None or val == "": return default
                try: return int(re.sub(r'[^0-9]', '', str(val)))
                except: return default

            # DB保存
            product.cpu_model = spec_data.get('cpu_model', product.cpu_model)
            product.gpu_model = spec_data.get('gpu_model', product.gpu_model)
            product.memory_gb = safe_int(spec_data.get('memory_gb'), product.memory_gb)
            product.storage_gb = safe_int(spec_data.get('storage_gb'), product.storage_gb)
            product.display_info = spec_data.get('display_info', product.display_info)
            product.spec_score = safe_int(spec_data.get('spec_score'), 0)
            product.score_cpu = safe_int(spec_data.get('score_cpu'), 0)
            product.score_gpu = safe_int(spec_data.get('score_gpu'), 0)
            product.score_cost = safe_int(spec_data.get('score_cost'), 0)
            product.score_portable = safe_int(spec_data.get('score_portable'), 0)
            product.score_ai = safe_int(spec_data.get('score_ai'), 0)
            product.is_ai_pc = spec_data.get('is_ai_pc', False)
            try: product.npu_tops = float(spec_data.get('npu_tops', 0.0))
            except: product.npu_tops = 0.0
            product.ai_summary = summary_text 
            product.ai_content = f"{summary_text}\n\n{html_content}"
            product.last_spec_parsed_at = timezone.now()
            product.save()

            self.stdout.write(self.style.SUCCESS(f" ✅ 解析完了: {product.unique_id}"))

        except Exception as e:
            self.stdout.write(self.style.ERROR(f"❌ 解析失敗 ({product.unique_id}): {str(e)}"))