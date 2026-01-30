# -*- coding: utf-8 -*-
# /home/maya/dev/shin-vps/django/api/middleware.py

import logging

logger = logging.getLogger(__name__)

class DomainDiscoveryMiddleware:
    """
    リクエストのホスト名からドメインを判別し、requestオブジェクトに属性を付与する
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # ホスト名を取得 (例: bic-saving.com, localhost:8000)
        host = request.get_host().split(':')[0].lower()
        
        # ドメイン識別ロジック
        if 'bic-saving' in host:
            request.site_type = 'saving'
            request.site_name = 'Bic Saving'
        elif 'bicstation' in host:
            request.site_type = 'station'
            request.site_name = 'Bic Station'
        elif 'tiper' in host or 'avflash' in host:
            request.site_type = 'adult'
            request.site_name = 'Adult Portal'
        else:
            # 開発環境（localhost等）や不明なドメインの場合のデフォルト
            request.site_type = 'general'
            request.site_name = 'Default Station'

        # ログに判別結果を出す（開発・デバッグ用）
        # logger.debug(f"Domain: {host} identified as {request.site_type}")

        response = self.get_response(request)
        return response