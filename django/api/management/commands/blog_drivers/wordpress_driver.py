# -*- coding: utf-8 -*-
import time, requests, xmlrpc.client
from .base_driver import BaseBlogDriver

class WordPressDriver(BaseBlogDriver):
    def post(self, title, body, image_url=None, categories=None, tags=None):
        conf = self.config
        server = xmlrpc.client.ServerProxy(conf['url'], allow_none=True)
        thumbnail_id = None
        
        # 1. 画像があればアップロードしてIDを取得（アイキャッチ用）
        if image_url:
            try:
                img_res = requests.get(image_url, timeout=20)
                if img_res.status_code == 200:
                    up_res = server.wp.uploadFile(conf['blog_id'], conf['user'], conf['pw'], {
                        'name': f"wp_{int(time.time())}.jpg",
                        'type': 'image/jpeg',
                        'bits': xmlrpc.client.Binary(img_res.content),
                        'overwrite': True
                    })
                    if 'id' in up_res:
                        thumbnail_id = int(up_res['id'])
            except Exception as e:
                print(f"  [WP Image Error] {e}")

        # 2. 本文内の画像プレースホルダーを置換
        img_tag = f'<div style="text-align:center; margin-bottom:20px;"><img src="{image_url}" style="max-width:100%;"></div>' if image_url else ""
        full_body = body.replace('__IMG_TAG_PLACEHOLDER__', img_tag)

        # 3. 投稿データ作成
        post_data = {
            'title': title,
            'description': full_body,
            'post_status': 'publish',
            'categories': categories or ["未分類"],
            'mt_keywords': tags or []
        }
        if thumbnail_id:
            post_data['post_thumbnail'] = thumbnail_id
        
        # 4. 実行
        try:
            server.metaWeblog.newPost(conf['blog_id'], conf['user'], conf['pw'], post_data, True)
            return True
        except Exception as e:
            print(f"  [WP Post Error] {e}")
            return False