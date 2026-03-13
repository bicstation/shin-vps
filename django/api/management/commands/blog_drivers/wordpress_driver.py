# -*- coding: utf-8 -*-
import time
import requests
import xmlrpc.client
from .base_driver import BaseBlogDriver

class WordPressDriver(BaseBlogDriver):
    """
    WordPress XML-RPC APIを使用した投稿ドライバー
    """
    def post(self, title, body, image_url=None, categories=None, tags=None, **kwargs):
        """
        WordPressに記事を投稿する
        :param kwargs: source_url など、他のドライバーで使用される追加引数を安全に受け取るための可変長引数
        """
        conf = self.config
        # 接続先サーバー設定
        try:
            server = xmlrpc.client.ServerProxy(conf['url'], allow_none=True)
        except Exception as e:
            print(f"  [WP Connection Error] {e}")
            return False

        thumbnail_id = None
        
        # 1. 画像があればアップロードしてIDを取得（アイキャッチ用）
        if image_url:
            try:
                img_res = requests.get(image_url, timeout=20)
                if img_res.status_code == 200:
                    # WordPressへバイナリデータを送信
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
        # もし本文に画像を入れたい場合は、__IMG_TAG_PLACEHOLDER__ を本文中に含めておくと置換されます
        img_tag = f'<div style="text-align:center; margin-bottom:20px;"><img src="{image_url}" style="max-width:100%;"></div>' if image_url else ""
        full_body = body.replace('__IMG_TAG_PLACEHOLDER__', img_tag)

        # (オプション) もし source_url を記事の最後にリンクとして載せたい場合は以下を有効にしてください
        # source_url = kwargs.get('source_url')
        # if source_url:
        #     full_body += f'\n\n<p>引用元: <a href="{source_url}" target="_blank">{source_url}</a></p>'

        # 3. 投稿データ作成 (MetaWeblog API 形式)
        post_data = {
            'title': title,
            'description': full_body,
            'post_status': 'publish',
            'categories': categories or ["未分類"],
            'mt_keywords': tags or [] # タグとして機能します
        }
        
        # アイキャッチ画像の設定
        if thumbnail_id:
            post_data['post_thumbnail'] = thumbnail_id
        
        # 4. 投稿の実行
        try:
            # newPost(blog_id, user, pw, content, publish_true)
            server.metaWeblog.newPost(conf['blog_id'], conf['user'], conf['pw'], post_data, True)
            return True
        except Exception as e:
            print(f"  [WP Post Error] {e}")
            return False