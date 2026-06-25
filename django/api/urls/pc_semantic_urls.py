# -*- coding: utf-8 -*-
# /home/maya/shin-dev/shin-vps/django/api/urls/pc_semantic_urls.py

from django.urls import path

# ==========================================================
# Semantic Runtime
# ==========================================================

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

from api.views.pc_product_view import (
    semantic_discovery_runtime,
    semantic_shelves,
)

from api.views.pc_stats_view import (
    pc_sidebar_stats,
)

app_name = "pc_semantic"

urlpatterns = [

    # ==========================================================
    # Semantic Grouped Attributes
    # ==========================================================

    path(
        "semantic/grouped-attributes/",
        pc_sidebar_stats,
        name="semantic_grouped_attributes",
    ),

    # ==========================================================
    # Semantic Discovery Runtime
    # ==========================================================

    path(
        "semantic/discovery/",
        semantic_discovery_runtime,
        name="semantic_discovery_runtime",
    ),

    # ==========================================================
    # Semantic Shelves
    # ==========================================================

    path(
        "semantic/shelves/",
        semantic_shelves,
        name="semantic_shelves",
    ),

    # ==========================================================
    # Semantic Finder V2
    # ==========================================================

    path(
        "semantic/finder/",
        semantic_finder_v2,
        name="semantic_finder_v2",
    ),

    # ==========================================================
    # Semantic Ranking V2
    # ==========================================================

    path(
        "semantic/ranking/<slug:group_slug>/",
        semantic_ranking_v2,
        name="semantic_ranking_v2",
    ),

    # ==========================================================
    # Semantic Product Detail V2
    # ==========================================================

    path(
        "semantic/product/<slug:unique_id>/",
        semantic_product_detail_v2,
        name="semantic_product_detail_v2",
    ),

    # ==========================================================
    # Semantic Related V2
    # ==========================================================

    path(
        "semantic/product/<slug:unique_id>/related/",
        semantic_related_v2,
        name="semantic_related_v2",
    ),
]