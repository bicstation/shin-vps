# -*- coding: utf-8 -*-
# /home/maya/shin-dev/shin-vps/django/api/management/commands/blog_drivers/hatena_driver.py
import os, base64, hashlib, requests
from django.utils import timezone
from xml.sax.saxutils import escape
from api.management.commands.blog_drivers.base_driver import BaseBlogDriver

class HatenaDriver(BaseBlogDriver):
    def post(self, title, body, image_url=None, source_url=None, product_info=None, summary=""):
        """
        はてなブログ (AtomPub) への投稿実行
        v16.8 司令部モデル対応版
        """
        full_body = self.wrap_content(body, image_url, source_url, product_info, summary)
        
        # --- 🚨 修正：司令部の BLOG_CONFIGS (user, api_key, endpoint) に完全に一致させる ---
        user = self.config.get('user')
        key = self.config.get('api_key')
        url = self.config.get('endpoint')
        
        # 安全策：設定が取得できなかった場合のガード
        if not all([user, key, url]):
            print(f"  [Hatena Error] 設定値が不足しています (user: {user}, endpoint: {url})")
            return False
        
        # 1. WSSE認証用パラメータ (UTC時間)
        now = timezone.now().strftime('%Y-%m-%dT%H:%M:%SZ')
        nonce = os.urandom(16)
        
        # 2. PasswordDigestの計算
        # SHA1(Nonce + Created + Password)
        sh = hashlib.sha1()
        sh.update(nonce + now.encode() + key.encode())
        digest = base64.b64encode(sh.digest()).decode()
        
        # 3. ヘッダー構築 (WSSE)
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
            # Shift-JIS などの混入を防ぐため utf-8 でエンコードして送信
            r = requests.post(url, data=xml.encode('utf-8'), headers=headers, timeout=30)
            
            # 200 (OK) または 201 (Created) であれば成功
            if r.status_code in [200, 201]:
                return True
            else:
                # 認証失敗やエンドポイント間違いの場合のデバッグ用
                print(f"  [Hatena Error] Status: {r.status_code}, Response: {r.text[:200]}")
                return False
        except Exception as e:
            print(f"  [Hatena Exception] {str(e)}")
            return False