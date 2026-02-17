# -*- coding: utf-8 -*-
# ./django/tiper_api/urls.py

from django.contrib import admin
from django.urls import path, include, re_path 
from .views import home, api_root  # api_root を views.py から読み込み

urlpatterns = [
    # ==========================================================
    # 1. システム管理 & ホーム
    # ==========================================================
    path('', home, name='home'),
    path('admin/', admin.site.urls),
    
    # ==========================================================
    # 2. API エンドポイント (委譲設定)
    # ==========================================================
    
    # 💡 [重要修正] /api/ 自体のアクセスにはプロジェクト親の api_root を使い、
    # それ以降の階層（/api/genres/ など）を api.urls に委譲します。
    path('api/', api_root, name='api_root'), # ← ここで読み込んだ api_root を使う
    path('api/', include('api.urls')), 
    
    # 各ブランド用エイリアス
    path('bicstation/api/', include('api.urls')),
    path('saving/api/', include('api.urls')),
    path('tiper/api/', include('api.urls')),
    path('avflash/api/', include('api.urls')),
    
    # ==========================================================
    # 3. フォールバック (フロントエンド / 未定義パス用)
    # ==========================================================
    re_path(r'^.*$', home, name='frontend'), 
]