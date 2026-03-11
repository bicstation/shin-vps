# -*- coding: utf-8 -*-
import xmlrpc.client
from .base_driver import BaseBlogDriver

class FC2Driver(BaseBlogDriver):
    def post(self, title, body, image_url=None, categories=None, tags=None):
        conf = self.config
        server = xmlrpc.client.ServerProxy(conf['url'], allow_none=True)
        
        # FC2は画像アップロードのXML-RPC仕様が特殊なため、
        # 本文に直接画像タグを埋め込むスタイルを採用します
        img_tag = f'<div style="text-align:center; margin-bottom:20px;"><img src="{image_url}" style="max-width:100%;"></div>' if image_url else ""
        full_body = body.replace('__IMG_TAG_PLACEHOLDER__', img_tag)

        post_data = {
            'title': title,
            'description': full_body,
            'post_status': 'publish',
            'categories': categories or ["Blog"],
            'mt_keywords': tags or []
        }
        
        try:
            # FC2用のXML-RPCメソッド呼び出し
            server.metaWeblog.newPost(conf['blog_id'], conf['user'], conf['pw'], post_data, True)
            return True
        except Exception as e:
            print(f"  [FC2 Post Error] {e}")
            return False