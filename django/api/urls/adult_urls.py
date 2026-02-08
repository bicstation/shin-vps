# -*- coding: utf-8 -*-
from django.urls import path
from api import views

# 🚀 app_name を指定することで、他アプリとの名前空間の衝突を防ぎます
app_name = 'api'

urlpatterns = [
    # --- 🆕 FANZA 最適化商品 (FanzaProduct) ---
    # 💡 全フロア統合一覧: サービス(digital/mono)やフロアでのフィルタリングに対応
    path('fanza-products/', views.FanzaProductListAPIView.as_view(), name='fanza_product_list'),
    
    # 💡 詳細取得/更新: unique_id (fz_xxxx) に基づく
    # AI解析やチャートデータの更新はこのエンドポイントを介して行います
    path('fanza-products/<str:unique_id>/', views.FanzaProductDetailAPIView.as_view(), name='fanza_product_detail'),
    # 🆕 ランキング用を詳細パスより「上」に追加
    path('adult-products/ranking/', views.AdultProductRankingAPIView.as_view(), name='adult_product_ranking'),

    # --- アダルト商品 (AdultProduct - 既存) ---
    path('adult-products/', views.AdultProductListAPIView.as_view(), name='adult_product_list'),
    path('adult-products/<str:product_id_unique>/', views.AdultProductDetailAPIView.as_view(), name='adult_product_detail'),

    # --- Linkshare商品 (既存) ---
    path('linkshare/', views.LinkshareProductListAPIView.as_view(), name='linkshare_product_list'),
    path('linkshare/<str:sku>/', views.LinkshareProductDetailAPIView.as_view(), name='linkshare_product_detail'),

    # --- PC製品 (PCProduct) ---
    path('pc-products/', views.PCProductListAPIView.as_view(), name='pc_product_list'),
    path('pc-products/<str:product_id>/', views.PCProductDetailAPIView.as_view(), name='pc_product_detail'),

    # --- マスターデータ (エンティティ) ---
    # Next.js の検索条件生成や、ランキング表示などで使用
    path('actresses/', views.ActressListAPIView.as_view(), name='actress_list'),
    path('genres/', views.GenreListAPIView.as_view(), name='genre_list'),
    path('makers/', views.MakerListAPIView.as_view(), name='maker_list'),
    path('labels/', views.LabelListAPIView.as_view(), name='label_list'),
    path('directors/', views.DirectorListAPIView.as_view(), name='director_list'),
    path('series/', views.SeriesListAPIView.as_view(), name='series_list'),
    path('authors/', views.AuthorListAPIView.as_view(), name='author_list'), # 🆕 読み放題/電子書籍用
]