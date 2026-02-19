# -*- coding: utf-8 -*-
# ./django/tiper_api/urls.py

from django.contrib import admin
from django.urls import path, include, re_path 
from .views import home

urlpatterns = [
    # ==========================================================
    # 1. システム管理 & ホーム
    # ==========================================================
    path('', home, name='home'),
    path('admin/', admin.site.urls),
    
    # ==========================================================
    # 2. API エンドポイント (唯一無二にする)
    # ==========================================================
    # 💡 namespace をここで指定せず、api/urls/__init__.py の app_name='api' に任せる
    # これにより W005 警告が消えます
    path('api/', include('api.urls')), 
    
    # ==========================================================
    # 3. フォールバック
    # ==========================================================
    # 全ての未定義パスを home へ（APIパス以外）
    re_path(r'^.*$', home, name='frontend'), 
]