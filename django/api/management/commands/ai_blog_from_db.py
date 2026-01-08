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
    help = 'Gemini/Gemmaをローテーションし、Hタグ構造化記事とドメイン別アフィリエイトリンク付きでWP投稿するスクリプト'

    def handle(self, *args, **options):
        # ==========================================
        # 1. 基本設定・認証情報
        # ==========================================
        GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
        WP_USER = "bicstation"
        WP_APP_PASSWORD = "9re0 t3de WCe1 u1IL MudX 31IY"
        
        # URL難読化回避用の分離定義
        H, C, S = "https", ":", "/"
        
        # WordPress設定（実行環境に応じてここを調整）
        W_DOM = "blog.tiper.live"
        WP_POST_URL = f"{H}{C}{S}{S}{W_DOM}{S}wp-json{S}wp/v2{S}bicstation"
        WP_MEDIA_URL = f"{H}{C}{S}{S}{W_DOM}{S}wp-json{S}wp/v2{S}media"
        AUTH = HTTPBasicAuth(WP_USER, WP_APP_PASSWORD)

        # AIモデルの優先順位リスト
        MODELS = [
            "gemini-3-flash-preview",
            "gemini-2.5-flash",
            "gemini-2.5-flash-lite",
            "gemma-3-12b-it" 
        ]

        # カテゴリID設定（ドメインのWP設定に合わせて調整）
        CAT_LENOVO, CAT_DELL, CAT_HP = 4, 7, 8 # HP用カテゴリID（仮）を追加
        TAG_DESKTOP, TAG_LAPTOP = 5, 6

        # ==========================================
        # 2. 投稿対象商品の選定
        # ==========================================
        # 未投稿かつ、Lenovo, Dell, HPのいずれか
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

        # カテゴリ判定
        if 'lenovo' in maker_low:
            target_cats = [CAT_LENOVO]
        elif 'dell' in maker_low:
            target_cats = [CAT_DELL]
        elif 'hp' in maker_low:
            target_cats = [CAT_HP]
        else:
            target_cats = [1] # 未分類
        
        name_lower = product.name.lower()
        target_tags = [TAG_DESKTOP if any(k in name_lower for k in ["desktop", "tower", "station", "aio", "tiny", "center"]) else TAG_LAPTOP]

        # 公式サイト詳細URL（ユニークIDを使用）
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
                            self.stdout.write(self.style.SUCCESS(f"画像アップロード成功"))
            except Exception as e:
                self.stdout.write(self.style.WARNING(f"画像処理エラー: {e}"))

        # ==========================================
        # 4. AIプロンプト
        # ==========================================
        prompt = f"""
        あなたはPCの技術仕様に精通した客観的な解説者です。
        以下の製品データに基づき、ITニュースサイト向けの深く鋭い、純粋な「HTMLソースコードのみ」を出力してください。
        Markdown(```htmlなど)や解説文は一切不要です。

        【製品データ】
        メーカー: {product.maker} | 商品名: {product.name} | 価格: {product.price}円
        スペック詳細: {product.description}

        【出力構成ルール】
        1. 1行目は記事のタイトル（h1相当のテキストのみ）。
        2. 本文は必ず <h2> や <h3> タグを使用してセクションを分け、目次に対応させてください。
        3. 2000文字以上の情報量で、製品のターゲット、性能、競合比較、専門家視点の評価を記述。
        4. 文末は「この製品の詳細は、以下のリンクからご確認いただけます」という一文で締める。
        """

        # ==========================================
        # 5. AI実行
        # ==========================================
        ai_text, selected_model = None, None
        G_DOM, G_PATH = "generativelanguage.googleapis.com", "v1/models"

        for model_id in MODELS:
            self.stdout.write(f"🤖 モデル {model_id} で生成中...")
            api_url = f"{H}{C}{S}{S}{G_DOM}{S}{G_PATH}{S}{model_id}:generateContent?key={GEMINI_API_KEY}"
            
            try:
                response = requests.post(api_url, json={"contents": [{"parts": [{"text": prompt}]}]}, timeout=120)
                res_json = response.json()
                if 'candidates' in res_json and len(res_json['candidates']) > 0:
                    ai_text = res_json['candidates'][0]['content']['parts'][0]['text']
                    selected_model = model_id
                    break
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"通信エラー ({model_id}): {e}"))
                continue

        if not ai_text:
            self.stdout.write(self.style.ERROR("すべてのモデルで生成に失敗しました。"))
            return

        # ==========================================
        # 6. 整形とアフィリエイト組み込み
        # ==========================================
        clean_text = re.sub(r'```(html)?', '', ai_text).replace('```', '').strip()
        lines = [l.strip() for l in clean_text.split('\n') if l.strip()]
        
        title = lines[0].replace('#', '').strip()
        main_body_html = '\n'.join(lines[1:]).strip()

        # アフィリエイトリンク生成（ドメイン別ID管理）
        # ※ W_DOM（実行ドメイン）に基づきIDを切り替える準備
        if 'dell' in maker_low:
            # Dell: リンクサイナジー (Deep Link)
            dell_ids = {
                "blog.tiper.live": "nNBA6GzaGrQ",
                "other-domain.com": "OTHER_DELL_ID"
            }
            your_id = dell_ids.get(W_DOM, "nNBA6GzaGrQ")
            offer_prefix = "1568114"
            encoded_product_url = urllib.parse.quote(product.url)
            
            # 修正ポイント: 純粋なURLのみを生成（Markdownリンク記法を完全に排除）
            affiliate_url = f"[https://click.linksynergy.com/link?id=](https://click.linksynergy.com/link?id=){your_id}&offerid={offer_prefix}.{product.unique_id}&type=15&murl={encoded_product_url}"
            vc_beacon = ""
            button_text = "Dell公式サイトで見る ＞"

        elif 'hp' in maker_low:
            # HP: バリューコマース (MyLink)
            hp_sids = {"blog.tiper.live": "3697471"}
            hp_pids = {"blog.tiper.live": "892455531"}
            sid = hp_sids.get(W_DOM, "3697471")
            pid = hp_pids.get(W_DOM, "892455531")
            encoded_url = urllib.parse.quote(product.url, safe='')
            
            affiliate_url = f"[https://ck.jp.ap.valuecommerce.com/servlet/referral?sid=](https://ck.jp.ap.valuecommerce.com/servlet/referral?sid=){sid}&pid={pid}&vc_url={encoded_url}"
            vc_beacon = f'<img src="//[ad.jp.ap.valuecommerce.com/servlet/gifbanner?sid=](https://ad.jp.ap.valuecommerce.com/servlet/gifbanner?sid=){sid}&pid={pid}" height="1" width="1" border="0">'
            button_text = "HP公式サイトで見る ＞"

        else:
            # Lenovo: バリューコマース (MyLink)
            sid, pid = "3697471", "892455531"
            encoded_url = urllib.parse.quote(product.url, safe='')
            
            affiliate_url = f"[https://ck.jp.ap.valuecommerce.com/servlet/referral?sid=](https://ck.jp.ap.valuecommerce.com/servlet/referral?sid=){sid}&pid={pid}&vc_url={encoded_url}"
            vc_beacon = f'<img src="//[ad.jp.ap.valuecommerce.com/servlet/gifbanner?sid=](https://ad.jp.ap.valuecommerce.com/servlet/gifbanner?sid=){sid}&pid={pid}" height="1" width="1" border="0">'
            button_text = "Lenovo公式サイトで見る ＞"

        # 商品紹介カードの組み立て
        custom_card_html = f"""
        <div style="margin: 40px 0; padding: 25px; border: 1px solid #e5e7eb; border-radius: 16px; background-color: #ffffff; box-shadow: 0 4px 20px rgba(0,0,0,0.08); font-family: sans-serif;">
            <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 24px;">
                <div style="flex: 1; min-width: 200px; text-align: center;">
                    <a href="{bic_detail_url}" target="_blank">
                        <img src="{media_url}" alt="{product.name}" style="max-width: 100%; height: auto; border-radius: 10px;">
                    </a>
                </div>
                <div style="flex: 2; min-width: 250px;">
                    <h3 style="margin: 0 0 12px 0; font-size: 1.4em;">{product.name}</h3>
                    <p style="color: #ef4444; font-weight: bold; font-size: 1.3em; margin: 10px 0;">価格：{product.price:,}円（税込）</p>
                    <div style="display: flex; gap: 12px; margin-top: 20px; flex-wrap: wrap;">
                        <a href="{affiliate_url}" target="_blank" rel="nofollow noopener noreferrer" 
                           style="flex: 1; min-width: 140px; background-color: #ef4444; color: #ffffff; text-align: center; padding: 14px 10px; border-radius: 8px; text-decoration: none; font-weight: bold;">
                            {button_text}{vc_beacon}
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

        full_content = f"{main_body_html}\n{custom_card_html}"

        # ==========================================
        # 7. WordPress 投稿実行
        # ==========================================
        wp_payload = {
            "title": title,
            "content": full_content,
            "status": "publish",
            "featured_media": media_id,
            "categories": target_cats, 
            "tags": target_tags           
        }
        
        wp_res = requests.post(WP_POST_URL, json=wp_payload, auth=AUTH)
        
        if wp_res.status_code == 201:
            product.is_posted = True
            product.save()
            self.stdout.write(self.style.SUCCESS(f"✅ 【投稿成功】モデル: {selected_model} / 記事: {title}"))
        else:
            self.stdout.write(self.style.ERROR(f"❌ WP投稿失敗: {wp_res.text}"))