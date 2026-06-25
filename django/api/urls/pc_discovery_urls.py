# -*- coding: utf-8 -*-
# /home/maya/shin-dev/shin-vps/django/api/urls/pc_discovery_urls.py

from django.urls import path

# ==========================================================
# Legacy Finder
# ==========================================================

from api.views.finder_views import (
    SemanticFinderView,
)

# ==========================================================
# Semantic Runtime
# ==========================================================

from api.views.finder_v2_view import (
    semantic_finder_v2,
)

from api.views.pc_product_view import (
    semantic_discovery_runtime,
    semantic_shelves,
    semantic_workflow_runtime,
)

app_name = "pc_discovery"

urlpatterns = [

    # ==========================================================
    # FINDER (Legacy)
    # ==========================================================

    path(
        "finder/",
        SemanticFinderView.as_view(),
        name="semantic_finder",
    ),

    # ==========================================================
    # FINDER (V2)
    # ==========================================================

    path(
        "semantic/finder/",
        semantic_finder_v2,
        name="semantic_finder_v2",
    ),

    # ==========================================================
    # DISCOVERY RUNTIME
    # ==========================================================

    path(
        "semantic/discovery/",
        semantic_discovery_runtime,
        name="semantic_discovery_runtime",
    ),

    # ==========================================================
    # SHELVES
    # ==========================================================

    path(
        "semantic/shelves/",
        semantic_shelves,
        name="semantic_shelves",
    ),

    # ==========================================================
    # WORKFLOW
    # ==========================================================

    path(
        "discover/<slug:workflow_slug>/",
        semantic_workflow_runtime,
        name="semantic_workflow_runtime",
    ),
]