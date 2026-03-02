# -*- coding: utf-8 -*-
# /home/maya/dev/shin-vps/django/api/views/adult_views.py
from django.db.models import Q, Count
from rest_framework import generics, filters, pagination, views, status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

# 🚀 DjangoFilterのインポートエラーを防ぐための安全な処理
try:
    from django_filters.rest_framework import DjangoFilterBackend
    HAS_DJANGO_FILTERS = True
except ImportError:
    HAS_DJANGO_FILTERS = False

from api.models import (
    AdultProduct, LinkshareProduct, AdultAttribute, FanzaFloorMaster,
    Actress, Genre, Maker, Label, Series, Director, Author
)
from api.serializers import AdultProductSerializer, LinkshareProductSerializer

# --------------------------------------------------------------------------
# 0. ページネーション
# --------------------------------------------------------------------------
class StandardResultsSetPagination(pagination.PageNumberPagination):
    page_size = 24
    page_size_query_param = 'page_size'
    max_page_size = 100

# --------------------------------------------------------------------------
# 💡 1. 統合製品一覧 (爆速インデックス活用版)
# --------------------------------------------------------------------------
class UnifiedAdultProductListView(generics.ListAPIView):
    permission_classes = [AllowAny]
    pagination_class = StandardResultsSetPagination
    serializer_class = AdultProductSerializer
    
    # 動的なフィルタ設定
    filter_backends = [filters.OrderingFilter, filters.SearchFilter]
    if HAS_DJANGO_FILTERS:
        filter_backends.append(DjangoFilterBackend)

    search_fields = ['title', 'product_description', 'ai_summary', 'actresses__name']
    ordering_fields = ['release_date', 'price', 'spec_score']

    def get_queryset(self):
        """
        🚀 爆速化のポイント:
        1. annotate(Count('attributes')) を廃止し has_attributes フラグを使用
        2. 作成済みの複合インデックス (is_active, has_attributes, -release_date) を強制発動
        """
        # 🚀 属性表示に必須の prefetch_related を確実に実行
        qs = AdultProduct.objects.filter(is_active=True).select_related(
            'maker', 'label', 'series', 'director', 'floor_master'
        ).prefetch_related('actresses', 'genres', 'attributes', 'authors')

        p = self.request.query_params
        
        # --- 🛸 A. ソースフィルタ (api_source: DUGA, FANZA, DMM ...) ---
        api_source = p.get('api_source')
        if api_source:
            qs = qs.filter(api_source__iexact=str(api_source))

        # --- 🛸 B. サービス・フロアフィルタ (service_code, floor_code) ---
        service_code = p.get('service_code')
        if service_code:
            qs = qs.filter(floor_master__service_code=service_code)
            
        floor_code = p.get('floor_code')
        if floor_code:
            qs = qs.filter(floor_master__floor_code=floor_code)

        # --- 🛸 C. 属性フィルタ (attribute または attribute_slug) ---
        attr_val = p.get('attribute') or p.get('attribute_slug')
        
        if attr_val:
            # 🚀 属性指定がある場合：その属性を最優先（特定タグの絞り込み）
            if str(attr_val).isdigit():
                qs = qs.filter(attributes__id=int(attr_val))
            else:
                qs = qs.filter(attributes__slug__iexact=str(attr_val))
        else:
            # 🚀 爆速ポイント: 指定なしの場合、Countを使わずフラグで絞り込み
            # これにより DB の Index Scan が走り、ミリ秒単位でレスポンスが返ります
            qs = qs.filter(has_attributes=True)
            
        return qs.distinct().order_by('-release_date')

# --------------------------------------------------------------------------
# 💡 2. 詳細・検索・ランキング
# --------------------------------------------------------------------------
class AdultProductDetailAPIView(generics.RetrieveAPIView):
    """商品詳細。ID(product_id_unique)で取得"""
    queryset = AdultProduct.objects.all().prefetch_related('attributes', 'actresses', 'genres')
    serializer_class = AdultProductSerializer
    lookup_field = 'product_id_unique'
    permission_classes = [AllowAny]

class AdultProductRankingAPIView(generics.ListAPIView):
    """AI解析スコアに基づくランキング (爆速版)"""
    serializer_class = AdultProductSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        # 🚀 ここもフラグを利用して集計処理を完全排除
        return AdultProduct.objects.filter(
            is_active=True,
            has_attributes=True
        ).order_by('-spec_score')[:30]

class ActressSearchAPIView(views.APIView):
    """女優検索エンドポイント"""
    permission_classes = [AllowAny]
    def get(self, request):
        query = request.GET.get('q', '').strip()
        if not query: return Response({"results": []})
        res = Actress.objects.filter(
            Q(name__icontains=query) | Q(ruby__icontains=query)
        ).filter(product_count__gt=0)[:10]
        return Response({"results": [{"id": a.id, "name": a.name} for a in res]})

class AdultSidebarStatsAPIView(views.APIView):
    """サイドバー用AI属性リスト (高速版)"""
    permission_classes = [AllowAny]
    def get(self, request):
        # サイドバーは属性ごとのカウントが必要なため、ここでは filter Q を使って効率化
        stats = AdultAttribute.objects.annotate(
            c=Count('products', filter=Q(products__is_active=True, products__has_attributes=True))
        ).filter(c__gt=0).order_by('-c')[:20]
        
        results = [{
            "id": a.id, 
            "name": a.name, 
            "slug": a.slug if a.slug else str(a.id), 
            "count": a.c
        } for a in stats]
        return Response({"status": "OK", "attributes": results})

# --------------------------------------------------------------------------
# 💡 3. ナビゲーション・インデックス
# --------------------------------------------------------------------------
class FanzaFloorNavigationAPIView(views.APIView):
    """サービス・フロア構造"""
    permission_classes = [AllowAny]
    def get(self, request):
        # 将来的にマスタデータを返すよう拡張可能
        return Response({"status": "OK", "data": {}})

class AdultTaxonomyIndexAPIView(views.APIView):
    """ジャンル・メーカー等のインデックス"""
    permission_classes = [AllowAny]
    def get(self, request):
        return Response({"status": "OK", "results": []})

class LinkshareProductListAPIView(generics.ListAPIView):
    """外部連携商品"""
    queryset = LinkshareProduct.objects.all().order_by('-updated_at')
    serializer_class = LinkshareProductSerializer
    permission_classes = [AllowAny]

class PlatformMarketAnalysisAPIView(views.APIView):
    """市場分析ステータス"""
    permission_classes = [AllowAny]
    def get(self, request):
        return Response({"status": "OPERATIONAL", "module": "MARKET_ANALYSIS_ENGINE"})