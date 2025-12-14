# E:\SHIN-VPS\django\api\urls.py

from django.urls import path
from . import views

urlpatterns = [
    # ★★★ 0. /api/ ルートエンドポイントの追加 ★★★
    path('', views.api_root, name='api_root'), 

    # 1. サーバーの稼働確認用
    # GET /api/status/
    path('status/', views.status_check, name='status_check'),
    
    # -----------------------------------------------------------
    # ★★★ 2. アダルト商品データ エンドポイント (AdultProduct) ★★★
    # -----------------------------------------------------------
    # GET /api/adults/
    path('adults/', views.AdultProductListAPIView.as_view(), name='adult_product_list'),
    
    # GET /api/adults/DUGA-12345/
    path('adults/<str:product_id_unique>/', views.AdultProductDetailAPIView.as_view(), name='adult_product_detail'),

    # -----------------------------------------------------------
    # ★★★ 3. Linkshare商品データ エンドポイント (LinkshareProduct) ★★★
    # -----------------------------------------------------------
    # ★★★ 修正: URLパス、ビュークラス、nameを Normal -> Linkshare に変更 ★★★
    # GET /api/linkshare/
    path('linkshare/', views.LinkshareProductListAPIView.as_view(), name='linkshare_product_list'),
    
    # ★★★ 修正: URLパス、ビュークラス、URLパラメータを Linkshare/sku に変更 ★★★
    # GET /api/linkshare/SKU-98765/
    # LinkshareProductの lookup_field は 'sku' に設定されているため、パラメータ名も 'sku' に変更します。
    path('linkshare/<str:sku>/', views.LinkshareProductDetailAPIView.as_view(), name='linkshare_product_detail'),
]