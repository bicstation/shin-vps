# -*- coding: utf-8 -*-
# /home/maya/shin-vps/django/api/urls/semantic_urls.py

from django.urls import path

from api.views.semantic_discovery_view import (
    semantic_discovery,
)

# ==============================================================================
# 🚀 App Name
# ==============================================================================

app_name = "semantic"

# ==============================================================================
# 🚀 URL Patterns
# ==============================================================================

urlpatterns = [

    # ==========================================================================
    # 🚀 Semantic Discovery Runtime
    # ==========================================================================

    path(
        "semantic/discovery/",
        semantic_discovery,
        name="semantic-discovery",
    ),
]