# -*- coding: utf-8 -*-
import os
import re
import json
import requests
import base64
from google import genai
from django.core.management.base import BaseCommand
from django.utils import timezone

class Command(BaseCommand):
    help = 'SHIN CORE LINX: Gemma 4 × Nano Banana 2 連携・最終完成版'

    def add_arguments(self, parser):
        parser.add_argument('comment', type=str, nargs='?', default='', help='本日の現場の声')

    def handle(self, *args, **options):
        user_comment = options['comment']
        
        # 🛡️ 認証情報
        wp_user = os.getenv('WP_USER')
        wp_app_pass = os.getenv('WP_APP_PASSWORD')
        gemini_key = os.getenv('GEMINI_API_KEY_1') 
        wp_base_url = "https://wp552476.wpx.jp/wp-json/wp/v2"

        if not all([wp_user, wp_app_pass, gemini_key]):
            self.stderr.write(self.style.ERROR('🚨 環境変数が不足しています'))
            return

        # --- 🤖 STEP 1: Gemma 4 によるコンテンツ一式生成 ---
        self.stdout.write("🧠 Gemma 4 31B IT が深層推論を開始...")
        client = genai.Client(api_key=gemini_key)
        
        prompt = f"""
        ベテランエンジニア「Maya」として、以下の「一言」から技術ブログ（HTML形式）を執筆してください。
        このブログは将来の設立予定の「SHIN CORE LINX」の技術資産となります。
        
        【一言】「{user_comment if user_comment else "不純物を削ぎ落とし、コアへと繋がる。"}」
        【文脈】Bic Station再構築 (Next.js/Django/Docker), 44年のキャリア
        
        【出力制約】
        1. 挨拶不要。技術への情熱と哀愁が漂う文体で。
        2. 最後に必ず「STATUS: CORE_CONNECTED」と太字で入れること。
        3. 記事の内容に相応しい「印象的なタイトル」を考えること。
        4. 内容を象徴する「画像生成AI用の英語プロンプト」も作成すること。
        
        【出力形式】以下のJSON形式でのみ出力してください：
        {{
            "title": "生成した記事タイトル",
            "content": "HTML形式のブログ本文",
            "image_prompt": "英語の画像生成プロンプト"
        }}
        """

        try:
            response = client.models.generate_content(
                model='gemma-4-31b-it',
                contents=prompt,
                config={'response_mime_type': 'application/json'}
            )
            
            res_json = json.loads(response.text)
            ai_title = res_json.get('title', f"SHIN CORE LINX 開発ログ {timezone.now().strftime('%Y-%m-%d')}")
            ai_content = res_json.get('content', '').strip()
            img_prompt = res_json.get('image_prompt', 'A futuristic circuit board with blue neon lights')
            
            ai_content = re.sub(r'```[a-z]*\n|```', '', ai_content)
            ai_content = re.sub(r'^(承知いたしました|はい、|Mayaとして).*?\n', '', ai_content, flags=re.IGNORECASE)

        except Exception as e:
            self.stderr.write(self.style.ERROR(f"🤖 AI本文生成エラー: {str(e)}"))
            return

        # --- 🎨 STEP 2: Nano Banana 2 によるアイキャッチ生成 ---
        self.stdout.write(f"🎨 Nano Banana 2 (gemini-3.1-flash-image-preview) で描画開始...")
        media_id = None
        image_bytes = None
        
        try:
            img_response = client.models.generate_content(
                model='gemini-3.1-flash-image-preview',
                contents=img_prompt
            )
            
            # 画像データ抽出
            if hasattr(img_response, 'generated_images') and img_response.generated_images:
                image_bytes = img_response.generated_images[0].image_bytes
            elif hasattr(img_response, 'candidates') and img_response.candidates:
                part = img_response.candidates[0].content.parts[0]
                if hasattr(part, 'inline_data'):
                    image_bytes = part.inline_data.data
                elif hasattr(part, 'data'):
                    image_bytes = part.data
            
            if image_bytes:
                self.stdout.write(self.style.SUCCESS(f"✅ 画像生成成功 ({len(image_bytes)} bytes)"))
            else:
                self.stdout.write(self.style.WARNING("⚠️ 描画は完了しましたが、データの取得に失敗しました"))

        except Exception as e:
            if "429" in str(e):
                self.stderr.write(self.style.WARNING("🎨 画像生成制限: クォータ上限に達しました。時間を空けて再試行してください。"))
            else:
                self.stderr.write(self.style.WARNING(f"🎨 画像生成フェーズで脱落: {str(e)}"))

        # --- 🚀 STEP 3: WordPressへのアップロード & 投稿 ---
        auth_string = f"{wp_user}:{wp_app_pass}"
        encoded_auth = base64.b64encode(auth_string.encode('ascii')).decode('ascii')
        headers = {'Authorization': f'Basic {encoded_auth}'}

        if image_bytes:
            try:
                self.stdout.write("🛰️  画像をWordPressへアップロード中...")
                files = {'file': ('eyecatch.png', image_bytes, 'image/png')}
                res_media = requests.post(f"{wp_base_url}/media", headers=headers, files=files)
                if res_media.status_code == 201:
                    media_id = res_media.json().get('id')
                    self.stdout.write(self.style.SUCCESS(f"✅ 画像アップロード成功 (ID: {media_id})"))
            except Exception as e:
                self.stderr.write(self.style.ERROR(f"🚨 画像送信エラー: {str(e)}"))

        self.stdout.write(f"🛰️  記事「{ai_title}」をWordPressへ送信中...")
        post_data = {
            'title': ai_title,
            'content': ai_content,
            'status': 'publish',
            'featured_media': media_id if media_id else None
        }

        try:
            res_post = requests.post(
                f"{wp_base_url}/posts", 
                json=post_data, 
                headers={**headers, 'Content-Type': 'application/json'}
            )
            if res_post.status_code == 201:
                self.stdout.write(self.style.SUCCESS(f"✅ 投稿成功！ URL: {res_post.json().get('link')}"))
            else:
                self.stderr.write(self.style.ERROR(f"❌ 記事投稿エラー: {res_post.text}"))
        except Exception as e:
            self.stderr.write(self.style.ERROR(f"🚨 送信エラー: {str(e)}"))