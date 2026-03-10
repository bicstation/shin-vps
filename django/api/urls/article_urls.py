# -*- coding: utf-8 -*-
# /home/maya/dev/shin-vps/django/api/urls/article_urls.py

from django.urls import path
# 💡 ArticleViewSet を正しいパスからインポート
# from api.views.article_views import ArticleViewSet 
from api.views.article_view import ArticleViewSet

# ViewSet のアクションを HTTP メソッドに紐付け
article_list = ArticleViewSet.as_view({
    'get': 'list',      # GET /api/news/ -> 一覧取得
    'post': 'create'    # POST /api/news/ -> 記事作成
})

article_detail = ArticleViewSet.as_view({
    'get': 'retrieve',  # GET /api/news/1/ -> 詳細取得
    'put': 'update',
    'patch': 'partial_update',
    'delete': 'destroy'
})

urlpatterns = [
    # Next.js が取得に来るエンドポイント
    path('', article_list, name='article-list'),
    path('<int:pk>/', article_detail, name='article-detail'),
]