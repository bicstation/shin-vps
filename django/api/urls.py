# -*- coding: utf-8 -*-
# /home/maya/dev/shin-vps/django/api/urls.py

from django.urls import path
from api import views

# 🚀 app_name を指定。これにより reverse('api:...') が有効になります。
app_name = 'api'

urlpatterns = [
    # ==========================================================
    # 0. システム・ルート (System Health & Entry)
    # ==========================================================
    # 💡 競合を避けるため、アプリ側のルートは api_v1_root 等に名前を変えるか、
    # 親の urls.py からのみ呼び出すようにします。
    path('', views.api_root, name='api_v1_root'), 
    path('status/', views.status_check, name='status_check'),

    # ==========================================================
    # 1. 認証 (Auth & User Management)
    # ==========================================================
    path('auth/login/', views.login_view, name='api_login'),
    path('auth/logout/', views.logout_view, name='api_logout'),
    path('auth/register/', views.register_view, name='api_register'),
    path('auth/me/', views.get_user_view, name='api_user_me'),
    path('auth/user/', views.get_user_view, name='api_user'),

    # ==========================================================
    # 2. PC・ソフトウェア製品 (PCProduct / 価格履歴)
    # ==========================================================
    path('pc-products/ranking/', views.PCProductRankingView.as_view(), name='pc_product_ranking'),
    path('pc-makers/', views.PCProductMakerListView.as_view(), name='pc_maker_list'),
    path('pc-sidebar-stats/', views.pc_sidebar_stats, name='pc_sidebar_stats'),
    
    path('pc-products/<str:unique_id>/price-history/', views.pc_product_price_history, name='pc_product_price_history'),
    path('pc-products/<str:unique_id>/', views.PCProductDetailAPIView.as_view(), name='pc_product_detail'),
    path('pc-products/', views.PCProductListAPIView.as_view(), name='pc_product_list'),

    # ==========================================================
    # 3. 🛡️ 統合アダルト共通ゲートウェイ (横断検索 / 関連レコメンド / 仕分け検索)
    # ==========================================================
    path('unified-adult-products/', views.UnifiedAdultProductListView.as_view(), name='unified_adult_products'),
    path('unified-products/', views.UnifiedAdultProductListView.as_view(), name='unified_products_alias'),

    # ==========================================================
    # 4. 🗺️ 階層ナビゲーション (Floor Master)
    # ==========================================================
    # 💡 Next.js のサイドメニュー用。views.FanzaFloorNavigationAPIView が必須です。
    path('navigation/floors/', views.FanzaFloorNavigationAPIView.as_view(), name='floor_navigation'),

    # ==========================================================
    # 5. FANZA 最適化商品 (FanzaProduct)
    # ==========================================================
    path('fanza-products/', views.FanzaProductListAPIView.as_view(), name='fanza_product_list'),
    path('fanza-products/<str:unique_id>/', views.FanzaProductDetailAPIView.as_view(), name='fanza_product_detail'),

    # ==========================================================
    # 6. アダルト/DUGA/統合商品 (AdultProduct)
    # ==========================================================
    path('adult-products/analysis/', views.PlatformMarketAnalysisAPIView.as_view(), name='platform_market_analysis'),
    path('adult-products/ranking/', views.AdultProductRankingAPIView.as_view(), name='adult_product_ranking'),
    path('adult-products/', views.AdultProductListAPIView.as_view(), name='adult_product_list'),
    path('adult-products/<str:product_id_unique>/', views.AdultProductDetailAPIView.as_view(), name='adult_product_detail'),

    # 💡 全項目インデックス（仕分け）用
    path('adult/taxonomy/', views.AdultTaxonomyIndexAPIView.as_view(), name='adult_taxonomy_index'),

    # ==========================================================
    # 7. Linkshare商品 (物販アフィリエイト)
    # ==========================================================
    path('linkshare/', views.LinkshareProductListAPIView.as_view(), name='linkshare_product_list'),
    path('linkshare/<str:sku>/', views.LinkshareProductDetailAPIView.as_view(), name='linkshare_product_detail'),

    # ==========================================================
    # 8. 🏷️ マスターデータ (全プラットフォーム統合版)
    # ==========================================================
    path('actresses/', views.ActressListAPIView.as_view(), name='actress_list'),
    path('genres/', views.GenreListAPIView.as_view(), name='genre_list'),
    path('makers/', views.MakerListAPIView.as_view(), name='maker_list'),
    path('labels/', views.LabelListAPIView.as_view(), name='label_list'),
    path('directors/', views.DirectorListAPIView.as_view(), name='director_list'),
    path('series/', views.SeriesListAPIView.as_view(), name='series_list'),
    path('authors/', views.AuthorListAPIView.as_view(), name='author_list'),
]