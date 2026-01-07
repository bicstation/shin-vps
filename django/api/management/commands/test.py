from django.core.management.base import BaseCommand
import os
import requests

class Command(BaseCommand):
    help = '現在使用可能なGeminiモデルの一覧と正確なモデル名を表示します'

    def handle(self, *args, **options):
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            self.stdout.write(self.style.ERROR("Error: GEMINI_API_KEY が設定されていません。"))
            return

        # 利用可能なモデルリストを取得
        url = f"https://generativelanguage.googleapis.com/v1beta/models?key={api_key}"

        try:
            response = requests.get(url)
            res_json = response.json()

            if 'error' in res_json:
                self.stdout.write(self.style.ERROR(f"APIエラー: {res_json['error']['message']}"))
                return

            self.stdout.write(self.style.SUCCESS("--- 利用可能なモデル一覧 ---"))
            for m in res_json.get('models', []):
                # モデル名とサポートしている機能を抽出
                name = m.get('name')
                methods = m.get('supportedGenerationMethods', [])
                
                # コンテンツ生成ができるモデルだけ表示
                if 'generateContent' in methods:
                    self.stdout.write(f"モデル名: {name}")

        except Exception as e:
            self.stdout.write(self.style.ERROR(f"通信エラー: {e}"))