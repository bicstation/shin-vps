# -*- coding: utf-8 -*-

from django.urls import path

from api.views import general_views

from api.views.pc_stats_view import (
    pc_sidebar_stats
)

from api.views.general_views import (
    PCProductRankingView,
    PCProductListAPIView,
    pc_product_detail,
    get_related_pc_products,
)

from api.views.finder_views import (
    SemanticFinderView
)


app_name = "general"


urlpatterns = [

    # -------------------------
    # 🧠 Semantic Finder
    # -------------------------
    path(
        "finder/",
        SemanticFinderView.as_view(),
    ),

    # -------------------------
    # 🏆 Ranking
    # -------------------------
    path(
        "pc-products/ranking/",
        general_views.PCProductRankingView.as_view()
    ),

    path(
        "pc-products/ranking/<slug:slug>/",
        general_views.PCProductRankingView.as_view()
    ),

    # -------------------------
    # 💻 Product List
    # -------------------------
    path(
        "pc-products/",
        general_views.PCProductListAPIView.as_view()
    ),

    # -------------------------
    # 🔗 Related Products
    # -------------------------
    path(
        "pc-products/<str:unique_id>/related/",
        get_related_pc_products
    ),

    # -------------------------
    # 📄 Product Detail
    # 반드시最後
    # -------------------------
    path(
        "pc-products/<str:unique_id>/",
        pc_product_detail,
    ),

    # -------------------------
    # 📊 Sidebar Stats
    # -------------------------
    path(
        "pc-sidebar-stats/",
        pc_sidebar_stats
    ),
]