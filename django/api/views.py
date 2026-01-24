# -*- coding: utf-8 -*-
from django.http import JsonResponse
from rest_framework import generics, filters, pagination
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.db.models import Count, F, Max
from django_filters.rest_framework import DjangoFilterBackend
from django.shortcuts import get_object_or_404
from django.utils import timezone
import logging
from urllib.parse import unquote

# ログの設定
logger = logging.getLogger(__name__)

# シリアライザのインポート
from .serializers import (
    AdultProductSerializer, 
    LinkshareProductSerializer,
    PCProductSerializer,  
    ActressSerializer,
    GenreSerializer,
    MakerSerializer,
    LabelSerializer,
    DirectorSerializer,
    SeriesSerializer
)

# モデルのインポート
from .models import (
    AdultProduct, 
    LinkshareProduct, 
    Actress, 
    Genre, 
    Maker, 
    Label, 
    Director, 
    Series
)
# PC製品モデル & 統計モデル
from .models.pc_products import PCProduct, PCAttribute, PriceHistory
from .models.pc_stats import ProductDailyStats

# --------------------------------------------------------------------------
# 💡 カスタムページネーション
# --------------------------------------------------------------------------
class PCProductLimitOffsetPagination(pagination.LimitOffsetPagination):
    default_limit = 10
    max_limit = 100

# --------------------------------------------------------------------------
# 0. /api/ ルートエンドポイント
# --------------------------------------------------------------------------
def api_root(request):
    return JsonResponse({
        "message": "Welcome to Tiper API Gateway", 
        "endpoints": {
            "status": "/api/status/",
            "products": {
                "pc_products_list": "/api/pc-products/", 
                "pc_ranking": "/api/pc-products/ranking/",
                "pc_popularity_ranking": "/api/pc-products/popularity-ranking/",
                "pc_product_makers": "/api/pc-makers/",
                "pc_sidebar_stats": "/api/pc-sidebar-stats/",
                "pc_product_detail": "/api/pc-products/{unique_id}/", 
                "pc_price_history": "/api/pc-products/{unique_id}/price-history/",
                "pc_stats_history": "/api/pc-products/{unique_id}/stats-history/",
                "adult_products_list": "/api/adults/",
                "linkshare_products_list": "/api/linkshare/",
            }
        }
    }, status=200)

def status_check(request):
    return JsonResponse({"status": "API is running"}, status=200)

# --------------------------------------------------------------------------
# 1. アダルト商品データ API
# --------------------------------------------------------------------------
class AdultProductListAPIView(generics.ListAPIView):
    queryset = AdultProduct.objects.all().prefetch_related(
        'maker', 'label', 'director', 'series', 'genres', 'actresses'
    ).order_by('-id') 
    serializer_class = AdultProductSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter, filters.SearchFilter]
    filterset_fields = {'genres': ['exact'], 'actresses': ['exact'], 'maker': ['exact']}
    ordering_fields = ['id', 'price', 'release_date'] 
    search_fields = ['title']

class AdultProductDetailAPIView(generics.RetrieveAPIView):
    queryset = AdultProduct.objects.all().prefetch_related('maker', 'label', 'director')
    serializer_class = AdultProductSerializer
    lookup_field = 'product_id_unique'

    def get_object(self):
        lookup_value = self.kwargs[self.lookup_field]
        if lookup_value.isdigit():
            return get_object_or_404(AdultProduct, id=int(lookup_value))
        return get_object_or_404(AdultProduct, product_id_unique=lookup_value)

# --------------------------------------------------------------------------
# 2. PC製品データ API
# --------------------------------------------------------------------------
class PCProductListAPIView(generics.ListAPIView):
    serializer_class = PCProductSerializer
    pagination_class = PCProductLimitOffsetPagination
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter, filters.SearchFilter]
    filterset_fields = {'site_prefix', 'unified_genre', 'stock_status'}
    search_fields = ['name', 'cpu_model', 'gpu_model']
    ordering_fields = ['price', 'spec_score', 'updated_at']

    def get_queryset(self):
        queryset = PCProduct.objects.filter(is_active=True).prefetch_related(
            'attributes', 'daily_stats'
        )
        maker = self.request.query_params.get('maker')
        if maker:
            queryset = queryset.filter(maker__iexact=unquote(maker))
        return queryset.order_by('-updated_at')

