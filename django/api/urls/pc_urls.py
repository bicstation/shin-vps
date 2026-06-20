# -*- coding: utf-8 -*-
# /home/maya/shin-dev/shin-vps/django/api/urls/pc_urls.py

from django.urls import path

from api.views.discover_v2_view import ( semantic_discover_v2, )
from api.views.finder_v2_view import ( semantic_finder_v2, )
from api.views.ranking_v2_view import ( semantic_ranking_v2, )
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

app_name = "pc"

urlpatterns = [
    
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