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
    # 🏆 ランキング
    path('pc-products/ranking/', views.PCProductRankingView.as_view(), name='pc_product_ranking'),
    
    # 🏭 統計・メーカー
    path('pc-makers/', views.PCProductMakerListView.as_view(), name='pc_maker_list'),
    path('pc-sidebar-stats/', views.pc_sidebar_stats, name='pc_sidebar_stats'),

    # 📈 価格推移
    path('pc-products/<str:unique_id>/price-history/', views.pc_product_price_history, name='pc_product_price_history'),

    # 🔍 詳細
    path('pc-products/<str:unique_id>/', views.PCProductDetailAPIView.as_view(), name='pc_product_detail'),

    # 📋 一覧 (末尾のスラッシュを意識)
    path('pc-products/', views.PCProductListAPIView.as_view(), name='pc_product_list'),

    # ==========================================================
    # 3. FANZA 最適化商品 (FanzaProduct)
    # ==========================================================
    # 📋 一覧
    path('fanza-products/', views.FanzaProductListAPIView.as_view(), name='fanza_product_list'),
    
    # 🔍 詳細 (unique_id: fz_xxxx 等)
    path('fanza-products/<str:unique_id>/', views.FanzaProductDetailAPIView.as_view(), name='fanza_product_detail'),

    # ==========================================================
    # 4. アダルト商品 (AdultProduct - DUGA/汎用)
    # ==========================================================
    # 🏆 ランキング (AI解析済み優先)
    path('adult-products/ranking/', views.AdultProductRankingAPIView.as_view(), name='adult_product_ranking'),
    
    # 📋 一覧
    path('adult-products/', views.AdultProductListAPIView.as_view(), name='adult_product_list'),
    
    # 🔍 詳細
    path('adult-products/<str:product_id_unique>/', views.AdultProductDetailAPIView.as_view(), name='adult_product_detail'),

    # ==========================================================
    # 5. Linkshare商品
    # ==========================================================
    path('linkshare/', views.LinkshareProductListAPIView.as_view(), name='linkshare_product_list'),
    path('linkshare/<str:sku>/', views.LinkshareProductDetailAPIView.as_view(), name='linkshare_product_detail'),

    # ==========================================================
    # 6. マスターデータ (エンティティ)
    # ==========================================================
    # 💡 全て /api/actresses/ のような形でアクセス可能。
    # Next.js のサイドバーや絞り込み検索で使用します。
    path('actresses/', views.ActressListAPIView.as_view(), name='actress_list'),
    path('genres/', views.GenreListAPIView.as_view(), name='genre_list'),
    path('makers/', views.MakerListAPIView.as_view(), name='maker_list'),
    path('labels/', views.LabelListAPIView.as_view(), name='label_list'),
    path('directors/', views.DirectorListAPIView.as_view(), name='director_list'),
    path('series/', views.SeriesListAPIView.as_view(), name='series_list'),
    path('authors/', views.AuthorListAPIView.as_view(), name='author_list'),
]