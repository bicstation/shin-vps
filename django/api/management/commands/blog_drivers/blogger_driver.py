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
        # 1. コンテンツの整形
        full_body = self.wrap_content(body, image_url, source_url, product_info, summary)
        
        try:
            # 2. token.json のパス解決
            # Docker環境の絶対パスを優先しつつ、configからの相対指定も受け付ける
            token_path = "/usr/src/app/api/management/commands/bs_json/token.json"
            
            # コンテナ外やディレクトリ構造が変わった場合のフォールバック
            if not os.path.exists(token_path):
                # current_dir が渡されていればそこからの相対パスを探す
                base_dir = self.config.get('current_dir', '')
                alt_path = os.path.join(os.path.dirname(base_dir), "bs_json", "token.json")
                if os.path.exists(alt_path):
                    token_path = alt_path

            if not os.path.exists(token_path):
                print(f"  [Blogger Error] Token file not found at: {token_path}")
                return False
                
            # 3. 認証情報の読み込み
            creds = Credentials.from_authorized_user_file(token_path, ['https://www.googleapis.com/auth/blogger'])
            
            # トークンが期限切れなら更新（Requestを投げてリフレッシュ）
            if creds and creds.expired and creds.refresh_token:
                try:
                    creds.refresh(Request())
                    with open(token_path, 'w') as token:
                        token.write(creds.to_json())
                except Exception as ref_e:
                    print(f"  [Blogger Error] Token refresh failed: {ref_e}")
                    return False
            
            # 4. APIサービスの構築
            service = build('blogger', 'v3', credentials=creds, cache_discovery=False)
            
            # 5. Blog ID の決定
            # CSVのヘッダー揺れ（blog_id / blog_id_or_rpc）に対応
            blog_id = str(self.config.get('blog_id') or self.config.get('blog_id_or_rpc') or '').strip()
            
            if not blog_id:
                # IDが不明な場合は、紐付いている最初のブログを取得
                blogs = service.blogs().listByUser(userId='self').execute()
                if 'items' in blogs and len(blogs['items']) > 0:
                    blog_id = blogs['items'][0]['id']
            
            if not blog_id:
                print("  [Blogger Error] Blog ID is missing.")
                return False
            
            # 6. 記事の投稿実行
            service.posts().insert(
                blogId=blog_id, 
                isDraft=False,
                body={
                    'title': title,
                    'content': full_body
                }
            ).execute()
            
            return True

        except Exception as e:
            print(f"  [Blogger Exception] {str(e)}")
            return False