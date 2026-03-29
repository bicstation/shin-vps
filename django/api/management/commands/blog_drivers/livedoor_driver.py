# -*- coding: utf-8 -*-
import os
import requests
import re
from requests.auth import HTTPBasicAuth
from xml.sax.saxutils import escape
from api.management.commands.blog_drivers.base_driver import BaseBlogDriver

class LivedoorDriver(BaseBlogDriver):
    def post(self, title, body, image_url=None, source_url=None, product_info=None, summary="", category=None, **kwargs):
        """
        Livedoor Blog (AtomPub) 投稿実行
        config から url または endpoint を柔軟に取得する
        引数に category を追加し、呼び出し元との不整合を解消
        """
        # --- 設定情報の取得 ---
        url = (self.config.get('url') or self.config.get('endpoint') or '').strip()
        user = str(self.config.get('user') or '').strip()
        key = str(self.config.get('api_key') or self.config.get('api_key_or_pw') or '').strip()

        # 基本的なバリデーション
        if not url.startswith('http'):
            print(f"   [Livedoor Error] Invalid Endpoint URL: '{url}'")
            return False
        
        if not user or not key:
            print(f"   [Livedoor Error] Missing Credentials (User/API Key)")
            return False

        # コンテンツ整形（BaseBlogDriverのwrap_contentを使用）
        full_body = self.wrap_content(body, image_url, source_url, product_info, summary)
        
        # XML制御文字のクレンジング
        full_body = "".join(ch for ch in full_body if ord(ch) >= 32 or ch in "\n\r\t")
        full_body = full_body.replace("]]>", "]]&gt;")
        
        # タイトルのエスケープ
        safe_title = escape(title.strip()) 
        
        # カテゴリタグの生成（もし指定があればXMLに追加）
        category_tag = ""
        if category:
            safe_category = escape(str(category).strip())
            category_tag = f'<category term="{safe_category}" />'
        
        # --- AtomPub XML 構築 ---
        # category_tag を entry 内に挿入
        xml = (
            f'<?xml version="1.0" encoding="utf-8"?>'
            f'<entry xmlns="http://www.w3.org/2005/Atom">'
            f'<title>{safe_title}</title>'
            f'{category_tag}'
            f'<content type="text/html"><![CDATA[{full_body}]]></content>'
            f'</entry>'
        )

        headers = {'Content-Type': 'application/atom+xml;type=entry'}
        
        try:
            auth = HTTPBasicAuth(user, key)
            binary_data = xml.encode('utf-8', errors='replace')
            
            r = requests.post(
                url, 
                data=binary_data, 
                auth=auth,
                headers=headers, 
                timeout=30
            )
            
            # 201 Created または 200 OK で成功
            if r.status_code in [200, 201]:
                return True
            
            print(f"   [Livedoor Error] Status: {r.status_code}")
            print(f"   [Livedoor Response] {r.text[:300]}") 
            return False

        except Exception as e:
            print(f"   [Livedoor Exception] {str(e)}")
            return False