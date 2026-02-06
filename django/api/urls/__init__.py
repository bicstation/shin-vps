# -*- coding: utf-8 -*-
from django.urls import path
from api import views
from api.urls.general_urls import urlpatterns as general_patterns
from api.urls.adult_urls import urlpatterns as adult_patterns

app_name = 'api'

urlpatterns = [
    # --- 0. ルート & ステータス ---
    path('', views.api_root, name='api_root'),
    path('status/', views.status_check, name='status_check'),
]

# 各ドメインのURLリストを単純に結合する
urlpatterns += general_patterns
urlpatterns += adult_patterns