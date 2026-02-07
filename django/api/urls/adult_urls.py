# -*- coding: utf-8 -*-
from django.urls import path
from api import views

# 🚀 app_name を指定することで、他アプリとの名前空間の衝突を防ぎます
app_name = 'api'

urlpatterns = [
    # --- アダルト商品 (AdultProduct) ---
    # 💡 一覧取得: 検索やフィルタリングに使用
    path('adult-products/', views.AdultProductListAPIView.as_view(), name='adult_product_list'),
    
    # 💡 詳細取得/更新: lookup_field = 'product_id_unique' に基づく
    # AI解析スクリプト (analyze_adult.py) はここを通じて product_description を読み書きします
    path('adult-products/<str:product_id_unique>/', views.AdultProductDetailAPIView.as_view(), name='adult_product_detail'),

    # --- Linkshare商品 ---
    path('linkshare/', views.LinkshareProductListAPIView.as_view(), name='linkshare_product_list'),
    path('linkshare/<str:sku>/', views.LinkshareProductDetailAPIView.as_view(), name='linkshare_product_detail'),

    # --- マスターデータ (統計取得などでNext.jsから呼ばれるエンドポイント) ---
    path('actresses/', views.ActressListAPIView.as_view(), name='actress_list'),
    path('genres/', views.GenreListAPIView.as_view(), name='genre_list'),
    path('makers/', views.MakerListAPIView.as_view(), name='maker_list'),
    path('labels/', views.LabelListAPIView.as_view(), name='label_list'),
    path('directors/', views.DirectorListAPIView.as_view(), name='director_list'),
    path('series/', views.SeriesListAPIView.as_view(), name='series_list'),
]