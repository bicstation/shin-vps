# E:\SHIN-VPS\django\api\urls.py

from django.urls import path
from . import views

urlpatterns = [
    # 1. サーバーの稼働確認用 (既存)
    # GET /api/status/
    path('status/', views.status_check, name='status_check'),
    
    # 2. 商品データ一覧の取得用 (新規追加)
    # GET /api/products/ (ページネーション有効)
    path('products/', views.ProductListAPIView.as_view(), name='product_list'), 
    
    # 3. 特定の製品データの取得用 (新規追加)
    # GET /api/products/DUGA-12345/ (例: product_id_unique を使用)
    # <str:product_id_unique> は views.ProductDetailAPIView の lookup_field と連携します
    path('products/<str:product_id_unique>/', views.ProductDetailAPIView.as_view(), name='product_detail'),
]