# -*- coding: utf-8 -*-
# api/views/__init__.py

import logging
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.reverse import reverse

# 各専門ビューからすべてをインポート
from .auth_views import *
from .general_views import *
from .adult_views import *
from .master_views import *
from .bs_views import *
# ==============================================================================
# 🆕 統合コンテンツ管理（Article）の追加
# ==============================================================================
from .article_view import ArticleViewSet

logger = logging.getLogger(__name__)

@api_view(['GET'])
@permission_classes([AllowAny])
def api_root(request, format=None):
    """
    API全体のマップを返す。
    Next.jsなどのフロントエンドから最初に叩かれるエンドポイント。
    """
    site_type = getattr(request, 'site_type', 'unknown')
    site_name = getattr(request, 'site_name', 'Unknown Site')

    # 🔗 逆引き失敗による Internal Server Error を防ぐ補助関数
    def safe_reverse(viewname):
        try:
            return reverse(viewname, request=request, format=format)
        except Exception as e:
            logger.warning(f"Reverse failed for {viewname}: {e}")
            return None

    return Response({
        "message": "Welcome to Tiper API v1 (Unified Version)",
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
                "status": safe_reverse('api:status_check'),
                "navigation_floors": safe_reverse('api:adult:floor_navigation'),
                "taxonomy_index": safe_reverse('api:adult:taxonomy_index'),
            },
            # 🆕 4サイト統合配信コンテンツ
            "articles": {
                "list_create": safe_reverse('api:article-list'),  # urls.pyのbasenameが 'article' の場合
                "bulk_export_done": f"{safe_reverse('api:article-list')}bulk-export-done/",
            },
            "bic_saving": {
                "devices": safe_reverse('api:bs:device-list'),
                "plans": safe_reverse('api:bs:plan-list'),
                "carriers": safe_reverse('api:bs:carrier-list'),
            },            
            "auth": {
                "login": safe_reverse('api:auth:login'),
                "logout": safe_reverse('api:auth:logout'),
                "register": safe_reverse('api:auth:register'),
                "user_me": safe_reverse('api:auth:user_me'),
                "user_detail": safe_reverse('api:auth:user_detail'),
            },
            "products": {
                "unified_adult_products": safe_reverse('api:adult:unified_products'),
                "pc_products_list": safe_reverse('api:pc_product_list'),
                "pc_ranking": safe_reverse('api:pc_product_ranking'),
                "linkshare": safe_reverse('api:linkshare_product_list'),
            },
            "masters": {
                "actresses": safe_reverse('api:adult:actress_list'),
                "genres": safe_reverse('api:adult:genre_list'),
                "makers": safe_reverse('api:adult:maker_list'),
                "labels": safe_reverse('api:label_list'),
                "directors": safe_reverse('api:director_list'),
                "series": safe_reverse('api:series_list'),
                "authors": safe_reverse('api:author_list'),
            }
        }
    })

@api_view(['GET'])
@permission_classes([AllowAny])
def status_check(request):
    """稼働確認・ヘルスチェック用"""
    site_type = getattr(request, 'site_type', 'unknown')
    return Response({
        "status": "API is running",
        "identified_site": site_type,
        "secure": request.is_secure(),
    }, status=200)