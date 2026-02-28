# -*- coding: utf-8 -*-
import re
from django.db.models import Q, Count
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import generics, filters, pagination, views, status
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response

from api.models import (
    AdultProduct, 
    LinkshareProduct, 
    AdultAttribute, 
    FanzaFloorMaster,
    Actress, Genre, Maker, Label, Series, Director, Author
)

from api.serializers import (
    AdultProductSerializer, 
    LinkshareProductSerializer
)

# --------------------------------------------------------------------------
# 0. ページネーション設定
# --------------------------------------------------------------------------
class StandardResultsSetPagination(pagination.PageNumberPagination):
    """標準的な一覧表示用のページネーション。1ページあたり24件。"""
    page_size = 24
    page_size_query_param = 'page_size'
    max_page_size = 100

# --------------------------------------------------------------------------
# 💡 1. 統合ゲートウェイView (Core Logic)
# --------------------------------------------------------------------------
class UnifiedAdultProductListView(generics.ListAPIView):
    """
    アダルト商品の統合一覧View。
    【重要】AI属性(AdultAttribute)が1つ以上存在する商品のみを対象とします。
    """
    permission_classes = [AllowAny]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter, filters.SearchFilter]
    serializer_class = AdultProductSerializer
    
    search_fields = [
        'title', 'product_description', 'ai_summary', 'ai_content', 'ai_catchcopy',
        'target_segment', 'actresses__name', 'genres__name', 'maker__name'
    ]
    
    ordering_fields = [
        'release_date', 'price', 'review_average', 'spec_score',
        'score_visual', 'score_story', 'score_erotic', 'score_rarity', 'score_cost_performance',
        'ai_score_visual', 'ai_score_story', 'ai_score_erotic'
    ]

    def get_queryset(self):
        # 1. 基本セット + attributesが空のものを除外
        # annotateで属性数をカウントし、1以上のもの(属性あり)のみに絞り込む
        qs = AdultProduct.objects.filter(is_active=True).annotate(
            attr_count=Count('attributes')
        ).filter(attr_count__gt=0).select_related(
            'maker', 'label', 'series', 'director', 'floor_master'
        ).prefetch_related(
            'actresses', 'genres', 'attributes', 'authors'
        )

        p = self.request.query_params
        
        # 2. AI属性（AdultAttribute）フィルタリング
        # Next.jsから送られてくる attribute_id を最優先で適用
        attr_id = p.get('attribute_id')
        attr_slug = p.get('attribute_slug')
        
        if attr_id and str(attr_id).isdigit():
            qs = qs.filter(attributes__id=int(attr_id))
        elif attr_slug:
            qs = qs.filter(attributes__slug=attr_slug)

        # 3. 関連商品の取得ロジック (related_to_id がある場合)
        related_id = p.get('related_to_id')
        axis_params = ['actress_id', 'maker_id', 'genre', 'actress', 'maker', 'series_id', 'label_id']
        has_specific_axis = any(p.get(k) for k in axis_params)

        if related_id and not has_specific_axis and not attr_id:
            try:
                base_obj = AdultProduct.objects.get(product_id_unique=related_id)
                return qs.filter(
                    Q(maker=base_obj.maker) | 
                    Q(actresses__in=base_obj.actresses.all()) |
                    Q(genres__in=base_obj.genres.all())
                ).exclude(product_id_unique=related_id).distinct().order_by('-release_date')
            except AdultProduct.DoesNotExist:
                pass

        # 4. 基本フィルタリング (Source / Service / Floor)
        source_param = p.get('api_source', '').strip().lower()
        service_code = p.get('service_code', '').strip().lower()
        floor_code = p.get('floor_code', '').strip().lower()
        
        if source_param: 
            qs = qs.filter(api_source__iexact=source_param)
        if service_code: 
            qs = qs.filter(api_service__iexact=service_code)
        if floor_code:   
            qs = qs.filter(Q(floor_code=floor_code) | Q(floor_master__floor_code=floor_code))

        # 5. タクソノミー（ID/Slug）共通フィルタリング
        filter_map = {
            'genre': ('genres__id', 'genres__slug'),
            'actress': ('actresses__id', 'actresses__slug'),
            'maker': ('maker__id', 'maker__slug'),
            'series': ('series__id', 'series__slug'),
            'director': ('director__id', 'director__slug'),
            'author': ('authors__id', 'authors__slug'),
            'label': ('label__id', 'label__slug'),
        }

        for key, (id_field, slug_field) in filter_map.items():
            id_val = p.get(key) or p.get(f"{key}_id")
            slug_val = p.get(f"{key}_slug")
            
            if id_val and str(id_val).isdigit():
                qs = qs.filter(**{id_field: id_val})
            elif slug_val:
                qs = qs.filter(**{slug_field: slug_val})

        if related_id:
            qs = qs.exclude(product_id_unique=related_id)

        # 重複を排除して最新順に
        return qs.distinct().order_by('-release_date')

