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
    help = 'Gemini優先・バックアップGemma・Cocoon完全最適化フルスクリプト'

    def handle(self, *args, **options):
        # ==========================================
        # 1. 記号・基本設定（URL難読化対策）
        # ==========================================
        SCH, CLN, SLS, QMK, EQU, AMP = "https", ":", "/", "?", "=", "&"

        GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
        WP_USER = "bicstation"
        WP_APP_PASSWORD = "9re0 t3de WCe1 u1IL MudX 31IY"
        W_DOM = "blog.tiper.live"
        
        WP_POST_URL = f"{SCH}{CLN}{SLS}{SLS}{W_DOM}{SLS}wp-json{SLS}wp{SLS}v2{SLS}bicstation"
        WP_MEDIA_URL = f"{SCH}{CLN}{SLS}{SLS}{W_DOM}{SLS}wp-json{SLS}wp{SLS}v2{SLS}media"
        AUTH = HTTPBasicAuth(WP_USER, WP_APP_PASSWORD)

        # 優先順位: Gemini 2.0系を最上位に、エラー時バックアップとしてGemmaを最後に配置
        MODELS = [
            "gemini-2.0-pro-exp-02-05", 
            "gemini-2.0-flash", 
            "gemini-2.0-flash-thinking-exp-01-21",
            "gemini-1.5-pro", 
            "gemini-1.5-flash",
            "gemini-2.0-flash-lite",
            "gemma-3-27b-it"  # バックアップ用
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
        self.stdout.write(self.style.SUCCESS(f"🚀 ターゲット確定: {product.name} ({product.maker})"))

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
                            self.stdout.write(self.style.SUCCESS(f"📸 アイキャッチ画像アップロード成功: ID {media_id}"))
            except Exception as e:
                self.stdout.write(self.style.WARNING(f"画像処理エラー: {e}"))

        # ==========================================
        # 4. AIプロンプト (Cocoon/h2/h3構造化指示)
        # ==========================================
        prompt = f"""
        あなたはPCの技術仕様に精通した客観的なテックライターです。
        以下の製品データに基づき、Cocoonテーマに最適化されたITニュース記事を、WordPressブロック形式のHTMLで出力してください。

        【製品データ】
        メーカー: {product.maker} | 商品名: {product.name} | 価格: {product.price}円
        スペック詳細: {product.description}

        【執筆ルール】
        1. 1行目はタイトル（プレーンテキスト）。
        2. 2行目以降は本文。<p>...</p>等のブロック形式を使用。
        3. 必ず <h2>中見出し</h2> と <h3>小見出し</h3> を使い、Cocoonの目次機能に対応した階層構造にすること。
        4. スペック、競合比較、ユーザーへのメリットを網羅し、2500文字以上の情報量で。
        5. 文末は「この製品の詳細は、以下のリンクからご確認いただけます」で締める。
        6. Markdown記号（```htmlなど）は含めない。
        """

        # ==========================================
        # 5. AI実行 (Gemini優先・Gemmaバックアップ)
        # ==========================================
        ai_text, selected_model = None, None
        API_HOST = "generativelanguage.googleapis.com"
        API_PATH = f"v1beta{SLS}models"

        for model_id in MODELS:
            self.stdout.write(f"🤖 モデル {model_id} で生成を試行中...")
            api_endpoint = f"{SCH}{CLN}{SLS}{SLS}{API_HOST}{SLS}{API_PATH}{SLS}{model_id}{CLN}generateContent{QMK}key{EQU}{GEMINI_API_KEY}"
            
            try:
                response = requests.post(api_endpoint, json={"contents": [{"parts": [{"text": prompt}]}]}, timeout=180)
                res_json = response.json()
                if 'candidates' in res_json and len(res_json['candidates']) > 0:
                    ai_text = res_json['candidates'][0]['content']['parts'][0]['text']
                    selected_model = model_id
                    self.stdout.write(self.style.SUCCESS(f"✨ {selected_model} で生成に成功しました。"))
                    break
                else:
                    self.stdout.write(self.style.WARNING(f"⚠️ {model_id} でエラーまたは制限が発生。"))
            except:
                continue

        if not ai_text: return

        # ==========================================
        # 6. 整形とアフィリエイト・装飾ブロック構築
        # ==========================================
        clean_text = re.sub(r'```(html)?', '', ai_text).replace('```', '').strip()
        lines = [l.strip() for l in clean_text.split('\n') if l.strip()]
        title = re.sub(r'<[^>]*?>', '', lines[0]).replace('#', '').strip()
        main_body_html = '\n'.join(lines[1:]).strip()

        # アフィリエイトURL設定
        if 'dell' in maker_low:
            affiliate_url = f"{SCH}{CLN}{SLS}{SLS}click.linksynergy.com{SLS}fs-bin{SLS}click{QMK}id{EQU}nNBA6GzaGrQ{AMP}offerid{EQU}1568114.10014115{AMP}type{EQU}3{AMP}subid{EQU}0"
            tracking_beacon = f'<img border="0" width="1" height="1" src="{SCH}{CLN}{SLS}{SLS}ad.linksynergy.com{SLS}fs-bin{SLS}show{QMK}id{EQU}nNBA6GzaGrQ{AMP}bids{EQU}1568114.10014115{AMP}type{EQU}3{AMP}subid{EQU}0" >'
            button_text = "Dell公式サイトで詳細を見る ＞"
        else:
            sid, pid = "3697471", "892455531"
            encoded_url = urllib.parse.quote(product.url, safe='')
            affiliate_url = f"{SCH}{CLN}{SLS}{SLS}ck.jp.ap.valuecommerce.com{SLS}servlet{SLS}referral{QMK}sid{EQU}{sid}{AMP}pid{EQU}{pid}{AMP}vc_url{EQU}{encoded_url}"
            tracking_beacon = f'<img src="{SCH}{CLN}{SLS}{SLS}ad.jp.ap.valuecommerce.com{SLS}servlet{SLS}gifbanner{QMK}sid{EQU}{sid}{AMP}pid{EQU}{pid}" height="1" width="1" border="0">'
            button_text = f"{product.maker}公式サイトで詳細を見る ＞"

        # 記事冒頭のアイキャッチ画像ブロック
        image_header_block = ""
        if media_url:
            image_header_block = f'\n<figure class="wp-block-image size-full"><img src="{media_url}" alt="{product.name}" class="wp-image-{media_id}"/></figure>\n'

        # 華やかな商品スペックカード（末尾用）
        custom_card_html = f"""
        <div style="margin: 40px 0; padding: 25px; border: 2px solid #3b82f6; border-radius: 20px; background-color: #f8fafc; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
            <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 24px;">
                <div style="flex: 1; min-width: 220px; text-align: center;">
                    <img src="{media_url if media_url else product.image_url}" alt="{product.name}" style="max-width: 100%; height: auto; border-radius: 12px; border: 1px solid #ddd;">
                </div>
                <div style="flex: 2; min-width: 250px;">
                    <h3 style="margin: 0 0 12px 0; color: #1e3a8a; font-size: 1.5em; border-bottom: 2px solid #3b82f6; padding-bottom: 8px;">{product.name}</h3>
                    <p style="color: #ef4444; font-weight: bold; font-size: 1.4em; margin: 15px 0;">特別価格：{product.price:,}円（税込）</p>
                    <div style="display: flex; gap: 12px; margin-top: 25px; flex-wrap: wrap;">
                        <a href="{affiliate_url}" target="_blank" rel="nofollow noopener" 
                           style="flex: 1; min-width: 160px; background: linear-gradient(135deg, #ef4444, #b91c1c); color: #ffffff; text-align: center; padding: 15px 10px; border-radius: 10px; text-decoration: none; font-weight: bold; box-shadow: 0 4px 10px rgba(239,68,68,0.3);">
                            {button_text}{tracking_beacon}
                        </a>
                        <a href="{bic_detail_url}" target="_blank"
                           style="flex: 1; min-width: 160px; background: linear-gradient(135deg, #1f2937, #111827); color: #ffffff; text-align: center; padding: 15px 10px; border-radius: 10px; text-decoration: none; font-weight: bold; box-shadow: 0 4px 10px rgba(0,0,0,0.2);">
                            詳細スペックを確認する ＞
                        </a>
                    </div>
                </div>
            </div>
        </div>
        """

        full_wp_content = f"{image_header_block}\n{main_body_html}\n{custom_card_html}"

        # ==========================================
        # 7. WordPress投稿とDB更新
        # ==========================================
        product.ai_content = main_body_html 
        product.is_posted = True
        product.save()

        wp_payload = {
            "title": title,
            "content": full_wp_content,
            "status": "publish",
            "featured_media": media_id,
            "categories": target_cats, 
            "tags": target_tags           
        }
        
        try:
            wp_res = requests.post(WP_POST_URL, json=wp_payload, auth=AUTH, timeout=30)
            if wp_res.status_code == 201:
                self.stdout.write(self.style.SUCCESS(f"✅ 【投稿完了】モデル: {selected_model} / タイトル: {title}"))
            else:
                self.stdout.write(self.style.ERROR(f"❌ WordPress投稿失敗: {wp_res.status_code}"))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"WordPress通信エラー: {e}"))