# -*- coding: utf-8 -*-
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

# 各モジュールからインポート（分割したViewを統合）
from .auth_views import *
from .general_views import *
from .adult_views import *
from .master_views import *

@api_view(['GET'])
@permission_classes([AllowAny])
def api_root(request):
    """
    API全体のマップを返す（ブラウザでの確認用）
    ミドルウェアによる判定結果をメタ情報として追加
    """
    return Response({
        "message": "Welcome to Tiper API Gateway",
        "context": {
            "identified_site": getattr(request, 'site_type', 'unknown'),
            "identified_name": getattr(request, 'site_name', 'Unknown Site'),
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
                "linkshare_products_list": "/api/linkshare/",
                "adult_product_detail": "/api/adults/{product_id_unique}/",
                "linkshare_product_detail": "/api/linkshare/{sku}/"
            },
            "masters": {
                "actresses": "/api/actresses/",
                "genres": "/api/genres/",
                "makers": "/api/makers/",
                "labels": "/api/labels/",
                "directors": "/api/directors/",
                "series": "/api/series/"
            }
        }
    })

@api_view(['GET'])
@permission_classes([AllowAny])
def status_check(request):
    """
    稼働確認用エンドポイント
    ミドルウェアが正しくドメインを識別できているか確認するための項目を追加
    """
    # ミドルウェアが未適用の場合を考慮し getattr を使用
    site_type = getattr(request, 'site_type', 'unknown')
    site_name = getattr(request, 'site_name', 'Unknown')

    return Response({
        "status": "API is running",
        "identified_site": site_type,
        "identified_name": site_name,
        "environment": "production" if not request.is_secure() else "secure",
        "detail": f"This request is processed as {site_name} configuration."
    }, status=200)