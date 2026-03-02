# -*- coding: utf-8 -*-
# /home/maya/dev/shin-vps/django/tiper_api/urls.py

from django.contrib import admin
from django.urls import path, include, re_path 
from .views import home

urlpatterns = [
    # ==========================================================
    # 1. API エンドポイント (最優先)
    # ==========================================================
    # 💡 api/urls/__init__.py 側で 'api/' を定義していないことを前提に
    # ここで一括して 'api/' プレフィックスを付与します。
    path('api/', include('api.urls')), 

    # ==========================================================
    # 2. システム管理
    # ==========================================================
    path('admin/', admin.site.urls),
    
    # ==========================================================
    # 3. ホーム & フォールバック (最後に記述)
    # ==========================================================
    # ルートパス
    path('', home, name='home'),

    # 💡 API以外のすべてのパスを home へ。
    # ただし、APIの404を home で上書きしないよう、
    # APIパス（^api/）以外にマッチさせる正規表現にするのが安全です。
    re_path(r'^(?!api/).*$', home, name='frontend'), 
]