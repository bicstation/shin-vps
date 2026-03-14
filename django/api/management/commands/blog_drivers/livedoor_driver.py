# -*- coding: utf-8 -*-
import os
import requests
import re
from requests.auth import HTTPBasicAuth
from django.utils import timezone
from xml.sax.saxutils import escape
from api.management.commands.blog_drivers.base_driver import BaseBlogDriver

class LivedoorDriver(BaseBlogDriver):
    def post(self, title, body, image_url=None, source_url=None, product_info=None, summary=""):
        """
        Livedoor Blog (AtomPub) への投稿実行
        【最終対策】記号クレンジング、XML制御文字排除、URL自動補正を完全実装
        """
        # 1. エンドポイントURLの正規化（徹底的な重複排除）
        # 設定値がどうあれ、最終的に .../article に整える
        base_url = self.config.get('url', '').strip().rstrip('/')
        if base_url.endswith('/article'):
            url = base_url
        else:
            url = f"{base_url}/article"
            
        user = self.config.get('user')
        key = self.config.get('api_key')

        # 2. コンテンツの整形
        full_body = self.wrap_content(body, image_url, source_url, product_info, summary)
        
        # 🚨 【400対策】XML破壊文字と制御文字を排除
        # 0x00-0x1F (改行・タブ以外) を除去し、CDATA破壊文字列を無効化
        full_body = "".join(ch for ch in full_body if ord(ch) >= 32 or ch in "\n\r\t")
        full_body = full_body.replace("]]>", "]]&gt;")
        
        # 🚨 【400対策】タイトル内の全角記号をXMLフレンドリーな形式に置換
        # ハルシネーション検知後の「【】｜」などの記号が弾かれるケースを想定
        safe_title = re.sub(r'[【】［］]', ' ', title)  # 隅付き括弧をスペースに
        safe_title = safe_title.replace('｜', ' - ')    # 縦棒をハイフンに
        safe_title = escape(safe_title.strip())         # XMLエスケープ
        
        # 3. AtomPub用XMLの組み立て (構造を最小化してパースエラーを防ぐ)
        xml = f'<?xml version="1.0" encoding="utf-8"?><entry xmlns="http://www.w3.org/2005/Atom"><title>{safe_title}</title><content type="text/html"><![CDATA[{full_body}]]></content></entry>'

        # 4. ヘッダーの構築
        headers = {
            'Content-Type': 'application/atom+xml;type=entry',
        }
        
        # 5. リクエスト送信 (Basic認証)
        try:
            auth = HTTPBasicAuth(user, key)
            
            # 🚨 エンコード時に壊れた文字を?に置換して送信
            binary_data = xml.encode('utf-8', errors='replace')
            
            r = requests.post(
                url, 
                data=binary_data, 
                auth=auth,
                headers=headers, 
                timeout=30
            )
            
            # 🚀 判定：Livedoorは新規作成時に 201 を返すが、200 も成功とする
            if r.status_code in [200, 201]:
                return True
            
            # 失敗時の詳細ログ（400エラーの場合、レスポンスに原因が書いてあることが多い）
            print(f"  [Livedoor Error] Status: {r.status_code}")
            print(f"  [Livedoor Response] {r.text[:500]}") 
            
            if r.status_code == 401:
                print("  💡 アドバイス: APIキー(10桁)またはユーザーIDが間違っています。")
            elif r.status_code == 400:
                print(f"  💡 アドバイス: タイトルの記号、または本文内の禁止ワードがAPIで弾かれました。URL: {url}")
            elif r.status_code == 404:
                print(f"  💡 アドバイス: 指定のURLが存在しません。API設定を確認してください。")
                
            return False

        except Exception as e:
            print(f"  [Livedoor Exception] {str(e)}")
            return False