# -*- coding: utf-8 -*-
import xmlrpc.client
import requests
import os
import mimetypes
from .base_driver import BaseBlogDriver

class SeesaaDriver(BaseBlogDriver):
    def post(self, title, body, image_url=None, source_url=None, product_info=None, summary=""):
        try:
            s = xmlrpc.client.ServerProxy(self.config['rpc_url'])
            
            # 1. 画像がある場合はSeesaaのファイルマネージャーにアップロード
            uploaded_image_url = image_url
            if image_url:
                uploaded_image_url = self._upload_image_to_seesaa(s, image_url)
            
            # 2. アップロード後のURLを使用してコンテンツをラップ
            # これにより、Seesaaドメインの画像が本文先頭（アイキャッチ位置）に配置されます
            full_body = self.wrap_content(body, uploaded_image_url, source_url, product_info, summary)
            
            # 3. 記事投稿
            s.metaWeblog.newPost(
                self.config['blog_id'], 
                self.config['user'], 
                self.config['pw'], 
                {'title': title, 'description': full_body}, 
                True
            )
            return True
        except Exception as e:
            print(f"❌ Seesaa投稿エラー: {str(e)}")
            return False

    def _upload_image_to_seesaa(self, server_proxy, image_url):
        """画像をダウンロードし、Seesaaのファイルマネージャーにアップロードする"""
        try:
            # 画像を一時的にダウンロード
            headers = {'User-Agent': 'Mozilla/5.0'}
            res = requests.get(image_url, timeout=10, headers=headers)
            if res.status_code != 200:
                return image_url # 失敗時は元のURLを返す
            
            # ファイル名とMIMEタイプを特定
            filename = os.path.basename(image_url).split('?')[0]
            if not filename:
                filename = "eye_catch.jpg"
            
            mime_type = mimetypes.guess_type(filename)[0] or 'image/jpeg'
            
            # XML-RPC用のデータ構造を作成
            media_object = {
                'name': filename,
                'type': mime_type,
                'bits': xmlrpc.client.Binary(res.content)
            }
            
            # 4. metaWeblog.newMediaObject でアップロード
            result = server_proxy.metaWeblog.newMediaObject(
                self.config['blog_id'],
                self.config['user'],
                self.config['pw'],
                media_object
            )
            
            # Seesaaから割り当てられたURLを返す
            return result.get('url', image_url)
            
        except Exception as e:
            print(f"⚠️ 画像アップロード失敗: {str(e)}")
            return image_url # 失敗時は直リンクでフォールバック