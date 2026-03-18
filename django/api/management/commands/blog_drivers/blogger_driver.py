# -*- coding: utf-8 -*-
# /home/maya/shin-dev/shin-vps/django/api/management/commands/blog_drivers/blogger_driver.py

import os
import json
from googleapiclient.discovery import build
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
# 絶対パスによるインポート
from api.management.commands.blog_drivers.base_driver import BaseBlogDriver

class BloggerDriver(BaseBlogDriver):
    def post(self, title, body, image_url=None, source_url=None, product_info=None, summary="", current_dir=None):
        """
        Google Blogger V3 API への投稿実行
        """
        # 1. コンテンツの整形
        full_body = self.wrap_content(body, image_url, source_url, product_info, summary)
        
        try:
            # 2. token.jsonのパス解決
            token_dir = os.path.join(current_dir, self.config['client_json_dir'])
            token_path = os.path.join(token_dir, 'token.json')
            
            if not os.path.exists(token_path):
                print(f"  [Blogger Error] Token file not found: {token_path}")
                return False
                
            # 3. 認証情報の読み込み
            creds = Credentials.from_authorized_user_file(token_path, ['https://www.googleapis.com/auth/blogger'])
            
            # トークン更新
            if creds and creds.expired and creds.refresh_token:
                creds.refresh(Request())
                with open(token_path, 'w') as token:
                    token.write(creds.to_json())
            
            # 4. APIサービスの構築
            service = build('blogger', 'v3', credentials=creds)
            
            # 5. ユーザーに紐づくブログ一覧を取得
            blogs = service.blogs().listByUser(userId='self').execute()
            
            if 'items' in blogs and len(blogs['items']) > 0:
                # 【修正：確定版】 を追加してリストの最初の要素を取得します
                blog_id = blogs['items'][0]['id']
                
                # 6. 記事の投稿
                service.posts().insert(
                    blogId=blog_id, 
                    body={
                        'title': title,
                        'content': full_body
                    }
                ).execute()
                
                return True
            
            print("  [Blogger Error] No blogs found.")
            return False

        except Exception as e:
            print(f"  [Blogger Exception] {str(e)}")
            return False