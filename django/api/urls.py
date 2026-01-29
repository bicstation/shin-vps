# -*- coding: utf-8 -*-
# /home/maya/dev/shin-vps/django/api/urls.py

from django.urls import path
from . import views

app_name = 'api'  # 名前空間を設定することで、reverse('api:login') 等の利用が可能になります

urlpatterns = [
    # -----------------------------------------------------------
    # 0. /api/ ルートエンドポイント
    # -----------------------------------------------------------
    # APIの全体像を確認するためのエントリーポイント（ブラウザで叩くとマップが表示されます）
    path('', views.api_root, name='api_root'), 

    # 1. サーバーの稼働確認用
    # システムのヘルスチェックや疎通確認に使用
    path('status/', views.status_check, name='status_check'),
    
    # -----------------------------------------------------------
    # 2. 認証 (Auth) エンドポイント
    # -----------------------------------------------------------
    # 💡 Next.js 側（Auth.js / localStorage管理）が利用するログイン・セッション管理
    path('auth/login/', views.login_view, name='api_login'),
    path('auth/logout/', views.logout_view, name='api_logout'),
    path('auth/register/', views.register_view, name='api_register'),
    
    # 💡 ユーザー情報取得 & 更新 (MyPage / Header用)
    # GET: 情報取得 / PATCH: プロフィール項目（bio, status_message等）の更新
    # ユーザーが自分の情報を取得・操作するための主要エンドポイント
    path('auth/me/', views.get_user_view, name='api_user_me'),
    
    # フロントエンドの互換性維持のためのエイリアス
    path('auth/user/', views.get_user_view, name='api_user'),

    # -----------------------------------------------------------
    # 3. PC・ソフトウェア製品データ エンドポイント (PCProduct)
    # -----------------------------------------------------------
    # GET /api/pc-products/ (一覧取得・フィルタリング)
    path('pc-products/', views.PCProductListAPIView.as_view(), name='pc_product_list'),

    # GET /api/pc-products/ranking/ (スコア順・トレンド順ランキング)
    path('pc-products/ranking/', views.PCProductRankingView.as_view(), name='pc_product_ranking'),

    # GET /api/pc-products/<unique_id>/ (詳細情報)
    path('pc-products/<str:unique_id>/', views.PCProductDetailAPIView.as_view(), name='pc_product_detail'),

    # GET /api/pc-products/<unique_id>/price-history/ (価格推移グラフ用)
    path('pc-products/<str:unique_id>/price-history/', views.pc_product_price_history, name='pc_product_price_history'),

    # GET /api/pc-makers/ (PCメーカー一覧)
    path('pc-makers/', views.PCProductMakerListView.as_view(), name='pc_maker_list'),

    # GET /api/pc-sidebar-stats/ (サイドバーのカウント集計)
    path('pc-sidebar-stats/', views.pc_sidebar_stats, name='pc_sidebar_stats'),

    # -----------------------------------------------------------
    # 4. アダルト商品データ エンドポイント (AdultProduct)
    # -----------------------------------------------------------
    # GET /api/adults/ (一覧)
    path('adults/', views.AdultProductListAPIView.as_view(), name='adult_product_list'),
    
    # GET /api/adults/<product_id_unique>/ (詳細)
    path('adults/<str:product_id_unique>/', views.AdultProductDetailAPIView.as_view(), name='adult_product_detail'),

    # -----------------------------------------------------------
    # 5. Linkshare商品データ エンドポイント (LinkshareProduct)
    # -----------------------------------------------------------
    # GET /api/linkshare/ (一覧)
    path('linkshare/', views.LinkshareProductListAPIView.as_view(), name='linkshare_product_list'),
    
    # GET /api/linkshare/<sku>/ (詳細)
    path('linkshare/<str:sku>/', views.LinkshareProductDetailAPIView.as_view(), name='linkshare_product_detail'),

    # -----------------------------------------------------------
    # 6. マスターデータ (共通項目) エンドポイント
    # -----------------------------------------------------------
    # 各エンティティのメタ情報取得（サイドバーの絞り込み用メニューなどに利用）
    path('actresses/', views.ActressListAPIView.as_view(), name='actress_list'),
    path('genres/', views.GenreListAPIView.as_view(), name='genre_list'),
    path('makers/', views.MakerListAPIView.as_view(), name='maker_list'),
    path('labels/', views.LabelListAPIView.as_view(), name='label_list'),
    path('directors/', views.DirectorListAPIView.as_view(), name='director_list'),
    path('series/', views.SeriesListAPIView.as_view(), name='series_list'),
]