# -*- coding: utf-8 -*-
# /home/maya/shin-dev/shin-vps/django/api/urls/article_urls.py

from django.urls import path

from api.views.article_view import (
    ArticleViewSet
)

# ==============================================================================
# 🚀 Namespace
# ==============================================================================

app_name = "articles"

# ==============================================================================
# 🚀 ViewSet Action Mapping
# ==============================================================================

# ------------------------------------------------------------------------------
# 📄 List / Create
# GET    /api/posts/
# POST   /api/posts/
# ------------------------------------------------------------------------------

article_list = ArticleViewSet.as_view({

    'get': 'list',

    'post': 'create',
})

# ------------------------------------------------------------------------------
# 📄 Detail
# GET      /api/posts/1/
# PUT      /api/posts/1/
# PATCH    /api/posts/1/
# DELETE   /api/posts/1/
# ------------------------------------------------------------------------------

article_detail = ArticleViewSet.as_view({

    'get': 'retrieve',

    'put': 'update',

    'patch': 'partial_update',

    'delete': 'destroy',
})

# ------------------------------------------------------------------------------
# 🚀 Bulk Export
# POST /api/posts/bulk-export-done/
# ------------------------------------------------------------------------------

article_bulk_export = ArticleViewSet.as_view({

    'post': 'bulk_mark_as_exported'
})

# ------------------------------------------------------------------------------
# 🔍 Source Duplication Check
# GET /api/posts/check-source/?url=...
# ------------------------------------------------------------------------------

article_check_source = ArticleViewSet.as_view({

    'get': 'check_source_exists'
})

# ==============================================================================
# 🚀 URL Patterns
# ==============================================================================

urlpatterns = [

    # ==========================================================================
    # 📰 Article List / Create
    # ==========================================================================

    path(
        '',
        article_list,
        name='article_list',
    ),

    # ==========================================================================
    # 📄 Article Detail
    # ==========================================================================

    path(
        '<int:pk>/',
        article_detail,
        name='article_detail',
    ),

    # ==========================================================================
    # 🚀 Bulk Export Done
    # ==========================================================================

    path(
        'bulk-export-done/',
        article_bulk_export,
        name='article_bulk_export',
    ),

    # ==========================================================================
    # 🔍 Source Check
    # ==========================================================================

    path(
        'check-source/',
        article_check_source,
        name='article_check_source',
    ),
]