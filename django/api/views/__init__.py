# -*- coding: utf-8 -*-
# /home/maya/dev/shin-vps/django/api/views.py

import logging
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.reverse import reverse

# 💡 分割・再編成した各モジュールからインポート
# ⚠️ 各 .py ファイル内にクラスや関数が定義されている必要があります
from .auth_views import *
from .general_views import *
from .adult_views import *

# ロガーの設定（サーバー側のターミナルに動作状況を出力するため）
logger = logging.getLogger(__name__)

@api_view(['GET'])
@permission_classes([AllowAny])
def api_root(request, format=None):
    """
    API全体のマップを返す（ブラウザでの確認用エンドポイント）
    プロジェクト親の api_root とは別に、アプリ内部の詳細マップを提供します。
    """
    site_type = getattr(request, 'site_type', 'unknown')
    site_name = getattr(request, 'site_name', 'Unknown Site')

    return Response({
        "message": "Welcome to Tiper API v1",
        "context": {
            "identified_site": site_type,
            "identified_name": site_name,
            "request_info": {
                "host": request.get_host(),
                "method": request.method,
            }
        },
        "endpoints": {
            "system": {
                "status": reverse('api:status_check', request=request, format=format),
                "navigation_floors": reverse('api:floor_navigation', request=request, format=format),
                "taxonomy_index": reverse('api:adult_taxonomy_index', request=request, format=format),
            },
            "auth": {
                "login": reverse('api:api_login', request=request, format=format),
                "logout": reverse('api:api_logout', request=request, format=format),
                "register": reverse('api:api_register', request=request, format=format),
                "user_me": reverse('api:api_user_me', request=request, format=format),
            },
            "products": {
                "unified_adult_products": reverse('api:unified_adult_products', request=request, format=format),
                "adult_products_list": reverse('api:adult_product_list', request=request, format=format),
                "fanza_products_list": reverse('api:fanza_product_list', request=request, format=format),
                "pc_products_list": reverse('api:pc_product_list', request=request, format=format),
                "pc_ranking": reverse('api:pc_product_ranking', request=request, format=format),
                "linkshare_products_list": reverse('api:linkshare_product_list', request=request, format=format),
            },
            "masters": {
                "actresses": reverse('api:actress_list', request=request, format=format),
                "genres": reverse('api:genre_list', request=request, format=format),
                "makers": reverse('api:maker_list', request=request, format=format),
                "labels": reverse('api:label_list', request=request, format=format),
                "directors": reverse('api:director_list', request=request, format=format),
                "series": reverse('api:series_list', request=request, format=format),
                "authors": reverse('api:author_list', request=request, format=format),
            }
        }
    })

@api_view(['GET'])
@permission_classes([AllowAny])
def status_check(request):
    """
    稼働確認用エンドポイント。
    フロントエンド(Next.js)のデバッグ情報を確認するために維持。
    """
    site_type = getattr(request, 'site_type', 'unknown')
    site_name = getattr(request, 'site_name', 'Unknown')

    debug_payload = {
        "client_ip": request.META.get('REMOTE_ADDR'),
        "http_host": request.get_host(),
        "user_agent": request.META.get('HTTP_USER_AGENT')[:100] if request.META.get('HTTP_USER_AGENT') else None,
        "query_params": request.GET,
        "is_secure": request.is_secure(),
        "middleware_context": {
            "site_type": site_type,
            "site_name": site_name
        }
    }

    logger.info(f"--- API Status Check: {site_name} ({site_type}) ---")

    return Response({
        "status": "API is running",
        "identified_site": site_type,
        "identified_name": site_name,
        "environment": "secure" if request.is_secure() else "standard",
        "detail": f"This request is processed as {site_name} configuration.",
        "tiper_debug": debug_payload 
    }, status=200)