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
    # 🚀 ミドルウェアで設定した project_id を取得 (デフォルトは unknown)
    project_id = getattr(request, 'project_id', 'unknown')
    
    # 💡 判定されたプロジェクトに基づき、人間が読みやすい名前をセット
    project_display_names = {
        'bicstation': 'BICSTATION AI LAB (PC/IT)',
        'avflash': 'AVFLASH (Adult Entertainment)',
        'saving': 'BIC-SAVING (Mobile/Life)',
        'tiper': 'TIPER Official',
    }
    project_name = project_display_names.get(project_id, 'Unknown Project')

    # 🔗 逆引き失敗による Internal Server Error を防ぐ補助関数
    def safe_reverse(viewname):
        try:
            return reverse(viewname, request=request, format=format)
        except Exception as e:
            logger.warning(f"Reverse failed for {viewname}: {e}")
            return None

    # 🛠️ プロジェクトに応じたエンドポイントの構築
    # ※ 将来的にはここで project_id に応じて表示する項目を制限することも可能です。
    
    return Response({
        "message": "Welcome to Tiper API v1 (Multi-Domain Unified Version)",
        "context": {
            "identified_project": project_id,
            "project_display_name": project_name,
            "request_info": {
                "host": request.get_host(),
                "method": request.method,
                "is_secure": request.is_secure(),
            }
        },
        "endpoints": {
            "system": {
                "status": safe_reverse('api:status_check'),
                "navigation_floors": safe_reverse('api:adult:floor_navigation'),
                "taxonomy_index": safe_reverse('api:adult:taxonomy_index'),
            },
            # 🆕 統合配信コンテンツ (各ドメインでフィルタリングされる)
            "articles": {
                "list_create": safe_reverse('api:article-list'),
                "bulk_export_done": f"{safe_reverse('api:article-list')}bulk-export-done/" if safe_reverse('api:article-list') else None,
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
            },
            "products": {
                # ⚠️ 注意: bicstationからアクセスしてもURL自体は見えますが、
                # View側でガードをかければデータは空になります。
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
            }
        }
    })

@api_view(['GET'])
@permission_classes([AllowAny])
def status_check(request):
    """稼働確認・ヘルスチェック用"""
    project_id = getattr(request, 'project_id', 'unknown')
    return Response({
        "status": "API is running",
        "identified_project": project_id,
        "secure": request.is_secure(),
        "host": request.get_host(),
    }, status=200)