# --------------------------------------------------------------------------
# 💡 2. サイドバー統計 (属性分析用)
# --------------------------------------------------------------------------
class AdultSidebarStatsAPIView(views.APIView):
    """サイドバーに表示するAI属性（熟女、人妻など）の一覧と該当件数"""
    permission_classes = [AllowAny]
    def get(self, request, *args, **kwargs):
        # 属性ごとに、紐付いている有効な商品数を集計
        stats = AdultAttribute.objects.annotate(
            attr_count=Count('products', filter=Q(products__is_active=True))
        ).filter(attr_count__gt=0).order_by('-attr_count')[:20]
        
        results = [
            {"id": a.id, "name": a.name, "slug": a.slug or str(a.id), "count": a.attr_count} 
            for a in stats
        ]
        return Response({"status": "ANALYSIS_COMPLETE", "attributes": results})

# --------------------------------------------------------------------------
# 💡 3. ナビゲーション・インデックスView
# --------------------------------------------------------------------------
class FanzaFloorNavigationAPIView(views.APIView):
    """サイト名、サービス、フロアごとの階層構造を生成"""
    permission_classes = [AllowAny]
    def get(self, request, *args, **kwargs):
        qs = FanzaFloorMaster.objects.filter(is_active=True)
        # 属性が付与されている商品のみをカウント対象にする
        floor_counts = AdultProduct.objects.filter(is_active=True).annotate(
            attr_count=Count('attributes')
        ).filter(attr_count__gt=0).values('floor_master_id').annotate(count=Count('id'))
        
        count_map = {item['floor_master_id']: item['count'] for item in floor_counts}
        
        structure = {}
        for item in qs:
            site = item.site_name
            current_floor_count = count_map.get(item.id, 0)
            if site not in structure:
                structure[site] = {"code": item.site_code.lower(), "name": site, "product_count": 0, "services": {}}
            svc = item.service_name
            if svc not in structure[site]["services"]:
                structure[site]["services"][svc] = {"code": item.service_code.lower(), "name": svc, "product_count": 0, "floors": []}
            structure[site]["services"][svc]["floors"].append({
                "code": item.floor_code.lower(), "name": item.floor_name, "product_count": current_floor_count
            })
            structure[site]["services"][svc]["product_count"] += current_floor_count
            structure[site]["product_count"] += current_floor_count
        return Response({"status": "NAV_SYNC_COMPLETE", "data": structure})

class AdultTaxonomyIndexAPIView(views.APIView):
    """ジャンルや女優などのマスターデータ一覧取得"""
    permission_classes = [AllowAny]
    def get(self, request, *args, **kwargs):
        p = request.query_params
        tax_type = p.get('type', 'genres')
        model_map = {
            'genres': Genre, 'makers': Maker, 'actresses': Actress, 
            'series': Series, 'directors': Director, 'authors': Author, 'labels': Label
        }
        TargetModel = model_map.get(tax_type)
        if not TargetModel: return Response({"error": "Invalid type"}, status=status.HTTP_400_BAD_REQUEST)
        
        qs = TargetModel.objects.filter(product_count__gt=0).order_by('-product_count')[:100]
        results = [{"id": item.id, "name": item.name, "slug": item.slug or str(item.id), "product_count": item.product_count} for item in qs]
        return Response({"type": tax_type, "results": results})

# --------------------------------------------------------------------------
# 💡 4. 詳細・ランキング・検索
# --------------------------------------------------------------------------
class AdultProductDetailAPIView(generics.RetrieveAPIView):
    """商品詳細取得"""
    queryset = AdultProduct.objects.all()
    serializer_class = AdultProductSerializer
    permission_classes = [AllowAny]
    lookup_field = 'product_id_unique'

class AdultProductRankingAPIView(generics.ListAPIView):
    """AI解析スコアに基づくランキング（属性あり限定）"""
    serializer_class = AdultProductSerializer
    permission_classes = [AllowAny]
    def get_queryset(self):
        return AdultProduct.objects.filter(
            is_active=True, spec_score__gt=0
        ).annotate(attr_count=Count('attributes')).filter(attr_count__gt=0).order_by('-spec_score')[:30]

class ActressSearchAPIView(views.APIView):
    """女優検索"""
    permission_classes = [AllowAny]
    def get(self, request, *args, **kwargs):
        query = request.GET.get('q', '').strip()
        if not query: return Response({"results": []})
        results = Actress.objects.filter(
            Q(name__icontains=query) | Q(ruby__icontains=query)
        ).filter(product_count__gt=0)[:10]
        data = [{"id": a.id, "name": a.name} for a in results]
        return Response({"results": data})

class LinkshareProductListAPIView(generics.ListAPIView):
    """外部連携商品一覧"""
    queryset = LinkshareProduct.objects.all().order_by('-updated_at')
    serializer_class = LinkshareProductSerializer
    permission_classes = [AllowAny]

# --------------------------------------------------------------------------
# 💡 5. エラー回避用スタブView (URLs.pyとの整合性維持)
# --------------------------------------------------------------------------
class PlatformMarketAnalysisAPIView(APIView):
    """URL設定で定義されている分析Viewのスタブ"""
    permission_classes = [AllowAny]
    def get(self, request):
        return Response({"status": "under_construction", "message": "Market analysis is coming soon."})