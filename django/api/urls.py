# -*- coding: utf-8 -*-
from django.urls import path
from api import views

# 🚀 app_name を指定することで、他アプリとの名前空間の衝突を防ぎます
app_name = 'api'

urlpatterns = [
    # ==========================================================
    # 1. 認証 (Auth)
    # ==========================================================
    path('auth/login/', views.login_view, name='api_login'),
    path('auth/logout/', views.logout_view, name='api_logout'),
    path('auth/register/', views.register_view, name='api_register'),
    path('auth/me/', views.get_user_view, name='api_user_me'),
    path('auth/user/', views.get_user_view, name='api_user'),

    # ==========================================================
    # 2. PC・ソフトウェア製品 (PCProduct)
    # ==========================================================
    # 🏆 ランキング (🚨 衝突回避のため具体的なパスを上に)
    path('pc-products/ranking/', views.PCProductRankingView.as_view(), name='pc_product_ranking'),
    
    # 🏭 統計・メーカー
    path('pc-makers/', views.PCProductMakerListView.as_view(), name='pc_maker_list'),
    path('pc-sidebar-stats/', views.pc_sidebar_stats, name='pc_sidebar_stats'),

    # 📈 価格推移 (🚨 unique_id 変数パスよりも具体的であれば上に配置)
    path('pc-products/<str:unique_id>/price-history/', views.pc_product_price_history, name='pc_product_price_history'),

    # 🔍 詳細 (🚨 unique_id による取得)
    path('pc-products/<str:unique_id>/', views.PCProductDetailAPIView.as_view(), name='pc_product_detail'),

    # 📋 一覧 (🚨 スラッシュ判定の競合を避けるため、PC製品群の最後に配置)
    path('pc-products/', views.PCProductListAPIView.as_view(), name='pc_product_list'),

    # ==========================================================
    # 3. FANZA 最適化商品 (FanzaProduct)
    # ==========================================================
    path('fanza-products/', views.FanzaProductListAPIView.as_view(), name='fanza_product_list'),
    path('fanza-products/<str:unique_id>/', views.FanzaProductDetailAPIView.as_view(), name='fanza_product_detail'),

    # ==========================================================
    # 4. アダルト商品 (AdultProduct)
    # ==========================================================
    path('adult-products/ranking/', views.AdultProductRankingAPIView.as_view(), name='adult_product_ranking'),
    path('adult-products/', views.AdultProductListAPIView.as_view(), name='adult_product_list'),
    path('adult-products/<str:product_id_unique>/', views.AdultProductDetailAPIView.as_view(), name='adult_product_detail'),

    # ==========================================================
    # 5. Linkshare商品
    # ==========================================================
    path('linkshare/', views.LinkshareProductListAPIView.as_view(), name='linkshare_product_list'),
    path('linkshare/<str:sku>/', views.LinkshareProductDetailAPIView.as_view(), name='linkshare_product_detail'),

    # ==========================================================
    # 6. マスターデータ (エンティティ)
    # ==========================================================
    path('actresses/', views.ActressListAPIView.as_view(), name='actress_list'),
    path('genres/', views.GenreListAPIView.as_view(), name='genre_list'),
    path('makers/', views.MakerListAPIView.as_view(), name='maker_list'),
    path('labels/', views.LabelListAPIView.as_view(), name='label_list'),
    path('directors/', views.DirectorListAPIView.as_view(), name='director_list'),
    path('series/', views.SeriesListAPIView.as_view(), name='series_list'),
    path('authors/', views.AuthorListAPIView.as_view(), name='author_list'),
]