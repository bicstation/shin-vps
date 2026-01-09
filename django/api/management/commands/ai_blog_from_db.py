import os
import re
import random
import requests
import urllib.parse
from django.core.management.base import BaseCommand
from api.models.pc_products import PCProduct 
from django.db.models import Q as DjangoQ 
from django.utils.timezone import now
from requests.auth import HTTPBasicAuth
from django.core.files.temp import NamedTemporaryFile

class Command(BaseCommand):
    help = 'アイキャッチ画像対応・Cocoon向け構造化(h2/h3)記事生成フルスクリプト'

    def handle(self, *args, **options):
        # ==========================================
        # 1. 記号・基本設定
        # ==========================================
        SCH  = "https"
        CLN  = ":"
        SLS  = "/"
        QMK  = "?"
        EQU  = "="
        AMP  = "&"

        GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
        WP_USER = "bicstation"
        WP_APP_PASSWORD = "9re0 t3de WCe1 u1IL MudX 31IY"
        W_DOM = "blog.tiper.live"
        
        WP_POST_URL = f"{SCH}{CLN}{SLS}{SLS}{W_DOM}{SLS}wp-json{SLS}wp{SLS}v2{SLS}bicstation"
        WP_MEDIA_URL = f"{SCH}{CLN}{SLS}{SLS}{W_DOM}{SLS}wp-json{SLS}wp{SLS}v2{SLS}media"
        AUTH = HTTPBasicAuth(WP_USER, WP_APP_PASSWORD)

        MODELS = [
            "gemma-3-27b-it", "gemini-2.0-flash", "gemini-2.0-flash-lite",
            "gemini-2.0-pro-exp-02-05", "gemini-1.5-flash", "gemini-1.5-pro",
            "gemini-2.0-flash-thinking-exp-01-21", "gemini-1.5-flash-8b",
            "gemini-exp-1206", "learnlm-1.5-pro-experimental"
        ]

        CAT_LENOVO, CAT_DELL, CAT_HP = 4, 7, 8
        TAG_DESKTOP, TAG_LAPTOP = 5, 6

        # ==========================================
        # 2. 投稿対象商品の選定
        # ==========================================
        products = PCProduct.objects.filter(is_active=True, is_posted=False).filter(
            DjangoQ(maker__icontains='Lenovo') | DjangoQ(maker__icontains='Dell') | DjangoQ(maker__icontains='HP')
        ).exclude(stock_status="受注停止中")
        
        if not products.exists():
            self.stdout.write(self.style.ERROR("未投稿の対象製品が見つかりません。"))
            return

        product = random.choice(products)
        maker_low = product.maker.lower()
        self.stdout.write(self.style.SUCCESS(f"🚀 ターゲット確定: {product.name}"))

        target_cats = [CAT_LENOVO if 'lenovo' in maker_low else CAT_DELL if 'dell' in maker_low else CAT_HP if 'hp' in maker_low else 1]
        name_lower = product.name.lower()
        target_tags = [TAG_DESKTOP if any(k in name_lower for k in ["desktop", "tower", "station", "aio", "tiny", "center", "poweredge"]) else TAG_LAPTOP]
        bic_detail_url = f"{SCH}{CLN}{SLS}{SLS}bicstation.com{SLS}product{SLS}{product.unique_id}{SLS}"

        # ==========================================
        # 3. 商品画像のアップロード（アイキャッチ用）
        # ==========================================
        media_id, media_url = None, ""
        if product.image_url:
            try:
                img_res = requests.get(product.image_url, timeout=15)
                if img_res.status_code == 200:
                    with NamedTemporaryFile(delete=True) as img_temp:
                        img_temp.write(img_res.content)
                        img_temp.flush()
                        
                        files = {'file': (f"{product.unique_id}.jpg", open(img_temp.name, 'rb'), 'image/jpeg')}
                        m_res = requests.post(
                            WP_MEDIA_URL, 
                            auth=AUTH, 
                            files=files, 
                            headers={'Content-Disposition': f'attachment; filename={product.unique_id}.jpg'}
                        )
                        if m_res.status_code == 201:
                            m_data = m_res.json()
                            media_id, media_url = m_data.get('id'), m_data.get('source_url')
                            self.stdout.write(self.style.SUCCESS(f"アイキャッチ画像アップ成功: ID {media_id}"))
            except Exception as e:
                self.stdout.write(self.style.WARNING(f"画像処理エラー: {e}"))

        # ==========================================
        # 4. AIプロンプト (Cocoon/h2/h3構造化指示)
        # ==========================================
        prompt = f"""
        あなたはPC専門のテックライターです。以下の製品について、Cocoonテーマに最適な構造化されたブログ記事をHTML形式で書いてください。

        【製品データ】
        メーカー: {product.maker}
        商品名: {product.name}
        価格: {product.price}円
        スペック: {product.description}

        【執筆ルール】
        1. 1行目は記事タイトル（プレーンテキスト）。
        2. 2行目から本文。読者の購買意欲をそそる導入文から始めてください。
        3. 必ず <h2>中見出し</h2> と <h3>小見出し</h3> を使い、論理的な構成にすること。
        4. 内容：製品の概要、スペックの徹底解説、競合他社との比較、どんなユーザーにおすすめか。
        5. 文末は「この製品の詳細は、以下のリンクからご確認いただけます」で締める。
        6. 2500文字以上の圧倒的なボリュームで。
        7. Markdown記号（```htmlなど）は一切不要。
        """

        # ==========================================
        # 5. AI実行
        # ==========================================
        ai_text, selected_model = None, None
        API_HOST = "generativelanguage.googleapis.com"
        API_PATH = f"v1beta{SLS}models"

        for model_id in MODELS:
            self.stdout.write(f"🤖 モデル {model_id} で生成中...")
            api_endpoint = f"{SCH}{CLN}{SLS}{SLS}{API_HOST}{SLS}{API_PATH}{SLS}{model_id}{CLN}generateContent{QMK}key{EQU}{GEMINI_API_KEY}"
            
            try:
                response = requests.post(api_endpoint, json={"contents": [{"parts": [{"text": prompt}]}]}, timeout=180)
                res_json = response.json()
                if 'candidates' in res_json and len(res_json['candidates']) > 0:
                    ai_text = res_json['candidates'][0]['content']['parts'][0]['text']
                    selected_model = model_id
                    break
            except:
                continue

        if not ai_text: return

        # ==========================================
        # 6. 整形とアフィリエイト構築
        # ==========================================
        clean_text = re.sub(r'```(html)?', '', ai_text).replace('```', '').strip()
        lines = [l.strip() for l in clean_text.split('\n') if l.strip()]
        title = re.sub(r'<[^>]*?>', '', lines[0]).replace('#', '').strip()
        main_body_html = '\n'.join(lines[1:]).strip()

        # アフィリエイトURL (Dell/他)
        if 'dell' in maker_low:
            affiliate_url = f"{SCH}{CLN}{SLS}{SLS}click.linksynergy.com{SLS}fs-bin{SLS}click{QMK}id{EQU}nNBA6GzaGrQ{AMP}offerid{EQU}1568114.10014115{AMP}type{EQU}3{AMP}subid{EQU}0"
            tracking_beacon = f'<img border="0" width="1" height="1" src="{SCH}{CLN}{SLS}{SLS}ad.linksynergy.com{SLS}fs-bin{SLS}show{QMK}id{EQU}nNBA6GzaGrQ{AMP}bids{EQU}1568114.10014115{AMP}type{EQU}3{AMP}subid{EQU}0" >'
            button_text = "Dell公式サイトで見る"
        else:
            sid, pid = "3697471", "892455531"
            encoded_url = urllib.parse.quote(product.url, safe='')
            affiliate_url = f"{SCH}{CLN}{SLS}{SLS}ck.jp.ap.valuecommerce.com{SLS}servlet{SLS}referral{QMK}sid{EQU}{sid}{AMP}pid{EQU}{pid}{AMP}vc_url{EQU}{encoded_url}"
            tracking_beacon = f'<img src="{SCH}{CLN}{SLS}{SLS}ad.jp.ap.valuecommerce.com{SLS}servlet{SLS}gifbanner{QMK}sid{EQU}{sid}{AMP}pid{EQU}{pid}" height="1" width="1" border="0">'
            button_text = f"{product.maker}公式サイトで見る"

        # 商品紹介カード
        custom_card_html = f"""
        <div style="margin: 40px 0; padding: 25px; border: 1px solid #e5e7eb; border-radius: 16px; background-color: #ffffff; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
            <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 24px;">
                <div style="flex: 1; min-width: 200px; text-align: center;">
                    <img src="{media_url if media_url else product.image_url}" alt="{product.name}" style="max-width: 100%; height: auto; border-radius: 10px;">
                </div>
                <div style="flex: 2; min-width: 250px;">
                    <h3 style="margin: 0 0 12px 0;">{product.name}</h3>
                    <p style="color: #ef4444; font-weight: bold; font-size: 1.3em;">価格：{product.price:,}円（税込）</p>
                    <div style="display: flex; gap: 12px; margin-top: 20px;">
                        <a href="{affiliate_url}" target="_blank" rel="nofollow noopener" style="flex: 1; background-color: #ef4444; color: #ffffff; text-align: center; padding: 14px; border-radius: 8px; text-decoration: none; font-weight: bold;">{button_text}{tracking_beacon}</a>
                        <a href="{bic_detail_url}" target="_blank" style="flex: 1; background-color: #1f2937; color: #ffffff; text-align: center; padding: 14px; border-radius: 8px; text-decoration: none; font-weight: bold;">詳細スペック ＞</a>
                    </div>
                </div>
            </div>
        </div>
        """

        full_wp_content = f"{main_body_html}\n{custom_card_html}"

        # ==========================================
        # 7. WordPress投稿
        # ==========================================
        product.ai_content = main_body_html 
        product.is_posted = True
        product.save()

        wp_payload = {
            "title": title,
            "content": full_wp_content,
            "status": "publish",
            "featured_media": media_id,  # これがアイキャッチ画像になる
            "categories": target_cats, 
            "tags": target_tags           
        }
        
        try:
            wp_res = requests.post(WP_POST_URL, json=wp_payload, auth=AUTH, timeout=30)
            if wp_res.status_code == 201:
                self.stdout.write(self.style.SUCCESS(f"✅ 投稿成功: {title}"))
            else:
                self.stdout.write(self.style.ERROR(f"❌ WPエラー: {wp_res.status_code}"))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"通信エラー: {e}"))