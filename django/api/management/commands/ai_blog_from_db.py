from django.core.management.base import BaseCommand
from api.models.pc_products import PCProduct 
import requests
import random
import os
import re
from requests.auth import HTTPBasicAuth
from django.core.files.temp import NamedTemporaryFile

class Command(BaseCommand):
    help = 'DB内の製品情報を元に、思考プロセスを排除し、独自デザインのリンクカードを含むリッチな記事を投稿します'

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
        あなたはテック系ブログ『Bicstation』の専門レビュアーです。
        以下の製品データに基づき、WordPress用のHTML記事を書いてください。

        【重要命令】
        - 「思考プロセス」「タイトル作成」「執筆者」などの説明は一切不要です。
        - 返信の1行目からいきなり「記事のタイトル」を書き始めてください。
        - 挨拶や確認の言葉（「承知しました」等）は一切禁止します。

        【商品データ】
        メーカー: {product.maker}
        商品名: {product.name}
        価格: {product.price}円
        スペック詳細: {product.description}
        
        【構成・装飾ルール】
        1. 1行目：キャッチーなタイトル（タグ不要、テキストのみ）
        2. 2行目以降：本文
        3. 見出しは <h2> または <h3> タグを使用。
        4. 箇条書きは <ul><li> タグを使用。
        5. 文末に必ず「この製品の詳細は公式サイトで確認してください」という趣旨の結びの言葉を入れてください。
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
            
            # メタ情報（思考プロセス等）や数字から始まる箇条書き（1. タイトルなど）を徹底排除
            filtered_lines = []
            exclude_keywords = ["思考プロセス", "執筆者", "カテゴリ", "ペルソナ", "ターゲット", "構成"]
            
            for line in lines:
                l_strip = line.strip()
                if not l_strip: continue
                # メタ情報のキーワードを含む行をスキップ
                if any(k in l_strip for k in exclude_keywords): continue
                # 「1. タイトル」のようなAIの自己解説パターンを正規表現で排除
                if re.match(r'^\d+\.\s+.*', l_strip): continue
                
                filtered_lines.append(l_strip)

            if not filtered_lines:
                self.stdout.write(self.style.ERROR("記事内容が空になりました。"))
                return

            # 1行目をタイトルとして取得
            title = filtered_lines[0].replace('#', '').strip()
            main_body_text = '\n'.join(filtered_lines[1:]).strip()

            # 5. 独自デザインの「リッチリンクカード」HTML作成
            # プラグインに頼らず、インラインスタイルで確実に表示させます。
            custom_card_html = f"""
            <div style="margin: 40px 0; padding: 25px; border: 2px solid #0062ff; border-radius: 15px; background-color: #f8faff; text-align: center; font-family: sans-serif;">
                <h3 style="margin-top: 0; color: #333;">今回ご紹介したモデルはこちら</h3>
                <p style="font-size: 1.1em; font-weight: bold; color: #555; margin-bottom: 20px;">{product.name}</p>
                <a href="{product.url}" target="_blank" rel="noopener noreferrer" 
                   style="display: inline-block; background-color: #0062ff; color: #fff; padding: 15px 40px; border-radius: 30px; text-decoration: none; font-weight: bold; font-size: 1.1em; transition: 0.3s; box-shadow: 0 4px 10px rgba(0,98,255,0.3);">
                   公式サイトで詳細を見る ＞
                </a>
            </div>
            """

            # 画像と本文の結合
            img_html = f'<img src="{media_url}" alt="{product.name}" class="wp-image-{media_id} size-large" style="margin-bottom: 20px; border-radius: 10px;" />' if media_url else ""
            full_content = f"{img_html}\n\n{main_body_text}\n\n{custom_card_html}"

            # 6. WordPress 投稿
            wp_payload = {
                "title": title,
                "content": full_content,
                "status": "publish",
                "featured_media": media_id
            }
            
            wp_res = requests.post(WP_POST_URL, json=wp_payload, auth=AUTH)
            
            if wp_res.status_code == 201:
                self.stdout.write(self.style.SUCCESS(f"【投稿成功】 ID: {wp_res.json().get('id')}"))
                self.stdout.write(f"タイトル: {title}")
            else:
                self.stdout.write(self.style.ERROR(f"WP投稿失敗: {wp_res.text}"))

        except Exception as e:
            self.stdout.write(self.style.ERROR(f"実行時エラー: {e}"))