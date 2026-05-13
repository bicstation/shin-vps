# -*- coding: utf-8 -*-
# /home/maya/dev/shin-vps/django/api/urls/product_urls.py

from django.urls import path

from api.views.product_view import (

    ProductRankingView,

    get_product_detail,

    get_related_products,

    diagnose_pc,

    ProductByUIDView,
)

# ==============================================================================
# 🚀 Namespace
# ==============================================================================

app_name = "products"

# ==============================================================================
# 🚀 URL Patterns
# ==============================================================================

urlpatterns = [

    # ==========================================================================
    # 🏆 Product Ranking
    # ==========================================================================

    path(
        'ranking/',
        ProductRankingView.as_view(),
        name='product_ranking',
    ),

    # ==========================================================================
    # 🔗 Related Products
    # ==========================================================================

    path(
        'related/<str:unique_id>/',
        get_related_products,
        name='related_products',
    ),

    # ==========================================================================
    # 🧠 PC Diagnosis
    # ==========================================================================

    path(
        'diagnose/',
        diagnose_pc,
        name='diagnose_pc',
    ),

    # ==========================================================================
    # 🆔 Product By UID
    # IMPORTANT:
    # Must be above catch-all detail route
    # ==========================================================================

    path(
        "by-uid/<str:unique_id>/",
        ProductByUIDView.as_view(),
        name='product_by_uid',
    ),

    # ==========================================================================
    # 📄 Product Detail
    # IMPORTANT:
    # Keep LAST
    # ==========================================================================

    path(
        'detail/<str:unique_id>/',
        get_product_detail,
        name='product_detail',
    ),
]