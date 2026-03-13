# -*- coding: utf-8 -*-
import os
import requests
from requests.auth import HTTPBasicAuth
from django.utils import timezone
from xml.sax.saxutils import escape
from api.management.commands.blog_drivers.base_driver import BaseBlogDriver

class LivedoorDriver(BaseBlogDriver):
    def post(self, title, body, image_url=None, source_url=None, product_info=None, summary=""):
        """
        Livedoor Blog (AtomPub) への投稿実行
        201 Created を最優先で拾い、DB二重登録バグを根絶する強化版
        """
        # 1. エンドポイントURLの正規化
        url = self.config['url'].rstrip('/')
        
        # 渡辺様の「〇」の法則を自動適用
        if not url.endswith('/article'):
            url = f"{url}/article"
            
        user = self.config['user']
        key = self.config['api_key']

        # 2. コンテンツの整形 (BaseBlogDriverのメソッドを使用)
        full_body = self.wrap_content(body, image_url, source_url, product_info, summary)
        
        # 3. XML用にタイトルをエスケープ
        safe_title = escape(title)
        
        # 4. AtomPub用XMLの組み立て
        xml = f'''<?xml version="1.0" encoding="utf-8"?>
<entry xmlns="http://www.w3.org/2005/Atom">
  <title>{safe_title}</title>
  <content type="text/html"><![CDATA[{full_body}]]></content>
</entry>'''

        # 5. ヘッダーの構築
        headers = {
            'Content-Type': 'application/atom+xml;type=entry',
        }
        
        # 6. リクエスト送信 (Basic認証)
        try:
            auth = HTTPBasicAuth(user, key)
            
            r = requests.post(
                url, 
                data=xml.encode('utf-8'), 
                auth=auth,
                headers=headers, 
                timeout=30
            )
            
            # 🚀 【重要】判定の厳格化
            # LivedoorのAtomPubでは 201 が「新規作成成功」の証です。
            if r.status_code == 201 or r.status_code == 200:
                # この時点でTrueを返せば、呼び出し元でArticleMapperがDBに保存し、次回から重複しません。
                return True
            
            # 失敗時のログ出力
            print(f"  [Livedoor Error] Status: {r.status_code}")
            print(f"  [Livedoor Response] {r.text[:300]}") # ログが埋まらないよう短縮表示
            
            if r.status_code == 401:
                print("  💡 アドバイス: APIキーが『AtomPub用パスワード(10桁)』か再確認してください。")
            elif r.status_code in [400, 404]:
                print(f"  💡 アドバイス: エンドポイントURL ({url}) の形式を再確認してください。")
                
            return False

        except Exception as e:
            print(f"  [Livedoor Exception] {str(e)}")
            return False