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
    help = 'DBの製品情報を元にAI記事を生成し、WPへ自動投稿（アイキャッチ・ダブルボタン・URL置換対応）'

    def handle(self, *args, **options):
        # ==========================================
        # 1. 基本設定と認証情報の定義
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

        # ==========================================
        # 2. 外部設定ファイルの読み込み
        # ==========================================
        BASE_DIR = os.path.dirname(os.path.abspath(__file__))
        PROMPT_FILE_PATH = os.path.join(BASE_DIR, "prompt", "ai_prompt.txt")
        MODELS_FILE_PATH = os.path.join(BASE_DIR, "prompt", "ai_models.txt")

        try:
            with open(PROMPT_FILE_PATH, 'r', encoding='utf-8') as f:
                base_prompt_template = f.read()
            with open(MODELS_FILE_PATH, 'r', encoding='utf-8') as f:
                MODELS = [line.strip() for line in f if line.strip()]
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"❌ 設定ファイル読み込み失敗: {e}"))
            return

        # ==========================================
        # 3. カテゴリ・タグ自動生成関数
        # ==========================================
        def get_or_create_term(taxonomy, name):
            if not name: return None
            name = str(name).strip()
            try:
                search_url = f"{WP_API_BASE}/{taxonomy}{QMK}search{EQU}{urllib.parse.quote(name)}"
                res = requests.get(search_url, auth=AUTH, timeout=15)
                if res.status_code == 200:
                    terms = res.json()
                    for t in terms:
                        if t['name'].lower() == name.lower():
                            return t['id']
                
                create_res = requests.post(f"{WP_API_BASE}/{taxonomy}", json={"name": name}, auth=AUTH, timeout=15)
                if create_res.status_code == 201:
                    return create_res.json().get('id')
            except: pass
            return None

        # ==========================================
        # 4. 投稿対象（商品）の選定
        # ==========================================
        products = PCProduct.objects.filter(is_active=True, is_posted=False).exclude(stock_status="受注停止中")
        if not products.exists():
            self.stdout.write(self.style.ERROR("未投稿の製品がありません。"))
            return

        product = random.choice(products)
        self.stdout.write(self.style.SUCCESS(f"🚀 ターゲット: {product.name}"))

        # カテゴリ・タグ取得
        target_cats = [get_or_create_term('categories', product.maker.upper())]
        target_cats = [c for c in target_cats if c]

        is_desktop = any(k in product.name.lower() for k in ["desktop", "tower", "station", "aio", "gkb", "fk2", "mirai", "shinkai"])
        target_tags = [get_or_create_term('tags', "デスクトップPC" if is_desktop else "ノートパソコン")]
        target_tags = [t for t in target_tags if t]

        # ==========================================
        # 5. アイキャッチ画像のアップロード
        # ==========================================
        media_id = None
        if product.image_url:
            try:
                img_res = requests.get(product.image_url, timeout=20)
                if img_res.status_code == 200:
                    with NamedTemporaryFile(delete=False, suffix=".jpg") as img_temp:
                        img_temp.write(img_res.content)
                        temp_path = img_temp.name
                    with open(temp_path, 'rb') as f:
                        files = {'file': (f"{product.unique_id}.jpg", f, 'image/jpeg')}
                        m_res = requests.post(WP_MEDIA_URL, auth=AUTH, files=files)
                    if os.path.exists(temp_path): os.unlink(temp_path)
                    if m_res.status_code == 201:
                        media_id = m_res.json().get('id')
            except: pass

        # ==========================================
        # 6. AIによる本文生成
        # ==========================================
        prompt = base_prompt_template.format(
            maker=product.maker, name=product.name,
            price=f"{product.price:,}", description=product.description
        )

        ai_raw_text = None
        for model_id in MODELS:
            api_url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_id}:generateContent?key={GEMINI_API_KEY}"
            try:
                response = requests.post(api_url, json={"contents": [{"parts": [{"text": prompt}]}]}, timeout=180)
                res_json = response.json()
                if 'candidates' in res_json:
                    ai_raw_text = res_json['candidates'][0]['content']['parts'][0]['text']
                    break
            except: continue
        
        if not ai_raw_text: return

        # ==========================================
        # 7. 生成テキストの解析
        # ==========================================
        clean_text = re.sub(r'```(html)?', '', ai_raw_text).replace('```', '').strip()
        lines = [l.strip() for l in clean_text.split('\n') if l.strip()]
        
        title = ""
        body_start_index = 0
        for i, line in enumerate(lines[:3]):
            candidate = re.sub(r'<[^>]*?>', '', line).replace('#', '').replace('*', '').strip()
            if len(candidate) > 5:
                title = candidate
                body_start_index = i + 1
                break

        summary_match = re.search(r'\[SUMMARY_DATA\](.*?)\[/SUMMARY_DATA\]', clean_text, re.DOTALL)
        summary_raw = summary_match.group(1).strip() if summary_match else ""
        main_body_raw = '\n'.join(lines[body_start_index:])
        if summary_match: main_body_raw = main_body_raw.replace(summary_match.group(0), "").strip()

        # ==========================================
        # 8. HTMLデザイン構築 (URL置換ロジック搭載)
        # ==========================================
        # アフィリエイト用
        sid, pid = "3697471", "892455531"
        encoded_url = urllib.parse.quote(product.url, safe='')
        final_affiliate_url = f"https://ck.jp.ap.valuecommerce.com/servlet/referral?sid={sid}&pid={pid}&vc_url={encoded_url}"
        
        # 【重要】自社サイト用URL生成：DBのハイフンをアンダースコアに強制置換
        target_uid = str(product.unique_id).strip().replace('-', '_')
        bic_detail_url = f"https://bicstation.com/product/{target_uid}/"
        
        summary_items = "".join([f"<li>{l.strip()}</li>" for l in summary_raw.splitlines() if ":" in l or "-" in l])
        summary_block = f"""<div style="background:#f8fafc; padding:25px; border:1px solid #e2e8f0; border-left:6px solid #3b82f6; border-radius:12px; margin-bottom:40px;">
            <h4 style="margin-top:0; color:#1e293b; font-size:1.2em;">🚀 このモデルの主要ポイント</h4>
            <ul style="margin-bottom:0; color:#475569; line-height:1.8; font-size:0.95em;">{summary_items}</ul>
        </div>"""

        img_src = product.image_url
        card_block = f"""<div style="margin: 50px 0; padding: 30px; border-radius: 24px; background: #1e293b; color: #fff; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);">
            <div style="display: flex; flex-wrap: wrap; gap: 30px; align-items: center;">
                <div style="flex: 1; min-width: 220px; text-align: center;">
                    <img src="{img_src}" style="max-width:100%; height:auto; border-radius:12px; background:#fff; padding:15px;">
                </div>
                <div style="flex: 1.5; min-width: 280px;">
                    <h3 style="color:#3b82f6; margin-top:0; font-size:1.6em; line-height:1.3;">{product.name}</h3>
                    <p style="font-size:2.2em; font-weight:800; color:#ef4444; margin: 15px 0;">{product.price:,}円 <span style="font-size:0.4em; color:#94a3b8; vertical-align:middle;">(税込)</span></p>
                    <div style="display: flex; flex-direction: column; gap: 12px; margin-top: 25px;">
                        <a href="{final_affiliate_url}" target="_blank" rel="nofollow noopener" style="background:#ef4444; color:#fff; text-align:center; padding:16px; border-radius:12px; text-decoration:none; font-weight:800; font-size:1.1em;">メーカー公式サイトで詳細を見る ＞</a>
                        <a href="{bic_detail_url}" target="_blank" style="background:#475569; color:#fff; text-align:center; padding:14px; border-radius:12px; text-decoration:none; font-weight:700; font-size:0.95em;">当サイトの詳細スペック表を確認 ＞</a>
                    </div>
                </div>
            </div>
        </div>"""

        full_wp_content = f"{summary_block}\n{main_body_raw}\n{card_block}"

        # ==========================================
        # 9. WordPressへの投稿
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
                product.is_posted = True
                product.save()
                self.stdout.write(self.style.SUCCESS(f"✅ 投稿完了: {title}"))
                self.stdout.write(f"🔗 生成URL: {bic_detail_url}")
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"❌ 投稿失敗: {e}"))