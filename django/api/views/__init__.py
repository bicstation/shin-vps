# -*- coding: utf-8 -*-
import logging
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

# 💡 分割・再編成した各モジュールからインポート（master_viewsは不要になったため削除）
from .auth_views import *
from .general_views import *
from .adult_views import *

# ロガーの設定（サーバー側のターミナルに動作状況を出力するため）
logger = logging.getLogger(__name__)

@api_view(['GET'])
@permission_classes([AllowAny])
def api_root(request):
    """
    API全体のマップを返す（ブラウザでの確認用エンドポイント）
    ミドルウェアによる判定結果（サイト種別）をメタ情報として追加。
    """
    site_type = getattr(request, 'site_type', 'unknown')
    site_name = getattr(request, 'site_name', 'Unknown Site')

    return Response({
        "message": "Welcome to Tiper API Gateway",
        "context": {
            "identified_site": site_type,
            "identified_name": site_name,
            "request_info": {
                "host": request.get_host(),
                "method": request.method,
            }
        },
        "endpoints": {
            "status": "/api/status/",
            "auth": {
                "login": "/api/auth/login/",
                "logout": "/api/auth/logout/",
                "register": "/api/auth/register/",
                "user": "/api/auth/me/"
            },
            "products": {
                "pc_products_list": "/api/pc-products/", 
                "pc_ranking": "/api/pc-products/ranking/",
                "pc_product_makers": "/api/pc-makers/",
                "pc_sidebar_stats": "/api/pc-sidebar-stats/",
                "pc_product_detail": "/api/pc-products/{unique_id}/", 
                "pc_price_history": "/api/pc-products/{unique_id}/price-history/",
                "adult_products_list": "/api/adults/",
                "unified_adult_products": "/api/unified-adult-products/",  # 💡 [新設] 統合エンドポイント
                "linkshare_products_list": "/api/linkshare/",
                "adult_product_detail": "/api/adults/{product_id_unique}/",
                "fanza_product_detail": "/api/fanza/{unique_id}/", # 💡 [追加] FANZA詳細
                "linkshare_product_detail": "/api/linkshare/{sku}/"
            },
            "masters": {
                "actresses": "/api/actresses/",
                "genres": "/api/genres/",
                "makers": "/api/makers/",
                "labels": "/api/labels/",
                "directors": "/api/directors/",
                "series": "/api/series/",
                "authors": "/api/authors/"
            }
        }
    })

@api_view(['GET'])
@permission_classes([AllowAny])
def status_check(request):
    """
    稼働確認用エンドポイント。
    フロントエンド(Next.js)のF12コンソールでデバッグ情報を確認するために維持。
    """
    # ミドルウェアによる識別
    site_type = getattr(request, 'site_type', 'unknown')
    site_name = getattr(request, 'site_name', 'Unknown')

    # 💡 通信トラブル解決に必要な情報を集約したデバッグ用ペイロード
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

    # サーバー側のターミナルにも状況を表示
    logger.info(f"--- API Status Check: {site_name} ({site_type}) ---")

    return Response({
        "status": "API is running",
        "identified_site": site_type,
        "identified_name": site_name,
        "environment": "secure" if request.is_secure() else "standard",
        "detail": f"This request is processed as {site_name} configuration.",
        # Next.js側の console.log(response.data.tiper_debug) で出力して使用
        "tiper_debug": debug_payload 
    }, status=200)