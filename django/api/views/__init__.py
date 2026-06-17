# -*- coding: utf-8 -*-
# /home/maya/shin-dev/shin-vps/django/api/views/__init__.py

import logging

from rest_framework.decorators import (
    api_view,
    permission_classes,
)

from rest_framework.permissions import (
    AllowAny,
)

from rest_framework.response import (
    Response,
)

# ==========================================================
# LEGACY / MULTI DOMAIN
# ==========================================================

from .auth_views import *
from .adult_views import *
from .master_views import *
from .bs_views import *

# ==========================================================
# PC SEMANTIC V2
# ==========================================================

from .finder_v2_view import *
from .ranking_v2_view import *
from .related_v2_view import *
from .product_detail_v2_view import *
from .discover_v2_view import *

# ==========================================================
# TSV TOPOLOGY V2
# ==========================================================

from .topology_v2_view import *

# ==========================================================
# NAVIGATION V2
# ==========================================================

from .navigation_v2_view import *

# ==========================================================
# SIDEBAR V2
# ==========================================================

from .sidebar_v2_view import *

# ==========================================================
# DISCOVER UNIVERSE V2
# ==========================================================

from .discover_universe_v2_view import *

# ==========================================================
# CONTENT
# ==========================================================

from .article_view import (
    ArticleViewSet,
)

from .contenthub_view import (
    ContentHubViewSet,
)

# ==========================================================
# LOGGER
# ==========================================================

logger = logging.getLogger(
    __name__
)

# ==========================================================
# API ROOT
# ==========================================================

@api_view(["GET"])
@permission_classes([AllowAny])
def api_root(request):

    return Response({

        "service":
            "SHIN CORE LINX",

        "runtime":
            "api_registry_v2",

        "pc": {

            "discovery":
                "/api/pc/discovery",

            "finder":
                "/api/pc/finder",

            "ranking":
                "/api/pc/ranking/<group_slug>",
            
            "inventory":
                "/api/pc/products",

            "product":
                "/api/pc/products/<unique_id>",

            "related":
                "/api/pc/products/<unique_id>/related",
        },

        "adult": {

            "enabled":
                True,
        },

        "ready":
            True,
    })

# ==========================================================
# HEALTH CHECK
# ==========================================================

@api_view(["GET"])
@permission_classes([AllowAny])
def status_check(request):

    return Response({

        "status":
            "ok",

        "service":
            "SHIN CORE LINX",

        "ready":
            True,
    })