class PCProductDetailAPIView(generics.RetrieveAPIView):
    queryset = PCProduct.objects.all().prefetch_related('attributes', 'daily_stats')
    serializer_class = PCProductSerializer
    lookup_field = 'unique_id'

    def get_object(self):
        unique_id = unquote(self.kwargs.get(self.lookup_field))
        product = get_object_or_404(PCProduct, unique_id=unique_id)
        
        try:
            today = timezone.now().date()
            stats, created = ProductDailyStats.objects.get_or_create(
                product=product,
                date=today
            )
            stats.pv_count = F('pv_count') + 1
            stats.save(update_fields=['pv_count'])
        except Exception as e:
            logger.error(f"Failed to track PV for product {product.unique_id}: {str(e)}")
            
        return product

class PCProductMakerListView(APIView):
    def get(self, request):
        qs = PCProduct.objects.filter(is_active=True).exclude(maker__isnull=True).exclude(maker='')
        maker_counts = qs.values('maker').annotate(count=Count('id')).order_by('maker')
        return Response(list(maker_counts))

@api_view(['GET'])
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
def pc_product_price_history(request, unique_id):
    product = get_object_or_404(PCProduct, unique_id=unquote(unique_id))
    history = PriceHistory.objects.filter(product=product).order_by('-recorded_at')[:30]
    history = reversed(history)
    
    data = {
        "name": product.name,
        "labels": [h.recorded_at.strftime('%m/%d') for h in history],
        "prices": [h.price for h in history]
    }
    return Response(data)

@api_view(['GET'])
def pc_product_stats_history(request, unique_id):
    """
    📈 特定製品の「注目度(PV)」の推移データを取得（グラフ表示用）
    """
    product = get_object_or_404(PCProduct, unique_id=unquote(unique_id))
    # 直近30日分の統計を取得
    stats = ProductDailyStats.objects.filter(product=product).order_by('-date')[:30]
    # 時系列順（古い順）に並べ替え
    stats_list = sorted(list(stats), key=lambda x: x.date)

    data = {
        "name": product.name,
        "labels": [s.date.strftime('%m/%d') for s in stats_list],
        "values": [s.pv_count for s in stats_list]
    }
    return Response(data)

# --------------------------------------------------------------------------
# 🚀 ランキング (スペック順 & 注目度順)
# --------------------------------------------------------------------------

class PCProductRankingView(generics.ListAPIView):
    """スペック性能(spec_score)順のランキング"""
    serializer_class = PCProductSerializer
    pagination_class = None 

    def get_queryset(self):
        return PCProduct.objects.filter(
            is_active=True, 
            spec_score__isnull=False,
            cpu_model__isnull=False,
            price__gt=0
        ).exclude(
            cpu_model=""
        ).prefetch_related('attributes', 'daily_stats').order_by('-spec_score')[:1000]

class PCProductPopularityRankingView(generics.ListAPIView):
    """
    🔥 注目度ランキング (PV数ベース)
    直近の最大PV数が多い順にベスト100を返す
    """
    serializer_class = PCProductSerializer
    pagination_class = None

    def get_queryset(self):
        return PCProduct.objects.filter(
            is_active=True
        ).annotate(
            latest_pv=Max('daily_stats__pv_count')
        ).prefetch_related('attributes', 'daily_stats').order_by('-latest_pv', '-spec_score')[:100]

# --------------------------------------------------------------------------
# 3. Linkshare & マスターデータ
# --------------------------------------------------------------------------
class LinkshareProductListAPIView(generics.ListAPIView): 
    queryset = LinkshareProduct.objects.all().order_by('-updated_at')
    serializer_class = LinkshareProductSerializer

class LinkshareProductDetailAPIView(generics.RetrieveAPIView): 
    queryset = LinkshareProduct.objects.all()
    serializer_class = LinkshareProductSerializer
    lookup_field = 'sku'

class ActressListAPIView(generics.ListAPIView):
    queryset = Actress.objects.all().order_by('name'); serializer_class = ActressSerializer

class GenreListAPIView(generics.ListAPIView):
    queryset = Genre.objects.all().order_by('name'); serializer_class = GenreSerializer

class MakerListAPIView(generics.ListAPIView):
    queryset = Maker.objects.all().order_by('name'); serializer_class = MakerSerializer

class LabelListAPIView(generics.ListAPIView):
    queryset = Label.objects.all().order_by('name'); serializer_class = LabelSerializer

class DirectorListAPIView(generics.ListAPIView):
    queryset = Director.objects.all().order_by('name'); serializer_class = DirectorSerializer

class SeriesListAPIView(generics.ListAPIView):
    queryset = Series.objects.all().order_by('name'); serializer_class = SeriesSerializer