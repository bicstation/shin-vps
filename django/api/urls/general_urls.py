# -*- coding: utf-8 -*-
from django.urls import path
from api import views

urlpatterns = [
    # --- 認証 (Auth) ---
    path('auth/login/', views.login_view, name='api_login'),
    path('auth/logout/', views.logout_view, name='api_logout'),
    path('auth/register/', views.register_view, name='api_register'),
    path('auth/me/', views.get_user_view, name='api_user_me'),
    path('auth/user/', views.get_user_view, name='api_user'), # エイリアス

    # --- PC・ソフトウェア製品 (PCProduct) ---
    path('pc-products/', views.PCProductListAPIView.as_view(), name='pc_product_list'),
    path('pc-products/ranking/', views.PCProductRankingView.as_view(), name='pc_product_ranking'),
    path('pc-products/<str:unique_id>/', views.PCProductDetailAPIView.as_view(), name='pc_product_detail'),
    path('pc-products/<str:unique_id>/price-history/', views.pc_product_price_history, name='pc_product_price_history'),
    path('pc-makers/', views.PCProductMakerListView.as_view(), name='pc_maker_list'),
    path('pc-sidebar-stats/', views.pc_sidebar_stats, name='pc_sidebar_stats'),
]