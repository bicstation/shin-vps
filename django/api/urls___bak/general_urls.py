# -*- coding: utf-8 -*-
from django.urls import path, re_path
from api import views

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
    
    # 📋 A. 製品一覧
    path('pc-products/', views.PCProductListAPIView.as_view(), name='pc_product_list'),
    
    # 🏆 B. ランキング (🚨 厳格な正規表現で定義)
    # path ではなく re_path を使い、末尾スラッシュまで完全に一致させることで
    # 下の <str:unique_id> への誤配分を物理的に防ぎます。
    re_path(r'^pc-products/ranking/$', views.PCProductRankingView.as_view(), name='pc_product_ranking'),
    
    # 🏭 C. メーカー・統計 (これらも ID と誤認されないよう先に定義)
    path('pc-makers/', views.PCProductMakerListView.as_view(), name='pc_maker_list'),
    path('pc-sidebar-stats/', views.pc_sidebar_stats, name='pc_sidebar_stats'),

    # 🔍 D. 製品詳細 (unique_id)
    # 他の固定パスがすべて外れた後に、残った文字列を ID として認識させます。
    path('pc-products/<str:unique_id>/', views.PCProductDetailAPIView.as_view(), name='pc_product_detail'),
    
    # 📈 E. 価格推移
    path('pc-products/<str:unique_id>/price-history/', views.pc_product_price_history, name='pc_product_price_history'),
]