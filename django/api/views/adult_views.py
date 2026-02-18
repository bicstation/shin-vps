# -*- coding: utf-8 -*-
import re
from datetime import date
from itertools import chain

from django.db.models import Q, Count, Avg, F
from django.http import Http404
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import generics, filters, pagination, response, views
from rest_framework.permissions import AllowAny

from api.models import (
    AdultProduct, FanzaProduct, LinkshareProduct, 
    AdultAttribute, FanzaFloorMaster
)
from api.serializers import AdultProductSerializer, FanzaProductSerializer, LinkshareProductSerializer

# --------------------------------------------------------------------------
# 0. ページネーション設定
# --------------------------------------------------------------------------
class StandardResultsSetPagination(pagination.PageNumberPagination):
    """
    Next.js側のグリッド表示(24件)に最適化した標準ページネーション
    """
    page_size = 24
    page_size_query_param = 'page_size'
    max_page_size = 100

# --------------------------------------------------------------------------
# 💡 1. 統合ゲートウェイView (高度なレコメンド & フィルタリング)
# --------------------------------------------------------------------------
class UnifiedAdultProductListView(generics.ListAPIView):
    """
    FANZA / DMM / DUGA を一つのエンドポイントで統合管理。
    """
    permission_classes = [AllowAny]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter, filters.SearchFilter]
    
    queryset = AdultProduct.objects.none() # 基本はget_querysetで制御
    search_fields = [
        'title', 'product_description', 'ai_summary', 'ai_content', 
        'target_segment', 'actresses__name', 'genres__name', 'maker__name'
    ]
    ordering_fields = [
        'release_date', 'price', 'review_average', 'spec_score', 'rel_score',
        'score_visual', 'score_story', 'score_erotic', 'score_rarity', 'score_cost_performance'
    ]

    def get_queryset(self):
        return AdultProduct.objects.filter(is_active=True)

    def list(self, request, *args, **kwargs):
        # --- 🚀 パラメータ取得と正規化 ---
        source_param = self.request.query_params.get('api_source', '').strip().lower()
        service_code = self.request.query_params.get('service_code', '').strip().lower()
        floor_code = self.request.query_params.get('floor_code', '').strip().lower()

        search_query = self.request.query_params.get('search')
        related_to_id = self.request.query_params.get('related_to_id')
        
        # スラッグ類
        slug_params = {
            'genre_slug': self.request.query_params.get('genre_slug'),
            'actress_slug': self.request.query_params.get('actress_slug'),
            'maker_slug': self.request.query_params.get('maker_slug') or self.request.query_params.get('maker__slug'),
            'series_slug': self.request.query_params.get('series_slug'),
            'director_slug': self.request.query_params.get('director_slug'),
            'author_slug': self.request.query_params.get('author_slug'),
        }

        # --- 🔗 関連作品レコメンドロジック ---
        if related_to_id:
            base_product = AdultProduct.objects.filter(product_id_unique=related_to_id).first() or \
                           AdultProduct.objects.filter(id=related_to_id).first()
            if base_product:
                qs_related = AdultProduct.objects.filter(is_active=True).exclude(id=base_product.id)
                qs_related = qs_related.annotate(
                    rel_score=(
                        Count('actresses', filter=Q(actresses__in=base_product.actresses.all())) * 20 +
                        Count('series', filter=Q(series=base_product.series)) * 15 +
                        Count('attributes', filter=Q(attributes__in=base_product.attributes.all())) * 10 +
                        Count('genres', filter=Q(genres__in=base_product.genres.all())) * 5 +
                        Count('maker', filter=Q(maker=base_product.maker)) * 2
                    )
                ).filter(rel_score__gt=0).order_by('-rel_score', '-release_date')
                return self._get_paginated_response(qs_related, AdultProductSerializer)

        # --- 🔍 クエリセットの構築 ---
        qs_adult = AdultProduct.objects.filter(is_active=True).select_related(
            'maker', 'label', 'series', 'director', 'floor_master'
        ).prefetch_related('actresses', 'genres', 'attributes', 'authors')
        
        qs_fanza = FanzaProduct.objects.filter(is_active=True).select_related(
            'maker', 'label'
        ).prefetch_related('actresses', 'genres')

        def apply_common_filters(qs, is_fanza_model=False):
            if source_param:
                if is_fanza_model:
                    qs = qs.filter(site_code__iexact=source_param)
                else:
                    qs = qs.filter(api_source__iexact=source_param)

            if service_code and not is_fanza_model:
                qs = qs.filter(api_service__iexact=service_code)

            if floor_code:
                if is_fanza_model:
                    qs = qs.filter(floor_code=floor_code)
                else:
                    qs = qs.filter(Q(floor_code=floor_code) | Q(floor_master__floor_code=floor_code))
            
            # スラッグフィルタ
            if slug_params['genre_slug']: qs = qs.filter(genres__slug=slug_params['genre_slug'])
            if slug_params['actress_slug']: qs = qs.filter(actresses__slug=slug_params['actress_slug'])
            if slug_params['maker_slug']: qs = qs.filter(maker__slug=slug_params['maker_slug'])
            
            if search_query:
                q_f = Q(title__icontains=search_query) | Q(product_description__icontains=search_query) | \
                      Q(actresses__name__icontains=search_query) | Q(genres__name__icontains=search_query)
                if not is_fanza_model:
                    q_f |= Q(ai_summary__icontains=search_query) | Q(maker__name__icontains=search_query)
                qs = qs.filter(q_f)
            
            if not is_fanza_model:
                if slug_params['series_slug']: qs = qs.filter(series__slug=slug_params['series_slug'])
                if slug_params['director_slug']: qs = qs.filter(director__slug=slug_params['director_slug'])
                if slug_params['author_slug']: qs = qs.filter(authors__slug=slug_params['author_slug'])
                
            return qs.distinct()

        qs_adult = apply_common_filters(qs_adult, is_fanza_model=False)
        qs_fanza = apply_common_filters(qs_fanza, is_fanza_model=True)

        # OrderingFilterなどのDRF標準フィルタを適用(Adult側)
        qs_adult = self.filter_queryset(qs_adult)

        # --- 📦 出力判定 ---
        if source_param == 'duga':
            return self._get_paginated_response(qs_adult.order_by('-release_date'), AdultProductSerializer)
        
        elif source_param in ['fanza', 'dmm']:
            # FanzaProductモデルにデータがある場合はそちらを優先、なければAdultProductから
            if qs_fanza.exists():
                return self._get_paginated_response(qs_fanza.order_by('-release_date'), FanzaProductSerializer)
            else:
                return self._get_paginated_response(qs_adult.order_by('-release_date'), AdultProductSerializer)
        
        else:
            # 混合ソート（統合アーカイブ用）
            def get_sort_key(instance):
                val = getattr(instance, 'release_date', None)
                if isinstance(val, date):
                    return val.isoformat()
                return str(val) if val else "0000-00-00"

            combined_list = sorted(chain(qs_adult, qs_fanza), key=get_sort_key, reverse=True)
            page = self.paginate_queryset(combined_list)
            if page is not None:
                return self.get_paginated_response(self._serialize_mixed_list(page))
            return response.Response(self._serialize_mixed_list(combined_list))

    def _serialize_mixed_list(self, instance_list):
        return [
            AdultProductSerializer(obj, context={'request': self.request}).data if isinstance(obj, AdultProduct)
            else FanzaProductSerializer(obj, context={'request': self.request}).data
            for obj in instance_list
        ]

    def _get_paginated_response(self, queryset, serializer_class):
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = serializer_class(page, many=True, context={'request': self.request})
            return self.get_paginated_response(serializer.data)
        serializer = serializer_class(queryset, many=True, context={'request': self.request})
        return response.Response(serializer.data)

