# -*- coding: utf-8 -*-
import os, base64, hashlib, requests
from django.utils import timezone  # Naive datetime 警告対策
from xml.sax.saxutils import escape
# 絶対パスに変更
from api.management.commands.blog_drivers.base_driver import BaseBlogDriver

class HatenaDriver(BaseBlogDriver):
    def post(self, title, body, image_url=None, source_url=None, product_info=None, summary=""):
        """
        はてなブログ (AtomPub) への投稿実行
        """
        full_body = self.wrap_content(body, image_url, source_url, product_info, summary)
        
        user = self.config['id']
        key = self.config['api_key']
        url = self.config['url']
        
        # 1. WSSE認証用パラメータ (UTC時間)
        now = timezone.now().strftime('%Y-%m-%dT%H:%M:%SZ')
        nonce = os.urandom(16)
        
        # 2. PasswordDigestの計算
        sh = hashlib.sha1()
        sh.update(nonce + now.encode() + key.encode())
        digest = base64.b64encode(sh.digest()).decode()
        
        # 3. ヘッダー構築
        wsse = f'UsernameToken Username="{user}", PasswordDigest="{digest}", Nonce="{base64.b64encode(nonce).decode()}", Created="{now}"'
        headers = {
            'X-WSSE': wsse,
            'Content-Type': 'application/atom+xml'
        }
        
        # 4. XML組み立て
        xml = f'''<?xml version="1.0" encoding="utf-8"?>
<entry xmlns="http://www.w3.org/2005/Atom">
  <title>{escape(title)}</title>
  <content type="text/html"><![CDATA[{full_body}]]></content>
</entry>'''
        
        try:
            r = requests.post(url, data=xml.encode('utf-8'), headers=headers, timeout=30)
            
            # 【修正箇所】空文字列との比較をリスト判定に変更
            if r.status_code in [200, 201]:
                return True
            else:
                # 失敗時は内容を出力
                print(f"  [Hatena Error] Status: {r.status_code}, Response: {r.text[:200]}")
                return False
        except Exception as e:
            print(f"  [Hatena Exception] {str(e)}")
            return False