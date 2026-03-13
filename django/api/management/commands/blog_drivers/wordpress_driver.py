# -*- coding: utf-8 -*-
import time
import requests
import xmlrpc.client
from .base_driver import BaseBlogDriver

class WordPressDriver(BaseBlogDriver):
    """
    WordPress XML-RPC APIを使用した投稿ドライバー
    wp.newPost を使用してアイキャッチ画像の紐付けを確実にします。
    """
    def post(self, title, body, image_url=None, categories=None, tags=None, **kwargs):
        conf = self.config
        
        # 接続先サーバー設定
        try:
            server = xmlrpc.client.ServerProxy(conf['url'], allow_none=True)
        except Exception as e:
            print(f"   [WP Connection Error] {e}")
            return False

        # 設定の正規化 (KeyError防止)
        blog_id = conf.get('blog_id', 0)  # 通常は0または1
        username = conf.get('user')
        # password または pw のどちらかがある方を採用
        password = conf.get('password') or conf.get('pw')

        thumbnail_id = None
        
        # 1. 画像のアップロード (メディアライブラリへ登録)
        if image_url:
            try:
                # DMM等のブロックを避けるためのヘッダー
                headers = {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                    'Referer': 'https://www.dmm.co.jp/'
                }
                img_res = requests.get(image_url, headers=headers, timeout=20)
                
                if img_res.status_code == 200:
                    # WordPressへバイナリデータを送信
                    up_res = server.wp.uploadFile(blog_id, username, password, {
                        'name': f"wp_{int(time.time())}.jpg",
                        'type': 'image/jpeg',
                        'bits': xmlrpc.client.Binary(img_res.content),
                        'overwrite': True
                    })
                    if 'id' in up_res:
                        thumbnail_id = int(up_res['id'])
                        print(f"   [WP] Media Upload Success: ID {thumbnail_id}")
                else:
                    print(f"   [WP Image Error] HTTP {img_res.status_code}")
            except Exception as e:
                print(f"   [WP Image Error] {e}")

        # 2. 本文内のプレースホルダー置換
        # もし ai_post_adult_news.py 側で既にHTML化されている場合はそのまま、
        # 置換が必要な場合はここで処理
        img_tag = f'<div style="text-align:center; margin-bottom:20px;"><img src="{image_url}" style="max-width:100%; border-radius:8px;"></div>' if image_url else ""
        full_body = body.replace('__IMG_TAG_PLACEHOLDER__', img_tag)

        # 3. 投稿データ作成 (WordPress native wp.newPost 形式)
        # この形式は post_thumbnail を確実に認識します
        post_content = {
            'post_type': 'post',
            'post_status': 'publish',
            'post_title': title,
            'post_content': full_body,
            'terms_names': {
                'category': categories or ["未分類"],
                'post_tag': tags or []
            }
        }
        
        # アイキャッチIDが存在すれば紐付け
        if thumbnail_id:
            post_content['post_thumbnail'] = thumbnail_id
        
        # 4. 投稿の実行
        try:
            # server.wp.newPost(blog_id, username, password, content)
            post_id = server.wp.newPost(blog_id, username, password, post_content)
            if post_id:
                print(f"   [WP] Post Created: ID {post_id}")
                return True
            return False
        except Exception as e:
            print(f"   [WP Post Error] {e}")
            return False