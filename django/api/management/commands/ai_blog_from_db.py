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
    help = 'スペック要約の自動補完と、WPブログ・自社DB解説の同時生成を行う（デル・アフィリエイト対応版）'

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

        # 優先順位を最新モデルへ調整
        MODELS = [
            "gemini-1.5-flash",
            "gemini-2.0-flash-exp",
            "gemini-1.5-pro",
            "gemini-3-flash-preview",  # 最先端・超軽量（期待大）
            "gemini-2.5-flash",        # 現在の標準モデル
            "gemini-2.0-flash",        # 安定版
            "gemini-flash-latest",     # エイリアス（1.5または2.0の最新を指す）
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
        self.stdout.write(self.style.SUCCESS(f"🚀 デプロイ準備: {product.name} ({product.maker})"))

        # カテゴリ・タグ判定
        maker_low = product.maker.lower()
        target_cats = [CAT_LENOVO if 'lenovo' in maker_low else (CAT_DELL if 'dell' in maker_low else 1)]
        
        name_low = product.name.lower()
        target_tags = [TAG_DESKTOP if any(k in name_low for k in ["desktop", "tower", "station", "aio", "tiny", "center"]) else TAG_LAPTOP]

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
                        m_res = requests.post(
                            WP_MEDIA_URL, 
                            auth=AUTH, 
                            files=files, 
                            headers={'Content-Disposition': f'attachment; filename={product.unique_id}.jpg'}
                        )
                        if m_res.status_code == 201:
                            m_data = m_res.json()
                            media_id, media_url = m_data.get('id'), m_data.get('source_url')
            except Exception as e:
                self.stdout.write(self.style.WARNING(f"⚠️ 画像処理スキップ: {e}"))

        # ==========================================
        # 4. AIプロンプト作成
        # ==========================================
        current_spec = product.description if product.description and "配信はありません" not in product.description else "詳細不明（製品名から主要スペックを推測してください）"

        prompt = f"""
        あなたはPCの技術仕様とマーケティングに精通したエキスパートです。
        以下の製品データから、【1.スペック要約】【2.ブログ記事タイトル】【3.詳細解説HTML】の3点を作成してください。

        【データ】メーカー:{product.maker} | 名称:{product.name} | 価格:{product.price}円 | 現在のスペック:{current_spec}

        ---
        【出力項目1：スペック要約】
        「OS / CPU / メモリ / ストレージ / その他特徴」の形式で、スラッシュ区切りで1行で出力。
        データ不足時は製品名から標準的構成を推測。

        【出力項目2：ブログタイトル】
        読者がクリックしたくなる熱量のあるタイトル。

        【出力項目3：詳細解説HTML】
        <h3>, <p>のみ。専門家目線の特徴、競合比較、推奨ユーザー。
        ---

        出力は必ず以下のタグで区切ること：
        [SUMMARY]
        (ここにスペック要約)
        [TITLE]
        (ここにブログタイトル)
        [BODY]
        (ここに詳細解説HTML)
        """

        # ==========================================
        # 5. AI実行（最新モデル対応・ループ改善版）
        # ==========================================
        ai_text, selected_model = None, None
        
        if not GEMINI_API_KEY:
            self.stdout.write(self.style.ERROR("🚨 GEMINI_API_KEY が設定されていません。"))
            return

        for model_id in MODELS:
            # 最新モデル対応のため v1 エンドポイントを使用
            api_url = f"https://generativelanguage.googleapis.com/v1/models/{model_id}:generateContent?key={GEMINI_API_KEY}"
            self.stdout.write(f"🤖 試行中: {model_id}...")
            
            try:
                response = requests.post(api_url, json={"contents": [{"parts": [{"text": prompt}]}]}, timeout=60)
                res_json = response.json()

                if response.status_code == 200:
                    if 'candidates' in res_json and len(res_json['candidates']) > 0:
                        ai_text = res_json['candidates'][0]['content']['parts'][0]['text']
                        selected_model = model_id
                        self.stdout.write(self.style.SUCCESS(f"✅ {model_id} で生成成功"))
                        break
                else:
                    err_msg = res_json.get('error', {}).get('message', '詳細不明なエラー')
                    self.stdout.write(self.style.WARNING(f"⚠️ {model_id} 失敗 (HTTP {response.status_code}): {err_msg}"))
                    continue

            except Exception as e:
                self.stdout.write(self.style.ERROR(f"❌ {model_id} 通信エラー: {str(e)}"))
                continue

        if not ai_text: 
            self.stdout.write(self.style.ERROR("💀 全てのAIモデルの試行に失敗しました。"))
            return

        # ==========================================
        # 6. 応答のパース
        # ==========================================
        try:
            new_spec = re.search(r'\[SUMMARY\](.*?)\[TITLE\]', ai_text, re.S).group(1).strip()
            title = re.search(r'\[TITLE\](.*?)\[BODY\]', ai_text, re.S).group(1).strip()
            main_body_html = re.search(r'\[BODY\](.*)', ai_text, re.S).group(1).strip()
            main_body_html = re.sub(r'```(html)?', '', main_body_html).replace('```', '').strip()
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"パースエラー (AIの出力形式不正): {e}"))
            return

        # ==========================================
        # 7. アフィリエイトリンクの判定・生成
        # ==========================================
        if 'dell' in maker_low:
            # --- デル専用：LinkShare リンク生成 ---
            # product.unique_id が 2557... の形式であることを前提
            link_id = product.unique_id
            your_id = "nNBA6GzaGrQ"
            offer_prefix = "1568114"
            murl_tracking = "https://ad.doubleclick.net/ddm/trackclk/N1153793.2372504AF_LINKSHARE/B23732657.265944707;dc_trk_aid=461028128;dc_trk_cid=127759547;VEN1=;dc_lat=;dc_rdid=;tag_for_child_directed_treatment=;tfua=?"
            
            aff_url = (
                f"https://click.linksynergy.com/link?id={your_id}"
                f"&offerid={offer_prefix}.{link_id}&type=15"
                f"&murl={urllib.parse.quote(murl_tracking)}"
            )
            beacon = "" 
        else:
            # --- デル以外（レノボ含む）：ValueCommerce ---
            encoded_url = urllib.parse.quote(product.url, safe='')
            aff_url = f"https://ck.jp.ap.valuecommerce.com/servlet/referral?sid=3697471&pid=892455531&vc_url={encoded_url}"
            beacon = f'<img src="https://ad.jp.ap.valuecommerce.com/servlet/gifbanner?sid=3697471&pid=892455531" height="1" width="1" border="0">'

        # ==========================================
        # 8. WordPress投稿 & DB保存
        # ==========================================
        top_image_html = f'<div style="text-align:center;margin-bottom:30px;"><img src="{media_url}" style="width:100%;border-radius:12px;"></div>' if media_url else ""

        card_html = f"""
        <div class="affiliate-card" style="margin:40px 0;padding:25px;border-radius:16px;background:#fff;border:1px solid #eee;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
            <div style="display:flex;flex-wrap:wrap;gap:20px;align-items:center;">
                <div style="flex:1;min-width:180px;"><img src="{media_url}" style="width:100%;border-radius:10px;"></div>
                <div style="flex:2;min-width:240px;">
                    <h3 style="margin:0 0 10px 0;">{product.name}</h3>
                    <p style="color:#d9534f;font-weight:bold;font-size:1.4em;">税込 {product.price:,}円〜</p>
                    <div style="display:flex;gap:10px;margin-top:15px;">
                        <a href="{aff_url}" target="_blank" style="flex:1;background:#d9534f;color:#fff;text-align:center;padding:12px;border-radius:6px;text-decoration:none;font-weight:bold;">公式サイトで購入 {beacon}</a>
                        <a href="{bic_detail_url}" style="flex:1;background:#333;color:#fff;text-align:center;padding:12px;border-radius:6px;text-decoration:none;font-weight:bold;">製品詳細</a>
                    </div>
                </div>
            </div>
        </div>
        """
        full_wp_content = f"{top_image_html}\n{main_body_html}\n{card_html}"

        wp_res = requests.post(WP_POST_URL, json={
            "title": title, 
            "content": full_wp_content, 
            "status": "publish", 
            "featured_media": media_id, 
            "categories": target_cats, 
            "tags": target_tags
        }, auth=AUTH)
        
        if wp_res.status_code == 201:
            product.description = new_spec
            product.ai_content = main_body_html
            product.is_posted = True
            product.save()
            self.stdout.write(self.style.SUCCESS(f"【成功】{selected_model}により自動投稿を完了しました。"))
        else:
            self.stdout.write(self.style.ERROR(f"WP投稿失敗: {wp_res.status_code} {wp_res.text}"))