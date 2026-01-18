import json
import requests
import re
from django.core.management.base import BaseCommand
from api.models.pc_products import PCProduct  # 💡 正しいパスに合わせて調整
from django.utils import timezone

# APIキー
GEMINI_API_KEY = "AIzaSyC080GbwuffBIgwq0_lNoJ25BIHQYJ3tRs"

class Command(BaseCommand):
    help = 'Gemma-3/Geminiを使用して製品スペックを解析し、DBを更新する（解説文付き）'

    def add_arguments(self, parser):
        parser.add_argument('unique_id', type=str, nargs='?')
        parser.add_argument('--limit', type=int, default=1, help='処理する最大件数')

    def handle(self, *args, **options):
        unique_id = options['unique_id']
        limit = options['limit']

        if unique_id:
            products = PCProduct.objects.filter(unique_id=unique_id)
        else:
            # 解析未完了のものを取得
            products = PCProduct.objects.filter(last_spec_parsed_at__isnull=True)[:limit]

        if not products.exists():
            self.stdout.write(self.style.WARNING("対象製品が見つかりませんでした。"))
            return

        for product in products:
            self.analyze_product(product)

    def analyze_product(self, product):
        self.stdout.write(f"\n🔍 解析＆解説生成開始: {product.name} (ID: {product.unique_id})")

        # ブランドルールの設定
        brand_rules = ""
        name_lower = product.name.lower()
        id_lower = product.unique_id.lower()

        if "mouse" in name_lower or "mouse" in id_lower:
            brand_rules = """
            【マウスコンピューター専用ルール】
            1. CPU: 型番の「A」はAMD、「I/i」はIntel。
            2. GPU: G-TUNE/NEXTGEARならゲーミング。型番Uは内蔵グラフィックス。
            3. 画面: A4/B4/G4=14型、A5/B5=15.6型。
            """
        else:
            brand_rules = "【標準ルール】名称からメーカーの命名規則を推測してください。"

        # 💡 プロンプトに "ai_description" を追加
        prompt = f"""
        あなたはPC専門家です。以下の製品情報を解析し、指定のJSON形式で出力してください。
        
        {brand_rules}
        
        製品名: {product.name}
        価格: {product.price}円
        説明文: {product.description}
        
        要求事項:
        1. 数値スペック（メモリ、ストレージ等）を正確に抽出してください。
        2. 「ai_description」項目には、このPCの魅力を伝える200文字程度のプロ並みの解説文を作成してください。
        
        フォーマット:
        {{
            "memory_gb": 16,
            "storage_gb": 512,
            "npu_tops": 0.0,
            "cpu_model": "CPU名",
            "gpu_model": "GPU名",
            "display_info": "画面情報",
            "target_segment": "一般事務/ゲーミング/クリエイター等",
            "is_ai_pc": false,
            "spec_score": 70,
            "ai_description": "ここに魅力的な解説文を入力"
        }}
        """

        # URLの組み立て
        host = "generativelanguage.googleapis.com"
        # 💡 モデル名は gemma-3 または gemini-1.5-flash/pro などが使えます
        path = "v1beta/models/gemini-1.5-flash:generateContent" 
        api_url = f"https://{host}/{path}?key={GEMINI_API_KEY}"
        
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {
                "temperature": 0.2, # 解説文に少し表現力を持たせるため0.1より微増
                "response_mime_type": "application/json" # JSON出力を強制
            }
        }

        try:
            response = requests.post(api_url, json=payload, timeout=40)
            response.raise_for_status()
            result = response.json()
            
            # JSONのパース
            answer_text = result['candidates'][0]['content']['parts'][0]['text'].strip()
            spec_data = json.loads(answer_text)

            self.stdout.write(self.style.SUCCESS("--- 解析＆生成成功 ---"))

            # 💡 DBへの保存処理（スペック数値 + 解説文）
            product.memory_gb = spec_data.get('memory_gb')
            product.storage_gb = spec_data.get('storage_gb')
            product.npu_tops = spec_data.get('npu_tops')
            product.cpu_model = spec_data.get('cpu_model')
            product.gpu_model = spec_data.get('gpu_model')
            product.display_info = spec_data.get('display_info')
            product.target_segment = spec_data.get('target_segment')
            product.is_ai_pc = spec_data.get('is_ai_pc', False)
            product.spec_score = spec_data.get('spec_score', 0)
            
            # 💡 ここでAI解説文を保存（モデルのフィールド名に合わせてください）
            product.ai_content = spec_data.get('ai_description')
            
            product.last_spec_parsed_at = timezone.now()
            product.save()
            
            self.stdout.write(self.style.SUCCESS(f"✅ スペックと解説文を保存しました: {product.unique_id}"))

        except Exception as e:
            self.stdout.write(self.style.ERROR(f"❌ エラー発生 ({product.unique_id}): {str(e)}"))