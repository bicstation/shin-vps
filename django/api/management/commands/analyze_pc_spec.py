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
from django.db.models import Q

# === API設定 ===
GEMINI_API_KEY = "AIzaSyC080GbwuffBIgwq0_lNoJ25BIHQYJ3tRs"

# === レート制限の設定 ===
MAX_WORKERS = 2       # 503エラー抑制のため控えめに設定
SAFE_RPM_LIMIT = 15   # 1分間に15リクエスト程度
INTERVAL = 60 / SAFE_RPM_LIMIT

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROMPT_BASE_DIR = os.path.join(BASE_DIR, "prompt")

class Command(BaseCommand):
    help = '並列処理と流量制限を用いて、PC製品およびソフトウェアをAI解析・5軸スコアリングする'

    def add_arguments(self, parser):
        parser.add_argument('unique_id', type=str, nargs='?')
        parser.add_argument('--limit', type=int, default=1, help='処理件数')
        parser.add_argument('--maker', type=str, help='メーカー指定（フィルタ用）')
        parser.add_argument('--model', type=str, help='使用するGeminiモデルID')
        parser.add_argument('--force', action='store_true', help='解析済みデータも再解析対象に含める')

    def load_prompt_file(self, filename):
        path = os.path.join(PROMPT_BASE_DIR, filename)
        try:
            with open(path, 'r', encoding='utf-8') as f:
                return f.read()
        except FileNotFoundError:
            return ""

    def get_maker_slug(self, maker_name):
        """
        メーカー名からファイル名に使用するスラッグを動的に生成・判定する
        プロンプトファイルの選択に利用
        """
        if not maker_name:
            return "standard"
        
        m = str(maker_name).lower()
        if any(x in m for x in ['fmv', 'fujitsu', '富士通']):
            return "fmv"
        if any(x in m for x in ['dynabook', 'ダイナブック']):
            return "dynabook"
        if any(x in m for x in ['sourcenext', 'ソースネクスト']):
            return "sourcenext"
        if any(x in m for x in ['trend', 'トレンドマイクロ']):
            return "trendmicro"
        if 'asus' in m:
            return "asus"
        if 'sony' in m:
            return "sony"
        if 'hp' in m:
            return "hp"
        if 'dell' in m:
            return "dell"
        if 'lenovo' in m:
            return "lenovo"
        if 'mouse' in m or 'マウス' in m:
            return "mouse"
        if 'nec' in m:
            return "nec"
        
        slug = re.sub(r'[^a-z0-9]', '', m)
        return slug if slug else "standard"

    def handle(self, *args, **options):
        unique_id = options['unique_id']
        limit = options['limit']
        maker_arg = options['maker']
        model_arg = options['model']
        force = options['force']

        # 基本クエリの構築
        query = PCProduct.objects.all()
        
        if not force:
            query = query.filter(last_spec_parsed_at__isnull=True)

        if unique_id:
            query = query.filter(unique_id=unique_id)
        elif maker_arg:
            m = maker_arg.lower()
            # 💡 フィルタリングロジックの強化：メーカー名・説明・URLなどから柔軟に検索
            if m in ['fmv', 'fujitsu', '富士通']:
                query = query.filter(
                    Q(maker__icontains='FMV') | 
                    Q(maker__icontains='富士通') | 
                    Q(maker__icontains='Fujitsu') |
                    Q(name__icontains='FMV')
                )
            elif m in ['dynabook', 'ダイナブック']:
                query = query.filter(Q(maker__icontains='dynabook') | Q(maker__icontains='ダイナブック'))
            elif m in ['nec']:
                query = query.filter(Q(maker__icontains='NEC') | Q(name__icontains='LAVIE'))
            elif m in ['lenovo']:
                query = query.filter(Q(maker__icontains='lenovo'))
            else:
                # 一般的なメーカー指定（部分一致）
                query = query.filter(maker__icontains=maker_arg)

        # 重複を排除し、指定件数取得
        products = list(query[:limit])
        
        if not products:
            self.stdout.write(self.style.WARNING(f"🔎 メーカー指定 [{maker_arg}] に該当する未解析製品が見つかりませんでした。"))
            return

        # モデル選択
        if model_arg:
            model_id = model_arg
        else:
            models_content = self.load_prompt_file('ai_models.txt')
            model_id = models_content.split('\n')[0].strip() if models_content else "gemini-1.5-flash"

        self.stdout.write(self.style.SUCCESS(f"🚀 解析開始: 全 {len(products)} 件 / モデル: {model_id}"))

        self.counter = 0
        with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
            future_to_product = {}
            for product in products:
                # 流量制限
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

    def analyze_product(self, product, model_id, count, total):
        # 1. 基本プロンプトの読み込み
        base_pc_prompt = self.load_prompt_file('analyze_pc_prompt.txt')
        if not base_pc_prompt:
            base_pc_prompt = "メーカー:{maker}\n製品名:{name}\n価格:{price}\n説明:{description}\n上記を解析してJSONスペックを作成せよ。"
        
        # 2. メーカー別プロンプトの動的判定
        target_maker_slug = self.get_maker_slug(product.maker)
        maker_prompt_file = f"analyze_{target_maker_slug}_prompt.txt"
        
        # 固有のプロンプトがなければ standard を読み込む
        brand_rules = self.load_prompt_file(maker_prompt_file)
        if not brand_rules:
            brand_rules = self.load_prompt_file('analyze_standard_prompt.txt')

        if not brand_rules:
            brand_rules = "【標準ルール】スペックから正確なスペック、および5軸評価スコアを抽出してください。"

        # 3. 構造化出力の厳格化
        structure_instruction = """
必ず以下のJSON形式を [SPEC_JSON] タグ内に含めてください。スコアは1-100で評価してください。
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

また、ユーザー向けの紹介文（HTML形式、h2やpタグ使用）を [SUMMARY_DATA]タグとは別に出力してください。
注目ポイントを以下の形式で [SUMMARY_DATA] タグ内に含めてください：
[SUMMARY_DATA]
POINT1: 特徴1
POINT2: 特徴2
POINT3: 特徴3
TARGET: おすすめのユーザー
[/SUMMARY_DATA]
"""
        try:
            # 💡 formatの失敗を防ぐため安全に埋め込み
            formatted_base = base_pc_prompt.replace("{maker}", str(product.maker))\
                                         .replace("{name}", str(product.name))\
                                         .replace("{price}", f"{product.price:,}")\
                                         .replace("{description}", str(product.description or ""))
        except Exception:
            formatted_base = f"メーカー:{product.maker}\n製品名:{product.name}\n価格:{product.price}\n{product.description}"

        full_prompt = f"{formatted_base}\n\nブランド別追加ルール:\n{brand_rules}\n\n{structure_instruction}"

        api_url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_id}:generateContent?key={GEMINI_API_KEY}"
        
        try:
            current_time = datetime.now().strftime("%H:%M:%S")
            self.stdout.write(f"[{current_time}] 📤 解析中 ({count}/{total}): [{product.maker}] {product.name}")

            response = requests.post(api_url, json={
                "contents": [{"parts": [{"text": full_prompt}]}],
                "generationConfig": {"temperature": 0.2}
            }, timeout=120)
            
            if response.status_code in [429, 500, 503]:
                wait_time = 30 if response.status_code == 429 else 10
                time.sleep(wait_time)
                return self.analyze_product(product, model_id, count, total)
            
            response.raise_for_status()
            res_json = response.json()
            full_text = res_json['candidates'][0]['content']['parts'][0]['text']

            # 4. AI回答からのデータ抽出
            spec_data = {}
            spec_match = re.search(r'\[SPEC_JSON\](.*?)\[/SPEC_JSON\]', full_text, re.DOTALL)
            if spec_match:
                try:
                    # JSON内のコメントを削除
                    clean_json = re.sub(r'//.*', '', spec_match.group(1).strip())
                    spec_data = json.loads(clean_json)
                except Exception:
                    self.stdout.write(self.style.WARNING(f"⚠️ JSONパース失敗 ({product.unique_id})"))

            summary_match = re.search(r'\[SUMMARY_DATA\](.*?)\[/SUMMARY_DATA\]', full_text, re.DOTALL)
            summary_text = summary_match.group(0).strip() if summary_match else ""

            # HTMLコンテンツの抽出（タグを除いた部分）
            html_content = full_text
            if summary_match:
                html_content = html_content.replace(summary_match.group(0), '')
            if spec_match:
                html_content = html_content.replace(spec_match.group(0), '')
            
            html_content = html_content.strip()

            def safe_int(val, default=0):
                if val is None or val == "": return default
                try:
                    return int(re.sub(r'[^0-9]', '', str(val)))
                except: return default

            # 5. モデルインスタンスの更新
            product.cpu_model = spec_data.get('cpu_model', product.cpu_model)
            product.gpu_model = spec_data.get('gpu_model', product.gpu_model)
            product.memory_gb = safe_int(spec_data.get('memory_gb'), product.memory_gb)
            product.storage_gb = safe_int(spec_data.get('storage_gb'), product.storage_gb)
            product.display_info = spec_data.get('display_info', product.display_info)
            product.spec_score = safe_int(spec_data.get('spec_score'), 0)
            
            # レーダーチャート用スコア
            product.score_cpu = safe_int(spec_data.get('score_cpu'), 0)
            product.score_gpu = safe_int(spec_data.get('score_gpu'), 0)
            product.score_cost = safe_int(spec_data.get('score_cost'), 0)
            product.score_portable = safe_int(spec_data.get('score_portable'), 0)
            product.score_ai = safe_int(spec_data.get('score_ai'), 0)

            # 追加スペック
            product.os_support = spec_data.get('os_support', product.os_support)
            product.license_term = spec_data.get('license_term', product.license_term)
            product.is_download = spec_data.get('is_download', product.is_download)
            product.device_count = safe_int(spec_data.get('device_count'), product.device_count)
            product.edition = spec_data.get('edition', product.edition)
            
            product.is_ai_pc = spec_data.get('is_ai_pc', False)
            try:
                product.npu_tops = float(spec_data.get('npu_tops', 0.0))
            except:
                product.npu_tops = 0.0

            product.cpu_socket = spec_data.get('cpu_socket', product.cpu_socket)
            product.motherboard_chipset = spec_data.get('chipset', product.motherboard_chipset)
            product.ram_type = spec_data.get('ram_type', product.ram_type)
            product.power_recommendation = safe_int(spec_data.get('power_wattage'), product.power_recommendation)
            
            # AI生成コンテンツ（サマリーデータを内包させることでNext.js側でパース可能にする）
            product.ai_summary = summary_text 
            product.ai_content = f"{summary_text}\n\n{html_content}"
            product.target_segment = spec_data.get('target_segment', product.target_segment)
            
            product.last_spec_parsed_at = timezone.now()
            product.save()

            self.stdout.write(self.style.SUCCESS(f" ✅ 解析完了: {product.unique_id} (Score:{product.score_cost})"))

        except Exception as e:
            self.stdout.write(self.style.ERROR(f"❌ 解析失敗 ({product.unique_id}): {str(e)}"))