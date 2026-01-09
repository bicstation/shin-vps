import os
import re
import random
import requests
import urllib.parse
from django.core.management.base import BaseCommand
from api.models.pc_products import PCProduct 
from django.db.models import Q
from django.utils.timezone import now
from requests.auth import HTTPBasicAuth
from django.core.files.temp import NamedTemporaryFile

class Command(BaseCommand):
    help = 'URL記号を完全分離し自動装飾エラーを排除した堅牢版スクリプト'

    def handle(self, *args, **options):
        # ==========================================
        # 1. 記号・基本設定 (自動リンク化対策)
        # ==========================================
        # 記号を個別に定義することで、エディタによる自動リンク(Markdown)を防止
        S  = "https"
        C  = ":"
        SL = "/"
        Q  = "?"
        E  = "="
        A  = "&"

        GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
        WP_USER = "bicstation"
        WP_APP_PASSWORD = "9re0 t3de WCe1 u1IL MudX 31IY"
        
        W_DOM = "blog.tiper.live"
        
        # WordPressエンドポイント構築
        WP_POST_URL = f"{S}{C}{SL}{SL}{W_DOM}{SL}wp-json{SL}wp{SL}v2{SL}bicstation"
        WP_MEDIA_URL = f"{S}{C}{SL}{SL}{W_DOM}{SL}wp-json{SL}wp{SL}v2{SL}media"
        AUTH = HTTPBasicAuth(WP_USER, WP_APP_PASSWORD)

        # 10種類のAIモデル
        MODELS = [
            "gemma-3-27b-it",
            "gemini-2.0-flash",
            "gemini-2.0-flash-lite",
            "gemini-2.0-pro-exp-02-05",
            "gemini-1.5-flash",
            "gemini-1.5-pro",
            "gemini-2.0-flash-thinking-exp-01-21",
            "gemini-1.5-flash-8b",
            "gemini-exp-1206",
            "learnlm-1.5-pro-experimental"
        ]

        CAT_LENOVO, CAT_DELL, CAT_HP = 4, 7, 8
        TAG_DESKTOP, TAG_LAPTOP = 5, 6

        # ==========================================
        # 2. 投稿対象商品の選定
        # ==========================================
        products = PCProduct.objects.filter(is_active=True, is_posted=False).filter(
            Q(maker__icontains='Lenovo') | Q(maker__icontains='Dell') | Q(maker__icontains='HP')
        ).exclude(stock_status="受注停止中")
        
        if not products.exists():
            self.stdout.write(self.style.ERROR("未投稿の対象製品が見つかりません。"))
            return

        product = random.choice(products)
        maker_low = product.maker.lower()
        self.stdout.write(self.style.SUCCESS(f"🚀 ターゲット確定: {product.name} ({product.maker})"))

        # カテゴリ・タグ判定
        target_cats = [CAT_LENOVO if 'lenovo' in maker_low else CAT_DELL if 'dell' in maker_low else CAT_HP if 'hp' in maker_low else 1]
        name_lower = product.name.lower()
        target_tags = [TAG_DESKTOP if any(k in name_lower for k in ["desktop", "tower", "station", "aio", "tiny", "center", "poweredge"]) else TAG_LAPTOP]
        
        # 商品詳細ページ
        bic_detail_url = f"{S}{C}{SL}{SL}bicstation.com{SL}product{SL}{product.unique_id}{SL}"

        # ==========================================
        # 3. 商品画像のアップロード
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
                            self.stdout.write(self.style.SUCCESS(f"画像アップロード成功: ID {media_id}"))
            except Exception as e:
                self.stdout.write(self.style.WARNING(f"画像処理エラー: {e}"))

        # ==========================================
        # 4. AIプロンプト
        # ==========================================
        prompt = f"""
        あなたはPCの技術仕様に精通した客観的な解説者です。
        以下の製品データに基づき、ITニュースサイト向けの深く鋭い記事を、WordPressのブロックエディタ形式のHTMLで出力してください。

        【製品データ】
        メーカー: {product.maker} | 商品名: {product.name} | 価格: {product.price}円
        スペック詳細: {product.description}

        【出力ルール】
        1. 1行目はタイトル（プレーンテキスト）。
        2. 2行目以降は本文。各要素を <p>...</p>や <h2>...</h2>で必ず囲むこと。
        3. 2000文字以上の情報量。Markdown(```html等)は含めない。
        4. 文末は「この製品の詳細は、以下のリンクからご確認いただけます」で締める。
        """

        # ==========================================
        # 5. AI実行 (記号分離型URL構築)
        # ==========================================
        ai_text, selected_model = None, None
        API_HOST = "generativelanguage.googleapis.com"
        API_PATH = f"v1beta{SL}models"

        for model_id in MODELS:
            self.stdout.write(f"🤖 モデル {model_id} で生成中...")
            # URLを構成パーツごとに結合 (https://host/path/model:generateContent?key=KEY)
            api_endpoint = f"{S}{C}{SL}{SL}{API_HOST}{SL}{API_PATH}{SL}{model_id}{C}generateContent{Q}key{E}{GEMINI_API_KEY}"
            
            try:
                response = requests.post(api_endpoint, json={"contents": [{"parts": [{"text": prompt}]}]}, timeout=120)
                res_json = response.json()
                
                if 'candidates' in res_json and len(res_json['candidates']) > 0:
                    ai_text = res_json['candidates'][0]['content']['parts'][0]['text']
                    selected_model = model_id
                    self.stdout.write(self.style.SUCCESS(f"✨ {model_id} 生成成功"))
                    break
                else:
                    self.stdout.write(self.style.WARNING(f"⚠️ {model_id} 失敗"))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"❌ 通信エラー ({model_id})"))
                continue

        if not ai_text:
            return

        # ==========================================
        # 6. 整形とアフィリエイトURLの構築
        # ==========================================
        clean_text = re.sub(r'```(html)?', '', ai_text).replace('```', '').strip()
        lines = [l.strip() for l in clean_text.split('\n') if l.strip()]
        title = re.sub(r'<[^>]*?>', '', lines[0]).replace('#', '').strip()
        main_body_html = '\n'.join(lines[1:]).strip()

        # アフィリエイトURLの構築 (記号を結合)
        affiliate_url = ""
        tracking_beacon = ""
        button_text = ""
        
        if 'dell' in maker_low:
            affiliate_url = f"{S}{C}{SL}{SL}click.linksynergy.com{SL}fs-bin{SL}click{Q}id{E}nNBA6GzaGrQ{A}offerid{E}1568114.10014115{A}type{E}3{A}subid{E}0"
            tracking_beacon = f'<img border="0" width="1" height="1" src="{S}{C}{SL}{SL}ad.linksynergy.com{SL}fs-bin{SL}show{Q}id{E}nNBA6GzaGrQ{A}bids{E}1568114.10014115{A}type{E}3{A}subid{E}0" >'
            button_text = "Dell公式サイトで見る ＞"
        else:
            sid, pid = "3697471", "892455531"
            encoded_url = urllib.parse.quote(product.url, safe='')
            affiliate_url = f"{S}{C}{SL}{SL}ck.jp.ap.valuecommerce.com{SL}servlet{SL}referral{Q}sid{E}{sid}{A}pid{E}{pid}{A}vc_url{E}{encoded_url}"
            tracking_beacon = f'<img src="{S}{C}{SL}{SL}ad.jp.ap.valuecommerce.com{SL}servlet{SL}gifbanner{Q}sid{E}{sid}{A}pid{E}{pid}" height="1" width="1" border="0">'
            button_text = f"{product.maker}公式サイトで見る ＞"

        # 冒頭のアイキャッチ
        image_header_block = ""
        if media_url:
            image_header_block = f'<figure class="wp-block-image size-full"><img src="{media_url}" alt="{product.name}"/></figure>'

        # スペックカード
        custom_card_html = f"""
        <div style="margin: 40px 0; padding: 25px; border: 1px solid #e5e7eb; border-radius: 16px; background-color: #ffffff; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
            <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 24px;">
                <div style="flex: 1; min-width: 200px; text-align: center;">
                    <a href="{bic_detail_url}" target="_blank">
                        <img src="{media_url if media_url else product.image_url}" alt="{product.name}" style="max-width: 100%; height: auto; border-radius: 10px;">
                    </a>
                </div>
                <div style="flex: 2; min-width: 250px;">
                    <h3 style="margin: 0 0 12px 0; font-size: 1.4em;">{product.name}</h3>
                    <p style="color: #ef4444; font-weight: bold; font-size: 1.3em; margin: 10px 0;">価格：{product.price:,}円（税込）</p>
                    <div style="display: flex; gap: 12px; margin-top: 20px; flex-wrap: wrap;">
                        <a href="{affiliate_url}" target="_blank" rel="nofollow noopener noreferrer" 
                           style="flex: 1; min-width: 140px; background-color: #ef4444; color: #ffffff; text-align: center; padding: 14px 10px; border-radius: 8px; text-decoration: none; font-weight: bold;">
                            {button_text}{tracking_beacon}
                        </a>
                        <a href="{bic_detail_url}" target="_blank"
                           style="flex: 1; min-width: 140px; background-color: #1f2937; color: #ffffff; text-align: center; padding: 14px 10px; border-radius: 8px; text-decoration: none; font-weight: bold;">
                            詳細スペックを見る ＞
                        </a>
                    </div>
                </div>
            </div>
        </div>
        """

        full_wp_content = f"{image_header_block}\n{main_body_html}\n{custom_card_html}"

        # ==========================================
        # 7. 実行と投稿
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
                self.stdout.write(self.style.SUCCESS(f"✅ 【投稿成功】モデル: {selected_model} / {title}"))
            else:
                self.stdout.write(self.style.ERROR(f"❌ WP投稿失敗: {wp_res.status_code}"))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"WP投稿通信エラー: {e}"))