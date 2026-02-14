# -*- coding: utf-8 -*-
from django.urls import path
from api import views

# 🚀 app_name を指定することで、他アプリとの名前空間の衝突を防ぎます
app_name = 'api'

urlpatterns = [
    # ==========================================================
    # 0. システム・ルート (System Health & Entry)
    # ==========================================================
    path('', views.api_root, name='api_root'),
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
    # 2. PC・ソフトウェア製品 (PCProduct)
    # ==========================================================
    path('pc-products/ranking/', views.PCProductRankingView.as_view(), name='pc_product_ranking'),
    path('pc-makers/', views.PCProductMakerListView.as_view(), name='pc_maker_list'),
    path('pc-sidebar-stats/', views.pc_sidebar_stats, name='pc_sidebar_stats'),
    
    path('pc-products/<str:unique_id>/price-history/', views.pc_product_price_history, name='pc_product_price_history'),
    path('pc-products/<str:unique_id>/', views.PCProductDetailAPIView.as_view(), name='pc_product_detail'),
    path('pc-products/', views.PCProductListAPIView.as_view(), name='pc_product_list'),

    # ==========================================================
    # 3. 🛡️ 統合アダルト共通ゲートウェイ (レコメンド / 横断検索 / トップページ)
    # ==========================================================
    # 💡 source パラメータなしでリクエストすると、全プラットフォームの最新データがミックスされます
    path('unified-adult-products/', views.UnifiedAdultProductListView.as_view(), name='unified_adult_products'),

    # ==========================================================
    # 4. FANZA 最適化商品 (FanzaProduct)
    # ==========================================================
    path('fanza-products/', views.FanzaProductListAPIView.as_view(), name='fanza_product_list'),
    path('fanza-products/<str:unique_id>/', views.FanzaProductDetailAPIView.as_view(), name='fanza_product_detail'),

    # ==========================================================
    # 5. アダルト/DUGA商品 (AdultProduct)
    # ==========================================================
    # 💡 統合解析エンドポイント
    # サイドバーの 'CLASSIFICATION' セクションに必要な「フロア」や「属性」の仕訳を返却します
    path('adult-products/analysis/', views.PlatformMarketAnalysisAPIView.as_view(), name='platform_market_analysis'),
    
    path('adult-products/ranking/', views.AdultProductRankingAPIView.as_view(), name='adult_product_ranking'),
    path('adult-products/', views.AdultProductListAPIView.as_view(), name='adult_product_list'),
    path('adult-products/<str:product_id_unique>/', views.AdultProductDetailAPIView.as_view(), name='adult_product_detail'),

    # ==========================================================
    # 6. Linkshare商品 (物販アフィリエイト)
    # ==========================================================
    path('linkshare/', views.LinkshareProductListAPIView.as_view(), name='linkshare_product_list'),
    path('linkshare/<str:sku>/', views.LinkshareProductDetailAPIView.as_view(), name='linkshare_product_detail'),

    # ==========================================================
    # 7. 🏷️ マスターデータ (全プラットフォーム統合版)
    # ==========================================================
    # 💡 修正後の View により、api_source 指定なしで「メーカー」や「女優」の全件取得が可能です
    path('actresses/', views.ActressListAPIView.as_view(), name='actress_list'),
    path('genres/', views.GenreListAPIView.as_view(), name='genre_list'),
    path('makers/', views.MakerListAPIView.as_view(), name='maker_list'),
    path('labels/', views.LabelListAPIView.as_view(), name='label_list'),
    path('directors/', views.DirectorListAPIView.as_view(), name='director_list'),
    path('series/', views.SeriesListAPIView.as_view(), name='series_list'),
    path('authors/', views.AuthorListAPIView.as_view(), name='author_list'),
]