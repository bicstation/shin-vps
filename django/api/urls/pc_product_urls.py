# -*- coding: utf-8 -*-
# /home/maya/shin-dev/shin-vps/django/api/urls/pc_product_urls.py

from django.urls import path

from api.views.general_views import (
    PCProductListAPIView,
)

from api.views.pc_product_view import (
    pc_product_detail,
    get_related_pc_products,
)

from api.views.product_detail_v2_view import (
    semantic_product_detail_v2,
)

from api.views.related_v2_view import (
    semantic_related_v2,
)

app_name = "pc_products"

urlpatterns = [

    # ==========================================================
    # PRODUCT LIST (Legacy)
    # ==========================================================

    path(
        "pc-products/",
        PCProductListAPIView.as_view(),
        name="pc_product_list",
    ),

    # ==========================================================
    # RELATED (Legacy)
    # IMPORTANT:
    # Must be above detail route
    # ==========================================================

    path(
        "pc-products/<str:unique_id>/related/",
        get_related_pc_products,
        name="related_pc_products",
    ),

    # ==========================================================
    # RELATED (V2)
    # ==========================================================

    path(
        "semantic/product/<slug:unique_id>/related/",
        semantic_related_v2,
        name="semantic_related_v2",
    ),

    # ==========================================================
    # PRODUCT DETAIL (Legacy)
    # ==========================================================

    path(
        "pc-products/<str:unique_id>/",
        pc_product_detail,
        name="pc_product_detail",
    ),

    # ==========================================================
    # PRODUCT DETAIL (V2)
    # ==========================================================

    path(
        "semantic/product/<slug:unique_id>/",
        semantic_product_detail_v2,
        name="semantic_product_detail_v2",
    ),
]