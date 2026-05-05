# -*- coding: utf-8 -*-

from django.urls import path
from api.views import general_views
from api.views.pc_stats_view import pc_sidebar_stats
from api.views.general_views import pc_product_detail

app_name = 'general'

urlpatterns = [
    # -------------------------
    # 🏆 ランキング（最優先）
    # -------------------------
    path(
        'pc-products/ranking/',
        general_views.PCProductRankingView.as_view()
    ),
    path(
        'pc-products/ranking/<slug:slug>/',
        general_views.PCProductRankingView.as_view()
    ),

    # -------------------------
    # 💻 製品一覧
    # -------------------------
    path(
        'pc-products/',
        general_views.PCProductListAPIView.as_view()
    ),

    # -------------------------
    # 📄 詳細（最後に置く）
    # -------------------------
    path(
        "pc-products/<str:unique_id>/",
        pc_product_detail,
    ),

    # -------------------------
    # 📊 サイドバー
    # -------------------------
    path(
        'pc-sidebar-stats/',
        pc_sidebar_stats
    ),
]