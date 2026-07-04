# -*- coding: utf-8 -*-
# /home/maya/shin-dev/shin-vps/django/api/urls/pc_urls.py

from django.urls import path

print("🔥 PC URLS LOADED")

from api.views.discover_v2_view import ( semantic_discover_v2, )
from api.views.finder_v2_view import ( semantic_finder_v2, )
from api.views.ranking_v2_view import ( semantic_ranking_v2, )
from api.views.ranking_universe_v2_view import ( semantic_ranking_universe_v2, )
from api.views.product_detail_v2_view import ( semantic_product_detail_v2, )
from api.views.related_v2_view import ( semantic_related_v2, )
from api.views.top_v2_view import ( semantic_top_v2,)
from api.views import ( semantic_discover_detail_v2, )
from api.views.product_list_v2_view import ( semantic_product_list_v2, )
from api.views.topology_v2_view import ( topology_runtime_v2, )
from api.views.navigation_v2_view import ( navigation_v2, )
from api.views.sidebar_v2_view import ( sidebar_v2, )
from api.views.discover_universe_v2_view import ( discover_universe_v2,)
from api.views.intent_v1_view import (semantic_intent_v1,)

# =====================================================
# LEGACY COMPATIBILITY TEST
# =====================================================

from api.views.general_views import ( PCProductListAPIView,)
from api.views.pc_product_view import (pc_product_detail,get_related_pc_products,)
from api.views.finder_v2_view import ( semantic_finder_v2,)
from api.views.pc_product_view import ( semantic_discovery_runtime, semantic_shelves,semantic_workflow_runtime,)
from api.views.general_views import ( PCProductRankingView,)
from api.views.pc_stats_view import ( pc_sidebar_stats,)
from api.views.finder_views import ( SemanticFinderView )


app_name = "pc"

urlpatterns = [

    # ======================================================
    # legacy_product_list
    # ======================================================
    
    
    path(
        "legacy/products/",
        PCProductListAPIView.as_view(),
        name="legacy_product_list",
    ),
    
    path(
        "legacy/products/<str:unique_id>/",
        pc_product_detail,
        name="legacy_product_detail",
    ),
    
    path(
        "legacy/products/<str:unique_id>/related/",
        get_related_pc_products,
        name="legacy_related_pc_products",
    ),
    
    path(
        "legacy/discover/",
        semantic_discovery_runtime,
        name="legacy_discovery",
    ),
    
    path(
        "legacy/pc-products/ranking/",
        PCProductRankingView.as_view(),
        name="pc_product_ranking",
    ),

    path(
        "legacy/pc-products/ranking/<slug:slug>/",
        PCProductRankingView.as_view(),
        name="pc_product_ranking_slug",
    ),
    
    path(
        "legacy/ranking/",
        PCProductRankingView.as_view(),
        name="legacy_ranking",
    ),

    path(
        "legacy/ranking/<slug:slug>/",
        PCProductRankingView.as_view(),
        name="legacy_ranking_slug",
    ),
    
    
    path(
        "legacy/pc-sidebar-stats/",
        pc_sidebar_stats,
        name="pc_sidebar_stats",
    ),

    # ==========================================================
    # Semantic Grouped Attributes
    # Canonical Semantic Ontology Authority
    # ==========================================================

    path(
        "legacy/semantic/grouped-attributes/",
        pc_sidebar_stats,
        name="semantic_grouped_attributes",
    ),
    
    path(
        "legacy/finder/",
        SemanticFinderView.as_view(),
        name="semantic_finder",
    ),


    path(
        "legacy/semantic/finder/",
        semantic_finder_v2,
        name="semantic_finder_v2",
    ),
    
    # ======================================================
    # TOP
    # ======================================================

    path(
        "top/",
        semantic_top_v2,
        name="semantic_top_v2",
    ),

    # ======================================================
    # TSV Topology
    # ======================================================


    path(
        "topology/",
        topology_runtime_v2,
        name="topology",
    ),


    path(
        "navigation/",
        navigation_v2,
        name="navigation",
    ),
    
    path(
        "sidebar/",
        sidebar_v2,
        name="sidebar",
    ),
    
    
    # ======================================================
    # SEMANTIC UNIVERSE
    # ======================================================

    # Legacy endpoint
    #
    # Discover Universe 構想時代のURL。
    # 既存Frontend互換維持のため残す。
    #
    # New integrations SHOULD use:
    # /api/pc/semantics/
    #
    path(
        "discover-universe/",
        discover_universe_v2,
        name="discover_universe",
    ),

    # Semantic Authority Runtime Endpoint
    #
    # Universe / Group / Attribute を含む
    # Semantic Topology Gateway。
    #
    # Preferred endpoint.
    #
    path(
        "semantics/",
        discover_universe_v2,
        name="semantics",
    ),

    
    path(
        "intent/",
        semantic_intent_v1,
    ),

    # =====================================================
    # DISCOVER
    # =====================================================

    path(
        "discover/",
        semantic_discover_v2,
        name="discover",
    ),

    path(
        "discover/<slug:group_slug>/",
        semantic_discover_detail_v2,
    ),

    # =====================================================
    # FINDER
    # =====================================================

    path(
        "finder/",
        semantic_finder_v2,
        name="finder",
    ),

    # =====================================================
    # RANKING
    # =====================================================
    
    path(
        "ranking-universe/",
        semantic_ranking_universe_v2,
        name="ranking_universe",
    ),

    path(
        "ranking/<slug:group_slug>/",
        semantic_ranking_v2,
        name="ranking",
    ),
   
    # =====================================================
    # PRODUCTS
    # =====================================================

    path(
        "products/",
        semantic_product_list_v2,
        name="product_list",
    ),

    path(
        "products/<slug:unique_id>/",
        semantic_product_detail_v2,
        name="product_detail",
    ),

    path(
        "products/<slug:unique_id>/related/",
        semantic_related_v2,
        name="related",
    ),

]