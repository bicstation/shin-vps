# -*- coding: utf-8 -*-
import time
import requests
import xmlrpc.client
from .base_driver import BaseBlogDriver

class WordPressDriver(BaseBlogDriver):
    """
    WordPress XML-RPC APIを使用した投稿ドライバー
    KeyErrorを防止し、引数の整合性と接続の安定性を向上させた強化版
    """
    def post(self, title, body, image_url=None, category=None, categories=None, tags=None, **kwargs):
        """
        WordPressへの投稿実行
        category 引数に対応し、WPの 'category' terms として反映
        """
        conf = self.config
        
        # 🚨 キー名が 'url' でも 'base_url' でも動くようにガード
        target_url = conf.get('url') or conf.get('base_url')
        
        if not target_url:
            print(f"   [WP Connection Error] 設定に 'url' または 'base_url' が見つかりません。")
            return False

        # 接続先サーバー設定
        try:
            server = xmlrpc.client.ServerProxy(target_url, allow_none=True)
        except Exception as e:
            print(f"   [WP Connection Error] ServerProxy生成失敗: {e}")
            return False

        # 設定の正規化 (KeyError防止)
        blog_id = conf.get('blog_id', 0)
        username = str(conf.get('user') or '').strip()
        # password または pw のどちらかがある方を採用
        password = str(conf.get('password') or conf.get('pw') or '').strip()

        if not username or not password:
            print(f"   [WP Auth Error] ユーザー名またはパスワードが未設定です。")
            return False

        thumbnail_id = None
        
        # 1. 画像のアップロード
        if image_url:
            try:
                headers = {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                    'Referer': 'https://www.google.com/'
                }
                img_res = requests.get(image_url, headers=headers, timeout=20)
                
                if img_res.status_code == 200:
                    up_res = server.wp.uploadFile(blog_id, username, password, {
                        'name': f"wp_{int(time.time())}.jpg",
                        'type': 'image/jpeg',
                        'bits': xmlrpc.client.Binary(img_res.content),
                        'overwrite': True
                    })
                    if up_res and 'id' in up_res:
                        thumbnail_id = int(up_res['id'])
                        print(f"   [WP] Media Upload Success: ID {thumbnail_id}")
                else:
                    print(f"   [WP Image Error] HTTP {img_res.status_code} URL: {image_url}")
            except Exception as e:
                print(f"   [WP Image Error] {e}")

        # 2. 本文内のプレースホルダー置換
        img_tag = f'<div style="text-align:center; margin-bottom:20px;"><img src="{image_url}" style="max-width:100%; border-radius:8px;"></div>' if image_url else ""
        safe_body = body if body else ""
        full_body = safe_body.replace('__IMG_TAG_PLACEHOLDER__', img_tag)

        # 3. カテゴリとタグの整理
        # 司令部からの 'category' を最優先し、リスト形式に変換
        wp_categories = []
        if category:
            wp_categories = [c.strip() for c in str(category).split(',') if c.strip()]
        elif categories:
            wp_categories = categories if isinstance(categories, list) else [categories]
        
        if not wp_categories:
            wp_categories = ["未分類"]

        wp_tags = tags if tags else []

        # 4. 投稿データ作成
        post_content = {
            'post_type': 'post',
            'post_status': 'publish',
            'post_title': title,
            'post_content': full_body,
            'terms_names': {
                'category': wp_categories,
                'post_tag': wp_tags
            }
        }
        
        if thumbnail_id:
            post_content['post_thumbnail'] = thumbnail_id
        
        # 5. 投稿の実行
        try:
            post_id = server.wp.newPost(blog_id, username, password, post_content)
            if post_id:
                print(f"   [WP] Post Created: ID {post_id}")
                return True
            return False
        except Exception as e:
            print(f"   [WP Post Error] {e}")
            return False