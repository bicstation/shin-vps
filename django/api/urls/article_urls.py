# -*- coding: utf-8 -*-
# /home/maya/shin-dev/shin-vps/django/api/urls/article_urls.py

from django.urls import path
from api.views.article_view import ArticleViewSet

# --- ViewSet のアクションを HTTP メソッドにマッピング ---
# 🚀 一覧・作成 (GET /api/articles/ , POST /api/articles/)
article_list = ArticleViewSet.as_view({
    'get': 'list',
    'post': 'create'
})

# 🚀 個別操作 (GET /api/articles/1/ , PUT / PATCH / DELETE)
article_detail = ArticleViewSet.as_view({
    'get': 'retrieve',
    'put': 'update',
    'patch': 'partial_update',
    'delete': 'destroy'
})

# 🚀 特殊アクション (一括公開済み更新 / 重複チェック)
article_bulk_export = ArticleViewSet.as_view({
    'post': 'bulk_mark_as_exported'
})

article_check_source = ArticleViewSet.as_view({
    'get': 'check_source_exists'
})

urlpatterns = [
    # 🏁 メインエンドポイント (Next.js や スクレイパーが主に使用)
    path('', article_list, name='article-list'),
    path('<int:pk>/', article_detail, name='article-detail'),

    # 🛠️ 運用支援エンドポイント
    # POST: /api/articles/bulk-export-done/
    path('bulk-export-done/', article_bulk_export, name='article-bulk-export'),
    
    # GET: /api/articles/check-source/?url=...
    path('check-source/', article_check_source, name='article-check-source'),
]