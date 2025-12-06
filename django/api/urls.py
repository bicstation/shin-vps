# E:\SHIN-VPS\django\api\urls.py

from django.urls import path
from . import views

urlpatterns = [
    # ★★★ 0. /api/ ルートエンドポイントの追加 (404解消のため) ★★★
    path('', views.api_root, name='api_root'), 

    # 1. サーバーの稼働確認用 (既存)
    # GET /api/status/
    path('status/', views.status_check, name='status_check'),
    
    # -----------------------------------------------------------
    # ★★★ 2. アダルト商品データ エンドポイント (旧 /api/products/) ★★★
    # -----------------------------------------------------------
    # GET /api/adults/
    path('adults/', views.AdultProductListAPIView.as_view(), name='adult_product_list'),
    
    # GET /api/adults/DUGA-12345/
    # <str:product_id_unique> は views.AdultProductDetailAPIView の lookup_field と連携
    path('adults/<str:product_id_unique>/', views.AdultProductDetailAPIView.as_view(), name='adult_product_detail'),

    # -----------------------------------------------------------
    # ★★★ 3. ノーマル商品データ エンドポイント (新規追加) ★★★
    # -----------------------------------------------------------
    # GET /api/normals/
    path('normals/', views.NormalProductListAPIView.as_view(), name='normal_product_list'),
    
    # GET /api/normals/SKU-98765/
    # <str:sku_unique> は views.NormalProductDetailAPIView の lookup_field と連携
    path('normals/<str:sku_unique>/', views.NormalProductDetailAPIView.as_view(), name='normal_product_detail'),
]