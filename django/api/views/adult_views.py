# -*- coding: utf-8 -*-
from rest_framework import generics, filters, pagination, response, views
from rest_framework.permissions import AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Count, Avg, F
from django.shortcuts import get_object_or_404
from django.http import Http404
from itertools import chain
from datetime import date
import re

from api.models import AdultProduct, FanzaProduct, LinkshareProduct, AdultAttribute
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
    仕分け検索（ジャンル・女優等）にも完全対応。
    """
    permission_classes = [AllowAny]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter, filters.SearchFilter]
    
    queryset = AdultProduct.objects.none()
    search_fields = [
        'title', 'product_description', 'ai_summary', 'ai_content', 
        'target_segment', 'actresses__name', 'genres__name', 'maker__name'
    ]
    ordering_fields = ['release_date', 'price', 'review_average', 'spec_score', 'rel_score']

    def get_queryset(self):
        return AdultProduct.objects.filter(is_active=True)

    def list(self, request, *args, **kwargs):
        source_param = self.request.query_params.get('api_source', '')
        source = source_param.upper() if source_param else None
        search_query = self.request.query_params.get('search')
        related_to_id = self.request.query_params.get('related_to_id')
        
        genre_slug = self.request.query_params.get('genre_slug')
        actress_slug = self.request.query_params.get('actress_slug')
        maker_slug = self.request.query_params.get('maker_slug') or self.request.query_params.get('maker__slug')
        series_slug = self.request.query_params.get('series_slug')
        director_slug = self.request.query_params.get('director_slug')
        author_slug = self.request.query_params.get('author_slug')

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
            'maker', 'label', 'series', 'director'
        ).prefetch_related('actresses', 'genres', 'attributes', 'authors')
        
        qs_fanza = FanzaProduct.objects.filter(is_active=True).select_related(
            'maker', 'label'
        ).prefetch_related('actresses', 'genres')

        def apply_common_filters(qs, is_fanza=False):
            if genre_slug: qs = qs.filter(genres__slug=genre_slug)
            if actress_slug: qs = qs.filter(actresses__slug=actress_slug)
            if maker_slug: qs = qs.filter(maker__slug=maker_slug)
            if search_query:
                q_f = Q(title__icontains=search_query) | Q(product_description__icontains=search_query) | \
                      Q(actresses__name__icontains=search_query) | Q(genres__name__icontains=search_query)
                if not is_fanza:
                    q_f |= Q(ai_summary__icontains=search_query) | Q(maker__name__icontains=search_query)
                qs = qs.filter(q_f)
            if not is_fanza:
                if series_slug: qs = qs.filter(series__slug=series_slug)
                if director_slug: qs = qs.filter(director__slug=director_slug)
                if author_slug: qs = qs.filter(authors__slug=author_slug)
            return qs.distinct()

        qs_adult = apply_common_filters(qs_adult, is_fanza=False)
        qs_fanza = apply_common_filters(qs_fanza, is_fanza=True)

        if source == 'DUGA':
            queryset = qs_adult.filter(api_source__iexact='DUGA').order_by('-release_date')
            return self._get_paginated_response(queryset, AdultProductSerializer)
        
        elif source in ['FANZA', 'DMM']:
            if qs_fanza.filter(site_code=source).exists():
                queryset = qs_fanza.filter(site_code=source).order_by('-release_date')
                return self._get_paginated_response(queryset, FanzaProductSerializer)
            else:
                queryset = qs_adult.filter(api_source__iexact=source).order_by('-release_date')
                return self._get_paginated_response(queryset, AdultProductSerializer)
        
        else:
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
# 💡 [NEW] 2. 全項目インデックス取得View (仕分けページ用)
# --------------------------------------------------------------------------
class AdultTaxonomyIndexAPIView(views.APIView):
    """
    ジャンル、メーカー、女優などの「項目リスト」を全件取得。
    1000件以上の仕分け表示（あいうえお順等）に使用。
    """
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        # 取得対象の指定 (default: genres)
        tax_type = request.query_params.get('type', 'genres')
        
        mapping = {
            'genres': 'genres',
            'makers': 'maker',
            'actresses': 'actresses',
            'series': 'series',
            'directors': 'director',
            'authors': 'authors',
            'labels': 'label',
        }
        
        relation_name = mapping.get(tax_type, 'genres')
        base_qs = AdultProduct.objects.filter(is_active=True)

        # 全項目を重複なく、商品数と共に取得 (名前順)
        items = base_qs.values(
            tmp_id=F(f'{relation_name}__id'),
            tmp_name=F(f'{relation_name}__name'),
            tmp_slug=F(f'{relation_name}__slug')
        ).annotate(
            product_count=Count('id')
        ).exclude(
            tmp_name=None
        ).order_by('tmp_name')

        results = [
            {
                "id": i['tmp_id'],
                "name": i['tmp_name'],
                "slug": i['tmp_slug'] or i['tmp_name'] or str(i['tmp_id']),
                "product_count": i['product_count']
            } for i in items
        ]

        return response.Response({
            "type": tax_type,
            "status": "TAXONOMY_SYNC_COMPLETE",
            "total_count": len(results),
            "results": results
        })

# --------------------------------------------------------------------------
# 📊 3. サイドバー用集計View (MarketAnalysis)
# --------------------------------------------------------------------------
class PlatformMarketAnalysisAPIView(views.APIView):
    permission_classes = [AllowAny]
    def get(self, request, *args, **kwargs):
        source_param = request.query_params.get('source')
        source = source_param.upper() if source_param else None
        base_qs = AdultProduct.objects.filter(is_active=True)
        if source: base_qs = base_qs.filter(api_source__iexact=source)

        def get_top_items(qs, relation_name, limit=15):
            items = qs.values(
                tmp_id=F(f'{relation_name}__id'), 
                tmp_name=F(f'{relation_name}__name'), 
                tmp_slug=F(f'{relation_name}__slug')
            ).annotate(product_count=Count('id')).exclude(tmp_name=None).order_by('-product_count')[:limit]
            return [{"id": i['tmp_id'], "name": i['tmp_name'], "slug": i['tmp_slug'], "product_count": i['product_count']} for i in items]

        return response.Response({
            "source": source or "UNIFIED_MATRIX",
            "status": "NODE_SYNC_COMPLETE",
            "total_nodes": base_qs.count(),
            "genres": get_top_items(base_qs, 'genres'),
            "makers": get_top_items(base_qs, 'maker'),
            "series": get_top_items(base_qs, 'series'),
            "actresses": get_top_items(base_qs, 'actresses'),
            "directors": get_top_items(base_qs, 'director'),
            "authors": get_top_items(base_qs, 'authors'), 
            "platform_avg_score": round(base_qs.aggregate(avg=Avg('spec_score'))['avg'] or 0, 2),
        })

# --------------------------------------------------------------------------
# 💡 4. 各種個別リストView
# --------------------------------------------------------------------------
class AdultProductListAPIView(generics.ListAPIView):
    serializer_class = AdultProductSerializer
    permission_classes = [AllowAny]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter, filters.SearchFilter]
    filterset_fields = ['api_source', 'is_active']
    search_fields = ['title', 'product_description', 'actresses__name', 'genres__name']
    
    def get_queryset(self):
        queryset = AdultProduct.objects.filter(is_active=True).select_related(
            'maker', 'label', 'series', 'director'
        ).prefetch_related('genres', 'actresses', 'authors')
        
        source = self.request.query_params.get('api_source')
        genre_slug = self.request.query_params.get('genre_slug')
        actress_slug = self.request.query_params.get('actress_slug')
        maker_slug = self.request.query_params.get('maker_slug') or self.request.query_params.get('maker__slug')
        series_slug = self.request.query_params.get('series_slug')
        director_slug = self.request.query_params.get('director_slug')
        author_slug = self.request.query_params.get('author_slug')

        if source: queryset = queryset.filter(api_source__iexact=source)
        if genre_slug: queryset = queryset.filter(genres__slug=genre_slug)
        if actress_slug: queryset = queryset.filter(actresses__slug=actress_slug)
        if maker_slug: queryset = queryset.filter(maker__slug=maker_slug)
        if series_slug: queryset = queryset.filter(series__slug=series_slug)
        if director_slug: queryset = queryset.filter(director__slug=director_slug)
        if author_slug: queryset = queryset.filter(authors__slug=author_slug)
        
        return queryset.distinct().order_by('-release_date')

class FanzaProductListAPIView(generics.ListAPIView):
    queryset = FanzaProduct.objects.filter(is_active=True).select_related('maker', 'label').prefetch_related('genres', 'actresses').order_by('-release_date')
    serializer_class = FanzaProductSerializer
    permission_classes = [AllowAny]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter, filters.SearchFilter]
    filterset_fields = ['site_code', 'maker__slug', 'is_recommend']
    search_fields = ['title', 'product_description', 'actresses__name', 'genres__name']

# --------------------------------------------------------------------------
# 💡 5. 詳細・ランキング・Linkshare
# --------------------------------------------------------------------------
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
            fallback = AdultProduct.objects.filter(Q(product_id_unique__iexact=raw_id) | Q(product_id_unique__icontains=clean_id)).first()
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
        return AdultProduct.objects.filter(spec_score__gt=0, is_active=True).exclude(ai_summary="").order_by('-spec_score', '-release_date')[:30]

class LinkshareProductListAPIView(generics.ListAPIView):
    queryset = LinkshareProduct.objects.all().order_by('-updated_at')
    serializer_class = LinkshareProductSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    search_fields = ['product_name', 'sku']