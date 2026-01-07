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
    help = 'スペック要約の自動補完と、WPブログ・自社DB解説の同時生成を行う'

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
            "gemini-2.0-flash-exp",
            "gemini-1.5-flash",
            "gemini-1.5-pro",
        ]

        CAT_LENOVO, CAT_DELL = 4, 7
        TAG_DESKTOP, TAG_LAPTOP = 5, 6

        # ==========================================
        # 2. 投稿対象商品の選定（未投稿 or AI解説未作成の商品）
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
        # 4. AIプロンプト（スペック要約＋解説の生成）
        # ==========================================
        # 💡 スペックが不足している場合、製品名からAIに推測させる指示を追加
        current_spec = product.description if product.description and "配信はありません" not in product.description else "詳細不明（製品名から主要スペックを推測してください）"

        prompt = f"""
        あなたはPCの技術仕様とマーケティングに精通したエキスパートです。
        以下の製品データから、【1.スペック要約】【2.ブログ記事タイトル】【3.詳細解説HTML】の3点を作成してください。

        【データ】メーカー:{product.maker} | 名称:{product.name} | 価格:{product.price}円 | 現在のスペック:{current_spec}

        ---
        【出力項目1：スペック要約】
        「OS / CPU / メモリ / ストレージ / その他特徴」の形式で、スラッシュ区切りで1行で出力してください。
        データが不足している場合は、製品名から一般的・標準的な構成を推測して埋めてください。
        例: Windows 11 / Core i5-1335U / 16GB RAM / 512GB SSD / 高色域ディスプレイ

        【出力項目2：ブログタイトル】
        読者がクリックしたくなる熱量のあるタイトルを1行で出力してください。

        【出力項目3：詳細解説HTML】
        カタログサイトにふさわしい論理的な製品解説をHTML（<h3>, <p>のみ）で作成してください。
        専門家目線での特徴、競合比較、推奨ユーザーを含めてください。
        ---

        出力は必ず以下のタグで区切って出力してください：
        [SUMMARY]
        (ここにスペック要約)
        [TITLE]
        (ここにブログタイトル)
        [BODY]
        (ここに詳細解説HTML)
        """

        # ==========================================
        # 5. AI実行
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

        if not ai_text: 
            self.stdout.write(self.style.ERROR("AIの応答が得られませんでした。"))
            return

        # ==========================================
        # 6. 応答のパース（解析）と整形
        # ==========================================
        try:
            # タグで分割して内容を抽出
            new_spec = re.search(r'\[SUMMARY\](.*?)\[TITLE\]', ai_text, re.S).group(1).strip()
            title = re.search(r'\[TITLE\](.*?)\[BODY\]', ai_text, re.S).group(1).strip()
            main_body_html = re.search(r'\[BODY\](.*)', ai_text, re.S).group(1).strip()
            
            # Markdownの除去
            main_body_html = re.sub(r'```(html)?', '', main_body_html).replace('```', '').strip()
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"パースエラー: {e}"))
            return

        # WordPress用コンテンツの構築
        top_image_html = f'<div style="text-align:center;margin-bottom:30px;"><img src="{media_url}" style="width:100%;border-radius:12px;box-shadow:0 4px 15px rgba(0,0,0,0.1);"></div>' if media_url else ""
        
        encoded_url = urllib.parse.quote(product.url, safe='')
        aff_url = f"{H}{C}{S}{S}ck.jp.ap.valuecommerce.com{S}servlet/referral?sid=3697471&pid=892455531&vc_url={encoded_url}"
        beacon = '<img src="https://ad.jp.ap.valuecommerce.com/servlet/gifbanner?sid=3697471&pid=892455531" height="1" width="1" border="0">'

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
        # 7. WordPress投稿 & 自社DB保存
        # ==========================================
        wp_res = requests.post(WP_POST_URL, json={
            "title": title, 
            "content": full_wp_content, 
            "status": "publish", 
            "featured_media": media_id, 
            "categories": target_cats, 
            "tags": target_tags
        }, auth=AUTH)
        
        if wp_res.status_code == 201:
            # 💡 自社DB（Next.js側）のデータを更新
            product.description = new_spec   # AIが生成した綺麗なスペックで上書き
            product.ai_content = main_body_html
            product.is_posted = True
            product.save()
            self.stdout.write(self.style.SUCCESS(f"【成功】{selected_model}によりスペック補完と記事生成を完了しました。"))
        else:
            self.stdout.write(self.style.ERROR(f"WP投稿失敗: {wp_res.status_code} {wp_res.text}"))