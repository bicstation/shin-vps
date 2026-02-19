# -*- coding: utf-8 -*-
# /home/maya/dev/shin-vps/django/api/urls/linkshare_urls.py

from django.urls import path
from api.views import general_views # または専用のview

app_name = 'linkshare'

urlpatterns = [
    path('', general_views.LinkshareProductListAPIView.as_view(), name='list'),
    path('<str:sku>/', general_views.LinkshareProductListAPIView.as_view(), name='detail'),
]