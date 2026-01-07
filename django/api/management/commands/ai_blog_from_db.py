from django.core.management.base import BaseCommand
from api.models.pc_products import PCProduct 
import requests
import random
import os
import re
from requests.auth import HTTPBasicAuth
from django.core.files.temp import NamedTemporaryFile

class Command(BaseCommand):
    help = '3つのモデルをローテーションして1日最大60回の投稿枠をフル活用する自動投稿スクリプト'

    def handle(self, *args, **options):
        # ==========================================
        # 1. 基本設定・認証情報
        # ==========================================
        GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
        WP_USER = "bicstation"
        WP_APP_PASSWORD = "9re0 t3de WCe1 u1IL MudX 31IY"
        
        # APIエンドポイント設定
        WP_POST_URL = "https://blog.tiper.live/wp-json/wp/v2/bicstation"
        WP_MEDIA_URL = "https://blog.tiper.live/wp-json/wp/v2/media"
        AUTH = HTTPBasicAuth(WP_USER, WP_APP_PASSWORD)

        # 【戦略】使用するモデルの優先順位リスト
        # 各モデル20回ずつの無料枠を順番に試行します
        MODELS = [
            "gemini-3-flash-preview",
            "gemini-2.5-flash",
            "gemini-2.5-flash-lite"
        ]

        # WordPress ID設定
        CAT_LENOVO = 4
        TAG_DESKTOP = 5
        TAG_LAPTOP = 6

        # ==========================================
        # 2. 投稿対象商品の選定 (DB操作)
        # ==========================================
        products = PCProduct.objects.filter(
            maker__icontains='Lenovo',
            is_active=True
        ).exclude(stock_status="受注停止中")
        
        if not products.exists():
            self.stdout.write(self.style.ERROR("有効なLenovo製品がDBに見当たりませんでした。"))
            return

        product = random.choice(products)
        self.stdout.write(self.style.SUCCESS(f"ターゲット商品確定: {product.name} (ID: {product.unique_id})"))

        # 商品名からタグを決定
        target_tags = []
        name_lower = product.name.lower()
        if any(keyword in name_lower for keyword in ["desktop", "tower", "station", "aio", "tiny", "center"]):
            target_tags.append(TAG_DESKTOP)
        else:
            target_tags.append(TAG_LAPTOP)

        # 自社サイトURL生成
        bic_detail_url = f"https://bicstation.com/product/{product.unique_id}/"

        # ==========================================
        # 3. 商品画像のアップロード (1回だけ実行)
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
        # 4. Gemini API 実行 (モデルローテーション)
        # ==========================================
        prompt = f"""
        あなたはPCの技術仕様に精通した客観的な解説者です。
        以下の製品データに基づき、ITニュースサイト向けの深く鋭い「HTMLソースコードのみ」を出力してください。

        【製品データ】
        メーカー: {product.maker}
        商品名: {product.name}
        価格: {product.price}円
        スペック詳細: {product.description}

        【出力ルール】
        - 1行目は「記事のタイトル」のみ（HTMLタグ不要）。
        - 2行目から「本文のHTML」を開始してください。
        - 2000文字以上の情報量で、CPU・GPU・メモリ・筐体設計について技術的に詳しく解説してください。
        - 見出しは <h2> または <h3>、リストは <ul> を使用してください。
        - 挨拶や前置きは一切不要です。
        - 文末は必ず「この製品の詳細は、以下のリンクからご確認いただけます」という一文で締めてください。
        - 出力は必ず日本語で行ってください。
        """

        ai_text = None
        selected_model = None

        for model_id in MODELS:
            self.stdout.write(f"モデル {model_id} で記事を生成中...")
            gemini_url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_id}:generateContent?key={GEMINI_API_KEY}"
            
            payload = {
                "contents": [{"parts": [{"text": prompt}]}]
            }

            try:
                response = requests.post(gemini_url, json=payload, timeout=60)
                res_json = response.json()
                
                if 'error' in res_json:
                    error_msg = res_json['error'].get('message', '')
                    # クォータ（回数制限）エラーの場合
                    if res_json['error'].get('code') == 429 or "quota" in error_msg.lower():
                        self.stdout.write(self.style.WARNING(f"モデル {model_id} の利用枠が終了しています。次のモデルへ切り替えます。"))
                        continue
                    else:
                        self.stdout.write(self.style.ERROR(f"APIエラー ({model_id}): {error_msg}"))
                        continue

                # 成功した場合
                ai_text = res_json['candidates'][0]['content']['parts'][0]['text']
                selected_model = model_id
                break # 成功したのでループを抜ける

            except Exception as e:
                self.stdout.write(self.style.ERROR(f"実行時エラー ({model_id}): {e}"))
                continue

        if not ai_text:
            self.stdout.write(self.style.ERROR("すべてのモデルで制限に達したか、生成に失敗しました。"))
            return

        # ==========================================
        # 5. コンテンツのクリーニング
        # ==========================================
        clean_text = re.sub(r'```(html)?', '', ai_text).replace('```', '').strip()
        lines = [l.strip() for l in clean_text.split('\n') if l.strip()]
        
        if not lines:
            self.stdout.write(self.style.ERROR("生成されたコンテンツが空です。"))
            return

        title = lines[0].replace('#', '').strip()
        main_body_html = '\n'.join(lines[1:]).strip()

        # ==========================================
        # 6. HTMLパーツの組み立て
        # ==========================================
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
                           style="flex: 1; min-width: 140px; background-color: #0062ff; color: #ffffff; text-align: center; padding: 14px 10px; border-radius: 8px; text-decoration: none; font-weight: bold;">
                           公式サイト ＞
                        </a>
                        <a href="{bic_detail_url}" target="_blank" rel="noopener"
                           style="flex: 1; min-width: 140px; background-color: #1f2937; color: #ffffff; text-align: center; padding: 14px 10px; border-radius: 8px; text-decoration: none; font-weight: bold;">
                           Bicstation詳細 ＞
                        </a>
                    </div>
                </div>
            </div>
        </div>
        """

        top_img_html = f"""
        <div style="margin-bottom: 30px;">
            <a href="{bic_detail_url}" target="_blank" rel="noopener">
                <img src="{media_url}" alt="{product.name}" class="wp-image-{media_id} size-large" style="border-radius: 12px; width: 100%; height: auto;" />
            </a>
        </div>
        """ if media_url else ""
        
        full_content = f"{top_img_html}\n{main_body_html}\n{custom_card_html}"

        # ==========================================
        # 7. WordPress 投稿実行
        # ==========================================
        wp_payload = {
            "title": title,
            "content": full_content,
            "status": "publish",
            "featured_media": media_id,
            "categories": [CAT_LENOVO], 
            "tags": target_tags           
        }
        
        wp_res = requests.post(WP_POST_URL, json=wp_payload, auth=AUTH)
        
        if wp_res.status_code == 201:
            self.stdout.write(self.style.SUCCESS(f"【投稿成功】モデル: {selected_model} / 記事: {title}"))
        else:
            self.stdout.write(self.style.ERROR(f"WP投稿失敗: {wp_res.text}"))