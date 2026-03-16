# -*- coding: utf-8 -*-
import os
import requests
import re
from requests.auth import HTTPBasicAuth
from xml.sax.saxutils import escape
from api.management.commands.blog_drivers.base_driver import BaseBlogDriver

class LivedoorDriver(BaseBlogDriver):
    def post(self, title, body, image_url=None, source_url=None, product_info=None, summary=""):
        """
        Livedoor Blog (AtomPub) 投稿実行
        URLの自動補正を完全に撤廃し、configのURLをそのまま使用する
        """
        # URLを一切加工せずそのまま使用（/article の有無は管理コマンド側に一任）
        url = self.config.get('url', '').strip()
        user = self.config.get('user')
        key = self.config.get('api_key')

        # コンテンツ整形
        full_body = self.wrap_content(body, image_url, source_url, product_info, summary)
        
        # XML制御文字のクレンジング
        full_body = "".join(ch for ch in full_body if ord(ch) >= 32 or ch in "\n\r\t")
        full_body = full_body.replace("]]>", "]]&gt;")
        
        # タイトルのエスケープ（AI生成タイトルを尊重）
        safe_title = escape(title.strip()) 
        
        # AtomPub XML
        xml = f'<?xml version="1.0" encoding="utf-8"?><entry xmlns="http://www.w3.org/2005/Atom"><title>{safe_title}</title><content type="text/html"><![CDATA[{full_body}]]></content></entry>'

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
            
            if r.status_code in [200, 201]:
                return True
            
            print(f"  [Livedoor Error] Status: {r.status_code}")
            print(f"  [Livedoor Response] {r.text[:300]}") 
            return False

        except Exception as e:
            print(f"  [Livedoor Exception] {str(e)}")
            return False