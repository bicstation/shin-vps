from django.core.management.base import BaseCommand
from api.models.pc_products import PCProduct 
import requests
import random
import os
import re
from requests.auth import HTTPBasicAuth
from django.core.files.temp import NamedTemporaryFile

class Command(BaseCommand):
    help = '画像とWリンクボタン（公式サイト・Bicstation個別ページ）付きの豪華な記事を生成しWordPressに投稿します'

    def handle(self, *args, **options):
        # --- 設定エリア ---
        GEMINI_API_KEY = "AIzaSyA-o3ZZUGLIscJJnD0HTnlxWqniLuwZhR8"
        WP_USER = "bicstation"
        WP_APP_PASSWORD = "9re0 t3de WCe1 u1IL MudX 31IY"
        
        # WordPress APIエンドポイント（blog.tiper.live 側）
        WP_POST_URL = "https://blog.tiper.live/wp-json/wp/v2/bicstation"
        WP_MEDIA_URL = "https://blog.tiper.live/wp-json/wp/v2/media"
        
        AUTH = HTTPBasicAuth(WP_USER, WP_APP_PASSWORD)
        GEMINI_URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key={GEMINI_API_KEY}"

        # 1. DBからLenovo製品をランダムに1つ取得
        products = PCProduct.objects.filter(
            maker__icontains='Lenovo',
            is_active=True
        ).exclude(stock_status="受注停止中")
        
        if not products.exists():
            self.stdout.write(self.style.ERROR("有効なLenovo製品がDBに見つかりませんでした。"))
            return

        product = random.choice(products)
        self.stdout.write(self.style.SUCCESS(f"ターゲット商品確定: {product.name} (ID: {product.unique_id})"))

        # Bicstation（本サイト）の個別詳細ページURLを構築
        bic_detail_url = f"https://bicstation.com/product/{product.unique_id}/"

        # 2. 商品画像をWordPressへアップロード
        media_id = None
        media_url = ""
        if product.image_url:
            self.stdout.write(f"画像をWordPressへアップロード中: {product.image_url}")
            try:
                img_res = requests.get(product.image_url, timeout=15)
                if img_res.status_code == 200:
                    with NamedTemporaryFile(delete=True) as img_temp:
                        img_temp.write(img_res.content)
                        img_temp.flush()
                        
                        files = {
                            'file': (f"{product.unique_id}.jpg", open(img_temp.name, 'rb'), 'image/jpeg')
                        }
                        media_upload_res = requests.post(
                            WP_MEDIA_URL,
                            auth=AUTH,
                            files=files,
                            headers={'Content-Disposition': f'attachment; filename={product.unique_id}.jpg'}
                        )
                        
                        if media_upload_res.status_code == 201:
                            media_data = media_upload_res.json()
                            media_id = media_data.get('id')
                            media_url = media_data.get('source_url')
                            self.stdout.write(self.style.SUCCESS(f"メディア登録完了 (ID: {media_id})"))
            except Exception as e:
                self.stdout.write(self.style.WARNING(f"画像処理エラー: {e}"))

        # 3. Geminiプロンプト（メタ情報を厳格に排除）
        prompt = f"""
        あなたはテック系ブログ『Bicstation』の専門レビュアーです。
        以下の製品データに基づき、WordPress用のHTML記事を書いてください。

        【重要命令】
        - 「思考プロセス」「タイトル作成」などのメタ情報は絶対に入れないでください。
        - 1行目からいきなり「タイトル」を書き始めてください。
        - 挨拶は不要です。

        【商品データ】
        メーカー: {product.maker}
        商品名: {product.name}
        価格: {product.price}円
        スペック詳細: {product.description}
        
        【構成ルール】
        1. 1行目：キャッチーなタイトル
        2. 2行目以降：本文（<h2> <h3>, <ul> <li>を使用）
        3. 最後に必ず「詳細は以下のリンクからチェックしてください」という締めの言葉を入れてください。
        """

        # 4. Gemini API 実行
        self.stdout.write("Geminiが記事を執筆中...")
        try:
            response = requests.post(GEMINI_URL, json={ "contents": [{ "parts": [{"text": prompt}] }] })
            ai_text = response.json()['candidates'][0]['content']['parts'][0]['text']
            
            # 不要なコードブロック記号を掃除
            clean_text = re.sub(r'```(html)?', '', ai_text).replace('```', '').strip()
            lines = clean_text.split('\n')
            
            # メタ情報の除去フィルター
            filtered_lines = []
            exclude_keywords = ["思考プロセス", "執筆者", "カテゴリ", "ペルソナ", "構成", "ターゲット"]
            for line in lines:
                l_strip = line.strip()
                if not l_strip: continue
                if any(k in l_strip for k in exclude_keywords): continue
                if re.match(r'^\d+\.\s+.*', l_strip): continue
                filtered_lines.append(l_strip)

            if not filtered_lines:
                return

            title = filtered_lines[0].replace('#', '').strip()
            main_body_text = '\n'.join(filtered_lines[1:]).strip()

            # 5. 画像・リンク先修正済みのリッチリンクカード作成
            # 画像自体にも aタグで bic_detail_url を設定
            custom_card_html = f"""
            <div style="margin: 40px 0; padding: 25px; border: 1px solid #e5e7eb; border-radius: 16px; background-color: #ffffff; box-shadow: 0 4px 20px rgba(0,0,0,0.08); font-family: sans-serif;">
                <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 24px;">
                    <div style="flex: 1; min-width: 200px; text-align: center;">
                        <a href="{bic_detail_url}" target="_blank" rel="noopener">
                            <img src="{media_url}" alt="{product.name}" style="max-width: 100%; height: auto; border-radius: 10px; cursor: pointer;">
                        </a>
                    </div>
                    <div style="flex: 2; min-width: 250px;">
                        <h3 style="margin: 0 0 12px 0; font-size: 1.4em; color: #111827; line-height: 1.4;">{product.name}</h3>
                        <p style="color: #4b5563; font-size: 0.95em; margin-bottom: 8px;">メーカー：{product.maker}</p>
                        <p style="color: #ef4444; font-weight: bold; font-size: 1.3em; margin: 10px 0;">価格：{product.price}円</p>
                        
                        <div style="display: flex; gap: 12px; margin-top: 20px; flex-wrap: wrap;">
                            <a href="{product.url}" target="_blank" rel="noopener noreferrer" 
                               style="flex: 1; min-width: 140px; background-color: #0062ff; color: #ffffff; text-align: center; padding: 14px 10px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 0.95em; box-shadow: 0 4px 6px rgba(0,98,255,0.2);">
                               公式サイト ＞
                            </a>
                            <a href="{bic_detail_url}" target="_blank" rel="noopener"
                               style="flex: 1; min-width: 140px; background-color: #1f2937; color: #ffffff; text-align: center; padding: 14px 10px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 0.95em; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                               Bicstation詳細 ＞
                            </a>
                        </div>
                    </div>
                </div>
            </div>
            """

            # 冒頭画像（ここもBicstationへのリンクに設定）
            top_img_html = f"""
            <a href="{bic_detail_url}" target="_blank" rel="noopener">
                <img src="{media_url}" alt="{product.name}" class="wp-image-{media_id} size-large" style="margin-bottom: 30px; border-radius: 12px; cursor: pointer;" />
            </a>
            """ if media_url else ""
            
            full_content = f"{top_img_html}\n\n{main_body_text}\n\n{custom_card_html}"

            # 6. WordPress 投稿
            wp_payload = {
                "title": title,
                "content": full_content,
                "status": "publish",
                "featured_media": media_id
            }
            
            wp_res = requests.post(WP_POST_URL, json=wp_payload, auth=AUTH)
            
            if wp_res.status_code == 201:
                self.stdout.write(self.style.SUCCESS(f"【投稿成功】: {title}"))
                self.stdout.write(f"本サイト誘導URL: {bic_detail_url}")
            else:
                self.stdout.write(self.style.ERROR(f"WP投稿失敗: {wp_res.text}"))

        except Exception as e:
            self.stdout.write(self.style.ERROR(f"実行時エラー: {e}"))