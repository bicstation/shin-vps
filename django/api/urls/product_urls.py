# api/urls/product_urls.py

from django.urls import path
from api.views.product_view import (
    ProductRankingView,
    get_product_detail,
    get_related_products,
    diagnose_pc,
    ProductByUIDView,  # ← これ追加
)

urlpatterns = [
    # 固定ルート
    path('ranking/', ProductRankingView.as_view()),
    path('related/<str:unique_id>/', get_related_products),
    path('diagnose/', diagnose_pc),

    # 👇 これを先に
    path("by-uid/<str:unique_id>/", ProductByUIDView.as_view()),

    # 👇 一番最後（キャッチオール）
    path('detail/<str:unique_id>/', get_product_detail),    
]