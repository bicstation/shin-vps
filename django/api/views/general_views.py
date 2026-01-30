# -*- coding: utf-8 -*-
from rest_framework import generics, filters, pagination
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from django.db.models import Count
from django_filters.rest_framework import DjangoFilterBackend
from django.shortcuts import get_object_or_404
from urllib.parse import unquote

from api.models.pc_products import PCProduct, PCAttribute, PriceHistory
from api.serializers import PCProductSerializer

# --------------------------------------------------------------------------
# 💡 カスタムページネーション
# --------------------------------------------------------------------------
class PCProductLimitOffsetPagination(pagination.LimitOffsetPagination):
    """
    Next.jsの ?offset=x&limit=y に対応するためのページネーション
    """
    default_limit = 10
    max_limit = 100

# --------------------------------------------------------------------------
# 🏆 ランキングビュー (PC製品用)
# --------------------------------------------------------------------------
class PCProductRankingView(generics.ListAPIView):
    serializer_class = PCProductSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        queryset = PCProduct.objects.filter(is_active=True, spec_score__gt=0)
        
        # 💡 ドメイン判定によるランキングロジックの分岐
        site_type = getattr(self.request, 'site_type', 'station')
        
        if site_type == 'saving':
            # 節約サイト: コスパスコアを最優先したランキング
            return queryset.order_by('-score_cost', '-spec_score')[:20]
        
        # 通常サイト: 総合スペックスコア順
        return queryset.order_by('-spec_score', '-updated_at')[:20]

# --------------------------------------------------------------------------
# 💻 PC・ソフトウェア製品一覧 (PCProduct)
# --------------------------------------------------------------------------
class PCProductListAPIView(generics.ListAPIView):
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
        """
        ドメイン判定ミドルウェアの結果に基づき、クエリセットを動的に最適化
        """
        queryset = PCProduct.objects.filter(is_active=True).prefetch_related('attributes')
        
        # クエリパラメータによる絞り込み
        maker = self.request.query_params.get('maker')
        attribute_slug = self.request.query_params.get('attribute')
        
        if maker:
            queryset = queryset.filter(maker__iexact=unquote(maker))
        if attribute_slug:
            queryset = queryset.filter(attributes__slug=unquote(attribute_slug))
        
        # 💡 ドメインによるデフォルト並び替え・絞り込みの分岐
        site_type = getattr(self.request, 'site_type', 'station')
        
        if site_type == 'saving':
            # 節約系サイト: 在庫があるものを優先し、コスパ順に並べる
            return queryset.order_by('stock_status', '-score_cost', '-updated_at')
        
        # 通常（Bic Station）: 更新順
        return queryset.order_by('-updated_at', 'id')

class PCProductDetailAPIView(generics.RetrieveAPIView):
    queryset = PCProduct.objects.all().prefetch_related('attributes')
    serializer_class = PCProductSerializer
    permission_classes = [AllowAny]
    lookup_field = 'unique_id'

# --------------------------------------------------------------------------
# 🛠️ メーカー・統計・履歴 API
# --------------------------------------------------------------------------
class PCProductMakerListView(APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        genre = request.query_params.get('genre')
        qs = PCProduct.objects.filter(is_active=True).exclude(maker__isnull=True).exclude(maker='')
        
        # 💡 ドメインに応じたメーカーリストのフィルタリング（必要に応じて）
        if getattr(request, 'site_type', '') == 'saving':
            # 例: 節約サイトでは特定の安価なメーカーのみに絞るなどの拡張が可能
            pass

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
    product = get_object_or_404(PCProduct, unique_id=unquote(unique_id))
    history = PriceHistory.objects.filter(product=product).order_by('recorded_at')[:30]
    data = {
        "name": product.name,
        "labels": [h.recorded_at.strftime('%Y/%m/%d') for h in history],
        "prices": [h.price for h in history]
    }
    return Response(data)