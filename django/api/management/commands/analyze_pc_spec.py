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
# Gemma 3系統(RPD 14,400)を活用するため並列数を調整
MAX_WORKERS = 2       # 503エラー抑制のため控えめに設定
SAFE_RPM_LIMIT = 15   # 1分間に15リクエスト程度
INTERVAL = 60 / SAFE_RPM_LIMIT

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROMPT_BASE_DIR = os.path.join(BASE_DIR, "prompt")

class Command(BaseCommand):
    help = '並立処理と流量制限を用いて、PC製品をAI解析する（FMV/Dynabook対応版）'

    def add_arguments(self, parser):
        parser.add_argument('unique_id', type=str, nargs='?')
        parser.add_argument('--limit', type=int, default=1, help='処理件数')
        parser.add_argument('--maker', type=str, help='メーカー指定')
        parser.add_argument('--model', type=str, help='使用するGeminiモデルID')
        parser.add_argument('--force', action='store_true', help='解析済みデータも再解析対象に含める')

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
        force = options['force']

        # 基本クエリの構築
        query = PCProduct.objects.all()
        
        # 未解析のみを対象（--forceがある場合は解析済みも含める）
        if not force:
            query = query.filter(last_spec_parsed_at__isnull=True)

        if unique_id:
            query = query.filter(unique_id=unique_id)
        elif maker_arg:
            # 表記揺れ（FMV/Dynabook/ASUSなど）に対応するためicontainsとQオブジェクトを使用
            m = maker_arg.lower()
            if m in ['fmv', 'fujitsu', '富士通']:
                query = query.filter(Q(maker__icontains='FMV') | Q(maker__icontains='富士通') | Q(maker__icontains='fujitsu'))
            elif m in ['dynabook', 'ダイナブック']:
                query = query.filter(Q(maker__icontains='dynabook') | Q(maker__icontains='ダイナブック'))
            else:
                query = query.filter(maker__icontains=maker_arg)

        products = list(query[:limit])
        if not products:
            # 診断用デバッグ：現在DBにあるメーカー名を一部表示
            available_makers = PCProduct.objects.values_list('maker', flat=True).distinct()[:10]
            self.stdout.write(self.style.WARNING(f"対象製品が見つかりませんでした。"))
            self.stdout.write(f"DB内のメーカー名の例: {list(available_makers)}")
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
                # 流量制限のための待機
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
        
        # メーカー判定：製品のmakerカラムから適切なスラッグを決定する
        raw_maker = (product.maker or "").lower()
        if any(x in raw_maker for x in ["fmv", "富士通", "fujitsu"]):
            target_maker_slug = "fmv"
        elif any(x in raw_maker for x in ["dynabook", "ダイナブック"]):
            target_maker_slug = "dynabook"
        elif "asus" in raw_maker:
            target_maker_slug = "asus"
        else:
            target_maker_slug = maker_arg or "standard"

        # 個別メーカー用プロンプトファイルの読み込み
        maker_prompt_file = f"analyze_{target_maker_slug.lower()}_prompt.txt"
        brand_rules = self.load_prompt_file(maker_prompt_file)

        if not brand_rules:
            brand_rules = "【標準ルール】製品名や型番、説明文からCPU、メモリ、ストレージ容量を正確に推論・抽出してください。"

        # プロンプトの組み立て
        try:
            formatted_base = base_pc_prompt.format(
                maker=product.maker, 
                name=product.name, 
                price=f"{product.price:,}",
                description=product.description
            )
        except Exception:
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
            
            # APIサーバー側の一時的なエラー(429, 503等)へのリトライ処理
            if response.status_code in [429, 500, 503]:
                wait_time = 30 if response.status_code == 429 else 10
                self.stdout.write(self.style.WARNING(f"⏳ サーバー一時エラー ({response.status_code})。{wait_time}秒待機して再試行..."))
                time.sleep(wait_time)
                return self.analyze_product(product, maker_arg, model_id, count, total)
            
            response.raise_for_status()
            res_json = response.json()
            full_text = res_json['candidates'][0]['content']['parts'][0]['text']

            # --- AI回答からのデータ抽出 ---
            spec_data = {}
            spec_match = re.search(r'\[SPEC_JSON\](.*?)\[/SPEC_JSON\]', full_text, re.DOTALL)
            if spec_match:
                try:
                    # JSON内の不要なコメント(//)や末尾カンマなどを簡易的に除去してパース
                    clean_json = re.sub(r'//.*', '', spec_match.group(1).strip())
                    spec_data = json.loads(clean_json)
                except Exception:
                    self.stdout.write(self.style.WARNING(f"⚠️ JSONパース失敗 ({product.unique_id})"))

            # 要約テキストの抽出
            summary_match = re.search(r'\[SUMMARY_DATA\](.*?)\[/SUMMARY_DATA\]', full_text, re.DOTALL)
            summary_text = summary_match.group(1).strip() if summary_match else ""

            # HTMLコンテンツの抽出（タグを除去した残りの部分）
            html_content = re.sub(r'\[SUMMARY_DATA\].*?\[/SUMMARY_DATA\]', '', full_text, flags=re.DOTALL)
            html_content = re.sub(r'\[SPEC_JSON\].*?\[/SPEC_JSON\]', '', html_content, flags=re.DOTALL).strip()

            # 数値変換の安全用関数
            def safe_int(val, default=0):
                if val is None: return default
                try:
                    return int(re.sub(r'[^0-9]', '', str(val)))
                except Exception:
                    return default

            # --- モデルインスタンスの更新 ---
            product.cpu_model = spec_data.get('cpu_model', product.cpu_model)
            product.gpu_model = spec_data.get('gpu_model', product.gpu_model)
            product.memory_gb = safe_int(spec_data.get('memory_gb'), product.memory_gb)
            product.storage_gb = safe_int(spec_data.get('storage_gb'), product.storage_gb)
            product.display_info = spec_data.get('display_info', product.display_info)
            product.spec_score = safe_int(spec_data.get('spec_score'), 0)
            product.is_ai_pc = spec_data.get('is_ai_pc', False)
            
            try:
                product.npu_tops = float(spec_data.get('npu_tops', 0.0))
            except Exception:
                product.npu_tops = 0.0

            product.cpu_socket = spec_data.get('cpu_socket', product.cpu_socket)
            product.motherboard_chipset = spec_data.get('chipset', product.motherboard_chipset)
            product.ram_type = spec_data.get('ram_type', product.ram_type)
            product.power_recommendation = safe_int(spec_data.get('power_wattage'), product.power_recommendation)
            
            product.ai_summary = summary_text
            product.ai_content = html_content
            product.target_segment = spec_data.get('target_segment', product.target_segment)
            
            # 解析完了時刻を記録
            product.last_spec_parsed_at = timezone.now()
            product.save()

            self.stdout.write(self.style.SUCCESS(f" ✅ 解析完了: {product.unique_id}"))

        except Exception as e:
            self.stdout.write(self.style.ERROR(f"❌ 解析失敗 ({product.unique_id}): {str(e)}"))