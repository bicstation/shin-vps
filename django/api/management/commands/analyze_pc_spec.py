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

# === APIキー設定 (10個のキーに対応) ===
# 環境変数 GEMINI_API_KEY_0 〜 GEMINI_API_KEY_9 を読み込みます
API_KEYS = [
    os.getenv(f"GEMINI_API_KEY_{i}", "") for i in range(10)
]

# デフォルトのキー（以前のもの）も予備として含める設定
LEGACY_KEY = os.getenv("GEMINI_API_KEY", "AIzaSyC080GbwuffBIgwq0_lNoJ25BIHQYJ3tRs")
if LEGACY_KEY not in API_KEYS:
    API_KEYS.append(LEGACY_KEY)

# 有効なキーのみを抽出
VALID_KEYS = [k for k in API_KEYS if k and len(k) > 10]
key_cycle = itertools.cycle(VALID_KEYS)

# === レート制限の設定 (10キー用に最適化) ===
# 無料枠(Gemini 1.5 Flash)は1キーあたり15RPM程度が安定
# 10キーあれば理論上150RPM、安全マージンを見て100RPM程度を目標にします
MAX_WORKERS = len(VALID_KEYS) if len(VALID_KEYS) > 0 else 1
SAFE_TOTAL_RPM = len(VALID_KEYS) * 12  # 1キー12リクエスト/分で計算
INTERVAL = 60 / SAFE_TOTAL_RPM if SAFE_TOTAL_RPM > 0 else 1

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROMPT_BASE_DIR = os.path.join(BASE_DIR, "prompt")

