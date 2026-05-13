# -*- coding: utf-8 -*-
# /home/maya/dev/shin-vps/django/api/views/__init__.py

import logging

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.reverse import reverse

# ==============================================================================
# 🚀 Import Views
# ==============================================================================

from .auth_views import *
from .general_views import *
from .adult_views import *
from .master_views import *
from .bs_views import *

# ==============================================================================
# 🚀 Content System
# ==============================================================================

from .article_view import ArticleViewSet
from .contenthub_view import ContentHubViewSet

# ==============================================================================
# 🚀 Logger
# ==============================================================================

logger = logging.getLogger(__name__)

# ==============================================================================
# 🚀 API ROOT
# ==============================================================================

@api_view(['GET'])
@permission_classes([AllowAny])
def api_root(request, format=None):
    """
    SHIN CORE LINX
    Semantic API Registry Endpoint

    Responsibilities:
    - API Discovery
    - Multi-Domain Context
    - Semantic Endpoint Registry
    - Frontend Bootstrap
    """

    # ==========================================================================
    # 🚀 Project Identity
    # ==========================================================================

    project_id = getattr(request, 'project_id', 'unknown')

    project_display_names = {

        'bicstation': 'BICSTATION AI LAB (PC/IT)',

        'avflash': 'AVFLASH (Adult Entertainment)',

        'saving': 'BIC-SAVING (Mobile/Life)',

        'tiper': 'TIPER Official',

        'contenthub': 'SHIN-VPS Integrated Content Hub',
    }

    project_name = project_display_names.get(
        project_id,
        'Unknown Project'
    )

    # ==========================================================================
    # 🚀 Safe Reverse Helper
    # ==========================================================================

    def safe_reverse(viewname):

        try:
            return reverse(
                viewname,
                request=request,
                format=format
            )

        except Exception as e:

            logger.warning(
                f"Reverse failed for {viewname}: {e}"
            )

            return None

    # ==========================================================================
    # 🚀 API Response
    # ==========================================================================

    return Response({

        # ======================================================================
        # 🚀 Core Info
        # ======================================================================

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

        # ======================================================================
        # 🚀 Semantic Endpoint Registry
        # ======================================================================

        "endpoints": {

            # ==============================================================
            # 🛠 System
            # ==============================================================

            "system": {

                "status": safe_reverse(
                    'api:status_check'
                ),

                "navigation_floors": safe_reverse(
                    'api:adult:floor_navigation'
                ),

                "taxonomy_index": safe_reverse(
                    'api:adult:taxonomy_index'
                ),
            },

            # ==============================================================
            # 📰 Articles
            # ==============================================================

            "articles": {

                "list_create": safe_reverse(
                    'api:articles:article_list'
                ),

                "bulk_export_done": (

                    f"{safe_reverse('api:articles:article_list')}bulk-export-done/"

                    if safe_reverse('api:articles:article_list')

                    else None
                ),
            },

            # ==============================================================
            # 🧠 Content Hub
            # ==============================================================

            "content_hub": {

                "entries": safe_reverse(
                    'api:contenthub:contenthub-item-list'
                ),

                "ai_ingest": (

                    f"{safe_reverse('api:contenthub:contenthub-item-list')}ai_ingest/"

                    if safe_reverse(
                        'api:contenthub:contenthub-item-list'
                    )

                    else None
                ),
            },

            # ==============================================================
            # 💰 Bic Saving
            # ==============================================================

            "bic_saving": {

                "devices": safe_reverse(
                    'api:bs:device-list'
                ),

                "plans": safe_reverse(
                    'api:bs:plan-list'
                ),

                "carriers": safe_reverse(
                    'api:bs:carrier-list'
                ),
            },

            # ==============================================================
            # 👤 Authentication
            # ==============================================================

            "auth": {

                "login": safe_reverse(
                    'api:auth:login'
                ),

                "logout": safe_reverse(
                    'api:auth:logout'
                ),

                "register": safe_reverse(
                    'api:auth:register'
                ),

                "user_me": safe_reverse(
                    'api:auth:me'
                ),
            },

            # ==============================================================
            # 🛍 Products
            # ==============================================================

            "products": {

                "unified_adult_products": safe_reverse(
                    'api:adult:unified_products'
                ),

                "pc_products_list": safe_reverse(
                    'api:general:pc_product_list'
                ),

                "pc_ranking": safe_reverse(
                    'api:general:pc_product_ranking'
                ),

                "linkshare": safe_reverse(
                    'api:linkshare:product_list'
                ),
            },

            # ==============================================================
            # 🧬 Master Data
            # ==============================================================

            "masters": {

                "actresses": safe_reverse(
                    'api:adult:actress_list'
                ),

                "genres": safe_reverse(
                    'api:adult:genre_list'
                ),

                "makers": safe_reverse(
                    'api:adult:maker_list'
                ),

                "labels": safe_reverse(
                    'api:master:label_list'
                ),
            }
        }
    })


# ==============================================================================
# 🚀 Health Check
# ==============================================================================

@api_view(['GET'])
@permission_classes([AllowAny])
def status_check(request):
    """
    Health Check Endpoint
    """

    project_id = getattr(
        request,
        'project_id',
        'unknown'
    )

    return Response({

        "status": "API is running",

        "identified_project": project_id,

        "secure": request.is_secure(),

        "host": request.get_host(),

    }, status=200)