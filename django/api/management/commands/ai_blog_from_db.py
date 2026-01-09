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
    help = 'Gemini/Gemma 6種類をローテーションし、AI記事をDB保存しつつWP投稿するスクリプト'

    def handle(self, *args, **options):
        # ==========================================
        # 1. 認証情報・記号定義（URL汚染防止）
        # ==========================================
        GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
        WP_USER = "bicstation"
        WP_APP_PASSWORD = "9re0 t3de WCe1 u1IL MudX 31IY"
        
        # URL組み立て用（自動リンクによるメタ文字混入を100%防ぐ手法）
        H, C, S, Q_MK, E_MK = "https", ":", "/", "?", "="
        W_DOM = "blog.tiper.live"
        G_DOM = "generativelanguage.googleapis.com"
        
        WP_BASE = f"{H}{C}{S}{S}{W_DOM}{S}wp-json{S}wp/v2"
        WP_POST_URL = f"{WP_BASE}{S}bicstation"
        WP_MEDIA_URL = f"{WP_BASE}{S}media"
        AUTH = HTTPBasicAuth(WP_USER, WP_APP_PASSWORD)

        # 💡 ローテーション用モデルリスト
        MODELS = [
            "gemini-2.0-flash",
            "gemini-2.0-flash-lite",
            "gemma-3-27b-it",
            "gemini-1.5-flash",
            "gemini-1.5-pro",
            "gemini-3-flash-preview",
        ]

        # WordPress設定
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
            self.stdout.write(self.style.ERROR("未投稿の対象製品がありません。"))
            return

        product = random.choice(products)
        maker_low = product.maker.lower()
        self.stdout.write(self.style.SUCCESS(f"🚀 ターゲット確定: {product.name} ({product.maker})"))

        # カテゴリ・タグ・詳細URL
        target_cats = [CAT_LENOVO if 'lenovo' in maker_low else CAT_DELL if 'dell' in maker_low else CAT_HP if 'hp' in maker_low else 1]
        name_lower = product.name.lower()
        target_tags = [TAG_DESKTOP if any(k in name_lower for k in ["desktop", "tower", "station", "aio", "tiny", "center"]) else TAG_LAPTOP]
        bic_detail_url = f"{H}{C}{S}{S}bicstation.com{S}product{S}{product.unique_id}{S}"

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
                        m_res = requests.post(WP_MEDIA_URL, auth=AUTH, files=files, headers={'Content-Disposition': f'attachment; filename={product.unique_id}.jpg'})
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
        以下の製品データに基づき、ITニュースサイト向けの深く鋭い、純粋な「HTMLソースコードのみ」を出力してください。
        Markdown記法(```html等)は絶対に入れないでください。

        製品名: {product.name}
        メーカー: {product.maker}
        価格: {product.price}円
        スペック: {product.description}

        【構成ルール】
        1. 1行目はタイトル（タグなしプレーンテキスト）。
        2. 本文は必ず <h2> <h3> タグを使用した構成。
        3. 2000文字以上の情報量。
        4. 文末は「この製品の詳細は、以下のリンクからご確認いただけます」で締める。
        """

        # ==========================================
        # 5. AI実行 (ローテーション)
        # ==========================================
        ai_text, selected_model = None, None

        for model_id in MODELS:
            self.stdout.write(f"🤖 モデル {model_id} で生成中...")
            
            # 💡 URLを完全に分解して結合（Markdownリンク等の混入を徹底排除）
            api_url = f"{H}{C}{S}{S}{G_DOM}{S}v1beta{S}models{S}{model_id}{C}generateContent{Q_MK}key{E_MK}{GEMINI_API_KEY}"
            
            payload = {"contents": [{"parts": [{"text": prompt}]}]}

            try:
                response = requests.post(api_url, json=payload, timeout=120)
                res_json = response.json()
                
                if 'candidates' in res_json and len(res_json['candidates']) > 0:
                    ai_text = res_json['candidates'][0]['content']['parts'][0]['text']
                    selected_model = model_id
                    break
                else:
                    error_msg = res_json.get('error', {}).get('message', 'No candidates')
                    self.stdout.write(self.style.WARNING(f"   -> 失敗: {error_msg}"))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"   -> 通信エラー: {str(e)}"))

        if not ai_text:
            self.stdout.write(self.style.ERROR("🚨 すべてのモデルで失敗しました。"))
            return

        # ==========================================
        # 6. 整形・アフィリエイト設定
        # ==========================================
        clean_text = re.sub(r'```(html)?', '', ai_text).replace('```', '').strip()
        lines = [l.strip() for l in clean_text.split('\n') if l.strip()]
        title = re.sub(r'<[^>]*?>', '', lines[0]).replace('#', '').strip()
        main_body_html = '\n'.join(lines[1:]).strip()

        # アフィリエイトURL生成
        aff_url = ""
        tk_beacon = ""
        btn_txt = ""

        if 'dell' in maker_low:
            aff_url = product.affiliate_url or "[https://click.linksynergy.com/fs-bin/click?id=nNBA6GzaGrQ&offerid=1568114.10014115&type=3&subid=0](https://click.linksynergy.com/fs-bin/click?id=nNBA6GzaGrQ&offerid=1568114.10014115&type=3&subid=0)"
            tk_beacon = '<img border="0" width="1" height="1" src="[https://ad.linksynergy.com/fs-bin/show?id=nNBA6GzaGrQ&bids=1568114.10014115&type=3&subid=0](https://ad.linksynergy.com/fs-bin/show?id=nNBA6GzaGrQ&bids=1568114.10014115&type=3&subid=0)">'
            btn_txt = "Dell公式サイトで見る ＞"
        else:
            sid, pid = "3697471", "892455531"
            encoded_url = urllib.parse.quote(product.url, safe='')
            aff_url = f"[https://ck.jp.ap.valuecommerce.com/servlet/referral?sid=](https://ck.jp.ap.valuecommerce.com/servlet/referral?sid=){sid}&pid={pid}&vc_url={encoded_url}"
            tk_beacon = f'<img src="//[ad.jp.ap.valuecommerce.com/servlet/gifbanner?sid=](https://ad.jp.ap.valuecommerce.com/servlet/gifbanner?sid=){sid}&pid={pid}" height="1" width="1" border="0">'
            btn_txt = f"{product.maker}公式サイトで見る ＞"

        # ==========================================
        # 7. Django DB保存 & WP投稿
        # ==========================================
        product.ai_content = main_body_html
        product.is_posted = True
        product.save()

        # WP用カード作成
        card_html = f"""
        <div style="margin:40px 0;padding:25px;border:1px solid #e5e7eb;border-radius:16px;background:#fff;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
            <div style="display:flex;flex-wrap:wrap;align-items:center;gap:24px;">
                <div style="flex:1;min-width:200px;text-align:center;">
                    <img src="{media_url if media_url else product.image_url}" style="max-width:100%;border-radius:10px;">
                </div>
                <div style="flex:2;min-width:250px;">
                    <h3 style="margin:0 0 12px 0;">{product.name}</h3>
                    <p style="color:#ef4444;font-weight:bold;font-size:1.3em;">価格：{product.price:,}円（税込）</p>
                    <div style="display:flex;gap:12px;margin-top:20px;">
                        <a href="{aff_url}" target="_blank" rel="nofollow" style="flex:1;background:#ef4444;color:#fff;text-align:center;padding:14px 10px;border-radius:8px;text-decoration:none;font-weight:bold;">{btn_txt}{tk_beacon}</a>
                        <a href="{bic_detail_url}" target="_blank" style="flex:1;background:#1f2937;color:#fff;text-align:center;padding:14px 10px;border-radius:8px;text-decoration:none;font-weight:bold;">スペック詳細を見る ＞</a>
                    </div>
                </div>
            </div>
        </div>
        """

        wp_payload = {
            "title": title,
            "content": f"{main_body_html}\n{card_html}",
            "status": "publish",
            "featured_media": media_id,
            "categories": target_cats,
            "tags": target_tags
        }
        
        try:
            res = requests.post(WP_POST_URL, json=wp_payload, auth=AUTH, timeout=30)
            if res.status_code == 201:
                self.stdout.write(self.style.SUCCESS(f"✅ 成功: {selected_model} / {title}"))
            else:
                self.stdout.write(self.style.ERROR(f"❌ WPエラー: {res.status_code}"))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"❌ 投稿通信エラー: {e}"))