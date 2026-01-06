from django.core.management.base import BaseCommand
from api.models import PcProduct
import requests
import random
from requests.auth import HTTPBasicAuth

class Command(BaseCommand):
    help = 'DB内のLenovo製品情報を元にGeminiで記事を生成しWordPressに投稿します'

    def handle(self, *args, **options):
        # --- 設定 ---
        GEMINI_API_KEY = "AIzaSyA-o3ZZUGLIscJJnD0HTnlxWqniLuwZhR8"
        WP_URL = "https://blog.tiper.live/wp-json/wp/v2/bicstation"
        WP_USER = "bicstation"
        WP_APP_PASSWORD = "9re0 t3de WCe1 u1IL MudX 31IY"
        GEMINI_URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key={GEMINI_API_KEY}"

        # 1. DBからLenovo製品をランダムに取得
        products = PcProduct.objects.filter(name__icontains='Lenovo')
        
        if not products.exists():
            self.stdout.write(self.style.ERROR("DBにLenovo製品が見つかりませんでした。"))
            return

        product = random.choice(products)
        self.stdout.write(f"ターゲット商品: {product.name}")

        # 2. プロンプト作成 (モデルのフィールドに合わせて調整)
        # raw_html, price, product_url 等のフィールドがある想定
        specs = getattr(product, 'raw_html', '詳細は公式サイトを確認')
        price = getattr(product, 'price', 'オープン価格')

        prompt = f"""
        あなたはテック系ブログ『Bicstation』の専門レビュアーです。
        以下の実在する製品データに基づき、読者が欲しくなる魅力的な紹介記事を日本語で書いてください。

        【商品情報】
        商品名: {product.name}
        価格: {price}
        スペック概要: {specs}

        【構成ルール】
        1. タイトルは1行目（興味を引くキャッチコピー）
        2. 導入（このPCが解決する悩み）
        3. 特徴解説（スペックから読み取れる強みを具体的に）
        4. まとめ
        最後に必ず「[商品詳細リンクはこちら]」という一文を添えてください。
        
        挨拶やメタ発言は一切不要です。
        """

        # 3. Gemini API 呼び出し
        payload = { "contents": [{ "parts": [{"text": prompt}] }] }
        
        try:
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
                self.stdout.write(self.style.SUCCESS(f"投稿成功！ ID: {wp_res.json().get('id')}"))
                self.stdout.write(f"タイトル: {title}")
            else:
                self.stdout.write(self.style.ERROR(f"WP投稿失敗: {wp_res.text}"))

        except Exception as e:
            self.stdout.write(self.style.ERROR(f"予期せぬエラー: {e}"))