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

    pc_product_detail,

    get_related_pc_products,
)

# ==========================================================
# Semantic Finder
# ==========================================================
from api.views.finder_views import (
    SemanticFinderView
)

app_name = "general"


urlpatterns = [

    # ======================================================
    # 🧠 Semantic Finder
    # ======================================================
    path(
        "finder/",
        SemanticFinderView.as_view(),
    ),

    # ======================================================
    # 🏆 PC Ranking
    # ======================================================
    path(
        "pc-products/ranking/",
        general_views.PCProductRankingView.as_view(),
    ),

    path(
        "pc-products/ranking/<slug:slug>/",
        general_views.PCProductRankingView.as_view(),
    ),

    # ======================================================
    # 📦 PC Product List
    # ======================================================
    path(
        "pc-products/",
        general_views.PCProductListAPIView.as_view(),
    ),

    # ======================================================
    # 🔗 Related Products
    # IMPORTANT:
    # Must be above detail route
    # ======================================================
    path(
        "pc-products/<str:unique_id>/related/",
        get_related_pc_products,
    ),

    # ======================================================
    # 📄 Product Detail
    # IMPORTANT:
    # Keep LAST to avoid URL collision
    # ======================================================
    path(
        "pc-products/<str:unique_id>/",
        pc_product_detail,
    ),

    # ======================================================
    # 📊 Sidebar Stats
    # ======================================================
    path(
        "pc-sidebar-stats/",
        pc_sidebar_stats,
    ),
]