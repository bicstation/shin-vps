# -*- coding: utf-8 -*-
# /home/maya/dev/shin-vps/django/api/urls/__init__.py

from django.urls import path, include
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
    # 2. 📁 各ドメイン別エンドポイント
    # ==========================================================
    # 💡 各子ファイル内で app_name (adult, auth等) が定義されているため、
    # ここで namespace を重ねて指定せずシンプルに include します。
    
    # 👤 認証・ユーザー系
    path('auth/', include('api.urls.auth_urls')),
    
    # 💻 一般・PC製品・共通系
    path('general/', include('api.urls.general_urls')),
    
    # 🔞 アダルト統合系
    path('adult/', include('api.urls.adult_urls')),
    
    # 🏷️ マスターデータ系 (Actress, Genre, etc.)
    path('master/', include('api.urls.master_urls')),
    
    # 📦 物販・Linkshare系
    path('linkshare/', include('api.urls.linkshare_urls')),
]