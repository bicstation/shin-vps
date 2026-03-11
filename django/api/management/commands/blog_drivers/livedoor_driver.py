# -*- coding: utf-8 -*-
import os
import base64
import hashlib
import requests
from django.utils import timezone  # Naive datetime警告対策
from xml.sax.saxutils import escape
from api.management.commands.blog_drivers.base_driver import BaseBlogDriver

class LivedoorDriver(BaseBlogDriver):
    def post(self, title, body, image_url=None, source_url=None, product_info=None, summary=""):
        """
        Livedoor Blog (AtomPub) への投稿実行
        """
        url = self.config['url']
        user = self.config['user']
        key = self.config['api_key']

        # 1. コンテンツの整形 (BaseBlogDriverのメソッドを使用)
        full_body = self.wrap_content(body, image_url, source_url, product_info, summary)
        
        # 2. XML用にタイトルをエスケープ
        safe_title = escape(title)
        
        # 3. WSSE認証用パラメータの生成
        # 現在時刻 (ISO 8601形式 / ZはUTCを意味する)
        now = timezone.now().strftime('%Y-%m-%dT%H:%M:%SZ')
        
        # Nonce (ランダムな文字列をBase64エンコード)
        nonce_raw = os.urandom(16)
        nonce_b64 = base64.b64encode(nonce_raw).decode()
        
        # PasswordDigestの計算: SHA1(Nonce + Created + API_Key)
        sh = hashlib.sha1()
        sh.update(nonce_raw + now.encode() + key.encode())
        digest = base64.b64encode(sh.digest()).decode()
        
        # 4. ヘッダーの構築
        wsse = f'UsernameToken Username="{user}", PasswordDigest="{digest}", Nonce="{nonce_b64}", Created="{now}"'
        headers = {
            'X-WSSE': wsse,
            'Authorization': 'WSSE profile="UsernameToken"',
            'Content-Type': 'application/atom+xml'
        }
        
        # 5. AtomPub用XMLの組み立て
        xml = f'''<?xml version="1.0" encoding="utf-8"?>
<entry xmlns="http://www.w3.org/2005/Atom">
  <title>{safe_title}</title>
  <content type="text/html"><![CDATA[{full_body}]]></content>
</entry>'''
        
        # 6. リクエスト送信
        try:
            r = requests.post(
                url, 
                data=xml.encode('utf-8'), 
                headers=headers, 
                timeout=30
            )
            
            # 【修正箇所】リスト形式でステータスコードを判定
            if r.status_code == 200 or r.status_code == 201:
                return True
            else:
                # 失敗時は原因特定のためにレスポンスを表示
                print(f"  [Livedoor Error] Status: {r.status_code}")
                print(f"  [Livedoor Response] {r.text[:300]}")
                return False
        except Exception as e:
            # 【修正箇所】エラーメッセージの型不一致を防ぐため明示的にstr変換
            print(f"  [Livedoor Exception] {str(e)}")
            return False