# -*- coding: utf-8 -*-
# /home/maya/dev/shin-vps/django/api/views/general_views.py

from rest_framework import generics, filters, pagination, views, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from django.db.models import Count
from django_filters.rest_framework import DjangoFilterBackend
from django.shortcuts import get_object_or_404
from django.http import Http404
from urllib.parse import unquote

# 💡 必要なモデルをインポート
from api.models import (
    PCProduct, PCAttribute, PriceHistory, LinkshareProduct,
    Actress, Genre, Maker, Label, Director, Series, Author,
    FanzaFloorMaster
)

# 💡 インポート先の修正
# 1. PC系および共通シリアライザー (general_serializers.py から)
from api.serializers.general_serializers import (
    PCProductSerializer, 
    LinkshareProductSerializer
)

# 2. アダルト系マスタ・階層シリアライザー (adult_serializers.py から)
from api.serializers.adult_serializers import (
    ActressSerializer, GenreSerializer, MakerSerializer, 
    LabelSerializer, DirectorSerializer, SeriesSerializer, AuthorSerializer,
    FanzaFloorMasterSerializer
)

# --------------------------------------------------------------------------
# 0. ページネーション & 基底クラス
# --------------------------------------------------------------------------

class PCProductLimitOffsetPagination(pagination.LimitOffsetPagination):
    """
    Next.jsの ?offset=x&limit=y に対応するためのページネーション
    """
    default_limit = 10
    max_limit = 100

class MasterEntityListView(generics.ListAPIView):
    """
    マスタデータ（女優・ジャンル等）取得の共通ベースクラス。
    """
    permission_classes = [AllowAny]
    pagination_class = None
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'slug', 'ruby']
    ordering = ['name']

# --------------------------------------------------------------------------
# 1. 共通マスタデータ View 実装
# --------------------------------------------------------------------------

class ActressListAPIView(MasterEntityListView):
    queryset = Actress.objects.all().order_by('-product_count', 'name')
    serializer_class = ActressSerializer

class GenreListAPIView(MasterEntityListView):
    queryset = Genre.objects.all().order_by('-product_count', 'name')
    serializer_class = GenreSerializer

class MakerListAPIView(MasterEntityListView):
    queryset = Maker.objects.all().order_by('-product_count', 'name')
    serializer_class = MakerSerializer

class LabelListAPIView(MasterEntityListView):
    queryset = Label.objects.all().order_by('-product_count', 'name')
    serializer_class = LabelSerializer

class DirectorListAPIView(MasterEntityListView):
    queryset = Director.objects.all().order_by('-product_count', 'name')
    serializer_class = DirectorSerializer

class SeriesListAPIView(MasterEntityListView):
    queryset = Series.objects.all().order_by('-product_count', 'name')
    serializer_class = SeriesSerializer

class AuthorListAPIView(MasterEntityListView):
    queryset = Author.objects.all().order_by('-product_count', 'name')
    serializer_class = AuthorSerializer

# --------------------------------------------------------------------------
# 2. 🏆 PC製品ランキング View
# --------------------------------------------------------------------------

class PCProductRankingView(generics.ListAPIView):
    """
    PC製品のランキング一覧を返す。
    site_type に基づき、コスパ重視か総合スコア重視かを自動判定。
    """
    serializer_class = PCProductSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        queryset = PCProduct.objects.filter(is_active=True, spec_score__gt=0)
        site_type = getattr(self.request, 'site_type', 'station')
        
        if site_type == 'saving':
            return queryset.order_by('-score_cost', '-spec_score')[:20]
        
        return queryset.order_by('-spec_score', '-updated_at')[:20]

# --------------------------------------------------------------------------
# 3. 💻 PC・ソフトウェア製品一覧 (PCProduct)
# --------------------------------------------------------------------------

