# -*- coding: utf-8 -*-
# /home/maya/shin-dev/shin-vps/django/api/urls/finder_urls.py

from django.urls import path

# ==========================================================
# FINDER VIEW
# ==========================================================

from api.views.finder_view import (
    semantic_finder,
)

# ==============================================================================
# 🚀 Namespace
# ==============================================================================

app_name = "finder"

# ==============================================================================
# 🚀 URL Patterns
# ==============================================================================

urlpatterns = [

    # ==========================================================================
    # 🧠 Semantic Discovery Finder
    # IMPORTANT:
    # backend-driven semantic exploration runtime
    # ==========================================================================

    path(
        "",
        semantic_finder,
        name="semantic_finder",
    ),

    # ==========================================================================
    # 🧠 Legacy Compatibility
    # IMPORTANT:
    # preserve old recommend endpoint
    # ==========================================================================

    path(
        "recommend/",
        semantic_finder,
        name="recommend",
    ),
]