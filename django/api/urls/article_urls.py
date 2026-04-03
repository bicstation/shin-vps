# -*- coding: utf-8 -*-
# /home/maya/shin-dev/shin-vps/django/api/urls/article_urls.py

from django.urls import path
from api.views.article_view import ArticleViewSet

# --- ViewSet のアクションを HTTP メソッドにマッピング ---

# 🚀 一覧・作成 (GET /api/posts/ , POST /api/posts/)
article_list = ArticleViewSet.as_view({
    'get': 'list',
    'post': 'create'
})

# 🚀 個別操作 (GET /api/posts/1/ , PUT / PATCH / DELETE)
article_detail = ArticleViewSet.as_view({
    'get': 'retrieve',
    'put': 'update',
    'patch': 'partial_update',
    'delete': 'destroy'
})

# 🚀 特殊アクション (一括公開済み更新)
# POST: /api/posts/bulk-export-done/
article_bulk_export = ArticleViewSet.as_view({
    'post': 'bulk_mark_as_exported'
})

# 🚀 重複チェック
# GET: /api/posts/check-source/?url=...
article_check_source = ArticleViewSet.as_view({
    'get': 'check_source_exists'
})

urlpatterns = [
    # 🏁 メインエンドポイント
    # これらは include された先のパス（例: /api/posts/）の直下に配置されます
    path('', article_list, name='article-list'),
    path('<int:pk>/', article_detail, name='article-detail'),

    # 🛠️ 運用支援エンドポイント
    path('bulk-export-done/', article_bulk_export, name='article-bulk-export'),
    path('check-source/', article_check_source, name='article-check-source'),
]