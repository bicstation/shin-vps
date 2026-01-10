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
    help = 'Gemini優先・外部プロンプト・カテゴリー＆タグ自動生成・Cocoon最適化フルスクリプト'

    def handle(self, *args, **options):
        # ==========================================
        # 1. 記号・基本設定
        # ==========================================
        SCH, CLN, SLS, QMK, EQU, AMP = "https", ":", "/", "?", "=", "&"

        GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
        WP_USER = "bicstation"
        WP_APP_PASSWORD = "9re0 t3de WCe1 u1IL MudX 31IY"
        W_DOM = "blog.tiper.live"
        
        WP_API_BASE = f"{SCH}{CLN}{SLS}{SLS}{W_DOM}{SLS}wp-json{SLS}wp{SLS}v2"
        WP_POST_URL = f"{WP_API_BASE}{SLS}bicstation"
        WP_MEDIA_URL = f"{WP_API_BASE}{SLS}media"
        AUTH = HTTPBasicAuth(WP_USER, WP_APP_PASSWORD)

        MODELS = [
            "gemini-2.0-pro-exp-02-05", 
            "gemini-2.0-flash", 
            "gemini-2.0-flash-thinking-exp-01-21",
            "gemini-1.5-pro", 
            "gemini-1.5-flash",
            "gemini-2.0-flash-lite",
            "gemma-3-27b-it"
        ]

        CAT_LENOVO, CAT_DELL, CAT_HP = 4, 7, 8
        TAG_DESKTOP, TAG_LAPTOP = 5, 6

        # --- 外部プロンプトファイルの読み込み ---
        PROMPT_FILE_PATH = "/mnt/c/dev/SHIN-VPS/django/api/management/commands/ai_prompt.txt"
        try:
            with open(PROMPT_FILE_PATH, 'r', encoding='utf-8') as f:
                base_prompt_template = f.read()
            self.stdout.write(self.style.SUCCESS(f"📖 プロンプトファイルを読み込みました: {PROMPT_FILE_PATH}"))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"❌ プロンプトファイルの読み込みに失敗しました: {e}"))
            return

        # --- 内部関数: ターム（カテゴリ/タグ）の取得・作成 ---
        def get_or_create_term(taxonomy, name):
            try:
                search_url = f"{WP_API_BASE}/{taxonomy}{QMK}search{EQU}{urllib.parse.quote(name)}"
                res = requests.get(search_url, auth=AUTH, timeout=10)
                if res.status_code == 200:
                    terms = res.json()
                    for t in terms:
                        if t['name'].lower() == name.lower():
                            return t['id']
                
                create_res = requests.post(
                    f"{WP_API_BASE}/{taxonomy}",
                    json={"name": name},
                    auth=AUTH,
                    timeout=10
                )
                if create_res.status_code == 201:
                    return create_res.json().get('id')
            except Exception as e:
                self.stdout.write(self.style.WARNING(f"ターム操作エラー ({name}): {e}"))
            return None

        # ==========================================
        # 2. 投稿対象商品の選定
        # ==========================================
        products = PCProduct.objects.filter(is_active=True, is_posted=False).exclude(stock_status="受注停止中")
        
        if not products.exists():
            self.stdout.write(self.style.ERROR("未投稿の対象製品が見つかりません。"))
            return

        product = random.choice(products)
        maker_low = product.maker.lower()
        self.stdout.write(self.style.SUCCESS(f"🚀 ターゲット確定: {product.name} ({product.maker})"))

        # カテゴリーとタグの決定
        target_cats = []
        if 'lenovo' in maker_low: target_cats.append(CAT_LENOVO)
        elif 'dell' in maker_low: target_cats.append(CAT_DELL)
        elif 'hp' in maker_low: target_cats.append(CAT_HP)
        else:
            new_cat_id = get_or_create_term('categories', product.maker.upper())
            target_cats.append(new_cat_id if new_cat_id else 1)

        target_tags = []
        name_lower = product.name.lower()
        is_desktop = any(k in name_lower for k in ["desktop", "tower", "station", "aio", "tiny", "center", "poweredge"])
        target_tags.append(TAG_DESKTOP if is_desktop else TAG_LAPTOP)
        
        if "rtx" in product.description.lower():
            t_id = get_or_create_term('tags', "GeForce RTX")
            if t_id: target_tags.append(t_id)

        bic_detail_url = f"{SCH}{CLN}{SLS}{SLS}bicstation.com{SLS}product{SLS}{product.unique_id}{SLS}"

        # ==========================================
        # 3. 画像アップロード
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
                        m_res = requests.post(WP_MEDIA_URL, auth=AUTH, files=files)
                        if m_res.status_code == 201:
                            m_data = m_res.json()
                            media_id, media_url = m_data.get('id'), m_data.get('source_url')
            except: pass

        # ==========================================
        # 4. AIプロンプトの構築（外部ファイルを埋め込み）
        # ==========================================
        # テキストファイル内の {maker}, {name}, {price}, {description} などの変数を置換
        prompt = base_prompt_template.format(
            maker=product.maker,
            name=product.name,
            price=f"{product.price:,}",
            description=product.description
        )

        # ==========================================
        # 5. AI実行
        # ==========================================
        ai_text, selected_model = None, None
        for model_id in MODELS:
            self.stdout.write(f"🤖 モデル {model_id} で生成を試行中...")
            api_url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_id}:generateContent?key={GEMINI_API_KEY}"
            try:
                response = requests.post(api_url, json={"contents": [{"parts": [{"text": prompt}]}]}, timeout=180)
                res_json = response.json()
                if 'candidates' in res_json:
                    ai_text = res_json['candidates'][0]['content']['parts'][0]['text']
                    selected_model = model_id
                    break
            except: continue

        if not ai_text: return

        # ==========================================
        # 6. 整形とアフィリエイト構築
        # ==========================================
        clean_text = re.sub(r'```(html)?', '', ai_text).replace('```', '').strip()
        lines = [l.strip() for l in clean_text.split('\n') if l.strip()]
        title = re.sub(r'<[^>]*?>', '', lines[0]).replace('#', '').strip()
        main_body_html = '\n'.join(lines[1:]).strip()

        # アフィリエイト設定
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

        image_header_block = f'\n<figure class="wp-block-image size-full"><img src="{media_url if media_url else product.image_url}"/></figure>\n'

        custom_card_html = f"""
        <div style="margin: 40px 0; padding: 25px; border: 2px solid #3b82f6; border-radius: 20px; background-color: #f8fafc; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
            <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 24px;">
                <div style="flex: 1; min-width: 220px; text-align: center;">
                    <img src="{media_url if media_url else product.image_url}" style="max-width: 100%; height: auto; border-radius: 12px; border: 1px solid #ddd;">
                </div>
                <div style="flex: 2; min-width: 250px;">
                    <h3 style="margin: 0 0 12px 0; color: #1e3a8a; font-size: 1.5em; border-bottom: 2px solid #3b82f6; padding-bottom: 8px;">{product.name}</h3>
                    <p style="color: #ef4444; font-weight: bold; font-size: 1.4em; margin: 15px 0;">特別価格：{product.price:,}円（税込）</p>
                    <div style="display: flex; gap: 12px; margin-top: 25px; flex-wrap: wrap;">
                        <a href="{affiliate_url}" target="_blank" rel="nofollow noopener" style="flex: 1; min-width: 160px; background: linear-gradient(135deg, #ef4444, #b91c1c); color: #ffffff; text-align: center; padding: 15px 10px; border-radius: 10px; text-decoration: none; font-weight: bold;">{button_text}{tracking_beacon}</a>
                        <a href="{bic_detail_url}" target="_blank" style="flex: 1; min-width: 160px; background: linear-gradient(135deg, #1f2937, #111827); color: #ffffff; text-align: center; padding: 15px 10px; border-radius: 10px; text-decoration: none; font-weight: bold;">詳細スペックを確認する ＞</a>
                    </div>
                </div>
            </div>
        </div>
        """

        full_wp_content = f"{image_header_block}\n{main_body_html}\n{custom_card_html}"

        # ==========================================
        # 7. WordPress投稿
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
                product.ai_content = main_body_html 
                product.is_posted = True
                product.save()
                self.stdout.write(self.style.SUCCESS(f"✅ 【投稿完了】モデル: {selected_model} / タイトル: {title}"))
            else:
                self.stdout.write(self.style.ERROR(f"❌ WordPress投稿失敗: {wp_res.status_code}"))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"WordPress通信エラー: {e}"))