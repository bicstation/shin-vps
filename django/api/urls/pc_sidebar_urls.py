# -*- coding: utf-8 -*-
# /home/maya/shin-dev/shin-vps/django/api/urls/pc_sidebar_urls.py

from django.urls import path

# ==========================================================
# Sidebar Runtime
# ==========================================================

from api.views.pc_stats_view import (
    pc_sidebar_stats,
)

app_name = "pc_sidebar"

urlpatterns = [

    # ==========================================================
    # Sidebar Stats
    # Legacy Helper Runtime
    # ==========================================================

    path(
        "pc-sidebar-stats/",
        pc_sidebar_stats,
        name="pc_sidebar_stats",
    ),

    # ==========================================================
    # Semantic Grouped Attributes
    # Canonical Semantic Ontology Authority
    # ==========================================================

    path(
        "semantic/grouped-attributes/",
        pc_sidebar_stats,
        name="semantic_grouped_attributes",
    ),
]