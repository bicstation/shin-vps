# -*- coding: utf-8 -*-
# ./django/tiper_api/urls.py

from django.contrib import admin
from django.urls import path, include, re_path 
from .views import home, api_root

urlpatterns = [
    # ==========================================================
    # 1. システム管理 & ホーム
    # ==========================================================
    path('', home, name='home'),
    path('admin/', admin.site.urls),
    
    # ==========================================================
    # 2. API エンドポイント (メイン)
    # ==========================================================
    
    # APIルート（ドキュメント表示用）
    path('api/', api_root, name='api_root'),
    
    # メインのAPI機能 (namespace='api' として唯一無二の定義にする)
    path('api/', include('api.urls', namespace='api')), 
    
    # ==========================================================
    # 3. ブランド別エイリアス (警告回避のため namespace を指定しない)
    # ==========================================================
    # 💡 内部のURL逆引き(reverse)は上記 'api' namespace が優先されます
    path('bicstation/api/', include('api.urls')),
    path('saving/api/', include('api.urls')),
    path('tiper/api/', include('api.urls')),
    path('avflash/api/', include('api.urls')),
    
    # ==========================================================
    # 4. フォールバック (フロントエンド / 未定義パス用)
    # ==========================================================
    # API以外の全てのパスを home (またはフロントエンド) へ
    re_path(r'^.*$', home, name='frontend'), 
]