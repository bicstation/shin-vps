# api/urls/product_urls.py

from django.urls import path
from api.views.product_view import ProductRankingView

urlpatterns = [
    path('ranking/', ProductRankingView.as_view()),
]