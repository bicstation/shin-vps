# -*- coding: utf-8 -*-
import os, base64, hashlib, requests
from django.utils import timezone
from xml.sax.saxutils import escape
from api.management.commands.blog_drivers.base_driver import BaseBlogDriver

class HatenaDriver(BaseBlogDriver):
    def post(self, title, body, image_url=None, source_url=None, product_info=None, summary=""):
        """
        はてなブログ (AtomPub) への投稿実行
        司令部（管理コマンド）からの多様なキー名に対応
        """
        full_body = self.wrap_content(body, image_url, source_url, product_info, summary)
        
        # --- 🚨 修正：キー名の揺れを吸収 (url/endpoint, api_key/api_key_or_pw) ---
        user = str(self.config.get('user') or '').strip()
        key = str(self.config.get('api_key') or self.config.get('api_key_or_pw') or '').strip()
        url = str(self.config.get('endpoint') or self.config.get('url') or '').strip()
        
        # 安全策：設定が取得できなかった場合のガード
        if not all([user, key, url]):
            print(f"  [Hatena Error] 設定値が不足しています (user: {user}, endpoint: {url})")
            return False

        if not url.startswith('http'):
            print(f"  [Hatena Error] Invalid Endpoint URL: '{url}'")
            return False
        
        try:
            # 1. WSSE認証用パラメータ (ISO8601形式のUTC時間)
            now = timezone.now().strftime('%Y-%m-%dT%H:%M:%SZ')
            
            # Nonceの生成
            # os.urandom(16) の生バイトをそのままハッシュ計算に使い、ヘッダーにはBase64版を入れる
            nonce_raw = os.urandom(16)
            nonce_b64 = base64.b64encode(nonce_raw).decode()
            
            # 2. PasswordDigestの計算: Base64(SHA1(Nonce + Created + Password))
            # バイト列の結合に注意して計算
            sh = hashlib.sha1()
            sh.update(nonce_raw + now.encode('utf-8') + key.encode('utf-8'))
            digest = base64.b64encode(sh.digest()).decode()
            
            # 3. ヘッダー構築 (WSSE)
            wsse = (
                f'UsernameToken Username="{user}", '
                f'PasswordDigest="{digest}", '
                f'Nonce="{nonce_b64}", '
                f'Created="{now}"'
            )
            
            headers = {
                'X-WSSE': wsse,
                'Content-Type': 'application/atom+xml',
                'User-Agent': 'C-PLAN Fleet Deployer/3.0'
            }
            
            # 4. XML組み立て
            # 制御文字を除去し、UTF-8で確実に送信
            full_body_cleaned = "".join(ch for ch in full_body if ord(ch) >= 32 or ch in "\n\r\t")
            
            xml = f'<?xml version="1.0" encoding="utf-8"?>' \
                  f'<entry xmlns="http://www.w3.org/2005/Atom">' \
                  f'<title>{escape(title.strip())}</title>' \
                  f'<content type="text/html"><![CDATA[{full_body_cleaned}]]></content>' \
                  f'</entry>'
            
            # 5. 送信
            r = requests.post(
                url, 
                data=xml.encode('utf-8'), 
                headers=headers, 
                timeout=30
            )
            
            if r.status_code in [200, 201]:
                return True
            else:
                print(f"  [Hatena Error] Status: {r.status_code}, Response: {r.text[:200]}")
                return False

        except Exception as e:
            print(f"  [Hatena Exception] {str(e)}")
            return False