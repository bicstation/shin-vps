from django.core.management.base import BaseCommand
from api.models.pc_products import PCProduct 
import requests
import random
import os
import re
from requests.auth import HTTPBasicAuth
from django.core.files.temp import NamedTemporaryFile
import urllib.parse

class Command(BaseCommand):
    help = 'Gemini 3/2.5とGemma 3をローテーションし、アフィリエイトリンク付きでWP投稿するスクリプト'

    def handle(self, *args, **options):
        # ==========================================
        # 1. 基本設定・認証情報
        # ==========================================
        GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
        WP_USER = "bicstation"
        WP_APP_PASSWORD = "9re0 t3de WCe1 u1IL MudX 31IY"
        
        # URLを文字列結合で定義（自動リンク化対策）
        PROT = "https://"
        WP_POST_URL = PROT + "blog.tiper.live/wp-json/wp/v2/bicstation"
        WP_MEDIA_URL = PROT + "blog.tiper.live/wp-json/wp/v2/media"
        AUTH = HTTPBasicAuth(WP_USER, WP_APP_PASSWORD)

        # モデルの優先順位リスト
        MODELS = [
            "gemini-3-flash-preview",
            "gemini-2.5-flash",
            "gemini-2.5-flash-lite",
            "gemma-3-12b-it" 
        ]

        # WordPress カテゴリ・タグID
        CAT_LENOVO = 4
        TAG_DESKTOP = 5
        TAG_LAPTOP = 6

        # ==========================================
        # 2. 投稿対象商品の選定
        # ==========================================
        products = PCProduct.objects.filter(
            maker__icontains='Lenovo',
            is_active=True,
            is_posted=False
        ).exclude(stock_status="受注停止中")
        
        if not products.exists():
            self.stdout.write(self.style.ERROR("未投稿の有効なLenovo製品がDBに見当たりませんでした。"))
            return

        product = random.choice(products)
        self.stdout.write(self.style.SUCCESS(f"ターゲット確定: {product.name} (ID: {product.unique_id})"))

        target_tags = []
        name_lower = product.name.lower()
        if any(keyword in name_lower for keyword in ["desktop", "tower", "station", "aio", "tiny", "center"]):
            target_tags.append(TAG_DESKTOP)
        else:
            target_tags.append(TAG_LAPTOP)

        bic_detail_url = PROT + f"bicstation.com/product/{product.unique_id}/"

        # ==========================================
        # 3. 商品画像のアップロード
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
        # 4. AIプロンプト
        # ==========================================
        prompt = f"""
        あなたはPCの技術仕様に精通した客観的な解説者です。
        以下の製品データに基づき、ITニュースサイト向けの深く鋭い、純粋な「HTMLソースコードのみ」を出力してください。
        Markdownの装飾(```htmlなど)や解説文を一切含めないでください。

        【製品データ】
        メーカー: {product.maker} | 商品名: {product.name} | 価格: {product.price}円
        スペック詳細: {product.description}

        【出力ルール】
        - 1行目は記事のタイトルのみ。
        - 2行目から本文HTML。
        - 2000文字以上の情報量で技術的に解説。
        - 文末は「この製品の詳細は、以下のリンクからご確認いただけます」という一文で締める。
        """

        # ==========================================
        # 5. AI実行 (URL完全プレーン化版)
        # ==========================================
        ai_text = None
        selected_model = None
        
        # API URLのパーツを完全に分離
        API_BASE = PROT + "[generativelanguage.googleapis.com/v1beta/models/](https://generativelanguage.googleapis.com/v1beta/models/)"

        for model_id in MODELS:
            self.stdout.write(f"モデル {model_id} で記事を生成中...")
            api_url = API_BASE + model_id + ":generateContent?key=" + GEMINI_API_KEY
            
            payload = {"contents": [{"parts": [{"text": prompt}]}]}

            try:
                response = requests.post(api_url, json=payload, timeout=90)
                res_json = response.json()
                
                if 'candidates' in res_json and len(res_json['candidates']) > 0:
                    ai_text = res_json['candidates'][0]['content']['parts'][0]['text']
                    selected_model = model_id
                    break 
                else:
                    self.stdout.write(self.style.ERROR(f"APIエラー ({model_id}): {res_json}"))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"通信エラー ({model_id}): {e}"))
                continue

        if not ai_text:
            self.stdout.write(self.style.ERROR("すべてのモデルで生成に失敗しました。"))
            return

        # ==========================================
        # 6. 整形とアフィリエイト組み込み
        # ==========================================
        clean_text = re.sub(r'```(html)?', '', ai_text).replace('```', '').strip()
        lines = [l.strip() for l in clean_text.split('\n') if l.strip()]
        
        title = lines[0].replace('#', '').strip()
        main_body_html = '\n'.join(lines[1:]).strip()

        encoded_url = urllib.parse.quote(product.url, safe='')
        
        # アフィリエイトURLとビーコンも同様に分割結合
        VC_BASE = PROT + "[ck.jp.ap.valuecommerce.com/servlet/referral](https://ck.jp.ap.valuecommerce.com/servlet/referral)"
        affiliate_url = VC_BASE + "?sid=3697471&pid=892455531&vc_url=" + encoded_url
        
        BC_SRC = "//[ad.jp.ap.valuecommerce.com/servlet/gifbanner?sid=3697471&pid=892455531](https://ad.jp.ap.valuecommerce.com/servlet/gifbanner?sid=3697471&pid=892455531)"
        vc_beacon = f'<img src="{BC_SRC}" height="1" width="1" border="0">'

        custom_card_html = f"""
        <div style="margin: 40px 0; padding: 25px; border: 1px solid #e5e7eb; border-radius: 16px; background-color: #ffffff; box-shadow: 0 4px 20px rgba(0,0,0,0.08); font-family: sans-serif;">
            <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 24px;">
                <div style="flex: 1; min-width: 200px; text-align: center;">
                    <a href="{bic_detail_url}" target="_blank">
                        <img src="{media_url}" alt="{product.name}" style="max-width: 100%; height: auto; border-radius: 10px;">
                    </a>
                </div>
                <div style="flex: 2; min-width: 250px;">
                    <h3 style="margin: 0 0 12px 0; font-size: 1.4em;">{product.name}</h3>
                    <p style="color: #ef4444; font-weight: bold; font-size: 1.3em; margin: 10px 0;">特別価格：{product.price}円</p>
                    <div style="display: flex; gap: 12px; margin-top: 20px; flex-wrap: wrap;">
                        <a href="{affiliate_url}" target="_blank" rel="nofollow noopener noreferrer" 
                           style="flex: 1; min-width: 140px; background-color: #ef4444; color: #ffffff; text-align: center; padding: 14px 10px; border-radius: 8px; text-decoration: none; font-weight: bold;">
                            Lenovo公式サイトで見る ＞{vc_beacon}
                        </a>
                        <a href="{bic_detail_url}" target="_blank"
                           style="flex: 1; min-width: 140px; background-color: #1f2937; color: #ffffff; text-align: center; padding: 14px 10px; border-radius: 8px; text-decoration: none; font-weight: bold;">
                            Bicstation詳細 ＞
                        </a>
                    </div>
                </div>
            </div>
        </div>
        """

        full_content = f"{main_body_html}\n{custom_card_html}"

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
            product.is_posted = True
            product.save()
            self.stdout.write(self.style.SUCCESS(f"【投稿成功】モデル: {selected_model} / 記事: {title}"))
        else:
            self.stdout.write(self.style.ERROR(f"WP投稿失敗: {wp_res.text}"))