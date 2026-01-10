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
            response = requests.get(url, timeout=10)
            res_json = response.json()

            if 'error' in res_json:
                self.stdout.write(self.style.ERROR(f"APIエラー: {res_json['error']['message']}"))
                return

            self.stdout.write(self.style.SUCCESS(f"{'# モデル名 (ai_models.txt用ID)':<45} | {'機能説明'}"))
            self.stdout.write("-" * 80)

            found_any = False
            for m in res_json.get('models', []):
                name_full = m.get('name', '')
                # 'models/gemini-xx' から 'gemini-xx' だけを抽出
                model_id = name_full.replace('models/', '')
                display_name = m.get('displayName', 'No Name')
                methods = m.get('supportedGenerationMethods', [])
                
                # コンテンツ生成ができるモデルだけ表示
                if 'generateContent' in methods:
                    # ai_models.txtにそのまま貼れる形式で表示
                    self.stdout.write(f"{model_id:<45} | {display_name}")
                    found_any = True

            if not found_any:
                self.stdout.write("コンテンツ生成可能なモデルが見つかりませんでした。")

        except Exception as e:
            self.stdout.write(self.style.ERROR(f"通信エラー: {e}"))