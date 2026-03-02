# -*- coding: utf-8 -*-
# /home/maya/dev/shin-vps/django/api/urls/adult_urls.py

from django.urls import path
# 🚀 フォルダ（パッケージ）から直接ファイルを指定してインポート
from api.views.adult_views import (
    UnifiedAdultProductListView, AdultProductDetailAPIView,
    AdultProductRankingAPIView, PlatformMarketAnalysisAPIView,
    AdultTaxonomyIndexAPIView, ActressSearchAPIView,
    FanzaFloorNavigationAPIView, LinkshareProductListAPIView,
    AdultSidebarStatsAPIView
)
# master_views も同様に
from api.views.master_views import ActressListAPIView, GenreListAPIView, MakerListAPIView

app_name = 'adult'

urlpatterns = [
    # adult_views. プレフィックスを消して、クラス名を直接記述します
    path('unified-products/', UnifiedAdultProductListView.as_view(), name='unified_products'),
    path('products/<str:product_id_unique>/', AdultProductDetailAPIView.as_view(), name='product_detail'),
    path('analysis/', PlatformMarketAnalysisAPIView.as_view(), name='market_analysis'),
    path('ranking/', AdultProductRankingAPIView.as_view(), name='ranking'),
    path('taxonomy/', AdultTaxonomyIndexAPIView.as_view(), name='taxonomy_index'),
    path('actress-search/', ActressSearchAPIView.as_view(), name='actress_search_api'),
    path('navigation/floors/', FanzaFloorNavigationAPIView.as_view(), name='floor_navigation'),
    path('actresses/', ActressListAPIView.as_view(), name='actress_list'),
    path('genres/', GenreListAPIView.as_view(), name='genre_list'),
    path('makers/', MakerListAPIView.as_view(), name='maker_list'),
    path('linkshare-products/', LinkshareProductListAPIView.as_view(), name='linkshare_list'),
    path('sidebar-stats/', AdultSidebarStatsAPIView.as_view(), name='sidebar_stats'),
]