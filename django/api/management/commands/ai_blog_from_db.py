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
    help = 'Gemini優先・Gutenberg対応・要約POINT4抽出・外部プロンプト完全版'

    def handle(self, *args, **options):
        # ==========================================
        # 1. 基本設定と記号定義
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
            "gemini-1.5-flash"
        ]

        CAT_LENOVO, CAT_DELL, CAT_HP = 4, 7, 8
        TAG_DESKTOP, TAG_LAPTOP = 5, 6

        # --- 外部プロンプトファイルの読み込み（パス解決を強化） ---
        # スクリプトと同じディレクトリにある ai_prompt.txt を探す
        current_dir = os.path.dirname(os.path.abspath(__file__))
        PROMPT_FILE_PATH = os.path.join(current_dir, "ai_prompt.txt")
        
        # 万が一上記で見つからない場合の予備パス（絶対パス）
        FALLBACK_PATH = "/mnt/c/dev/SHIN-VPS/django/api/management/commands/ai_prompt.txt"

        base_prompt_template = ""
        try:
            target_path = PROMPT_FILE_PATH if os.path.exists(PROMPT_FILE_PATH) else FALLBACK_PATH
            with open(target_path, 'r', encoding='utf-8') as f:
                base_prompt_template = f.read()
            self.stdout.write(self.style.SUCCESS(f"📖 プロンプト読み込み成功: {target_path}"))
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
        # 4. AI実行
        # ==========================================
        prompt = base_prompt_template.format(
            maker=product.maker,
            name=product.name,
            price=f"{product.price:,}",
            description=product.description
        )

        ai_raw_text, selected_model = None, None
        for model_id in MODELS:
            self.stdout.write(f"🤖 モデル {model_id} で生成を試行中...")
            api_url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_id}:generateContent?key={GEMINI_API_KEY}"
            try:
                response = requests.post(api_url, json={"contents": [{"parts": [{"text": prompt}]}]}, timeout=180)
                res_json = response.json()
                if 'candidates' in res_json:
                    ai_raw_text = res_json['candidates'][0]['content']['parts'][0]['text']
                    selected_model = model_id
                    break
            except: continue

        if not ai_raw_text: return

        # ==========================================
        # 5. テキスト解析とGutenbergブロック化
        # ==========================================
        clean_text = re.sub(r'```(html)?', '', ai_raw_text).replace('```', '').strip()
        lines = [l.strip() for l in clean_text.split('\n') if l.strip()]
        
        # 1行目はタイトル
        title = re.sub(r'<[^>]*?>', '', lines[0]).replace('#', '').strip()
        
        # 要約データの抽出
        summary_match = re.search(r'\[SUMMARY_DATA\](.*?)\[/SUMMARY_DATA\]', clean_text, re.DOTALL)
        summary_raw = summary_match.group(1).strip() if summary_match else ""
        
        # 本文の抽出（タイトルとSUMMARYを除去）
        main_body_raw = '\n'.join(lines[1:])
        if summary_match:
            main_body_raw = main_body_raw.replace(summary_match.group(0), "").strip()

        # Gutenberg用ブロックコメント付与関数
        def convert_to_blocks(html):
            # 見出しブロック
            html = re.sub(r'(<h[23]>.*?</h[23]>)', r'\1', html)
            # 段落ブロック
            html = re.sub(r'(<p>.*?</p>)', r'\1', html, flags=re.DOTALL)
            return html

        main_body_blocks = convert_to_blocks(main_body_raw)

        # ==========================================
        # 6. アフィリエイトとデザイン構築
        # ==========================================
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

        # 要約ボックスHTML
        summary_items = "".join([f"<li>{l.strip()}</li>" for l in summary_raw.splitlines() if ":" in l])
        summary_html = f"""<div style="background:#f0f9ff; padding:20px; border-left:5px solid #0ea5e9; border-radius:4px; margin-bottom:30px;">
            <h4 style="margin-top:0; color:#0369a1;">⚡ この製品の注目ポイント</h4>
            <ul style="margin-bottom:0; font-size:0.95em; line-height:1.8;">{summary_items}</ul>
        </div>"""

        # 商品カードHTML
        custom_card_html = f"""<div style="margin: 40px 0; padding: 25px; border: 1px solid #e2e8f0; border-radius: 20px; background-color: #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
            <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 24px;">
                <div style="flex: 1; min-width: 200px; text-align: center;">
                    <img src="{media_url if media_url else product.image_url}" style="max-width: 100%; height: auto; border-radius: 12px;">
                </div>
                <div style="flex: 2; min-width: 250px;">
                    <h3 style="margin: 0 0 12px 0; color: #1e3a8a;">{product.name}</h3>
                    <p style="color: #ef4444; font-weight: bold; font-size: 1.4em; margin: 15px 0;">特別価格：{product.price:,}円（税込）</p>
                    <div style="display: flex; gap: 12px; margin-top: 25px; flex-wrap: wrap;">
                        <a href="{affiliate_url}" target="_blank" rel="nofollow noopener" style="flex: 1; min-width: 160px; background: #ef4444; color: #ffffff; text-align: center; padding: 15px 10px; border-radius: 9999px; text-decoration: none; font-weight: bold;">{button_text}{tracking_beacon}</a>
                        <a href="{bic_detail_url}" target="_blank" style="flex: 1; min-width: 160px; background: #1f2937; color: #ffffff; text-align: center; padding: 15px 10px; border-radius: 9999px; text-decoration: none; font-weight: bold;">スペック詳細 ＞</a>
                    </div>
                </div>
            </div>
        </div>"""

        # 全体コンテンツ結合
        image_header = f'<figure class="wp-block-image size-full"><img src="{media_url if media_url else product.image_url}"/></figure>'
        full_wp_content = f"{image_header}\n{summary_html}\n{main_body_blocks}\n{custom_card_html}"

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
                product.ai_content = main_body_raw 
                product.is_posted = True
                product.save()
                self.stdout.write(self.style.SUCCESS(f"✅ 【投稿完了】モデル: {selected_model} / タイトル: {title}"))
            else:
                self.stdout.write(self.style.ERROR(f"❌ WordPress投稿失敗: {wp_res.status_code}"))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"WordPress通信エラー: {e}"))