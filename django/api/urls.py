# E:\SHIN-VPS\django\api\urls.py

from django.urls import path
from . import views

urlpatterns = [
    # -----------------------------------------------------------
    # 0. /api/ ルートエンドポイント
    # -----------------------------------------------------------
    # APIの全体マップを表示 (各カテゴリへのリンクを提供)
    path('', views.api_root, name='api_root'), 

    # 1. サーバーの稼働確認用
    # GET /api/status/
    path('status/', views.status_check, name='status_check'),
    
    # -----------------------------------------------------------
    # 2. アダルト商品データ エンドポイント (AdultProduct)
    # -----------------------------------------------------------
    # GET /api/adults/
    path('adults/', views.AdultProductListAPIView.as_view(), name='adult_product_list'),
    
    # GET /api/adults/DUGA-12345/
    path('adults/<str:product_id_unique>/', views.AdultProductDetailAPIView.as_view(), name='adult_product_detail'),

    # -----------------------------------------------------------
    # 3. PC製品データ エンドポイント (PCProduct)
    # -----------------------------------------------------------
    # 最新版：AI解説(ai_content)・在庫ステータス(stock_status)・アフィリエイトURL対応版
    
    # GET /api/pc-products/
    # 💡 QueryParams (?site=lenovo, ?maker=acer, ?genre=gaming等) による絞り込みに対応
    path('pc-products/', views.PCProductListAPIView.as_view(), name='pc_product_list'),

    # GET /api/pc-products/4515777630658/
    # 💡 unique_id（JANコードやメーカー固有ID）で個別の詳細データを取得
    path('pc-products/<str:unique_id>/', views.PCProductDetailAPIView.as_view(), name='pc_product_detail'),

    # -----------------------------------------------------------
    # 4. Linkshare商品データ エンドポイント (LinkshareProduct)
    # -----------------------------------------------------------
    # GET /api/linkshare/
    path('linkshare/', views.LinkshareProductListAPIView.as_view(), name='linkshare_product_list'),
    
    # GET /api/linkshare/SKU-98765/
    path('linkshare/<str:sku>/', views.LinkshareProductDetailAPIView.as_view(), name='linkshare_product_detail'),

    # -----------------------------------------------------------
    # 5. マスターデータ (仕分け項目) エンドポイント
    # -----------------------------------------------------------
    # GET /api/actresses/
    path('actresses/', views.ActressListAPIView.as_view(), name='actress_list'),

    # GET /api/genres/
    path('genres/', views.GenreListAPIView.as_view(), name='genre_list'),

    # GET /api/makers/
    path('makers/', views.MakerListAPIView.as_view(), name='maker_list'),

    # GET /api/labels/
    path('labels/', views.LabelListAPIView.as_view(), name='label_list'),

    # GET /api/directors/
    path('directors/', views.DirectorListAPIView.as_view(), name='director_list'),

    # GET /api/series/
    path('series/', views.SeriesListAPIView.as_view(), name='series_list'),
]