# -*- coding: utf-8 -*-
from django.urls import path
from api.views import adult_views, master_views

# ネームスペース
app_name = 'adult'

urlpatterns = [
    # 統合製品一覧（フィルタ・検索・ソート）
    path('unified-products/', adult_views.UnifiedAdultProductListView.as_view(), name='unified_products'),
    
    # 製品詳細
    path('products/<str:product_id_unique>/', adult_views.AdultProductDetailAPIView.as_view(), name='product_detail'),

    # 分析・ランキング
    path('analysis/', adult_views.PlatformMarketAnalysisAPIView.as_view(), name='market_analysis'),
    path('ranking/', adult_views.AdultProductRankingAPIView.as_view(), name='ranking'),
    path('taxonomy/', adult_views.AdultTaxonomyIndexAPIView.as_view(), name='taxonomy_index'),

    # AIソムリエ・高度検索
    path('actress-search/', adult_views.ActressSearchAPIView.as_view(), name='actress_search_api'),

    # 階層ナビゲーション
    path('navigation/floors/', adult_views.FanzaFloorNavigationAPIView.as_view(), name='floor_navigation'),

    # マスターデータ
    path('actresses/', master_views.ActressListAPIView.as_view(), name='actress_list'),
    path('genres/', master_views.GenreListAPIView.as_view(), name='genre_list'),
    path('makers/', master_views.MakerListAPIView.as_view(), name='maker_list'),
    
    # 外部連携生データ
    path('linkshare-products/', adult_views.LinkshareProductListAPIView.as_view(), name='linkshare_list'),
    
    # AI属性統計（サイドバー用タグ集計）
    path('sidebar-stats/', adult_views.AdultSidebarStatsAPIView.as_view(), name='sidebar_stats'),
]