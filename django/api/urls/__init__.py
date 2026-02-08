# -*- coding: utf-8 -*-
from django.urls import path, include  # include をインポート
from api import views
from api.urls.general_urls import urlpatterns as general_patterns
from api.urls.adult_urls import urlpatterns as adult_patterns

app_name = 'api'

# 1. まず中身を空にして
urlpatterns = []

# 2. 具体的なパスを先に登録（これにより /api/adult-products/ranking が優先される）
urlpatterns += adult_patterns
urlpatterns += general_patterns


# 3. 最後にステータスとルートを追加
urlpatterns += [
    path('status/', views.status_check, name='status_check'),
    
    # 🚨 これを一番最後に置くことで、上のパターンに漏れたものだけがここに来る
    path('', views.api_root, name='api_root'),
]