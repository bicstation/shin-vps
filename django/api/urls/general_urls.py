# -*- coding: utf-8 -*-
# /home/maya/dev/shin-vps/django/api/urls/general_urls.py

from django.urls import path
from api.views import general_views

# ==========================================================
# Sidebar Stats
# ==========================================================

from api.views.pc_stats_view import (
    pc_sidebar_stats
)

# ==========================================================
# General Views
# ==========================================================


from api.views.general_views import (

    PCProductRankingView,
    PCProductListAPIView,
)

from api.views.pc_product_view import (

    pc_product_detail,
    get_related_pc_products,
    semantic_discovery_runtime,
    semantic_shelves,
    semantic_workflow_runtime,
)

# ==========================================================
# Semantic Finder
# ==========================================================

from api.views.finder_views import (
    SemanticFinderView
)

from api.views.finder_v2_view import (
    semantic_finder_v2,
)

from api.views.ranking_v2_view import (
    semantic_ranking_v2,
)

from api.views.product_detail_v2_view import (
    semantic_product_detail_v2,
)

from api.views.related_v2_view import (
    semantic_related_v2,
)

# ==============================================================================
# 🚀 APP NAMESPACE
# ==============================================================================

app_name = "general"


# ==============================================================================
# URL PATTERNS
# ==============================================================================

urlpatterns = [

    # ==========================================================================
    # 🧠 Semantic Finder
    # ==========================================================================

    path(
        "finder/",
        SemanticFinderView.as_view(),
        name="semantic_finder",
    ),


    path(
        "semantic/finder/",
        semantic_finder_v2,
        name="semantic_finder_v2",
    ),


    # ==========================================================================
    # 🧠 Semantic Grouped Attributes
    # Canonical Semantic Ontology Authority
    # ==========================================================================

    path(
        "semantic/grouped-attributes/",
        pc_sidebar_stats,
        name="semantic_grouped_attributes",
    ),

    # ==========================================================================
    # 🚀 Semantic Discovery Runtime
    # Cinematic Exploration Runtime
    # ==========================================================================

    path(
        "semantic/discovery/",
        semantic_discovery_runtime,
        name="semantic_discovery_runtime",
    ),

    # ==========================================================================
    # 🎬 Semantic Shelves Runtime
    # ==========================================================================

    path(
        "semantic/shelves/",
        semantic_shelves,
        name="semantic_shelves",
    ),

    # ==========================================================================
    # 🏆 PC Ranking
    # ==========================================================================

    path(
        "pc-products/ranking/",
        general_views.PCProductRankingView.as_view(),
        name="pc_product_ranking",
    ),

    path(
        "pc-products/ranking/<slug:slug>/",
        general_views.PCProductRankingView.as_view(),
        name="pc_product_ranking_slug",
    ),

    path(
        "semantic/ranking/<slug:group_slug>/",
        semantic_ranking_v2,
        name="semantic_ranking_v2",
    ),

    # ==========================================================================
    # 📦 PC Product List
    # ==========================================================================

    path(
        "pc-products/",
        general_views.PCProductListAPIView.as_view(),
        name="pc_product_list",
    ),

    # ==========================================================================
    # 🔗 Semantic Related Runtime
    # IMPORTANT:
    # Must be above detail route
    # ==========================================================================

    path(
        "pc-products/<str:unique_id>/related/",
        get_related_pc_products,
        name="related_pc_products",
    ),
    path(
        "semantic/product/<slug:unique_id>/related/",
        semantic_related_v2,
        name="semantic_related_v2",
    ),
    # ==========================================================================
    # 📄 Product Detail Runtime
    # IMPORTANT:
    # Keep LAST to avoid URL collision
    # ==========================================================================

    path(
        "pc-products/<str:unique_id>/",
        pc_product_detail,
        name="pc_product_detail",
    ),
    
    path(
        "semantic/product/<slug:unique_id>/",
        semantic_product_detail_v2,
        name="semantic_product_detail_v2",
    ),

    # ==========================================================================
    # 📊 Sidebar Stats
    # Legacy Helper Runtime
    # ==========================================================================

    path(
        "pc-sidebar-stats/",
        pc_sidebar_stats,
        name="pc_sidebar_stats",
    ),
    
    # ==============================================================================
    # 🌌 Workflow Runtime
    # ==============================================================================

    path(
        "discover/<slug:workflow_slug>/",
        semantic_workflow_runtime,
        name="semantic_workflow_runtime",
    ),
]