class Command(BaseCommand):
    help = '10個のAPIキーをローテーションし、PC製品をAI解析・5軸スコアリングする（超高速並列版）'

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
            self.stdout.write(self.style.ERROR("❌ 有効なAPIキーが設定されていません。"))
            return

        query = PCProduct.objects.all()
        
        if null_only:
            query = query.filter(last_spec_parsed_at__isnull=True)
        elif not force:
            query = query.filter(
                Q(last_spec_parsed_at__isnull=True) | 
                Q(score_cpu=0) | Q(score_gpu=0) | Q(score_cost=0) | Q(score_portable=0) | Q(score_ai=0)
            )

        if unique_id:
            query = query.filter(unique_id=unique_id)
        elif maker_arg:
            m = maker_arg.lower()
            if m in ['fmv', 'fujitsu', '富士通']:
                query = query.filter(Q(maker__icontains='FMV') | Q(maker__icontains='富士通') | Q(name__icontains='FMV'))
            elif m in ['dynabook', 'ダイナブック']:
                query = query.filter(Q(maker__icontains='dynabook') | Q(maker__icontains='ダイナブック'))
            elif m in ['nec']:
                query = query.filter(Q(maker__icontains='NEC') | Q(name__icontains='LAVIE'))
            elif m in ['hp']:
                query = query.filter(Q(maker__icontains='HP') | Q(maker__icontains='Hewlett'))
            elif m in ['dell']:
                query = query.filter(Q(maker__icontains='dell'))
            elif m in ['ark', 'アーク']:
                query = query.filter(Q(maker__icontains='ark') | Q(site_prefix='ark'))
            else:
                query = query.filter(maker__icontains=maker_arg)

        products = list(query[:limit])
        if not products:
            self.stdout.write(self.style.WARNING(f"🔎 解析待ち製品が見つかりませんでした。"))
            return

        if model_arg:
            model_id = model_arg
        else:
            models_content = self.load_prompt_file('ai_models.txt')
            model_id = models_content.split('\n')[0].strip() if models_content else "gemini-1.5-flash"

        self.stdout.write(self.style.SUCCESS(
            f"🚀 解析開始: 全 {len(products)} 件\n"
            f"🔑 稼働キー数: {len(VALID_KEYS)} / スレッド数: {MAX_WORKERS}\n"
            f"⏱️ リクエスト間隔: {INTERVAL:.2f}秒 / モデル: {model_id}"
        ))

        self.counter = 0
        with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
            future_to_product = {}
            for i, product in enumerate(products):
                # 均等にリクエストを投げるためのスリープ
                if i > 0:
                    time.sleep(INTERVAL) 
                
                self.counter += 1
                future = executor.submit(self.analyze_product, product, model_id, self.counter, len(products))
                future_to_product[future] = product

            for future in as_completed(future_to_product):
                product = future_to_product[future]
                try:
                    future.result()
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f"❌ 致命的エラー ({product.unique_id}): {str(e)}"))

    def analyze_product(self, product, model_id, count, total, retry_count=0):
        # 💡 ローテーションから次のキーを取得
        current_api_key = next(key_cycle)
        key_hint = current_api_key[-4:] # デバッグ用末尾4桁

        # 1. プロンプト組み立て
        base_pc_prompt = self.load_prompt_file('analyze_pc_prompt.txt') or "メーカー:{maker}\n製品名:{name}\n価格:{price}\n説明:{description}\n上記を解析せよ。"
        target_maker_slug = self.get_maker_slug(product.maker)
        maker_prompt_file = f"analyze_{target_maker_slug}_prompt.txt"
        brand_rules = self.load_prompt_file(maker_prompt_file) or self.load_prompt_file('analyze_pc_prompt.txt')
        if not brand_rules: brand_rules = "【標準ルール】正確なスペックと5軸スコアを抽出してください。"

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
        api_url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_id}:generateContent?key={current_api_key}"
        
        try:
            current_time = datetime.now().strftime("%H:%M:%S")
            self.stdout.write(f"[{current_time}] 📤 解析中 ({count}/{total}) [Key:..{key_hint}]: [{product.maker}] {product.name}")

            response = requests.post(api_url, json={
                "contents": [{"parts": [{"text": full_prompt}]}],
                "generationConfig": {"temperature": 0.2}
            }, timeout=120)
            
            # 💡 429(Rate Limit) または 5xxエラー の場合は別のキーに期待してリトライ
            if response.status_code in [429, 500, 503, 504]:
                if retry_count < len(VALID_KEYS): # 全てのキーを一巡するまでリトライ可能
                    # 429のときは少し待機時間を増やす
                    wait_time = (retry_count + 1) * 5 
                    self.stdout.write(self.style.WARNING(
                        f"⚠️ 制限検知 ({product.unique_id}) [Key:..{key_hint}]: ステータス {response.status_code}。別のキーでリトライ({retry_count+1}/{len(VALID_KEYS)})"
                    ))
                    time.sleep(wait_time)
                    return self.analyze_product(product, model_id, count, total, retry_count + 1)
                else:
                    self.stdout.write(self.style.ERROR(f"❌ 全てのキーで制限超過またはエラー: {product.unique_id}"))
                    return

            response.raise_for_status()
            res_json = response.json()
            
            if 'candidates' not in res_json or not res_json['candidates']:
                raise ValueError("APIからのレスポンスにコンテンツが含まれていません。")

            full_text = res_json['candidates'][0]['content']['parts'][0]['text']

            # --- データ抽出処理 ---
            spec_data = {}
            spec_match = re.search(r'\[SPEC_JSON\](.*?)\[/SPEC_JSON\]', full_text, re.DOTALL)
            if spec_match:
                try:
                    # コメント行の削除とクリーニング
                    clean_json = re.sub(r'//.*', '', spec_match.group(1).strip())
                    spec_data = json.loads(clean_json)
                except Exception as je:
                    self.stdout.write(self.style.WARNING(f"⚠️ JSONパース失敗 ({product.unique_id}): {str(je)}"))

            summary_match = re.search(r'\[SUMMARY_DATA\](.*?)\[/SUMMARY_DATA\]', full_text, re.DOTALL)
            summary_text = summary_match.group(0).strip() if summary_match else ""

            # プロンプト内のタグを除去してHTMLコンテンツを抽出
            html_content = full_text
            if summary_match: html_content = html_content.replace(summary_match.group(0), '')
            if spec_match: html_content = html_content.replace(spec_match.group(0), '')
            html_content = html_content.strip()

            def safe_int(val, default=0):
                if val is None or val == "": return default
                try: 
                    if isinstance(val, int): return val
                    return int(re.sub(r'[^0-9]', '', str(val)))
                except: return default

            # --- DB保存 ---
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
            product.os_support = spec_data.get('os_support', product.os_support)
            product.license_term = spec_data.get('license_term', product.license_term)
            product.is_download = spec_data.get('is_download', product.is_download)
            product.device_count = safe_int(spec_data.get('device_count'), product.device_count)
            product.edition = spec_data.get('edition', product.edition)
            product.is_ai_pc = spec_data.get('is_ai_pc', False)
            
            try: 
                npu_val = spec_data.get('npu_tops', 0.0)
                product.npu_tops = float(npu_val) if npu_val else 0.0
            except: 
                product.npu_tops = 0.0
                
            product.cpu_socket = spec_data.get('cpu_socket', product.cpu_socket)
            product.motherboard_chipset = spec_data.get('chipset', product.motherboard_chipset)
            product.ram_type = spec_data.get('ram_type', product.ram_type)
            product.power_recommendation = safe_int(spec_data.get('power_wattage'), product.power_recommendation)
            product.ai_summary = summary_text 
            product.ai_content = f"{summary_text}\n\n{html_content}"
            product.target_segment = spec_data.get('target_segment', product.target_segment)
            product.last_spec_parsed_at = timezone.now()
            product.save()

            self.stdout.write(self.style.SUCCESS(f" ✅ 解析完了: {product.unique_id} [Key:..{key_hint}]"))

        except Exception as e:
            self.stdout.write(self.style.ERROR(f"❌ 解析失敗 ({product.unique_id}): {str(e)}"))