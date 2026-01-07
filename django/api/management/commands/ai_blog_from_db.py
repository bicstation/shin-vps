from django.core.management.base import BaseCommand
from api.models.pc_products import PCProduct 
from django.db.models import Q
import requests
import random
import os
import re
from requests.auth import HTTPBasicAuth
from django.core.files.temp import NamedTemporaryFile
import urllib.parse

class Command(BaseCommand):
    help = '集客用WPブログと信頼用自社DB(Next.js)の両方に、役割の異なる解説を同時生成・保存する'

    def handle(self, *args, **options):
        # ==========================================
        # 1. 基本設定・認証情報
        # ==========================================
        GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
        WP_USER = "bicstation"
        WP_APP_PASSWORD = "9re0 t3de WCe1 u1IL MudX 31IY"
        
        H, C, S = "https", ":", "/"
        W_DOM = "blog.tiper.live"
        WP_POST_URL = f"{H}{C}{S}{S}{W_DOM}{S}wp-json{S}wp/v2{S}bicstation"
        WP_MEDIA_URL = f"{H}{C}{S}{S}{W_DOM}{S}wp-json{S}wp/v2{S}media"
        AUTH = HTTPBasicAuth(WP_USER, WP_APP_PASSWORD)

        MODELS = [
            "gemini-3-flash-preview",
            "gemini-2.5-flash",
            "gemini-2.5-flash-lite",
            "gemma-3-12b-it" 
        ]

        CAT_LENOVO, CAT_DELL = 4, 7
        TAG_DESKTOP, TAG_LAPTOP = 5, 6

        # ==========================================
        # 2. 投稿対象商品の選定
        # ==========================================
        products = PCProduct.objects.filter(
            is_active=True,
            is_posted=False
        ).filter(
            Q(ai_content__isnull=True) | Q(ai_content="")
        ).exclude(stock_status="受注停止中")
        
        if not products.exists():
            self.stdout.write(self.style.ERROR("対象製品がDBに見当たりませんでした。"))
            return

        product = random.choice(products)
        self.stdout.write(self.style.SUCCESS(f"デプロイ準備: {product.name}"))

        # カテゴリ・タグ判定
        target_cats = [CAT_LENOVO if 'lenovo' in product.maker.lower() else (CAT_DELL if 'dell' in product.maker.lower() else 1)]
        target_tags = [TAG_DESKTOP if any(k in product.name.lower() for k in ["desktop", "tower", "station", "aio", "tiny", "center"]) else TAG_LAPTOP]

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
            except Exception as e:
                self.stdout.write(self.style.WARNING(f"画像処理スキップ: {e}"))

        # ==========================================
        # 4. AIプロンプト（役割分担の強化）
        # ==========================================
        prompt = f"""
        あなたはPCの技術仕様とマーケティングに精通したエキスパートです。
        以下の製品データから、ITニュースサイト向けの【ブログ記事】と、自社カタログサイト向けの【製品解説】を同時に作成してください。

        【データ】メーカー:{product.maker} | 名称:{product.name} | 価格:{product.price}円 | スペック:{product.description}

        【出力ルール】
        - 1行目: 読者を惹きつけるブログタイトル
        - 2行目以降: 本文HTML
        - 内容には必ず以下を含めてください:
            1. 専門家から見たこのモデルの最大の特徴（性能・冷却・筐体など）
            2. 競合他社（DELLならLenovo、LenovoならHP等）と比較した際の強み
            3. このスペックが「本当に必要になる」具体的なユーザー像
        - ブログ向けには「語りかけるような熱量のある文章」を。
        - カタログ（製品詳細）向けには「スペックを論理的に裏付ける客観的な解説」を意識。

        ※Markdown(```html)は厳禁。純粋なHTMLタグのみを出力してください。
        """

        # ==========================================
        # 5. AI実行（ローテーション）
        # ==========================================
        ai_text, selected_model = None, None
        for model_id in MODELS:
            api_url = f"{H}{C}{S}{S}generativelanguage.googleapis.com{S}v1beta{S}models{S}{model_id}:generateContent?key={GEMINI_API_KEY}"
            try:
                response = requests.post(api_url, json={"contents": [{"parts": [{"text": prompt}]}]}, timeout=120)
                res_json = response.json()
                if 'candidates' in res_json:
                    ai_text = res_json['candidates'][0]['content']['parts'][0]['text']
                    selected_model = model_id
                    break
            except: continue

        if not ai_text: return

        # ==========================================
        # 6. 整形とアフィリエイトカードの構築
        # ==========================================
        clean_text = re.sub(r'```(html)?', '', ai_text).replace('```', '').strip()
        lines = [l.strip() for l in clean_text.split('\n') if l.strip()]
        if len(lines) < 2: return

        title = lines[0].replace('#', '').strip()
        main_body_html = '\n'.join(lines[1:]).strip()

        # WordPress用のフルセット
        top_image_html = f'<div style="text-align:center;margin-bottom:30px;"><img src="{media_url}" style="width:100%;border-radius:12px;box-shadow:0 4px 15px rgba(0,0,0,0.1);"></div>' if media_url else ""
        
        encoded_url = urllib.parse.quote(product.url, safe='')
        aff_url = f"{H}{C}{S}{S}ck.jp.ap.valuecommerce.com{S}servlet/referral?sid=3697471&pid=892455531&vc_url={encoded_url}"
        beacon = '<img src="//[ad.jp.ap.valuecommerce.com/servlet/gifbanner?sid=3697471&pid=892455531](https://ad.jp.ap.valuecommerce.com/servlet/gifbanner?sid=3697471&pid=892455531)" height="1" width="1" border="0">'

        card_html = f"""
        <div class="affiliate-card" style="margin:40px 0;padding:25px;border-radius:16px;background:#fff;border:1px solid #eee;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
            <div style="display:flex;flex-wrap:wrap;gap:20px;align-items:center;">
                <div style="flex:1;min-width:180px;"><img src="{media_url}" style="width:100%;border-radius:10px;"></div>
                <div style="flex:2;min-width:240px;">
                    <h3 style="margin:0 0 10px 0;">{product.name}</h3>
                    <p style="color:#d9534f;font-weight:bold;font-size:1.4em;">税込 {product.price:,}円〜</p>
                    <div style="display:flex;gap:10px;margin-top:15px;">
                        <a href="{aff_url}" target="_blank" style="flex:1;background:#d9534f;color:#fff;text-align:center;padding:12px;border-radius:6px;text-decoration:none;font-weight:bold;">公式サイト {beacon}</a>
                        <a href="{bic_detail_url}" style="flex:1;background:#333;color:#fff;text-align:center;padding:12px;border-radius:6px;text-decoration:none;font-weight:bold;">製品詳細</a>
                    </div>
                </div>
            </div>
        </div>
        """
        full_wp_content = f"{top_image_html}\n{main_body_html}\n{card_html}"

        # ==========================================
        # 7. 実行
        # ==========================================
        wp_res = requests.post(WP_POST_URL, json={"title":title, "content":full_wp_content, "status":"publish", "featured_media":media_id, "categories":target_cats, "tags":target_tags}, auth=AUTH)
        
        if wp_res.status_code == 201:
            # Next.js用には「アイキャッチ」や「カード」を含めない、純粋なプロの解説のみを保存
            product.ai_content = main_body_html
            product.is_posted = True
            product.save()
            self.stdout.write(self.style.SUCCESS(f"【成功】{selected_model}によりWP/自社DBの両方を最適化しました。"))