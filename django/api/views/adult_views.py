# -*- coding: utf-8 -*-
from rest_framework import generics, filters, pagination
from rest_framework.permissions import AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from django.shortcuts import get_object_or_404
from django.db.models import Q
from api.models import AdultProduct, FanzaProduct, LinkshareProduct
from api.serializers import AdultProductSerializer, FanzaProductSerializer, LinkshareProductSerializer

# --------------------------------------------------------------------------
# 0. ページネーション設定
# --------------------------------------------------------------------------
class StandardResultsSetPagination(pagination.PageNumberPagination):
    """
    Next.js側の表示数(24件)に合わせた標準ページネーション
    """
    page_size = 24
    page_size_query_param = 'page_size'
    max_page_size = 100

# --------------------------------------------------------------------------
# 💡 1. 統合ゲートウェイView (FANZA / DMM / DUGA 共通エンドポイント)
# --------------------------------------------------------------------------
class UnifiedAdultProductListView(generics.ListAPIView):
    """
    FANZA / DMM / DUGA を一つのエンドポイントで仕分ける
    ?api_source=DUGA  -> AdultProduct(DUGA)から取得
    ?api_source=FANZA -> FanzaProduct(site_code=FANZA)から取得
    ?api_source=DMM   -> FanzaProduct(site_code=DMM)から取得
    """
    permission_classes = [AllowAny]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter, filters.SearchFilter]

    # 個別フィルタリングの設定を統合
    filterset_fields = {
        'genres': ['exact'],
        'actresses': ['exact'],
        'maker': ['exact'],
        'maker__slug': ['exact'],
        'price': ['exact', 'gte', 'lte'],
    }
    search_fields = ['title', 'product_description', 'ai_summary']
    ordering_fields = ['release_date', 'price', 'review_average', 'spec_score']

    def get_queryset(self):
        source = self.request.query_params.get('api_source', '').upper()
        maker_slug = self.request.query_params.get('maker__slug')

        # --- DUGA (AdultProductモデル) の場合 ---
        if source == 'DUGA':
            qs = AdultProduct.objects.filter(is_active=True).select_related(
                'maker', 'label', 'director', 'series'
            ).prefetch_related(
                'genres', 'actresses'
            )
            if maker_slug:
                qs = qs.filter(maker__slug=maker_slug)
            return qs.order_by('-release_date')
        
        # --- FANZA / DMM (FanzaProductモデル) の場合 ---
        # api_sourceが未指定、あるいはFANZA/DMMの場合
        site = 'FANZA' if source not in ['DMM', 'FANZA'] else source
        
        qs = FanzaProduct.objects.filter(
            site_code=site, 
            is_active=True
        ).select_related(
            'maker', 'label', 'director', 'series'
        ).prefetch_related(
            'genres', 'actresses'
        )
        
        if maker_slug:
            qs = qs.filter(maker__slug=maker_slug)
        
        return qs.order_by('-release_date')

    def get_serializer_class(self):
        """api_sourceに応じてシリアライザーを切り替える"""
        source = self.request.query_params.get('api_source', '').upper()
        if source == 'DUGA':
            return AdultProductSerializer
        return FanzaProductSerializer

# --------------------------------------------------------------------------
# 2. FANZA / DMM 専用View
# --------------------------------------------------------------------------
class FanzaProductListAPIView(generics.ListAPIView):
    """FANZA Direct API 系の個別一覧"""
    queryset = FanzaProduct.objects.filter(is_active=True).select_related(
        'maker', 'label'
    ).prefetch_related('genres', 'actresses').order_by('-release_date')
    serializer_class = FanzaProductSerializer
    permission_classes = [AllowAny]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter, filters.SearchFilter]
    filterset_fields = ['site_code', 'maker', 'genres', 'actresses', 'is_recommend']
    search_fields = ['title', 'product_description']

class FanzaProductDetailAPIView(generics.RetrieveAPIView):
    """FANZA製品の詳細"""
    queryset = FanzaProduct.objects.all().select_related('maker', 'label').prefetch_related('genres', 'actresses')
    serializer_class = FanzaProductSerializer
    permission_classes = [AllowAny]
    lookup_field = 'unique_id'

# --------------------------------------------------------------------------
# 3. AdultProduct (DUGA等) 専用View
# --------------------------------------------------------------------------
class AdultProductListAPIView(generics.ListAPIView):
    """DUGA / 正規化データの個別一覧"""
    queryset = AdultProduct.objects.filter(is_active=True).select_related(
        'maker', 'label'
    ).prefetch_related('genres', 'actresses').order_by('-release_date')
    serializer_class = AdultProductSerializer
    permission_classes = [AllowAny]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter, filters.SearchFilter]
    filterset_fields = ['api_source', 'maker', 'genres', 'actresses']
    search_fields = ['title', 'product_description']

class AdultProductDetailAPIView(generics.RetrieveAPIView):
    """AdultProductの詳細"""
    queryset = AdultProduct.objects.all().select_related('maker', 'label').prefetch_related('genres', 'actresses')
    serializer_class = AdultProductSerializer
    permission_classes = [AllowAny]
    lookup_field = 'product_id_unique'

# --------------------------------------------------------------------------
# 4. 特殊抽出 View (ランキング等)
# --------------------------------------------------------------------------
class AdultProductRankingAPIView(generics.ListAPIView):
    """AI解析スコア(spec_score)に基づく総合ランキング"""
    serializer_class = AdultProductSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        # スコアがあり、かつAIサマリーが存在するものを優先して抽出
        return AdultProduct.objects.filter(
            spec_score__gt=0,
            is_active=True
        ).exclude(
            ai_summary=""
        ).select_related('maker', 'label').order_by('-spec_score', '-release_date')[:30]

class LinkshareProductListAPIView(generics.ListAPIView):
    """物販系Linkshare商品の一覧"""
    queryset = LinkshareProduct.objects.all().order_by('-updated_at')
    serializer_class = LinkshareProductSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    search_fields = ['product_name', 'sku']