# --------------------------------------------------------------------------
# 💡 2. 階層ナビゲーションView (Next.js サイドバー用)
# --------------------------------------------------------------------------
class FanzaFloorNavigationAPIView(views.APIView):
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        site_code = request.query_params.get('site_code', '').lower()
        service_code = request.query_params.get('service_code', '').lower()
        
        qs = FanzaFloorMaster.objects.filter(is_active=True)
        if site_code: qs = qs.filter(site_code__iexact=site_code)
        if service_code: qs = qs.filter(service_code__iexact=service_code)

        structure = {}
        for item in qs:
            site = item.site_name
            if site not in structure:
                structure[site] = {"code": item.site_code.lower(), "name": site, "services": {}}
            
            svc = item.service_name
            if svc not in structure[site]["services"]:
                structure[site]["services"][svc] = {"code": item.service_code.lower(), "name": svc, "floors": []}
            
            structure[site]["services"][svc]["floors"].append({
                "code": item.floor_code.lower(),
                "name": item.floor_name
            })

        return response.Response({
            "status": "NAV_SYNC_COMPLETE",
            "data": structure
        })

# --------------------------------------------------------------------------
# 💡 3. 全項目インデックス取得View (仕分けページ用)
# --------------------------------------------------------------------------
class AdultTaxonomyIndexAPIView(views.APIView):
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        tax_type = request.query_params.get('type', 'genres')
        source_param = request.query_params.get('api_source', '').lower()
        service_code = request.query_params.get('service_code', '').lower()
        floor_code = request.query_params.get('floor_code', '').lower()
        
        mapping = {
            'genres': 'genres', 'makers': 'maker', 'actresses': 'actresses',
            'series': 'series', 'directors': 'director', 'authors': 'authors',
            'labels': 'label',
        }
        
        relation_name = mapping.get(tax_type, 'genres')
        base_qs = AdultProduct.objects.filter(is_active=True)
        
        if source_param: base_qs = base_qs.filter(api_source__iexact=source_param)
        if service_code: base_qs = base_qs.filter(api_service__iexact=service_code)
        if floor_code:
            base_qs = base_qs.filter(Q(floor_code=floor_code) | Q(floor_master__floor_code=floor_code))

        items = base_qs.values(
            tmp_id=F(f'{relation_name}__id'),
            tmp_name=F(f'{relation_name}__name'),
            tmp_slug=F(f'{relation_name}__slug')
        ).annotate(product_count=Count('id')).exclude(tmp_name=None).order_by('tmp_name')

        results = [
            {
                "id": i['tmp_id'], "name": i['tmp_name'],
                "slug": i['tmp_slug'] or i['tmp_name'] or str(i['tmp_id']),
                "product_count": i['product_count']
            } for i in items
        ]

        return response.Response({
            "type": tax_type, "total_count": len(results), "results": results
        })

