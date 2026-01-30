# -*- coding: utf-8 -*-
from django.urls import path, include
from api import views

app_name = 'api'

urlpatterns = [
    # --- 0. ルート & ステータス ---
    path('', views.api_root, name='api_root'),
    path('status/', views.status_check, name='status_check'),

    # --- 各ドメイン・機能別エンドポイントの統合 ---
    # 既存のURL構造を壊さないよう、prefixなしでincludeします
    path('', include('api.urls.general_urls')),
    path('', include('api.urls.adult_urls')),
]