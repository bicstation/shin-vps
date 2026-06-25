# -*- coding: utf-8 -*-
# /home/maya/shin-dev/shin-vps/django/api/urls/pc_ranking_urls.py

from django.urls import path

# ==========================================================
# Legacy Ranking
# ==========================================================

from api.views.general_views import (
    PCProductRankingView,
)

# ==========================================================
# Semantic Ranking V2
# ==========================================================

from api.views.ranking_v2_view import (
    semantic_ranking_v2,
)

app_name = "pc_ranking"

urlpatterns = [

    # ==========================================================
    # RANKING (Legacy)
    # ==========================================================

    path(
        "pc-products/ranking/",
        PCProductRankingView.as_view(),
        name="pc_product_ranking",
    ),

    path(
        "pc-products/ranking/<slug:slug>/",
        PCProductRankingView.as_view(),
        name="pc_product_ranking_slug",
    ),

    # ==========================================================
    # RANKING (V2)
    # ==========================================================

    path(
        "semantic/ranking/<slug:group_slug>/",
        semantic_ranking_v2,
        name="semantic_ranking_v2",
    ),
]