# -*- coding: utf-8 -*-
# /home/maya/dev/shin-vps/django/api/urls/general_urls.py

from django.urls import path
from api.views import general_views
from api.views.pc_stats_view import pc_sidebar_stats

app_name = 'general'

urlpatterns = [
    # 💻 製品一覧
    path('pc-products/', general_views.PCProductListAPIView.as_view(), name='pc_product_list'),
    
    # 🏆 ランキング
    path('pc-products/ranking/', general_views.PCProductRankingView.as_view(), name='pc_product_ranking'),
    path("pc-products/ranking/<str:slug>/", general_views.PCProductRankingView.as_view(), name="pc_product_ranking_slug"),
    
    # 🔥 人気
    path('pc-products/popularity-ranking/', general_views.PCProductRankingView.as_view(), name='pc_product_popularity_ranking'),
    
    # 🔍 詳細
    path('pc-products/<str:unique_id>/', general_views.PCProductDetailAPIView.as_view(), name='pc_product_detail'),
    path('pc-products/<str:unique_id>/maid-stream/', general_views.PCProductMaidStreamView.as_view(), name='pc_product_maid_stream'),
    path('pc-products/<str:unique_id>/price-history/', general_views.pc_product_price_history, name='pc_product_price_history'),
    
    # 📊 統計
    path('pc-makers/', general_views.PCProductMakerListView.as_view(), name='pc_maker_list'),
    path("pc-sidebar-stats/", pc_sidebar_stats, name="pc_sidebar_stats"),
]