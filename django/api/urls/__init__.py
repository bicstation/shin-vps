# -*- coding: utf-8 -*-
"""
API Main Routing Configuration
Path: /home/maya/dev/shin-vps/django/api/urls/__init__.py

This file aggregates all domain-specific URL patterns into the central API routing.
It also provides root navigation and system health check endpoints.
"""

from django.urls import path, include
from django.http import HttpResponse
from api.views import api_root, status_check

# 💡 ネームスペースのルートを 'api' に設定
app_name = 'api'

urlpatterns = [
    # ==========================================================
    # 1. 🏠 API Root & System Status
    # ==========================================================
    path('', api_root, name='api_root'),
    path('status/', status_check, name='status_check'),

    # ==========================================================
    # 2. 📁 コンテンツ系
    # ==========================================================
    path('content-hub/', include('api.urls.contenthub_urls')),

    # 📰 記事系（Next.js互換含む）
    path('general/posts/', include('api.urls.article_urls')),
    path('adult/posts/',   include('api.urls.article_urls')),
    path('bs/posts/',      include('api.urls.article_urls')),
    path('posts/',         include('api.urls.article_urls')),

    # ==========================================================
    # 3. 👤 認証
    # ==========================================================
    path('auth/', include('api.urls.auth_urls')),

    # ==========================================================
    # 4. 🛍️ 統合プロダクト（★最重要）
    # ==========================================================
    path('products/', include('api.urls.product_urls')),

    # ==========================================================
    # 5. 📊 データソース系（裏側）
    # ==========================================================
    path('general/', include('api.urls.general_urls')),
    path('adult/',   include('api.urls.adult_urls')),
    path('master/',  include('api.urls.master_urls')),
    path('linkshare/', include('api.urls.linkshare_urls')),
    path('bs/',      include('api.urls.bs_urls')),

    # ==========================================================
    # 6. 🤖 AI系
    # ==========================================================
    path('ai/', include('api.urls.ai_urls')),

    # ==========================================================
    # 7. 🛡️ 不要リクエスト抑制
    # ==========================================================
    path('events/stream', lambda r: HttpResponse(status=204)),
    path('releases', lambda r: HttpResponse(status=204)),
]