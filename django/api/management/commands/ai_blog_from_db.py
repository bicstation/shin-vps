"""
【自動投稿スクリプト: bicstation 完全版】
このスクリプトは、以下の2つの外部ファイルを同じディレクトリ内に必要とします。
1. ai_models.txt : 使用するGeminiモデル名（gemini-1.5-proなど）を1行ずつ記述
2. ai_prompt.txt : AIへの指示（プロンプト）。{maker}, {name}, {price}, {description} の変数を埋め込む形式

実行コマンド: python manage.py ai_post_pc_news
"""

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
    help = 'DBの製品情報を元にAI記事を生成し、WordPress(blog.tiper.live)へ自動投稿します'

    def handle(self, *args, **options):
        # ==========================================
        # 1. 基本設定と認証情報の定義
        # ==========================================
        # 文字列結合用の定数（URL構築時に使用）
        SCH, CLN, SLS, QMK, EQU, AMP = "https", ":", "/", "?", "=", "&"

        # 環境変数およびWordPress接続情報
        GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
        WP_USER = "bicstation"
        WP_APP_PASSWORD = "9re0 t3de WCe1 u1IL MudX 31IY"
        W_DOM = "blog.tiper.live"
        
        # WordPress API エンドポイント
        WP_API_BASE = f"{SCH}{CLN}{SLS}{SLS}{W_DOM}{SLS}wp-json{SLS}wp{SLS}v2"
        WP_POST_URL = f"{WP_API_BASE}{SLS}bicstation" # カスタム投稿タイプまたは特定ルート
        WP_MEDIA_URL = f"{WP_API_BASE}{SLS}media"
        AUTH = HTTPBasicAuth(WP_USER, WP_APP_PASSWORD)

        # WordPress上のカテゴリID / タグID (環境に合わせて調整)
        CAT_LENOVO, CAT_DELL, CAT_HP = 4, 7, 8
        TAG_DESKTOP, TAG_LAPTOP = 5, 6

        # ==========================================
        # 2. 外部設定ファイルの読み込み
        # ==========================================
        current_dir = os.path.dirname(os.path.abspath(__file__))
        PROMPT_FILE_PATH = os.path.join(current_dir, "ai_prompt.txt")
        MODELS_FILE_PATH = os.path.join(current_dir, "ai_models.txt")

        try:
            with open(PROMPT_FILE_PATH, 'r', encoding='utf-8') as f:
                base_prompt_template = f.read()
            with open(MODELS_FILE_PATH, 'r', encoding='utf-8') as f:
                MODELS = [line.strip() for line in f if line.strip()]
            self.stdout.write(self.style.SUCCESS(f"📖 設定ファイル読み込み成功 (モデル数: {len(MODELS)})"))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"❌ 設定ファイルの読み込みに失敗しました: {e}"))
            return

        def get_or_create_term(taxonomy, name):
            """WP上のカテゴリやタグを名前で検索し、なければ作成してIDを返す"""
            try:
                search_url = f"{WP_API_BASE}/{taxonomy}{QMK}search{EQU}{urllib.parse.quote(name)}"
                res = requests.get(search_url, auth=AUTH, timeout=10)
                if res.status_code == 200:
                    terms = res.json()
                    for t in terms:
                        if t['name'].lower() == name.lower(): return t['id']
                
                # 見つからない場合は新規作成
                create_res = requests.post(f"{WP_API_BASE}/{taxonomy}", json={"name": name}, auth=AUTH, timeout=10)
                if create_res.status_code == 201: return create_res.json().get('id')
            except: pass
            return None

        # ==========================================
        # 3. 投稿対象（商品）の選定
        # ==========================================
        # 未投稿かつアクティブ、かつ受注停止ではない商品をランダムに1つ取得
        products = PCProduct.objects.filter(is_active=True, is_posted=False).exclude(stock_status="受注停止中")
        
        if not products.exists():
            self.stdout.write(self.style.ERROR("未投稿の対象製品が見つかりません。"))
            return

        product = random.choice(products)
        maker_low = product.maker.lower()
        self.stdout.write(self.style.SUCCESS(f"🚀 ターゲット確定: {product.name} ({product.maker})"))

        # メーカー名に基づいたカテゴリ割り当て
        target_cats = []
        if 'lenovo' in maker_low: target_cats.append(CAT_LENOVO)
        elif 'dell' in maker_low: target_cats.append(CAT_DELL)
        elif 'hp' in maker_low: target_cats.append(CAT_HP)
        else:
            new_cat_id = get_or_create_term('categories', product.maker.upper())
            target_cats.append(new_cat_id if new_cat_id else 1)

        # 製品名からデスクトップかノートPCか判定してタグ付け
        is_desktop = any(k in product.name.lower() for k in ["desktop", "tower", "station", "aio", "tiny", "center", "poweredge"])
        target_tags = [TAG_DESKTOP if is_desktop else TAG_LAPTOP]
        
        # 特定のキーワード(RTXなど)があればタグを追加
        if "rtx" in product.description.lower():
            t_id = get_or_create_term('tags', "GeForce RTX")
            if t_id: target_tags.append(t_id)

        # ==========================================
        # 4. アイキャッチ画像のアップロード
        # ==========================================
        media_id, media_url = None, ""
        if product.image_url:
            try:
                img_res = requests.get(product.image_url, timeout=20)
                if img_res.status_code == 200:
                    with NamedTemporaryFile(delete=False, suffix=".jpg") as img_temp:
                        img_temp.write(img_res.content)
                        temp_path = img_temp.name
                    
                    with open(temp_path, 'rb') as f:
                        files = {'file': (f"{product.unique_id}.jpg", f, 'image/jpeg')}
                        m_res = requests.post(
                            WP_MEDIA_URL, 
                            auth=AUTH, 
                            files=files, 
                            headers={'Content-Disposition': f'attachment; filename={product.unique_id}.jpg'}
                        )
                    
                    if os.path.exists(temp_path):
                        os.unlink(temp_path)

                    if m_res.status_code == 201:
                        media_id = m_res.json().get('id')
                        media_url = m_res.json().get('source_url')
                        self.stdout.write(self.style.SUCCESS(f"🖼️ 画像アップロード成功: ID {media_id}"))
            except Exception as e:
                self.stdout.write(self.style.WARNING(f"画像アップロード失敗(スキップします): {e}"))

        # ==========================================
        # 5. AIによる本文生成 (Gemini API)
        # ==========================================
        prompt = base_prompt_template.format(
            maker=product.maker, name=product.name,
            price=f"{product.price:,}", description=product.description
        )

        ai_raw_text = None
        # ai_models.txtに記載されたモデルを順に試行
        for model_id in MODELS:
            self.stdout.write(f"🤖 モデル {model_id} で生成を試行中...")
            api_url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_id}:generateContent?key={GEMINI_API_KEY}"
            try:
                response = requests.post(api_url, json={"contents": [{"parts": [{"text": prompt}]}]}, timeout=180)
                res_json = response.json()
                if 'candidates' in res_json:
                    ai_raw_text = res_json['candidates'][0]['content']['parts'][0]['text']
                    self.stdout.write(self.style.SUCCESS(f"✅ AI生成成功: {model_id}"))
                    break
            except: continue

        if not ai_raw_text:
            self.stdout.write(self.style.ERROR("❌ 全てのAIモデルで生成に失敗しました。"))
            return

        # ==========================================
        # 6. 生成テキストの解析とクリーニング
        # ==========================================
        # マークダウンの装飾記号を除去
        clean_text = re.sub(r'```(html)?', '', ai_raw_text).replace('```', '').strip()
        lines = [l.strip() for l in clean_text.split('\n') if l.strip()]
        
        if not lines:
            self.stdout.write(self.style.ERROR("生成されたテキストが空です。"))
            return

        # --- タイトル抽出ロジックの強化 ---
        title = ""
        body_start_index = 0
        for i, line in enumerate(lines[:3]): # 最初の3行からタイトルを探す
            # 記号を除去
            candidate = re.sub(r'<[^>]*?>', '', line).replace('#', '').replace('*', '').strip()
            # 「タイトル：」というラベルがあれば消す
            candidate = re.sub(r'^タイトル[:：]\s*', '', candidate)
            
            if candidate and len(candidate) > 5:
                title = candidate
                body_start_index = i + 1
                break

        # タイトルが取れなかった場合のバックアップ
        if not title:
            title = f"{product.maker} {product.name} 実機スペック解説と最新価格情報"
            body_start_index = 0

        # [SUMMARY_DATA] セクション（注目ポイント）の抽出
        summary_match = re.search(r'\[SUMMARY_DATA\](.*?)\[/SUMMARY_DATA\]', clean_text, re.DOTALL)
        summary_raw = summary_match.group(1).strip() if summary_match else ""
        
        # 本文の組み立て（タイトル行を除去したもの）
        main_body_raw = '\n'.join(lines[body_start_index:])
        if summary_match: 
            main_body_raw = main_body_raw.replace(summary_match.group(0), "").strip()

        # ==========================================
        # 7. アフィリエイトURLおよび広告タグの構築
        # ==========================================
        tracking_beacon = ""
        if product.affiliate_url:
            final_affiliate_url = product.affiliate_url
        else:
            # 各メーカー用のアフィリエイトリンク生成
            if 'dell' in maker_low:
                final_affiliate_url = f"https://click.linksynergy.com/fs-bin/click?id=nNBA6GzaGrQ&offerid=1568114.10014115&type=3&subid=0"
                tracking_beacon = f'<img border="0" width="1" height="1" src="https://ad.linksynergy.com/fs-bin/show?id=nNBA6GzaGrQ&bids=1568114.10014115&type=3&subid=0" >'
            else:
                # バリューコマース用
                sid, pid = "3697471", "892455531"
                encoded_url = urllib.parse.quote(product.url, safe='')
                final_affiliate_url = f"https://ck.jp.ap.valuecommerce.com/servlet/referral?sid={sid}&pid={pid}&vc_url={encoded_url}"
                tracking_beacon = f'<img src="https://ad.jp.ap.valuecommerce.com/servlet/gifbanner?sid={sid}&pid={pid}" height="1" width="1" border="0">'

        # ==========================================
        # 8. HTMLデザインの構築
        # ==========================================
        bic_detail_url = f"https://bicstation.com/product/{product.unique_id}/"
        button_text = f"{product.maker}公式で詳細を見る ＞"

        # 注目ポイントのリスト表示用BOX
        summary_items = "".join([f"<li>{l.strip()}</li>" for l in summary_raw.splitlines() if ":" in l or "-" in l])
        summary_block = f"""<div style="background:#f0f9ff; padding:20px; border-left:5px solid #0ea5e9; border-radius:4px; margin-bottom:30px;">
            <h4 style="margin-top:0; color:#0369a1;">⚡ この製品の注目ポイント</h4>
            <ul style="margin-bottom:0; font-size:0.95em; line-height:1.8;">{summary_items}</ul>
        </div>"""

        # 冒頭のメイン画像ブロック
        img_src = media_url if media_url else product.image_url
        image_header_block = f'<figure class="wp-block-image size-large"><img src="{img_src}" alt="{product.name}" class="wp-image-{media_id if media_id else ""}"/></figure>'

        # 記事末尾の商品購入カード
        card_block = f"""<div style="margin: 40px 0; padding: 25px; border: 1px solid #e2e8f0; border-radius: 20px; background-color: #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
            <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 24px;">
                <div style="flex: 1; min-width: 200px; text-align: center;">
                    <img src="{img_src}" style="max-width: 100%; height: auto; border-radius: 12px;">
                </div>
                <div style="flex: 2; min-width: 250px;">
                    <h3 style="margin: 0 0 12px 0; color: #1e3a8a;">{product.name}</h3>
                    <p style="color: #ef4444; font-weight: bold; font-size: 1.4em; margin: 15px 0;">特別価格：{product.price:,}円（税込）</p>
                    <div style="display: flex; gap: 12px; margin-top: 25px;">
                        <a href="{final_affiliate_url}" target="_blank" rel="nofollow noopener" style="flex: 1; background: #ef4444; color: #ffffff; text-align: center; padding: 15px 10px; border-radius: 9999px; text-decoration: none; font-weight: bold;">{button_text}{tracking_beacon}</a>
                        <a href="{bic_detail_url}" target="_blank" style="flex: 1; background: #1f2937; color: #ffffff; text-align: center; padding: 15px 10px; border-radius: 9999px; text-decoration: none; font-weight: bold;">詳細スペック ＞</a>
                    </div>
                </div>
            </div>
        </div>"""

        # WordPressに送る最終的なHTMLコンテンツ
        full_wp_content = f"{image_header_block}\n{summary_block}\n{main_body_raw}\n{card_block}"

        # ==========================================
        # 9. WordPressへの投稿リクエスト
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
                # 投稿成功時はDBを更新して二重投稿を防止
                product.ai_content = main_body_raw 
                product.is_posted = True
                product.save()
                self.stdout.write(self.style.SUCCESS(f"✅ 【投稿完了】タイトル: {title}"))
            else:
                self.stdout.write(self.style.ERROR(f"❌ WordPress投稿失敗: {wp_res.status_code} - {wp_res.text}"))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"WordPress通信エラー: {e}"))