import os
import requests
from django.core.management.base import BaseCommand

class Command(BaseCommand):
    help = 'Gemini APIで利用可能なモデル名と、それぞれの入力・出力上限を一覧表示します'

    def handle(self, *args, **options):
        # --- 1. 環境変数のチェック ---
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            self.stdout.write(self.style.ERROR("\n[!] GEMINI_API_KEY が設定されていません。"))
            self.stdout.write("    export GEMINI_API_KEY='your_key_here' を実行してください。\n")
            return

        # --- 2. モデル一覧の取得 ---
        # v1beta を指定することで最新のモデル情報（Gemma3等）を取得可能にします
        url = f"https://generativelanguage.googleapis.com/v1beta/models?key={api_key}"

        self.stdout.write(self.style.HTTP_INFO("\n🌐 Google AI Studio から最新モデル情報を取得中...\n"))

        try:
            response = requests.get(url, timeout=15)
            res_json = response.json()

            if 'error' in res_json:
                self.stdout.write(self.style.ERROR(f"❌ APIエラー: {res_json['error']['message']}"))
                return

            # --- 3. 見栄えの良いテーブルヘッダーの描画 ---
            # カラム幅の定義
            W_ID = 38
            W_IN = 12
            W_OUT = 10
            W_NAME = 30

            # ヘッダー行
            header = (
                f"{'# モデルID (ai_models.txt用)':<{W_ID}} | "
                f"{'入力上限':>{W_IN}} | "
                f"{'出力上限':>{W_OUT}} | "
                f"{'表示名'}"
            )
            
            self.stdout.write(self.style.SQL_FIELD(header))
            self.stdout.write(self.style.SQL_FIELD("-" * (W_ID + W_IN + W_OUT + W_NAME + 10)))

            # --- 4. データの抽出と表示 ---
            found_count = 0
            for m in res_json.get('models', []):
                # 'models/gemini-1.5-flash' -> 'gemini-1.5-flash'
                model_id = m.get('name', '').replace('models/', '')
                display_name = m.get('displayName', 'Unknown')
                
                # トークン制限（APIレスポンスから取得、なければ0）
                input_limit = m.get('inputTokenLimit', 0)
                output_limit = m.get('outputTokenLimit', 0)
                
                # 生成機能(generateContent)を持っているモデルのみに絞り込む
                methods = m.get('supportedGenerationMethods', [])
                if 'generateContent' in methods:
                    # 1,000,000 などのカンマ区切り、0の場合はハイフン
                    in_str = f"{input_limit:,}" if input_limit else "-"
                    out_str = f"{output_limit:,}" if output_limit else "-"
                    
                    # 1.5 Pro などの巨大モデルは色を変える（演出）
                    style_func = self.stdout.write
                    if input_limit >= 1000000:
                        style_func = lambda x: self.stdout.write(self.style.SUCCESS(x))
                    elif "gemma" in model_id:
                        style_func = lambda x: self.stdout.write(self.style.WARNING(x))

                    line = (
                        f"{model_id:<{W_ID}} | "
                        f"{in_str:>{W_IN}} | "
                        f"{out_str:>{W_OUT}} | "
                        f"{display_name}"
                    )
                    style_func(line)
                    found_count += 1

            # --- 5. 終了メッセージ ---
            self.stdout.write(self.style.SQL_FIELD("-" * (W_ID + W_IN + W_OUT + W_NAME + 10)))
            self.stdout.write(f"\n✅ 合計 {found_count} 個の生成可能モデルが見つかりました。\n")
            
            self.stdout.write(self.style.HTTP_REDIRECT("💡 ヒント:"))
            self.stdout.write(" - 入力上限が大きいモデルは、長いJSONデータやドキュメントの解析に向いています。")
            self.stdout.write(" - 毎日大量に投稿する場合は、'flash-lite' 系がコストパフォーマンス（無料枠）に優れています。\n")

        except requests.exceptions.RequestException as e:
            self.stdout.write(self.style.ERROR(f"\n❌ 通信エラーが発生しました: {e}\n"))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"\n❌ 予期せぬエラー: {e}\n"))