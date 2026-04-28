# api/urls/product_urls.py

from django.urls import path
from api.views.product_view import RankingView

urlpatterns = [
    path('ranking/', RankingView.as_view(), name='product-ranking'),
]