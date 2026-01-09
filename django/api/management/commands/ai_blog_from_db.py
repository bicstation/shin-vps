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
    help = 'Gemini/Gemma 10種ローテーション・URLエラー修正・スペックカード画像維持版'

    def handle(self, *args, **options):
        # ==========================================
        # 1. 基本設定・認証情報
        # ==========================================
        GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
        WP_USER = "bicstation"
        WP_APP_PASSWORD = "9re0 t3de WCe1 u1IL MudX 31IY"
        
        W_DOM = "blog.tiper.live"
        WP_POST_URL = f"https://{W_DOM}/wp-json/wp/v2/bicstation"
        WP_MEDIA_URL = f"https://{W_DOM}/wp-json/wp/v2/media"
        AUTH = HTTPBasicAuth(WP_USER, WP_APP_PASSWORD)

        # 💡 失敗に強い10種類のモデルローテーション
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
        products = PCProduct.objects.filter(
            is_active=True,
            is_posted=False
        ).filter(
            Q(maker__icontains='Lenovo') | Q(maker__icontains='Dell') | Q(maker__icontains='HP')
        ).exclude(stock_status="受注停止中")
        
        if not products.exists():
            self.stdout.write(self.style.ERROR("未投稿の対象製品がDBに見当たりませんでした。"))
            return

        product = random.choice(products)
        maker_low = product.maker.lower()
        self.stdout.write(self.style.SUCCESS(f"🚀 ターゲット確定: {product.name} ({product.maker})"))

        # カテゴリ・タグ判定
        target_cats = [CAT_LENOVO if 'lenovo' in maker_low else CAT_DELL if 'dell' in maker_low else CAT_HP if 'hp' in maker_low else 1]
        name_lower = product.name.lower()
        target_tags = [TAG_DESKTOP if any(k in name_lower for k in ["desktop", "tower", "station", "aio", "tiny", "center", "poweredge"]) else TAG_LAPTOP]

        # 詳細ページURL
        bic_detail_url = f"https://bicstation.com/product/{product.unique_id}/"

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
        # 4. AIプロンプト (Gutenberg最適化)
        # ==========================================
        prompt = f"""
        あなたはPCの技術仕様に精通した客観的な解説者です。
        以下の製品データに基づき、ITニュースサイト向けの深く鋭い記事を、WordPressのブロックエディタ形式のHTMLのみで出力してください。

        【製品データ】
        メーカー: {product.maker} | 商品名: {product.name} | 価格: {product.price}円
        スペック詳細: {product.description}

        【出力ルール】
        1. 1行目は記事のタイトル（プレーンテキスト）。
        2. 2行目以降は本文。各要素を <p>...</p>や <h2>...</h2>で必ず囲むこと。
        3. 2000文字以上の情報量で記述。
        4. 文末は「この製品の詳細は、以下のリンクからご確認いただけます」という一文で締める。
        5. 解説やMarkdownの囲み(```html等)は一切含めない。
        """

        # ==========================================
        # 5. AI実行 (ローテーション)
        # ==========================================
        ai_text, selected_model = None, None

        for model_id in MODELS:
            self.stdout.write(f"🤖 モデル {model_id} で生成中...")
            # ⚠️ URLに余計な記号が混じらないよう、純粋なf-stringで構築
            api_endpoint = f"[https://generativelanguage.googleapis.com/v1beta/models/](https://generativelanguage.googleapis.com/v1beta/models/){model_id}:generateContent?key={GEMINI_API_KEY}"
            
            try:
                response = requests.post(api_endpoint, json={"contents": [{"parts": [{"text": prompt}]}]}, timeout=120)
                res_json = response.json()
                
                if 'candidates' in res_json and len(res_json['candidates']) > 0:
                    ai_text = res_json['candidates'][0]['content']['parts'][0]['text']
                    selected_model = model_id
                    self.stdout.write(self.style.SUCCESS(f"✨ {model_id} 生成成功"))
                    break
                else:
                    error_msg = res_json.get('error', {}).get('message', 'Unknown Error')
                    self.stdout.write(self.style.WARNING(f"⚠️ {model_id} 失敗: {error_msg[:50]}"))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"❌ 通信エラー ({model_id}): {e}"))
                continue

        if not ai_text:
            self.stdout.write(self.style.ERROR("🚨 すべてのモデルで生成に失敗しました。"))
            return

        # ==========================================
        # 6. 整形とアフィリエイトURLの浄化
        # ==========================================
        # 不要な記号のクリーンアップ
        clean_text = re.sub(r'```(html)?', '', ai_text).replace('```', '').strip()
        lines = [l.strip() for l in clean_text.split('\n') if l.strip()]
        
        if not lines:
            return

        title = re.sub(r'<[^>]*?>', '', lines[0]).replace('#', '').strip()
        main_body_html = '\n'.join(lines[1:]).strip()

        # アフィリエイトURLの生成（URLのノイズをreplaceで除去）
        affiliate_url = ""
        tracking_beacon = ""
        button_text = ""
        
        if 'dell' in maker_low:
            raw_url = product.affiliate_url if hasattr(product, 'affiliate_url') and product.affiliate_url else "[https://click.linksynergy.com/fs-bin/click?id=nNBA6GzaGrQ&offerid=1568114.10014115&type=3&subid=0](https://click.linksynergy.com/fs-bin/click?id=nNBA6GzaGrQ&offerid=1568114.10014115&type=3&subid=0)"
            affiliate_url = raw_url.strip().replace('(', '').replace(')', '').replace('[', '').replace(']', '')
            tracking_beacon = '<img border="0" width="1" height="1" src="[https://ad.linksynergy.com/fs-bin/show?id=nNBA6GzaGrQ&bids=1568114.10014115&type=3&subid=0](https://ad.linksynergy.com/fs-bin/show?id=nNBA6GzaGrQ&bids=1568114.10014115&type=3&subid=0)" >'
            button_text = "Dell公式サイトで見る ＞"
        else:
            sid, pid = "3697471", "892455531"
            raw_url = product.url
            encoded_url = urllib.parse.quote(raw_url, safe='')
            affiliate_url = f"[https://ck.jp.ap.valuecommerce.com/servlet/referral?sid=](https://ck.jp.ap.valuecommerce.com/servlet/referral?sid=){sid}&pid={pid}&vc_url={encoded_url}"
            tracking_beacon = f'<img src="//[ad.jp.ap.valuecommerce.com/servlet/gifbanner?sid=](https://ad.jp.ap.valuecommerce.com/servlet/gifbanner?sid=){sid}&pid={pid}" height="1" width="1" border="0">'
            button_text = f"{product.maker}公式サイトで見る ＞"

        # 冒頭のアイキャッチ画像（WordPress標準の画像ブロック形式）
        image_header_block = ""
        if media_url:
            image_header_block = f"""
            <figure class="wp-block-image size-full"><img src="{media_url}" alt="{product.name}" class="wp-image-{media_id}"/></figure>
            """

        # スペックカードHTML（画像は必須として維持）
        custom_card_html = f"""
        <div style="margin: 40px 0; padding: 25px; border: 1px solid #e5e7eb; border-radius: 16px; background-color: #ffffff; box-shadow: 0 4px 20px rgba(0,0,0,0.08); font-family: sans-serif;">
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
        # 7. Django DBへの保存 (以前のロジック維持)
        # ==========================================
        product.ai_content = main_body_html 
        product.is_posted = True
        product.save()
        self.stdout.write(self.style.SUCCESS(f"💾 Django DBにAI記事を保存しました。"))

        # ==========================================
        # 8. WordPress 投稿実行
        # ==========================================
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
                self.stdout.write(self.style.SUCCESS(f"✅ 【投稿成功】モデル: {selected_model} / 記事: {title}"))
            else:
                self.stdout.write(self.style.ERROR(f"❌ WP投稿失敗: {wp_res.status_code} - {wp_res.text}"))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"WP投稿通信エラー: {e}"))