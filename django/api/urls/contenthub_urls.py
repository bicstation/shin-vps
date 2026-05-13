# -*- coding: utf-8 -*-
"""
==============================================================================
🚀 ContentHub API Routing Configuration
==============================================================================

Path:
    /home/maya/dev/shin-vps/django/api/urls/contenthub_urls.py

Responsibilities:
    - Unified Content Distribution
    - AI Ingestion
    - Multi-Site Publishing
    - Content CRUD
    - Semantic Content Pipeline

==============================================================================
"""

from django.urls import path, include

from rest_framework.routers import DefaultRouter

from api.views.contenthub_view import (
    ContentHubViewSet
)

# ==============================================================================
# 🚀 Namespace
# ==============================================================================

app_name = "contenthub"

# ==============================================================================
# 🚀 Router Setup
# ==============================================================================
#
# DefaultRouter automatically generates:
#
# - list
# - create
# - retrieve
# - update
# - partial_update
# - destroy
#
# plus:
#
# - @action routes
#
# ==============================================================================

router = DefaultRouter()

# ------------------------------------------------------------------------------
# 🧠 Content Hub
# ------------------------------------------------------------------------------

router.register(
    r'items',
    ContentHubViewSet,
    basename='contenthub-item'
)

# ==============================================================================
# 🚀 URL Patterns
# ==============================================================================

urlpatterns = [

    path(
        '',
        include(router.urls)
    ),
]