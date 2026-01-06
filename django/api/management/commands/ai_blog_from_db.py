from django.core.management.base import BaseCommand
from api.models.pc_products import PCProduct 
import requests
import random
import os
import re
from requests.auth import HTTPBasicAuth
from django.core.files.temp import NamedTemporaryFile

class Command(BaseCommand):
    help = 'DB内の製品情報を元に、HTML見出しとブログカード付きの豪華な記事を生成しWordPressに投稿します'

    def handle(self, *args, **options):
        # --- 設定エリア ---
        GEMINI_API_KEY = "AIzaSyA-o3ZZUGLIscJJnD0HTnlxWqniLuwZhR8"
        WP_USER = "bicstation"
        WP_APP_PASSWORD = "9re0 t3de WCe1 u1IL MudX 31IY"
        
        # 投稿用エンドポイントとメディア用エンドポイント
        WP_POST_URL = "https://blog.tiper.live/wp-json/wp/v2/bicstation"
        WP_MEDIA_URL = "https://blog.tiper.live/wp-json/wp/v2/media"
        
        AUTH = HTTPBasicAuth(WP_USER, WP_APP_PASSWORD)
        GEMINI_URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key={GEMINI_API_KEY}"

        # 1. DBから対象商品を取得
        products = PCProduct.objects.filter(
            maker__icontains='Lenovo',
            is_active=True
        ).exclude(stock_status="受注停止中")
        
        if not products.exists():
            self.stdout.write(self.style.ERROR("有効なLenovo製品がDBに見つかりませんでした。"))
            return

        product = random.choice(products)
        self.stdout.write(self.style.SUCCESS(f"ターゲット商品確定: {product.name}"))

        # 2. 商品画像をWordPressへアップロード
        media_id = None
        media_url = ""
        if product.image_url:
            self.stdout.write(f"画像をアップロード中: {product.image_url}")
            try:
                img_res = requests.get(product.image_url, timeout=15)
                if img_res.status_code == 200:
                    with NamedTemporaryFile(delete=True) as img_temp:
                        img_temp.write(img_res.content)
                        img_temp.flush()
                        
                        files = {
                            'file': (f"{product.unique_id}.jpg", open(img_temp.name, 'rb'), 'image/jpeg')
                        }
                        media_upload_res = requests.post(
                            WP_MEDIA_URL,
                            auth=AUTH,
                            files=files,
                            headers={'Content-Disposition': f'attachment; filename={product.unique_id}.jpg'}
                        )
                        
                        if media_upload_res.status_code == 201:
                            media_data = media_upload_res.json()
                            media_id = media_data.get('id')
                            media_url = media_data.get('source_url')
                            self.stdout.write(self.style.SUCCESS(f"メディア登録完了 (ID: {media_id})"))
            except Exception as e:
                self.stdout.write(self.style.WARNING(f"画像処理エラー: {e}"))

        # 3. Geminiによる執筆プロンプト作成（出力を厳格に制御）
        prompt = f"""
        【重要】「思考プロセス」などは一切不要です。記事本文のみを出力してください。

        あなたはテック系ブログ『Bicstation』の専門レビュアーです。
        以下の製品データに基づき、WordPress用のHTML記事を書いてください。

        【商品データ】
        メーカー: {product.maker}
        商品名: {product.name}
        価格: {product.price}円
        スペック詳細: {product.description}
        
        【構成・装飾ルール】
        1. 1行目：キャッチーなタイトル（タグ不要、テキストのみ）
        2. 2行目以降：本文
        3. 見出しは必ず <h2> または <h3> タグで囲ってください。
        4. 箇条書きが必要な場合は <ul><li> タグを使用してください。
        5. 最後に必ず以下のショートコードを1つだけ配置してください。
           [blogcard url="{product.url}"]
        """

        # 4. Gemini API 呼び出し
        self.stdout.write("Geminiが記事を執筆中...")
        payload = { "contents": [{ "parts": [{"text": prompt}] }] }
        
        try:
            response = requests.post(GEMINI_URL, json=payload)
            res_json = response.json()
            
            if 'error' in res_json:
                self.stdout.write(self.style.ERROR(f"Gemini APIエラー: {res_json['error']['message']}"))
                return

            ai_text = res_json['candidates'][0]['content']['parts'][0]['text']
            
            # クリーニング：コードブロック記号を除去
            clean_text = re.sub(r'```(html)?', '', ai_text).replace('```', '').strip()
            
            lines = clean_text.split('\n')
            
            # 思考プロセスなどの不要行をフィルタリング
            exclude_keywords = ["思考プロセス", "執筆者", "カテゴリ", "ペルソナ"]
            filtered_lines = [l for l in lines if not any(k in l for k in exclude_keywords) and l.strip() != ""]

            if not filtered_lines:
                self.stdout.write(self.style.ERROR("記事内容が空になりました。"))
                return

            title = filtered_lines[0].replace('#', '').strip()
            
            # 本文の整形
            # AIが本文中に書いてしまったショートコードを一旦削除して、確実に最後に1つだけ結合する
            target_shortcode = f'[blogcard url="{product.url}"]'
            main_body_text = '\n'.join(filtered_lines[1:]).replace(target_shortcode, "").strip()

            img_html = f'<img src="{media_url}" alt="{product.name}" class="wp-image-{media_id} size-large" style="margin-bottom: 20px;" />' if media_url else ""
            
            # 【重要】ショートコードを独立した行として末尾に結合
            # 前後に改行を入れることでWordPressのオートフォーマットによる破壊を防ぐ
            full_content = f"{img_html}\n\n{main_body_text}\n\n{target_shortcode}"

            # 5. WordPress 投稿
            wp_payload = {
                "title": title,
                "content": full_content,
                "status": "publish",
                "featured_media": media_id
            }
            
            wp_res = requests.post(
                WP_POST_URL, 
                json=wp_payload, 
                auth=AUTH
            )
            
            if wp_res.status_code == 201:
                self.stdout.write(self.style.SUCCESS(f"【投稿成功】 ID: {wp_res.json().get('id')}"))
                self.stdout.write(f"タイトル: {title}")
            else:
                self.stdout.write(self.style.ERROR(f"WP投稿失敗: {wp_res.text}"))

        except Exception as e:
            self.stdout.write(self.style.ERROR(f"実行時エラー: {e}"))