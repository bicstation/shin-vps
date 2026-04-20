# -*- coding: utf-8 -*-
"""
ContentHub API Routing Configuration
Path: /home/maya/shin-vps/django/api/urls/contenthub_urls.py

This file defines the routing for the ContentHub module, including AI ingestion
and integrated content management features.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from api.views import ContentHubViewSet

# アプリケーションの名前空間（ファイル名に合わせて単数形に統一）
app_name = 'contenthub'

# ==============================================================================
# Router Setup
# ==============================================================================
# DefaultRouter handles standard CRUD and @action decorators automatically.
router = DefaultRouter()

# Register the ContentHubViewSet
# Base URL path will be determined by the parent urls.py (e.g., api/content-hub/)
router.register(r'', ContentHubViewSet, basename='contenthub')

# ==============================================================================
# URL Patterns
# ==============================================================================
urlpatterns = [
    # Router generated endpoints (list, detail, custom actions like ai-ingest, etc.)
    path('', include(router.urls)),
]