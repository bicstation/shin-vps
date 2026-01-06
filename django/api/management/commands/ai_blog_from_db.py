from django.core.management.base import BaseCommand
from api.models.pc_products import PCProduct 
import requests
import random
import os
import re
from requests.auth import HTTPBasicAuth
from django.core.files.temp import NamedTemporaryFile

class Command(BaseCommand):
    help = 'DBから製品情報を取得し、GeminiでAIレビュー記事を生成してWordPressへ自動投稿します'

    def handle(self, *args, **options):
        # ==========================================
        # 1. 基本設定・認証情報
        # ==========================================
        GEMINI_API_KEY = "AIzaSyA-o3ZZUGLIscJJnD0HTnlxWqniLuwZhR8"
        WP_USER = "bicstation"
        WP_APP_PASSWORD = "9re0 t3de WCe1 u1IL MudX 31IY"
        
        # APIエンドポイント設定
        WP_POST_URL = "https://blog.tiper.live/wp-json/wp/v2/bicstation"
        WP_MEDIA_URL = "https://blog.tiper.live/wp-json/wp/v2/media"
        GEMINI_URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key={GEMINI_API_KEY}"
        
        AUTH = HTTPBasicAuth(WP_USER, WP_APP_PASSWORD)

        # ==========================================
        # 2. 投稿対象商品の選定 (DB操作)
        # ==========================================
        # Lenovo製品かつ有効(is_active)で、受注停止中ではないものをランダムに1つ取得
        products = PCProduct.objects.filter(
            maker__icontains='Lenovo',
            is_active=True
        ).exclude(stock_status="受注停止中")
        
        if not products.exists():
            self.stdout.write(self.style.ERROR("有効なLenovo製品がDBに見定まりませんでした。"))
            return

        product = random.choice(products)
        self.stdout.write(self.style.SUCCESS(f"ターゲット商品確定: {product.name} (ID: {product.unique_id})"))

        # 自社サイト(Bicstation)の製品詳細ページURLを生成
        bic_detail_url = f"https://bicstation.com/product/{product.unique_id}/"

        # ==========================================
        # 3. 商品画像のアップロード (WordPress Media API)
        # ==========================================
        media_id = None
        media_url = ""
        if product.image_url:
            self.stdout.write(f"画像をWordPressへアップロード中...")
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
                            self.stdout.write(self.style.SUCCESS(f"メディア登録完了(ID: {media_id})"))
            except Exception as e:
                self.stdout.write(self.style.WARNING(f"画像処理エラー: {e}"))

        # ==========================================
        # 4. Geminiプロンプトの構築
        # ==========================================
        prompt = f"""
        あなたはテック系ブログ『Bicstation』の専門レビュアーです。
        以下の製品データに基づき、WordPress用の「HTMLソースコードのみ」を出力してください。

        【絶対遵守の命令】
        - 1行目は「記事のタイトル」のみを記述してください（HTMLタグは不要）。
        - 2行目から「本文のHTML」を開始してください。
        - 「執筆者」「カテゴリ」「構成」「思考プロセス」などのメタ情報は絶対に出力しないでください。
        - 挨拶、解説、"承知いたしました"等の言葉も一切不要です。
        - 本文の見出しは必ず <h2> または <h3> タグを使用してください。
        - スペック表などは <table> または <ul> タグを使用してください。

        【商品データ】
        メーカー: {product.maker}
        商品名: {product.name}
        価格: {product.price}円
        スペック詳細: {product.description}
        
        【記事の締め】
        文末は必ず「この製品の詳細は、以下のリンクからご確認いただけます」という一文で締めてください。
        """

        # ==========================================
        # 5. Gemini API 実行 (安全性設定付き)
        # ==========================================
        self.stdout.write("GeminiがHTML記事を生成中...")
        
        # 安全性フィルターを緩和してエラー(candidates欠損)を回避するペイロード
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "safetySettings": [
                {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE"},
                {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE"},
                {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE"},
                {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE"}
            ]
        }

        try:
            response = requests.post(GEMINI_URL, json=payload)
            res_json = response.json()
            
            # APIがブロックした場合のハンドリング
            if 'candidates' not in res_json:
                reason = res_json.get('promptFeedback', {}).get('blockReason', 'UNKNOWN')
                self.stdout.write(self.style.ERROR(f"Geminiが回答を拒否しました。理由: {reason}"))
                return

            ai_text = res_json['candidates'][0]['content']['parts'][0]['text']
            
            # クリーニング：マークダウンのコードブロックシンボルを除去
            clean_text = re.sub(r'```(html)?', '', ai_text).replace('```', '').strip()
            lines = [l.strip() for l in clean_text.split('\n') if l.strip()]
            
            # 不要なメタ情報行が混入した場合の最終フィルター
            filtered_lines = []
            exclude_keywords = ["執筆者:", "カテゴリ:", "構成:", "ターゲット:", "思考プロセス", "Persona:", "メタ情報"]
            
            for line in lines:
                if any(k in line for k in exclude_keywords): continue
                if re.match(r'^(\d+\.|タイトル：|Title:)', line): continue
                filtered_lines.append(line)

            if not filtered_lines:
                self.stdout.write(self.style.ERROR("有効なコンテンツが生成されませんでした。"))
                return

            # 1行目をタイトル、それ以降を本文HTMLとして結合
            title = filtered_lines[0].replace('#', '').strip()
            main_body_html = '\n'.join(filtered_lines[1:]).strip()

            # ==========================================
            # 6. HTMLパーツの組み立て (画像・リッチカード)
            # ==========================================
            # 記事末尾のWリンクボタン付きリッチカード
            custom_card_html = f"""
            <div style="margin: 40px 0; padding: 25px; border: 1px solid #e5e7eb; border-radius: 16px; background-color: #ffffff; box-shadow: 0 4px 20px rgba(0,0,0,0.08); font-family: sans-serif;">
                <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 24px;">
                    <div style="flex: 1; min-width: 200px; text-align: center;">
                        <a href="{bic_detail_url}" target="_blank" rel="noopener">
                            <img src="{media_url}" alt="{product.name}" style="max-width: 100%; height: auto; border-radius: 10px;">
                        </a>
                    </div>
                    <div style="flex: 2; min-width: 250px;">
                        <h3 style="margin: 0 0 12px 0; font-size: 1.4em; color: #111827; line-height: 1.4;">{product.name}</h3>
                        <p style="color: #4b5563; font-size: 0.95em; margin-bottom: 8px;">メーカー：{product.maker}</p>
                        <p style="color: #ef4444; font-weight: bold; font-size: 1.3em; margin: 10px 0;">価格：{product.price}円</p>
                        <div style="display: flex; gap: 12px; margin-top: 20px; flex-wrap: wrap;">
                            <a href="{product.url}" target="_blank" rel="noopener noreferrer" 
                               style="flex: 1; min-width: 140px; background-color: #0062ff; color: #ffffff; text-align: center; padding: 14px 10px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 0.95em; box-shadow: 0 4px 6px rgba(0,98,255,0.2);">
                               公式サイト ＞
                            </a>
                            <a href="{bic_detail_url}" target="_blank" rel="noopener"
                               style="flex: 1; min-width: 140px; background-color: #1f2937; color: #ffffff; text-align: center; padding: 14px 10px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 0.95em; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                               Bicstation詳細 ＞
                            </a>
                        </div>
                    </div>
                </div>
            </div>
            """

            # 記事冒頭のアイキャッチ的画像
            top_img_html = f"""
            <div style="margin-bottom: 30px;">
                <a href="{bic_detail_url}" target="_blank" rel="noopener">
                    <img src="{media_url}" alt="{product.name}" class="wp-image-{media_id} size-large" style="border-radius: 12px; width: 100%; height: auto;" />
                </a>
            </div>
            """ if media_url else ""
            
            # 全パーツを一つのHTMLとして統合
            full_content = f"{top_img_html}\n{main_body_html}\n{custom_card_html}"

            # ==========================================
            # 7. WordPress 投稿実行
            # ==========================================
            wp_payload = {
                "title": title,
                "content": full_content,
                "status": "publish",         # 'draft'にすれば下書き保存になります
                "featured_media": media_id   # WordPress上のアイキャッチ画像ID
            }
            
            wp_res = requests.post(WP_POST_URL, json=wp_payload, auth=AUTH)
            
            if wp_res.status_code == 201:
                self.stdout.write(self.style.SUCCESS(f"【投稿成功】: {title}"))
            else:
                self.stdout.write(self.style.ERROR(f"WP投稿失敗: {wp_res.text}"))

        except Exception as e:
            self.stdout.write(self.style.ERROR(f"実行時重大エラー: {e}"))