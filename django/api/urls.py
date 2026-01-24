# -*- coding: utf-8 -*-
# /home/maya/dev/shin-vps/django/api/urls.py

from django.urls import path
from . import views

urlpatterns = [
    # -----------------------------------------------------------
    # 0. /api/ ルートエンドポイント
    # -----------------------------------------------------------
    # APIの全体像を確認するためのエントリーポイント
    path('', views.api_root, name='api_root'), 

    # 1. サーバーの稼働確認用
    # システムのヘルスチェックや疎通確認に使用
    path('status/', views.status_check, name='status_check'),
    
    # -----------------------------------------------------------
    # 2. アダルト商品データ エンドポイント (AdultProduct)
    # -----------------------------------------------------------
    path('adults/', views.AdultProductListAPIView.as_view(), name='adult_product_list'),
    path('adults/<str:product_id_unique>/', views.AdultProductDetailAPIView.as_view(), name='adult_product_detail'),

    # -----------------------------------------------------------
    # 3. PC・ソフトウェア製品データ エンドポイント (PCProduct)
    # -----------------------------------------------------------
    # GET /api/pc-products/
    # 💡 フィルタ（cpu_socket, maker, unified_genre等）を適用して一覧を取得
    path('pc-products/', views.PCProductListAPIView.as_view(), name='pc_product_list'),

    # GET /api/pc-products/ranking/
    # 🏆 AI解析スコア(spec_score)が高い順に取得（スペック最強ランキング）
    path('pc-products/ranking/', views.PCProductRankingView.as_view(), name='pc_product_ranking'),

    # 🚀 【新設】GET /api/pc-products/popularity-ranking/
    # 🔥 注目度（PV数）が高い順に取得（トレンドランキング・ベスト100）
    path('pc-products/popularity-ranking/', views.PCProductPopularityRankingView.as_view(), name='pc_product_popularity_ranking'),

    # GET /api/pc-makers/
    # メーカー別の製品数やロゴ、リンク用データを取得
    path('pc-makers/', views.PCProductMakerListView.as_view(), name='pc_maker_list'),

    # GET /api/pc-sidebar-stats/
    # 💡 サイドバーの絞り込み用メニューを動的に取得
    path('pc-sidebar-stats/', views.pc_sidebar_stats, name='pc_sidebar_stats'),

    # GET /api/pc-products/<unique_id>/
    # 💡 詳細情報を取得。アクセス時にPVもカウントされます
    path('pc-products/<str:unique_id>/', views.PCProductDetailAPIView.as_view(), name='pc_product_detail'),

    # GET /api/pc-products/<unique_id>/price-history/
    # 📈 特定製品の価格推移データを取得（グラフ表示用）
    path('pc-products/<str:unique_id>/price-history/', views.pc_product_price_history, name='pc_product_price_history'),

    # 📉 注目度ランキング・PV数の推移データを取得（グラフ表示用）
    # ※ views.py に stats_history 取得関数が定義されていることを前提としています
    # path('pc-products/<str:unique_id>/stats-history/', views.pc_product_stats_history, name='pc_product_stats_history'),

    # -----------------------------------------------------------
    # 4. Linkshare商品データ エンドポイント (LinkshareProduct)
    # -----------------------------------------------------------
    path('linkshare/', views.LinkshareProductListAPIView.as_view(), name='linkshare_product_list'),
    path('linkshare/<str:sku>/', views.LinkshareProductDetailAPIView.as_view(), name='linkshare_product_detail'),

    # -----------------------------------------------------------
    # 5. マスターデータ (仕分け項目) エンドポイント
    # -----------------------------------------------------------
    path('actresses/', views.ActressListAPIView.as_view(), name='actress_list'),
    path('genres/', views.GenreListAPIView.as_view(), name='genre_list'),
    path('makers/', views.MakerListAPIView.as_view(), name='maker_list'),
    path('labels/', views.LabelListAPIView.as_view(), name='label_list'),
    path('directors/', views.DirectorListAPIView.as_view(), name='director_list'),
    path('series/', views.SeriesListAPIView.as_view(), name='series_list'),
]