class PCProductListAPIView(generics.ListAPIView):
    """
    PC製品の一覧取得・詳細フィルタリング・検索
    """
    serializer_class = PCProductSerializer
    pagination_class = PCProductLimitOffsetPagination
    permission_classes = [AllowAny]
    
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter, filters.SearchFilter]
    filterset_fields = [
        'site_prefix', 'unified_genre', 'stock_status', 
        'is_posted', 'is_ai_pc', 'is_download',
        'cpu_socket', 'motherboard_chipset', 'ram_type',
        'license_term', 'edition'
    ]
    
    search_fields = [
        'name', 'cpu_model', 'gpu_model', 'os_support',
        'edition', 'description', 'ai_content'
    ]
    
    ordering_fields = [
        'price', 'updated_at', 'created_at', 'memory_gb', 
        'spec_score', 'score_cpu', 'score_gpu', 'score_cost', 
        'score_portable', 'score_ai', 'npu_tops', 'power_recommendation'
    ]

    def get_queryset(self):
        queryset = PCProduct.objects.filter(is_active=True).prefetch_related('attributes')
        
        maker = self.request.query_params.get('maker')
        attribute_slug = self.request.query_params.get('attribute')
        
        if maker:
            queryset = queryset.filter(maker__iexact=unquote(maker))
        if attribute_slug:
            queryset = queryset.filter(attributes__slug=unquote(attribute_slug))
        
        site_type = getattr(self.request, 'site_type', 'station')
        if site_type == 'saving':
            return queryset.order_by('stock_status', '-score_cost', '-updated_at')
        
        return queryset.order_by('-updated_at', 'id')

# --------------------------------------------------------------------------
# 4. 🔍 製品詳細 (PCProductDetail)
# --------------------------------------------------------------------------

class PCProductDetailAPIView(generics.RetrieveAPIView):
    queryset = PCProduct.objects.all().prefetch_related('attributes')
    serializer_class = PCProductSerializer
    permission_classes = [AllowAny]
    lookup_field = 'unique_id'
    lookup_url_kwarg = 'unique_id'

    def get_object(self):
        unique_id = self.kwargs.get(self.lookup_url_kwarg)
        if unique_id == 'ranking':
            raise Http404("Invalid ID: 'ranking' is a reserved keyword.")
        return super().get_object()

# --------------------------------------------------------------------------
# 5. 🛠️ PC統計・履歴・メーカー API
# --------------------------------------------------------------------------

class PCProductMakerListView(APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        genre = request.query_params.get('genre')
        qs = PCProduct.objects.filter(is_active=True).exclude(maker__isnull=True).exclude(maker='')
        if genre:
            qs = qs.filter(unified_genre=genre)
        maker_counts = qs.values('maker').annotate(count=Count('id')).order_by('maker')
        return Response(list(maker_counts))

@api_view(['GET'])
@permission_classes([AllowAny])
def pc_sidebar_stats(request):
    attrs = PCAttribute.objects.annotate(
        product_count=Count('products')
    ).filter(product_count__gt=0).order_by('attr_type', 'order', 'name')
    
    sidebar_data = {}
    for attr in attrs:
        type_display = attr.get_attr_type_display()
        if type_display and ". " in type_display:
            type_display = type_display.split(". ", 1)[1]
        if type_display not in sidebar_data:
            sidebar_data[type_display] = []
        sidebar_data[type_display].append({
            'id': attr.id, 'name': attr.name, 'slug': attr.slug, 'count': attr.product_count
        })
    return Response(sidebar_data)

@api_view(['GET'])
@permission_classes([AllowAny])
def pc_product_price_history(request, unique_id):
    decoded_id = unquote(unique_id)
    if decoded_id == 'ranking':
        raise Http404()
    product = get_object_or_404(PCProduct, unique_id=decoded_id)
    history = PriceHistory.objects.filter(product=product).order_by('recorded_at')[:30]
    return Response({
        "name": product.name,
        "labels": [h.recorded_at.strftime('%Y/%m/%d') for h in history],
        "prices": [h.price for h in history]
    })

# --------------------------------------------------------------------------
# 6. Linkshare商品 Views
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
# 7. 🗺️ 階層ナビゲーション (Floor Master)
# --------------------------------------------------------------------------

class FanzaFloorNavigationAPIView(views.APIView):
    """
    Next.jsのサイドメニューを動的に生成するためのエンドポイント。
    FanzaFloorMasterSerializer を使用して正規化された階層データを返却。
    """
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        # サービス・フロア階層をすべて取得
        floors = FanzaFloorMaster.objects.filter(is_active=True).order_by('site_code', 'service_code', 'id')
        
        # アダルト用シリアライザーを使用
        serializer = FanzaFloorMasterSerializer(floors, many=True)
        
        return Response({
            "officialHierarchy": serializer.data
        }, status=status.HTTP_200)