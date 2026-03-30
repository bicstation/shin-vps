# -*- coding: utf-8 -*-
# /home/maya/shin-vps/django/api/management/commands/blog_drivers/livedoor_driver.py
import os
import requests
import re
import unicodedata
from requests.auth import HTTPBasicAuth
from xml.sax.saxutils import escape
from api.management.commands.blog_drivers.base_driver import BaseBlogDriver

class LivedoorDriver(BaseBlogDriver):
    def post(self, title, body, image_url=None, source_url=None, product_info=None, summary="", category=None, **kwargs):
        """
        Livedoor Blog (AtomPub) 投稿実行
        XML 1.0規格外の文字を物理的に排除し、400 Bad Requestを回避
        """
        # --- 設定情報の取得 ---
        url = (self.config.get('url') or self.config.get('endpoint') or '').strip()
        user = str(self.config.get('user') or '').strip()
        key = str(self.config.get('api_key') or self.config.get('api_key_or_pw') or '').strip()

        if not url.startswith('http'):
            print(f"   [Livedoor Error] Invalid Endpoint URL: '{url}'")
            return False
        
        if not user or not key:
            print(f"   [Livedoor Error] Missing Credentials")
            return False

        # コンテンツ整形
        full_body = self.wrap_content(body, image_url, source_url, product_info, summary)
        
        # --- XML破壊の元凶を鎮圧 ---
        # 1. CDATAセクションを壊す文字列をエスケープ
        full_body = full_body.replace("]]>", "]]&gt;")
        
        # 2. XML 1.0 で禁止されている制御文字 (0x00-0x08, 0x0B, 0x0C, 0x0E-0x1F) を物理除去
        # これをやらないと、AIが紛れ込ませたゴミ文字で400エラーになります
        full_body = "".join(ch for ch in full_body if self._is_xml_safe(ch))
        
        # タイトルも同様にクレンジングしてエスケープ
        clean_title = "".join(ch for ch in title.strip() if self._is_xml_safe(ch))
        safe_title = escape(clean_title)

        # カテゴリタグ (AtomPubでは <content> より前に置くのが一般的で安全)
        category_tag = ""
        if category:
            safe_category = escape(str(category).strip())
            category_tag = f'<category term="{safe_category}" />'
        
        # --- AtomPub XML 構築 ---
        # 確実に utf-8 宣言。CDATAを使うことでHTMLタグを保護
        xml = (
            f'<?xml version="1.0" encoding="utf-8"?>'
            f'<entry xmlns="http://www.w3.org/2005/Atom">'
            f'<title>{safe_title}</title>'
            f'<updated>{self._get_timestamp()}</updated>' # 更新日時を追加（推奨）
            f'{category_tag}'
            f'<content type="text/html"><![CDATA[{full_body}]]></content>'
            f'</entry>'
        )

        headers = {'Content-Type': 'application/atom+xml;type=entry'}
        
        try:
            auth = HTTPBasicAuth(user, key)
            # errors='ignore' で万が一の不正バイトもスキップ
            binary_data = xml.encode('utf-8', errors='ignore')
            
            r = requests.post(
                url, 
                data=binary_data, 
                auth=auth,
                headers=headers, 
                timeout=30
            )
            
            if r.status_code in [200, 201]:
                return True
            
            # 失敗時は詳細を出力
            print(f"   [Livedoor Error] Status: {r.status_code}")
            print(f"   [Livedoor Response] {r.text[:500]}") 
            return False

        except Exception as e:
            print(f"   [Livedoor Exception] {str(e)}")
            return False

    def _is_xml_safe(self, char):
        """XML 1.0 で許可されている文字か判定"""
        cp = ord(char)
        # 許可される範囲: #x9 | #xA | #xD | [#x20-#xD7FF] | [#xE000-#xFFFD] | [#x10000-#x10FFFF]
        return (
            cp == 0x9 or cp == 0xA or cp == 0xD or
            (0x20 <= cp <= 0xD7FF) or
            (0xE000 <= cp <= 0xFFFD) or
            (0x10000 <= cp <= 0x10FFFF)
        )

    def _get_timestamp(self):
        """AtomPub 用のタイムスタンプ"""
        from datetime import datetime
        return datetime.now().strftime('%Y-%m-%dT%H:%M:%S')