# -*- coding: utf-8 -*-
# E:\SHIN-VPS\django\api\urls.py

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
    # ソフトウェアの場合も unified_genre='software' などでここから取得します
    path('pc-products/', views.PCProductListAPIView.as_view(), name='pc_product_list'),

    # GET /api/pc-makers/
    # メーカー別の製品数やロゴ、リンク用データを取得
    path('pc-makers/', views.PCProductMakerListView.as_view(), name='pc_maker_list'),

    # GET /api/pc-sidebar-stats/
    # 💡 サイドバーの絞り込み用メニュー（CPU別、OS別、ライセンス別などの件数）を動的に取得
    # 内部の views.pc_sidebar_stats で os_support 等の集計ロジックを追加すると便利です
    path('pc-sidebar-stats/', views.pc_sidebar_stats, name='pc_sidebar_stats'),

    # GET /api/pc-products/<unique_id>/
    # 💡 lookup_field='unique_id' により、メーカー固有ID（MSE_xxxなど）で詳細を取得
    path('pc-products/<str:unique_id>/', views.PCProductDetailAPIView.as_view(), name='pc_product_detail'),

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