# --------------------------------------------------------------------------
# 📊 4. サイドバー用集計View (MarketAnalysis)
# --------------------------------------------------------------------------
class PlatformMarketAnalysisAPIView(views.APIView):
    permission_classes = [AllowAny]
    def get(self, request, *args, **kwargs):
        source_param = request.query_params.get('source', '').lower()
        service_code = request.query_params.get('service_code', '').lower()
        floor_code = request.query_params.get('floor_code', '').lower()

        base_qs = AdultProduct.objects.filter(is_active=True)
        if source_param: base_qs = base_qs.filter(api_source__iexact=source_param)
        if service_code: base_qs = base_qs.filter(api_service__iexact=service_code)
        if floor_code: base_qs = base_qs.filter(Q(floor_code=floor_code) | Q(floor_master__floor_code=floor_code))

        def get_top_items(qs, relation_name, limit=15):
            items = qs.values(
                tmp_id=F(f'{relation_name}__id'), 
                tmp_name=F(f'{relation_name}__name'), 
                tmp_slug=F(f'{relation_name}__slug')
            ).annotate(product_count=Count('id')).exclude(tmp_name=None).order_by('-product_count')[:limit]
            return [{"id": i['tmp_id'], "name": i['tmp_name'], "slug": i['tmp_slug'], "product_count": i['product_count']} for i in items]

        return response.Response({
            "source": source_param or "all",
            "service": service_code or "all",
            "floor": floor_code or "all",
            "total_nodes": base_qs.count(),
            "genres": get_top_items(base_qs, 'genres'),
            "makers": get_top_items(base_qs, 'maker'),
            "series": get_top_items(base_qs, 'series'),
            "actresses": get_top_items(base_qs, 'actresses'),
            "platform_avg_score": round(base_qs.aggregate(avg=Avg('spec_score'))['avg'] or 0, 2),
        })

