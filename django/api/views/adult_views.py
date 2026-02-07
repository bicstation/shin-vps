# -*- coding: utf-8 -*-
from rest_framework import generics, filters
from rest_framework.permissions import AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from django.shortcuts import get_object_or_404
from api.models import AdultProduct, LinkshareProduct
from api.serializers import AdultProductSerializer, LinkshareProductSerializer

class AdultProductListAPIView(generics.ListAPIView):
    # 💡 修正：attributes (AdultAttribute) を prefetch_related に追加してクエリを最適化
    queryset = AdultProduct.objects.all().prefetch_related(
        'maker', 'label', 'director', 'series', 'genres', 'actresses', 'attributes'
    ).order_by('-id') 
    
    serializer_class = AdultProductSerializer
    permission_classes = [AllowAny]
    
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter, filters.SearchFilter]
    
    # 💡 修正：新しいカラム（is_posted, is_active等）での絞り込みを可能にする
    filterset_fields = {
        'api_source': ['exact'],      # DUGAかFANZAかで絞り込み可能に
        'genres': ['exact'],
        'actresses': ['exact'],
        'maker': ['exact'],
        'series': ['exact'],
        'label': ['exact'],
        'attributes': ['exact'],      # 属性タグでの絞り込み
        'is_posted': ['exact'],       # ブログ投稿済みかどうか
        'is_active': ['exact'],       # 掲載中かどうか
    }
    
    # 💡 修正：スコア順や解析日順での並び替えをサポート
    ordering_fields = ['id', 'price', 'release_date', 'spec_score', 'last_spec_parsed_at'] 
    
    # 🚀 修正：作品紹介文 (product_description) も検索対象に含める
    search_fields = ['title', 'product_description', 'ai_summary']

class AdultProductDetailAPIView(generics.RetrieveAPIView):
    # 💡 修正：詳細画面でも属性データを一括取得
    queryset = AdultProduct.objects.all().prefetch_related(
        'maker', 'label', 'director', 'series', 'genres', 'actresses', 'attributes'
    )
    serializer_class = AdultProductSerializer
    permission_classes = [AllowAny]
    lookup_field = 'product_id_unique'

    def get_object(self):
        lookup_value = self.kwargs.get(self.lookup_field)
        # 数値（ID）か、一意識別子（product_id_unique）の両方に対応
        if lookup_value.isdigit():
            return get_object_or_404(AdultProduct, id=int(lookup_value))
        return get_object_or_404(AdultProduct, product_id_unique=lookup_value)

class LinkshareProductListAPIView(generics.ListAPIView): 
    queryset = LinkshareProduct.objects.all().order_by('-updated_at')
    serializer_class = LinkshareProductSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    search_fields = ['product_name', 'sku']

class LinkshareProductDetailAPIView(generics.RetrieveAPIView): 
    queryset = LinkshareProduct.objects.all()
    serializer_class = LinkshareProductSerializer
    permission_classes = [AllowAny]
    lookup_field = 'sku'