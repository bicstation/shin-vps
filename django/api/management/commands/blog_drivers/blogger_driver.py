# -*- coding: utf-8 -*-
import os
import json
from googleapiclient.discovery import build
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from api.management.commands.blog_drivers.base_driver import BaseBlogDriver

class BloggerDriver(BaseBlogDriver):
    def post(self, title, body, image_url=None, source_url=None, product_info=None, summary="", **kwargs):
        """
        Google Blogger V3 API への投稿実行
        """
        # 1. コンテンツの整形（BaseBlogDriverのメソッドを使用）
        full_body = self.wrap_content(body, image_url, source_url, product_info, summary)
        
        try:
            # 2. 【最重要】token.json の絶対パスを指定
            # お師匠様が教えてくれたパスを直接指定するか、configから組み立てます
            token_path = "/home/maya/shin-dev/shin-vps/django/api/management/commands/bs_json/token.json"
            
            if not os.path.exists(token_path):
                print(f"  [Blogger Error] Token file not found at: {token_path}")
                return False
                
            # 3. 認証情報の読み込み
            creds = Credentials.from_authorized_user_file(token_path, ['https://www.googleapis.com/auth/blogger'])
            
            # トークンが期限切れなら更新
            if creds and creds.expired and creds.refresh_token:
                creds.refresh(Request())
                with open(token_path, 'w') as token:
                    token.write(creds.to_json())
            
            # 4. APIサービスの構築
            service = build('blogger', 'v3', credentials=creds)
            
            # 5. Blog ID の決定
            # CSVの 'blog_id_or_rpc' 列に入れた値が self.config['blog_id'] に格納されています
            blog_id = self.config.get('blog_id')
            
            if not blog_id:
                # もしCSVにIDがなければ、最初に見つかったブログを使う（バックアップ）
                blogs = service.blogs().listByUser(userId='self').execute()
                if 'items' in blogs and len(blogs['items']) > 0:
                    blog_id = blogs['items'][0]['id']
            
            if not blog_id:
                print("  [Blogger Error] Blog ID is missing.")
                return False
            
            # 6. 記事の投稿
            service.posts().insert(
                blogId=blog_id, 
                body={
                    'title': title,
                    'content': full_body
                }
            ).execute()
            
            return True

        except Exception as e:
            # ここで KeyError: 'client_json_dir' が出ていたのを、直接パス指定にすることで撲滅
            print(f"  [Blogger Exception] {str(e)}")
            return False