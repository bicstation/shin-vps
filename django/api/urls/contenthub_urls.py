# -*- coding: utf-8 -*-
"""
ContentHub API Routing Configuration
Path: /home/maya/dev/shin-vps/django/api/urls/contenthub_urls.py

統合コンテンツハブ (ContentHub) のルーティング定義。
AIインジェスト、各サイトへの配信制御、および標準的なCRUD操作を管理します。
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from api.views.contenthub_viewset import ContentHubViewSet

# アプリケーションの名前空間
# 他のURL設定から 'contenthub:list' のようにリバース参照するために使用します
app_name = 'contenthub'

# ==============================================================================
# Router Setup
# ==============================================================================
# DefaultRouterは標準的なCRUD(list, create, retrieve, update, destroy)に加え、
# ViewSet内の@actionデコレータ（ai_ingest, bulk_publish等）を自動的にルーティングします。
router = DefaultRouter()

# ContentHubViewSetの登録
# ルートパスに登録することで、api/content-hub/ で一覧取得が可能になります
router.register(r'items', ContentHubViewSet, basename='item')

# ==============================================================================
# URL Patterns
# ==============================================================================
urlpatterns = [
    # ルーターによって生成された全エンドポイントを包含
    # 例: 
    # GET    /api/content-hub/items/          -> 一覧取得
    # POST   /api/content-hub/items/ai_ingest/ -> AIインジェスト実行
    # GET    /api/content-hub/items/{id}/     -> 詳細取得
    path('', include(router.urls)),
]