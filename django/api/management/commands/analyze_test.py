import json
import requests
from django.core.management.base import BaseCommand
from api.models import PCProduct
from django.utils import timezone

# ここにAPIキーを直接セット
GEMINI_API_KEY = "AIzaSyC080GbwuffBIgwq0_lNoJ25BIHQYJ3tRs"

class Command(BaseCommand):
    def add_arguments(self, parser):
        parser.add_argument('unique_id', type=str, nargs='?')

    def handle(self, *args, **options):
        unique_id = options['unique_id']
        if unique_id:
            product = PCProduct.objects.filter(unique_id=unique_id).first()
        else:
            product = PCProduct.objects.filter(last_spec_parsed_at__isnull=True).first()

        if not product:
            self.stdout.write("対象製品なし")
            return

        self.stdout.write(f"🔍 解析中: {product.name}")

        # モデルを安定版に変更
        model = "gemma-3-27b-it"
        api_url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={GEMINI_API_KEY}"
        
        prompt = f"""
        以下のスペック情報を解析し、指定のJSONフォーマットで回答してください。
        
        【スペック情報】
        {product.description}
        
        【出力フォーマット】
        {{
            "memory_gb": 16,
            "storage_gb": 512,
            "npu_tops": 40.0,
            "cpu_model": "Intel Core Ultra 5 125U",
            "gpu_model": "Intel Graphics",
            "display_info": "13.3インチ フルHD 液晶",
            "target_segment": "ビジネス・モバイル",
            "is_ai_pc": true,
            "spec_score": 75
        }}
        """

        # JSONのみを確実に返させるためのペイロード
        payload = {
            "contents": [{
                "parts": [{"text": prompt}]
            }],
            "generationConfig": {
                "response_mime_type": "application/json",
            }
        }

        try:
            response = requests.post(api_url, json=payload, timeout=30)
            response.raise_for_status()
            result = response.json()
            
            # テキスト抽出
            answer_text = result['candidates'][0]['content']['parts'][0]['text']
            spec_data = json.loads(answer_text)

            self.stdout.write(self.style.SUCCESS("--- 解析成功 ---"))
            self.stdout.write(json.dumps(spec_data, indent=4, ensure_ascii=False))

            # DB保存
            product.memory_gb = spec_data.get('memory_gb')
            product.storage_gb = spec_data.get('storage_gb')
            product.npu_tops = spec_data.get('npu_tops')
            product.cpu_model = spec_data.get('cpu_model')
            product.gpu_model = spec_data.get('gpu_model')
            product.target_segment = spec_data.get('target_segment')
            product.is_ai_pc = spec_data.get('is_ai_pc', False)
            product.spec_score = spec_data.get('spec_score', 0)
            product.last_spec_parsed_at = timezone.now()
            product.save()

            self.stdout.write(self.style.SUCCESS("✅ DB保存完了"))

        except Exception as e:
            # 詳細なエラーを出力
            if 'response' in locals() and response.text:
                self.stdout.write(self.style.ERROR(f"APIエラー詳細: {response.text}"))
            self.stdout.write(self.style.ERROR(f"エラー: {str(e)}"))