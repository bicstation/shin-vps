# -*- coding: utf-8 -*-
from rest_framework import generics, filters
from rest_framework.permissions import AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from django.shortcuts import get_object_or_404
from django.db.models import Q

from api.models import (
    AdultProduct, LinkshareProduct, FanzaProduct, 
    Maker, Label, Genre, Actress, Director, Series, Author
)
from api.serializers import (
    AdultProductSerializer, LinkshareProductSerializer, FanzaProductSerializer,
    MakerSerializer, LabelSerializer, GenreSerializer, 
    ActressSerializer, DirectorSerializer, SeriesSerializer, AuthorSerializer
)

# --------------------------------------------------------------------------
# 1. 🆕 FANZA 最適化商品 (FanzaProduct) Views
# --------------------------------------------------------------------------

class FanzaProductListAPIView(generics.ListAPIView):
    """
    FANZA APIの全フロアを統合した一覧表示。
    高度なフィルタリングと検索、スコア順の並び替えに対応。
    """
    queryset = FanzaProduct.objects.all().prefetch_related(
        'maker', 'label', 'director', 'series', 'genres', 'actresses', 'authors'
    ).order_by('-release_date')
    
    serializer_class = FanzaProductSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter, filters.SearchFilter]
    
    filterset_fields = {
        'site_code': ['exact'],
        'service_code': ['exact'],
        'floor_code': ['exact'],
        'genres': ['exact'],
        'actresses': ['exact'],
        'authors': ['exact'],
        'maker': ['exact'],
        'is_active': ['exact'],
        'is_recommend': ['exact'],
    }
    
    # AI解析スコアやレビュー、発売日での並び替えをサポート
    ordering_fields = [
        'id', 'release_date', 'review_average', 'review_count', 
        'score_visual', 'score_story', 'score_cost', 'score_erotic'
    ]
    
    search_fields = ['title', 'product_description', 'ai_summary']

class FanzaProductDetailAPIView(generics.RetrieveUpdateAPIView):
    """
    FANZA商品の詳細取得および更新（AI解析結果の書き込み用）。
    unique_id (fz_xxxx) または DBのIDで取得可能。
    """
    queryset = FanzaProduct.objects.all().prefetch_related(
        'maker', 'label', 'director', 'series', 'genres', 'actresses', 'authors'
    )
    serializer_class = FanzaProductSerializer
    permission_classes = [AllowAny]
    lookup_field = 'unique_id'

    def get_object(self):
        lookup_value = self.kwargs.get(self.lookup_field)
        if lookup_value.isdigit():
            return get_object_or_404(FanzaProduct, id=int(lookup_value))
        return get_object_or_404(FanzaProduct, unique_id=lookup_value)


# --------------------------------------------------------------------------
# 2. アダルト商品 (AdultProduct - 既存) Views
# --------------------------------------------------------------------------

class AdultProductListAPIView(generics.ListAPIView):
    """既存のDUGA/旧式FANZAデータ用一覧"""
    queryset = AdultProduct.objects.all().prefetch_related(
        'maker', 'label', 'director', 'series', 'genres', 'actresses', 'attributes'
    ).order_by('-id') 
    
    serializer_class = AdultProductSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter, filters.SearchFilter]
    
    filterset_fields = {
        'api_source': ['exact'],
        'genres': ['exact'],
        'actresses': ['exact'],
        'maker': ['exact'],
        'series': ['exact'],
        'label': ['exact'],
        'attributes': ['exact'],
        'is_posted': ['exact'],
        'is_active': ['exact'],
    }
    
    ordering_fields = ['id', 'price', 'release_date', 'spec_score', 'last_spec_parsed_at'] 
    search_fields = ['title', 'product_description', 'ai_summary']

class AdultProductDetailAPIView(generics.RetrieveAPIView):
    queryset = AdultProduct.objects.all().prefetch_related(
        'maker', 'label', 'director', 'series', 'genres', 'actresses', 'attributes'
    )
    serializer_class = AdultProductSerializer
    permission_classes = [AllowAny]
    lookup_field = 'product_id_unique'

    def get_object(self):
        lookup_value = self.kwargs.get(self.lookup_field)
        if lookup_value.isdigit():
            return get_object_or_404(AdultProduct, id=int(lookup_value))
        return get_object_or_404(AdultProduct, product_id_unique=lookup_value)


# --------------------------------------------------------------------------
# 3. マスターデータ (Entity) Views
# --------------------------------------------------------------------------

class EntityBaseListView(generics.ListAPIView):
    """マスタデータの基底View"""
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'ruby']
    ordering_fields = ['name', 'product_count', 'created_at']

class ActressListAPIView(EntityBaseListView):
    queryset = Actress.objects.all()
    serializer_class = ActressSerializer

class GenreListAPIView(EntityBaseListView):
    queryset = Genre.objects.all()
    serializer_class = GenreSerializer

class MakerListAPIView(EntityBaseListView):
    queryset = Maker.objects.all()
    serializer_class = MakerSerializer

class LabelListAPIView(EntityBaseListView):
    queryset = Label.objects.all()
    serializer_class = LabelSerializer

class DirectorListAPIView(EntityBaseListView):
    queryset = Director.objects.all()
    serializer_class = DirectorSerializer

class SeriesListAPIView(EntityBaseListView):
    queryset = Series.objects.all()
    serializer_class = SeriesSerializer

class AuthorListAPIView(EntityBaseListView):
    """🆕 著者一覧"""
    queryset = Author.objects.all()
    serializer_class = AuthorSerializer


# --------------------------------------------------------------------------
# 4. Linkshare商品 (既存) Views
# --------------------------------------------------------------------------

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
    
# --------------------------------------------------------------------------
# 5. ランキング・特殊抽出 Views
# --------------------------------------------------------------------------

class AdultProductRankingAPIView(generics.ListAPIView):
    """
    AI解析スコア(spec_score)に基づく総合ランキングAPI。
    AI解析が完了している製品を優先して、スコアの高い順に返します。
    """
    serializer_class = AdultProductSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        # 1. AI要約が存在し、かつスコアが設定されているものを抽出
        # 2. 総合スコア(spec_score)の降順で並び替え
        # 3. 上位30件に絞り込む
        return AdultProduct.objects.filter(
            Q(ai_summary__isnull=False) & ~Q(ai_summary="")
        ).filter(
            spec_score__gt=0
        ).prefetch_related(
            'maker', 'label', 'actresses', 'genres'
        ).order_by('-spec_score', '-release_date')[:30]