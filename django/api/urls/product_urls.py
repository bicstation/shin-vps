# api/urls/product_urls.py

from django.urls import path
from api.views.product_view import ProductRankingView
from api.views.product_view import get_product_detail

urlpatterns = [
    path('ranking/', ProductRankingView.as_view()),

    # 🔥 ここ修正
    path('<str:unique_id>/', get_product_detail),
]