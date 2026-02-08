# -*- coding: utf-8 -*-
from django.urls import path
from api import views

urlpatterns = [
    # ==========================================================
    # 1. 認証 (Auth)
    # ==========================================================
    # ログイン・ログアウト
    path('auth/login/', views.login_view, name='api_login'),
    path('auth/logout/', views.logout_view, name='api_logout'),
    
    # ユーザー登録・情報取得
    path('auth/register/', views.register_view, name='api_register'),
    path('auth/me/', views.get_user_view, name='api_user_me'),
    path('auth/user/', views.get_user_view, name='api_user'), # フロントエンドの互換用エイリアス

    # ==========================================================
    # 2. PC・ソフトウェア製品 (PCProduct)
    # ==========================================================
    # 製品一覧・検索
    path('pc-products/', views.PCProductListAPIView.as_view(), name='pc_product_list'),
    
    # ランキング表示
    path('pc-products/ranking/', views.PCProductRankingView.as_view(), name='pc_product_ranking'),
    
    # 製品詳細 (unique_id による取得)
    path('pc-products/<str:unique_id>/', views.PCProductDetailAPIView.as_view(), name='pc_product_detail'),
    
    # 価格推移グラフ用データ
    path('pc-products/<str:unique_id>/price-history/', views.pc_product_price_history, name='pc_product_price_history'),
    
    # メーカー一覧・サイドバー統計
    path('pc-makers/', views.PCProductMakerListView.as_view(), name='pc_maker_list'),
    path('pc-sidebar-stats/', views.pc_sidebar_stats, name='pc_sidebar_stats'),
]