# -*- coding: utf-8 -*-
import json
import requests
import logging
from urllib.parse import unquote

from django.db.models import Count
from django.http import Http404, StreamingHttpResponse
from django.shortcuts import get_object_or_404
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import generics, filters, pagination, views, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

# 💡 必要なモデルをインポート
from api.models import (
    PCProduct, PCAttribute, PriceHistory, LinkshareProduct,
    Actress, Genre, Maker, Label, Director, Series, Author,
    FanzaFloorMaster
)

# 💡 シリアライザーのインポート
from api.serializers.general_serializers import (
    PCProductSerializer, 
    LinkshareProductSerializer
)
from api.serializers.adult_serializers import (
    ActressSerializer, GenreSerializer, MakerSerializer, 
    LabelSerializer, DirectorSerializer, SeriesSerializer, AuthorSerializer,
    FanzaFloorMasterSerializer
)

logger = logging.getLogger(__name__)

# --------------------------------------------------------------------------
# 0. ページネーション & 基底クラス
# --------------------------------------------------------------------------

class PCProductLimitOffsetPagination(pagination.LimitOffsetPagination):
    """Next.jsの ?offset=x&limit=y に対応するためのページネーション"""
    default_limit = 10
    max_limit = 100

class MasterEntityListView(generics.ListAPIView):
    """マスタデータ取得の共通ベースクラス"""
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
    serializer_class = PCProductSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        queryset = PCProduct.objects.filter(is_active=True, spec_score__gt=0)
        path = self.request.path
        is_popularity = 'popularity-ranking' in path
        site_type = getattr(self.request, 'site_type', 'station')

        if is_popularity:
            return queryset.order_by('-updated_at', '-spec_score')[:20]
        if site_type == 'saving':
            return queryset.order_by('-score_cost', '-spec_score')[:20]
        
        return queryset.order_by('-spec_score', '-updated_at')[:20]

# --------------------------------------------------------------------------
# 3. 💻 PC・ソフトウェア製品一覧
# --------------------------------------------------------------------------

class PCProductListAPIView(generics.ListAPIView):
    """💻 PC製品の一覧取得・詳細フィルタリング"""
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
    search_fields = ['name', 'cpu_model', 'gpu_model', 'os_support', 'edition', 'description', 'ai_content']
    ordering_fields = [
        'price', 'updated_at', 'created_at', 'memory_gb', 'storage_gb',
        'spec_score', 'score_cpu', 'score_gpu', 'score_cost', 
        'score_portable', 'score_ai', 'npu_tops', 'power_recommendation'
    ]

    def get_queryset(self):
        queryset = PCProduct.objects.filter(is_active=True).prefetch_related('attributes')
        
        maker = self.request.query_params.get('maker')
        if maker:
            queryset = queryset.filter(maker__iexact=unquote(maker))
            
        attribute_slug = self.request.query_params.get('attribute')
        if attribute_slug:
            queryset = queryset.filter(attributes__slug=unquote(attribute_slug))

        max_price = self.request.query_params.get('max_price')
        if max_price:
            try:
                queryset = queryset.filter(price__lte=int(max_price))
            except ValueError: pass

        return queryset.order_by('-updated_at')

# --------------------------------------------------------------------------
# 4. 🔍 製品詳細
# --------------------------------------------------------------------------

class PCProductDetailAPIView(generics.RetrieveAPIView):
    queryset = PCProduct.objects.all().prefetch_related('attributes')
    serializer_class = PCProductSerializer
    permission_classes = [AllowAny]
    lookup_field = 'unique_id'

# --------------------------------------------------------------------------
# 5. 🛠️ PC統計・サイドバー集計 & メーカーリスト
# --------------------------------------------------------------------------

@api_view(['GET'])
@permission_classes([AllowAny])
def pc_sidebar_stats(request):
    """📊 サイドバー統計一括生成 (メーカー・属性)"""
    # 属性集計
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

    # 🚀 メーカー集計 (救済措置: 大文字化)
    maker_raw = PCProduct.objects.filter(is_active=True) \
        .exclude(maker__isnull=True).exclude(maker='') \
        .values('maker') \
        .annotate(count=Count('maker')) \
        .order_by('-count')

    sidebar_data['maker_counts'] = [
        {
            'name': str(m['maker']).upper(),
            'maker': m['maker'], 
            'count': m['count']
        } for m in maker_raw
    ]

    return Response(sidebar_data)

class PCProductMakerListView(APIView):
    """📊 メーカー名の大文字整形・カウント付きリスト取得"""
    permission_classes = [AllowAny]

    def get(self, request):
        maker_raw = PCProduct.objects.filter(is_active=True) \
            .exclude(maker__isnull=True).exclude(maker='') \
            .values('maker') \
            .annotate(count=Count('maker')) \
            .order_by('-count')

        formatted_makers = [
            {
                'name': str(m['maker']).upper(), # 表示用: HP
                'maker': m['maker'],             # クエリ用: hp
                'count': m['count']              # 件数: 146
            } for m in maker_raw
        ]
        return Response(formatted_makers)

@api_view(['GET'])
def pc_product_price_history(request, unique_id):
    product = get_object_or_404(PCProduct, unique_id=unquote(unique_id))
    history = PriceHistory.objects.filter(product=product).order_by('recorded_at')[:30]
    return Response({
        "name": product.name,
        "labels": [h.recorded_at.strftime('%Y/%m/%d') for h in history],
        "prices": [h.price for h in history]
    })

# --------------------------------------------------------------------------
# 6. AIメイド接客 ストリーミング
# --------------------------------------------------------------------------

class PCProductMaidStreamView(views.APIView):
    permission_classes = [AllowAny]
    def get(self, request, unique_id):
        product = get_object_or_404(PCProduct, unique_id=unquote(unique_id))
        prompt = f"あなたは秋葉原のショップBIC STATIONの看板娘です。{product.name}の魅力を語って。最後はニャン！"

        def stream_generator():
            url = "http://172.17.0.1:11434/api/generate"
            payload = {"model": "gemma3:4b", "prompt": prompt, "stream": True}
            try:
                response = requests.post(url, json=payload, stream=True, timeout=(5, 60))
                for line in response.iter_lines():
                    if line:
                        token = json.loads(line.decode('utf-8')).get('response', '')
                        yield token
            except Exception as e:
                yield f"エラーだニャ: {str(e)}"

        return StreamingHttpResponse(stream_generator(), content_type='text/plain; charset=utf-8')

# --------------------------------------------------------------------------
# 7. その他
# --------------------------------------------------------------------------

class LinkshareProductListAPIView(generics.ListAPIView): 
    queryset = LinkshareProduct.objects.all().order_by('-updated_at')
    serializer_class = LinkshareProductSerializer
    permission_classes = [AllowAny]

class LinkshareProductDetailAPIView(generics.RetrieveAPIView): 
    queryset = LinkshareProduct.objects.all()
    serializer_class = LinkshareProductSerializer
    lookup_field = 'sku'

class FanzaFloorNavigationAPIView(views.APIView):
    permission_classes = [AllowAny]
    def get(self, request, *args, **kwargs):
        floors = FanzaFloorMaster.objects.filter(is_active=True).order_by('site_code', 'id')
        serializer = FanzaFloorMasterSerializer(floors, many=True)
        return Response({"officialHierarchy": serializer.data})