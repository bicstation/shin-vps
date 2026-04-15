# -*- coding: utf-8 -*-
# /home/maya/dev/shin-vps/django/api/urls/__init__.py

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
    # 2. 📁 各ドメイン別エンドポイント (階層型ルーティング対応)
    # ==========================================================
    
    # 📰 記事系 (posts)
    # 🛡️ Next.js v3 の prefix (general/posts/ 等) をすべて article_urls へ誘導
    path('general/posts/', include('api.urls.article_urls')),
    path('adult/posts/',   include('api.urls.article_urls')),
    path('bs/posts/',      include('api.urls.article_urls')),
    
    # 互換性維持: prefixなしの /api/posts/ も引き続き受け付ける
    path('posts/', include('api.urls.article_urls')),

    # 👤 認証・ユーザー系
    path('auth/', include('api.urls.auth_urls')),
    
    # 💻 一般・PC製品・共通系 (api/general/...)
    path('general/', include('api.urls.general_urls')),
    
    # 🔞 アダルト統合系 (api/adult/...)
    path('adult/', include('api.urls.adult_urls')),
    
    # 🏷️ マスターデータ系 (api/master/...)
    path('master/', include('api.urls.master_urls')),
    
    # 📦 物販・Linkshare系 (api/linkshare/...)
    path('linkshare/', include('api.urls.linkshare_urls')),
    
    # 📱 Bic-saving 系 (api/bs/...)
    path('bs/', include('api.urls.bs_urls')),
    
    # ==========================================================
    # 🛡️ 3. 504 Timeout 防止用: 不要なリクエストを黙らせる
    # ==========================================================
    path('events/stream', lambda r: HttpResponse(status=204)),
    path('releases', lambda r: HttpResponse(status=204)),
]