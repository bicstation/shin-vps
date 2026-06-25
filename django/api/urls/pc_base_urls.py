# -*- coding: utf-8 -*-
# /home/maya/shin-dev/shin-vps/django/api/urls/pc_base_urls.py

from django.urls import (
    include,
    path,
)

app_name = "pc_base"

urlpatterns = [

    # ==========================================================
    # Product Experience
    # ==========================================================

    path(
        "",
        include(
            "api.urls.pc_product_urls"
        ),
    ),

    # ==========================================================
    # Discovery Experience
    # ==========================================================

    path(
        "",
        include(
            "api.urls.pc_discovery_urls"
        ),
    ),

    # ==========================================================
    # Ranking Experience
    # ==========================================================

    path(
        "",
        include(
            "api.urls.pc_ranking_urls"
        ),
    ),

    # ==========================================================
    # Semantic Runtime
    # ==========================================================

    path(
        "",
        include(
            "api.urls.pc_semantic_urls"
        ),
    ),

    # ==========================================================
    # Sidebar Runtime
    # ==========================================================

    path(
        "",
        include(
            "api.urls.pc_sidebar_urls"
        ),
    ),
]