# --------------------------------------------------------------------------
# 💡 5. 各種個別リスト・詳細View
# --------------------------------------------------------------------------
class AdultProductListAPIView(generics.ListAPIView):
    serializer_class = AdultProductSerializer
    permission_classes = [AllowAny]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter, filters.SearchFilter]
    
    def get_queryset(self):
        queryset = AdultProduct.objects.filter(is_active=True).select_related(
            'maker', 'label', 'series', 'director', 'floor_master'
        ).prefetch_related('genres', 'actresses', 'authors')
        
        params = self.request.query_params
        source = params.get('api_source', '').lower()
        service = params.get('service_code', '').lower()
        floor = params.get('floor_code', '').lower()
        
        if source: queryset = queryset.filter(api_source__iexact=source)
        if service: queryset = queryset.filter(api_service__iexact=service)
        if floor: queryset = queryset.filter(Q(floor_code=floor) | Q(floor_master__floor_code=floor))
        
        mapping = {
            'genre_slug': 'genres__slug',
            'actress_slug': 'actresses__slug',
            'maker_slug': 'maker__slug',
            'series_slug': 'series__slug',
            'director_slug': 'director__slug',
            'author_slug': 'authors__slug'
        }
        for param, filter_key in mapping.items():
            val = params.get(param)
            if val: queryset = queryset.filter(**{filter_key: val})
        
        return queryset.distinct().order_by('-release_date')

class FanzaProductListAPIView(generics.ListAPIView):
    queryset = FanzaProduct.objects.filter(is_active=True).select_related('maker', 'label').prefetch_related('genres', 'actresses').order_by('-release_date')
    serializer_class = FanzaProductSerializer
    permission_classes = [AllowAny]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter, filters.SearchFilter]
    filterset_fields = ['site_code', 'maker__slug', 'is_recommend']
    search_fields = ['title', 'product_description', 'actresses__name', 'genres__name']

class FanzaProductDetailAPIView(generics.RetrieveAPIView):
    queryset = FanzaProduct.objects.all().select_related('maker', 'label').prefetch_related('genres', 'actresses')
    serializer_class = FanzaProductSerializer
    permission_classes = [AllowAny]
    lookup_field = 'unique_id'
    
    def get_object(self):
        raw_id = self.kwargs[self.lookup_field]
        clean_id = re.sub(r'^(FANZA_|DMM_|DUGA_|fz_)', '', raw_id, flags=re.IGNORECASE)
        obj = self.get_queryset().filter(Q(unique_id__iexact=raw_id) | Q(unique_id__icontains=clean_id)).first()
        if not obj:
            fallback = AdultProduct.objects.filter(Q(product_id_unique__iexact=raw_id.lower()) | Q(product_id_unique__icontains=clean_id.lower())).first()
            if fallback: 
                self.serializer_class = AdultProductSerializer
                return fallback
            raise Http404(f"Not Found: {raw_id}")
        return obj

class AdultProductDetailAPIView(generics.RetrieveAPIView):
    queryset = AdultProduct.objects.all().select_related('maker', 'label', 'director').prefetch_related('genres', 'actresses')
    serializer_class = AdultProductSerializer
    permission_classes = [AllowAny]
    lookup_field = 'product_id_unique'

class AdultProductRankingAPIView(generics.ListAPIView):
    serializer_class = AdultProductSerializer
    permission_classes = [AllowAny]
    def get_queryset(self):
        return AdultProduct.objects.filter(
            spec_score__gt=0, is_active=True
        ).exclude(ai_summary="").order_by('-spec_score', '-release_date')[:30]

class LinkshareProductListAPIView(generics.ListAPIView):
    queryset = LinkshareProduct.objects.all().order_by('-updated_at')
    serializer_class = LinkshareProductSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    search_fields = ['product_name', 'sku']