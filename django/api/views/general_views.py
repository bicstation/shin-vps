# -*- coding: utf-8 -*-
from rest_framework import generics, filters, pagination
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from django.db.models import Count
from django_filters.rest_framework import DjangoFilterBackend
from django.shortcuts import get_object_or_404
from django.http import Http404
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
    """
    PC製品のランキング一覧を返す。
    URL: /api/pc-products/ranking/
    """
    serializer_class = PCProductSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        # activeかつスコアがあるものを対象
        queryset = PCProduct.objects.filter(is_active=True, spec_score__gt=0)
        
        # 💡 ドメイン判定（ミドルウェア等で設定されている想定）
        site_type = getattr(self.request, 'site_type', 'station')
        
        if site_type == 'saving':
            # 節約サイト: コスパ重視
            return queryset.order_by('-score_cost', '-spec_score')[:20]
        
        # 通常サイト: 総合スコア順
        return queryset.order_by('-spec_score', '-updated_at')[:20]

# --------------------------------------------------------------------------
# 💻 PC・ソフトウェア製品一覧 (PCProduct)
# --------------------------------------------------------------------------
class PCProductListAPIView(generics.ListAPIView):
    """
    PC製品の一覧取得・フィルタリング・検索
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
        """
        メーカーや属性（スラッグ）によるフィルタリングを適用
        """
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
# 🔍 製品詳細 (PCProductDetail)
# --------------------------------------------------------------------------
class PCProductDetailAPIView(generics.RetrieveAPIView):
    """
    個別製品の詳細情報を unique_id で取得
    """
    queryset = PCProduct.objects.all().prefetch_related('attributes')
    serializer_class = PCProductSerializer
    permission_classes = [AllowAny]
    
    # URLパラメータ <str:unique_id> をモデルの unique_id フィールドと紐付け
    lookup_field = 'unique_id'
    lookup_url_kwarg = 'unique_id'

    def get_object(self):
        """
        予約語(rankingなど)がIDとして渡された場合に安全に404を返す
        """
        unique_id = self.kwargs.get(self.lookup_url_kwarg)
        
        # 🚨 unique_idが 'ranking' の場合は、一覧Viewへ行くべきリクエストなので
        # 詳細Viewとしては「存在しない」として404を出す
        if unique_id == 'ranking':
            raise Http404("Invalid ID: 'ranking' is a reserved keyword.")
            
        return super().get_object()

# --------------------------------------------------------------------------
# 🛠️ メーカー・統計・履歴 API
# --------------------------------------------------------------------------
class PCProductMakerListView(APIView):
    """
    メーカーの一覧とそれぞれの登録商品数を返す
    """
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
    """
    サイドバー表示用の属性統計データを返す
    """
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
    """
    製品の価格履歴を返す（30日分）
    """
    decoded_id = unquote(unique_id)
    
    if decoded_id == 'ranking':
        raise Http404()

    product = get_object_or_404(PCProduct, unique_id=decoded_id)
    history = PriceHistory.objects.filter(product=product).order_by('recorded_at')[:30]
    
    data = {
        "name": product.name,
        "labels": [h.recorded_at.strftime('%Y/%m/%d') for h in history],
        "prices": [h.price for h in history]
    }
    return Response(data)