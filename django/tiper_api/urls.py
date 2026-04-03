# -*- coding: utf-8 -*-
# /home/maya/dev/shin-vps/django/tiper_api/urls.py

from django.contrib import admin
from django.urls import path, include, re_path 
from .views import home

urlpatterns = [
    # ==========================================================
    # 1. API エンドポイント (最優先)
    # ==========================================================
    # 🚀 'api/news/' を廃止し、'api/posts/' に統一・整理します。
    # 💡 api/urls.py 内で各リソース（posts, users等）を定義している前提。
    path('api/', include('api.urls')), 

    # ==========================================================
    # 2. システム管理
    # ==========================================================
    path('admin/', admin.site.urls),
    
    # ==========================================================
    # 3. ホーム & フォールバック (最後に記述)
    # ==========================================================
    # ルートパス (http://api.tiper.live/ 等への直接アクセス時)
    path('', home, name='home'),

    # 🛡️ 重要: API以外のすべてのパスを home へ転送。
    # (?!api/|admin/|static/|media/) 
    # API, 管理画面, 静的ファイル以外のリクエストのみをフロントエンド(home)へ流します。
    # これにより、APIの打ち間違いで「謎のHTML」が返ってくるのを防ぎます。
    re_path(r'^(?!api/|admin/|static/|media/).*$', home, name='frontend'), 
]