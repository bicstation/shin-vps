import json
import requests
import re
import os
from django.core.management.base import BaseCommand
from api.models import PCProduct
from django.utils import timezone

# APIキー
GEMINI_API_KEY = "AIzaSyC080GbwuffBIgwq0_lNoJ25BIHQYJ3tRs"

class Command(BaseCommand):
    help = 'Gemma-3を使用して製品スペック解析と魅力的な解説文・要約を同時に生成してDBを更新する'

    def add_arguments(self, parser):
        parser.add_argument('unique_id', type=str, nargs='?')
        parser.add_argument('--limit', type=int, default=1, help='処理する最大件数')

    def handle(self, *args, **options):
        unique_id = options['unique_id']
        limit = options['limit']

        if unique_id:
            products = PCProduct.objects.filter(unique_id=unique_id)
        else:
            products = PCProduct.objects.filter(last_spec_parsed_at__isnull=True)[:limit]

        if not products.exists():
            self.stdout.write(self.style.WARNING("対象製品が見つかりませんでした。"))
            return

        for product in products:
            self.analyze_product(product)

    def analyze_product(self, product):
        self.stdout.write(f"\n🔍 Gemma-3 解析開始: {product.name} (ID: {product.unique_id})")

        # 1. ブランドルールの判定
        brand_rules = ""
        name_lower = product.name.lower()
        id_lower = product.unique_id.lower()

        if "mouse" in name_lower or "mouse" in id_lower:
            brand_rules = """
            【マウスコンピューター専用ルール】
            1. CPUの判断:
               - 型番に「A」があれば AMD (例: A4-A5U)
               - 型番に「I」または「i」があれば Intel (例: I5U, I7G)
            2. GPU(グラフィック)の判断:
               - シリーズ名が「G-TUNE」「NEXTGEAR」ならゲーミング機。型番に「G60」「G50」があれば RTX 4060/3050 等を推測。
               - シリーズ名が「MousePro」「DAIV (R4など)」「mouse (A4/B4等)」で、型番に「U」があれば「CPU内蔵グラフィックス」の可能性が高いです。
            3. 画面サイズ:
               - 「A4」「B4」「G4」などは 14インチ、「A5」「B5」などは 15.6インチを指します.
            """
        else:
            brand_rules = "【標準ルール】型番や名称からメーカーの命名規則を推測して解析してください。"

        # 2. プロンプトの構築（Gemma-3向けにJSONのみを出すよう強調）
        prompt = f"""
        あなたはPC専門家およびプロのWebライターです。以下の情報を解析し、JSON形式で出力してください。
        解説、思考プロセス、挨拶は一切不要です。出力は必ず純粋なJSONのみにしてください。
        
        {brand_rules}
        
        製品名: {product.name}
        説明文: {product.description}
        
        出力JSONフォーマット:
        {{
            "memory_gb": 16,
            "storage_gb": 512,
            "npu_tops": 0.0,
            "cpu_model": "CPU名",
            "gpu_model": "GPU名",
            "display_info": "画面情報",
            "target_segment": "層",
            "is_ai_pc": false,
            "spec_score": 70,
            "ai_content": "このPCの魅力を伝える300文字程度の紹介文",
            "ai_summary": "一覧用の60文字以内の短い紹介文"
        }}
        """

        # 3. APIリクエストの設定 (JSON modeを無効化)
        model_id = "gemma-3-27b-it"
        api_url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_id}:generateContent?key={GEMINI_API_KEY}"
        
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {
                "temperature": 0.1,
                # JSON mode は無効にして、プレーンテキストとして受け取る
            }
        }

        try:
            response = requests.post(api_url, json=payload, timeout=60)
            
            if response.status_code != 200:
                self.stdout.write(self.style.ERROR(f"❌ API Error {response.status_code}: {response.text}"))
                return

            result = response.json()
            answer_text = result['candidates'][0]['content']['parts'][0]['text'].strip()

            # 4. JSONの抽出（正規表現で ```json { ... } ``` の中身だけを取り出す）
            # Gemma-3はMarkdownでラップしてくることが多いため
            match = re.search(r'\{.*\}', answer_text, re.DOTALL)
            if match:
                clean_json = match.group(0)
            else:
                clean_json = answer_text

            spec_data = json.loads(clean_json)

            self.stdout.write(self.style.SUCCESS("--- Gemma-3 解析・生成成功 ---"))

            # 5. DB保存
            product.memory_gb = spec_data.get('memory_gb')
            product.storage_gb = spec_data.get('storage_gb')
            product.npu_tops = spec_data.get('npu_tops')
            product.cpu_model = spec_data.get('cpu_model')
            product.gpu_model = spec_data.get('gpu_model')
            product.display_info = spec_data.get('display_info')
            product.target_segment = spec_data.get('target_segment')
            product.is_ai_pc = spec_data.get('is_ai_pc', False)
            product.spec_score = spec_data.get('spec_score', 0)
            
            product.ai_content = spec_data.get('ai_content')
            product.ai_summary = spec_data.get('ai_summary')
            
            product.last_spec_parsed_at = timezone.now()
            product.save()
            
            self.stdout.write(self.style.SUCCESS(f"✅ DB保存完了 (Gemma-3): {product.unique_id}"))

        except Exception as e:
            self.stdout.write(self.style.ERROR(f"❌ 例外発生 ({product.unique_id}): {str(e)}"))
            # デバッグ用に生の回答を表示
            if 'answer_text' in locals():
                self.stdout.write(f"Raw answer: {answer_text}")