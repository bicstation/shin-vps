from django.core.management.base import BaseCommand
# 正しいインポートパス：ファイル名が pc_products なので .pc_products になります
from api.models.pc_products import PCProduct 
import requests
import random
from requests.auth import HTTPBasicAuth

class Command(BaseCommand):
    help = 'DB内のLenovo製品情報を元にGeminiで商品紹介記事を生成します'

    def handle(self, *args, **options):
        # --- 設定 ---
        GEMINI_API_KEY = "AIzaSyA-o3ZZUGLIscJJnD0HTnlxWqniLuwZhR8"
        WP_URL = "https://blog.tiper.live/wp-json/wp/v2/bicstation"
        WP_USER = "bicstation"
        WP_APP_PASSWORD = "9re0 t3de WCe1 u1IL MudX 31IY"
        GEMINI_URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key={GEMINI_API_KEY}"

        # 1. DBから在庫があり、Lenovoの製品をランダムに取得
        # モデル定義に合わせて 'PCProduct' を使用
        products = PCProduct.objects.filter(
            maker__icontains='Lenovo',
            is_active=True
        ).exclude(stock_status="受注停止中")
        
        if not products.exists():
            self.stdout.write(self.style.ERROR("有効なLenovo製品がDBに見つかりませんでした。"))
            return

        product = random.choice(products)
        self.stdout.write(self.style.SUCCESS(f"ターゲット商品確定: {product.name}"))

        # 2. プロンプト作成（モデルのフィールドをフル活用）
        prompt = f"""
        あなたはテック系ブログ『Bicstation』の専門レビュアーです。
        以下の実在するPC製品データに基づき、読者が購入したくなる魅力的な紹介記事を日本語で書いてください。

        【商品データ】
        メーカー: {product.maker}
        商品名: {product.name}
        価格: {product.price}円
        スペック詳細: {product.description}
        現在の状況: {product.stock_status}

        【構成ルール】
        1. 1行目：キャッチーなタイトル（商品名を含み、ベネフィットを強調）
        2. 導入：このPCがどんな悩みを解決するか
        3. 特徴：スペック（CPUやメモリ等）を分かりやすく解説
        4. おすすめユーザー：どんな人に最適か
        5. 最後に必ず以下の形式でリンクを含めてください：
           [詳しくはこちら： {product.url} ]

        挨拶や「承知いたしました」等の発言は一切不要です。
        """

        # 3. Gemini API 呼び出し
        payload = { "contents": [{ "parts": [{"text": prompt}] }] }
        
        try:
            self.stdout.write("Geminiが記事を執筆中...")
            response = requests.post(GEMINI_URL, json=payload)
            res_json = response.json()
            
            if 'error' in res_json:
                self.stdout.write(self.style.ERROR(f"Gemini APIエラー: {res_json['error']['message']}"))
                return

            ai_text = res_json['candidates'][0]['content']['parts'][0]['text']
            lines = ai_text.strip().split('\n')
            title = lines[0].replace('#', '').strip()
            content = '\n'.join(lines[1:]).strip()

            # 4. WordPress 投稿
            wp_payload = {
                "title": title,
                "content": content,
                "status": "publish"
            }
            
            wp_res = requests.post(
                WP_URL, 
                json=wp_payload, 
                auth=HTTPBasicAuth(WP_USER, WP_APP_PASSWORD)
            )
            
            if wp_res.status_code == 201:
                self.stdout.write(self.style.SUCCESS(f"【投稿成功】 ID: {wp_res.json().get('id')}"))
                self.stdout.write(f"タイトル: {title}")
            else:
                self.stdout.write(self.style.ERROR(f"WP投稿失敗: {wp_res.text}"))

        except Exception as e:
            self.stdout.write(self.style.ERROR(f"予期せヌエラー: {e}"))