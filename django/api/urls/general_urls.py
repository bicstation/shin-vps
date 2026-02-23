# -*- coding: utf-8 -*-
# /home/maya/dev/shin-vps/django/api/urls/general_urls.py

from django.urls import path
from api.views import general_views

app_name = 'general'

urlpatterns = [
    path('pc-products/', general_views.PCProductListAPIView.as_view(), name='pc_product_list'),
    path('pc-products/ranking/', general_views.PCProductRankingView.as_view(), name='pc_product_ranking'),
    path('pc-products/<str:unique_id>/', general_views.PCProductDetailAPIView.as_view(), name='pc_product_detail'),
    path('pc-products/<str:unique_id>/maid-stream/', general_views.PCProductMaidStreamView.as_view(), name='pc_product_maid_stream'),
    path('pc-products/<str:unique_id>/price-history/', general_views.pc_product_price_history, name='pc_product_price_history'),
    path('pc-makers/', general_views.PCProductMakerListView.as_view(), name='pc_maker_list'),
    path('pc-sidebar-stats/', general_views.pc_sidebar_stats, name='pc_sidebar_stats'),
]