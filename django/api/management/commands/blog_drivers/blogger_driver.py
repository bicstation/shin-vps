# -*- coding: utf-8 -*-
# /home/maya/shin-vps/django/api/management/commands/blog_drivers/blogger_driver.py
import os
import json
from googleapiclient.discovery import build
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from api.management.commands.blog_drivers.base_driver import BaseBlogDriver

class BloggerDriver(BaseBlogDriver):
    def post(self, title, body, image_url=None, source_url=None, product_info=None, summary="", category=None, **kwargs):
        """
        Google Blogger V3 API への投稿実行
        category 引数に対応し、Bloggerの 'labels' として反映
        """
        # 1. コンテンツの整形
        full_body = self.wrap_content(body, image_url, source_url, product_info, summary)
        
        try:
            # 2. token.json のパス解決
            token_path = "/usr/src/app/api/management/commands/bs_json/token.json"
            
            if not os.path.exists(token_path):
                base_dir = self.config.get('current_dir', '')
                alt_path = os.path.join(os.path.dirname(base_dir), "bs_json", "token.json")
                if os.path.exists(alt_path):
                    token_path = alt_path

            if not os.path.exists(token_path):
                print(f"   [Blogger Error] Token file not found at: {token_path}")
                return False
                
            # 3. 認証情報の読み込み
            creds = Credentials.from_authorized_user_file(token_path, ['https://www.googleapis.com/auth/blogger'])
            
            if creds and creds.expired and creds.refresh_token:
                try:
                    creds.refresh(Request())
                    with open(token_path, 'w') as token:
                        token.write(creds.to_json())
                except Exception as ref_e:
                    print(f"   [Blogger Error] Token refresh failed: {ref_e}")
                    return False
            
            # 4. APIサービスの構築
            service = build('blogger', 'v3', credentials=creds, cache_discovery=False)
            
            # 5. Blog ID の決定
            blog_id = str(self.config.get('blog_id') or self.config.get('blog_id_or_rpc') or '').strip()
            
            if not blog_id:
                blogs = service.blogs().listByUser(userId='self').execute()
                if 'items' in blogs and len(blogs['items']) > 0:
                    blog_id = blogs['items'][0]['id']
            
            if not blog_id:
                print("   [Blogger Error] Blog ID is missing.")
                return False

            # 6. ラベル（タグ）の準備
            # Bloggerでは 'labels' というリスト形式でタグを指定する
            labels = []
            if category:
                # 念のためカンマ区切りにも対応
                labels = [c.strip() for c in str(category).split(',') if c.strip()]
            
            # 7. 記事の投稿実行
            post_body = {
                'title': title,
                'content': full_body
            }
            if labels:
                post_body['labels'] = labels

            service.posts().insert(
                blogId=blog_id, 
                isDraft=False,
                body=post_body
            ).execute()
            
            return True

        except Exception as e:
            print(f"   [Blogger Exception] {str(e)}")
            return False