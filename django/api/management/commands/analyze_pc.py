# -*- coding: utf-8 -*-
import json
import requests
import re
import os
from django.core.management.base import BaseCommand
from api.models.pc_products import PCProduct
from django.utils import timezone

# API設定
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
BASE_PROMPT_DIR = os.path.join(os.path.dirname(__file__), 'prompt')

class Command(BaseCommand):
    help = 'Gemma-3を使用して外部プロンプトに基づき製品スペック解析とHTML記事生成を行い、DBを更新する'

    def add_arguments(self, parser):
        parser.add_argument('unique_id', type=str, nargs='?')
        parser.add_argument('--limit', type=int, default=1, help='処理する最大件数')

    def load_prompt(self, filename):
        """promptディレクトリからファイルを読み込むヘルパー"""
        path = os.path.join(BASE_PROMPT_DIR, filename)
        try:
            with open(path, 'r', encoding='utf-8') as f:
                return f.read()
        except FileNotFoundError:
            return ""

    def handle(self, *args, **options):
        unique_id = options['unique_id']
        limit = options['limit']

        # モデルリストの確認（デバッグ用）
        models_list = self.load_prompt('ai_models.txt')
        self.stdout.write(f"📂 使用可能モデル候補:\n{models_list.strip()}\n")

        if unique_id:
            products = PCProduct.objects.filter(unique_id=unique_id)
        else:
            # 解析未実施の製品を優先
            products = PCProduct.objects.filter(last_spec_parsed_at__isnull=True)[:limit]

        if not products.exists():
            self.stdout.write(self.style.WARNING("対象製品が見つかりませんでした。"))
            return

        for product in products:
            self.analyze_product(product)

    def analyze_product(self, product):
        self.stdout.write(f"\n🔍 解析＆コンテンツ生成開始: {product.name} ({product.unique_id})")

        # 1. 外部プロンプトの読み込み
        base_pc_prompt = self.load_prompt('analyze_pc_prompt.txt')
        mouse_rules = self.load_prompt('analyze_mouse_prompt.txt')
        
        # 2. ブランドルールの選定
        brand_rules = ""
        name_lower = product.name.lower()
        id_lower = product.unique_id.lower()
        if "mouse" in name_lower or "mouse" in id_lower or product.maker == "MouseComputer":
            brand_rules = mouse_rules
        else:
            brand_rules = "【標準ルール】型番や名称からメーカーの命名規則を推測して解析してください。"

        # 3. 最終プロンプトの組み立て
        # 自作PC提案用のカラム（Socket, Chipset, RAM Type, PSU）を抽出対象に追加
        full_prompt = f"""
{base_pc_prompt.format(maker=product.maker, name=product.name, price=product.price, description=product.description)}

【追加命令：詳細スペック抽出】
記事執筆と同時に、以下のスペック情報を正確に抽出し、回答の最後に必ず [SPEC_JSON] {{...}} [/SPEC_JSON] の形式で含めてください。
特に、CPUやマザーボードの型番から「ソケット」や「チップセット」を論理的に推論してください。

{{
    "memory_gb": 整数, 
    "storage_gb": 整数, 
    "npu_tops": 小数,
    "cpu_model": "文字列", 
    "gpu_model": "文字列",
    "cpu_socket": "LGA1700/AM5等", 
    "chipset": "B760/Z790等", 
    "ram_type": "DDR5/DDR4",
    "power_wattage": 整数(推奨電源W数),
    "display_info": "文字列", 
    "target_segment": "層",
    "is_ai_pc": boolean, 
    "spec_score": 0-100
}}

ブランド固有ルール:
{brand_rules}
"""

        # 4. APIリクエスト設定 (Gemma-3 27Bを使用)
        model_id = "gemma-3-27b-it"
        api_url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_id}:generateContent?key={GEMINI_API_KEY}"
        
        payload = {
            "contents": [{"parts": [{"text": full_prompt}]}],
            "generationConfig": {
                "temperature": 0.2, 
            }
        }

        try:
            response = requests.post(api_url, json=payload, timeout=90)
            
            if response.status_code != 200:
                self.stdout.write(self.style.ERROR(f"❌ API Error {response.status_code}: {response.text}"))
                return

            result = response.json()
            full_response_text = result['candidates'][0]['content']['parts'][0]['text'].strip()

            # --- データ抽出フェーズ ---

            # A. タイトルとHTML本文の分離
            lines = full_response_text.split('\n')
            title = lines[0].replace('#', '').strip() # Markdownの#を除去
            
            # 特殊タグを除いた部分をHTMLとして抽出
            html_content = "\n".join(lines[1:])
            html_content = re.sub(r'\[SUMMARY_DATA\].*?\[/SUMMARY_DATA\]', '', html_content, flags=re.DOTALL)
            html_content = re.sub(r'\[SPEC_JSON\].*?\[/SPEC_JSON\]', '', html_content, flags=re.DOTALL).strip()

            # B. [SUMMARY_DATA] の抽出（meta description用）
            summary_match = re.search(r'\[SUMMARY_DATA\](.*?)\[/SUMMARY_DATA\]', full_response_text, re.DOTALL)
            summary_text = summary_match.group(1).strip() if summary_match else ""

            # C. [SPEC_JSON] の抽出
            spec_match = re.search(r'\[SPEC_JSON\](.*?)\[/SPEC_JSON\]', full_response_text, re.DOTALL)
            if spec_match:
                spec_json_str = spec_match.group(1).strip()
                spec_data = json.loads(spec_json_str)
            else:
                # 予備：もしタグがなければ全体からJSONを探す
                json_match = re.search(r'\{.*"memory_gb".*\}', full_response_text, re.DOTALL)
                spec_data = json.loads(json_match.group(0)) if json_match else {}

            self.stdout.write(self.style.SUCCESS(f"--- 解析成功: {title[:30]}... ---"))

            # --- DB保存フェーズ ---
            # 基本情報
            product.ai_summary = summary_text
            product.ai_content = html_content
            
            # AI抽出スペック
            product.cpu_model = spec_data.get('cpu_model')
            product.gpu_model = spec_data.get('gpu_model')
            product.memory_gb = spec_data.get('memory_gb')
            product.storage_gb = spec_data.get('storage_gb')
            product.npu_tops = spec_data.get('npu_tops')
            product.display_info = spec_data.get('display_info')
            product.is_ai_pc = spec_data.get('is_ai_pc', False)
            product.spec_score = spec_data.get('spec_score', 0)
            product.target_segment = spec_data.get('target_segment')

            # 🚀 自作PC提案用新設カラムへの保存
            product.cpu_socket = spec_data.get('cpu_socket')
            product.motherboard_chipset = spec_data.get('chipset')
            product.ram_type = spec_data.get('ram_type')
            product.power_recommendation = spec_data.get('power_wattage')
            
            # タイムスタンプ更新
            product.last_spec_parsed_at = timezone.now()
            product.save()
            
            self.stdout.write(self.style.SUCCESS(f"✅ DB更新完了: {product.unique_id} (Socket: {product.cpu_socket}, Chipset: {product.motherboard_chipset})"))

        except Exception as e:
            self.stdout.write(self.style.ERROR(f"❌ 例外発生 ({product.unique_id}): {str(e)}"))
            if 'full_response_text' in locals():
                # エラー時でも生レスポンスの冒頭をログ出力
                self.stdout.write(f"Raw Response Sample: {full_response_text[:200]}...")