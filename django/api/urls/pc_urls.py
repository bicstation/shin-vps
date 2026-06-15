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