# -*- coding: utf-8 -*-
# /usr/src/app/api/views/adult_views.py

import re
from datetime import date
from itertools import chain

from django.db.models import Q, Count, Avg, F
from django.http import Http404
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import generics, filters, pagination, response, views, status
from rest_framework.permissions import AllowAny

from api.models import (
    AdultProduct, 
    LinkshareProduct, 
    AdultAttribute, 
    FanzaFloorMaster
)

from api.serializers import (
    AdultProductSerializer, 
    LinkshareProductSerializer
)

# --------------------------------------------------------------------------
# 0. ページネーション設定
# --------------------------------------------------------------------------
class StandardResultsSetPagination(pagination.PageNumberPagination):
    page_size = 24
    page_size_query_param = 'page_size'
    max_page_size = 100

# --------------------------------------------------------------------------
# 💡 1. 統合ゲートウェイView (すべてのフィルタを網羅)
# --------------------------------------------------------------------------
class UnifiedAdultProductListView(generics.ListAPIView):
    """
    FANZA / DMM / DUGA を AdultProduct モデルで一括管理。
    ID、日本語スラッグ、各種コードによる完全フィルタリングに対応。
    """
    permission_classes = [AllowAny]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter, filters.SearchFilter]
    
    serializer_class = AdultProductSerializer
    
    search_fields = [
        'title', 'product_description', 'ai_summary', 'ai_content', 
        'target_segment', 'actresses__name', 'genres__name', 'maker__name'
    ]
    ordering_fields = [
        'release_date', 'price', 'review_average', 'spec_score',
        'score_visual', 'score_story', 'score_erotic', 'score_rarity', 'score_cost_performance'
    ]

    def get_queryset(self):
        qs = AdultProduct.objects.filter(is_active=True).select_related(
            'maker', 'label', 'series', 'director', 'floor_master'
        ).prefetch_related('actresses', 'genres', 'attributes', 'authors')

        p = self.request.query_params

        # A. 基本ソース・階層フィルタ
        source_param = p.get('api_source', '').strip().lower()
        service_code = p.get('service_code', '').strip().lower()
        floor_code = p.get('floor_code', '').strip().lower()
        
        if source_param: qs = qs.filter(api_source__iexact=source_param)
        if service_code: qs = qs.filter(api_service__iexact=service_code)
        if floor_code:  qs = qs.filter(Q(floor_code=floor_code) | Q(floor_master__floor_code=floor_code))

        # B. 【重要】全方位スラッグ・IDフィルタリング
        # Next.js側から送られる xxx_slug (日本語含) または xxx (ID) を処理
        filter_map = {
            'genre': ('genres__id', 'genres__slug'),
            'actress': ('actresses__id', 'actresses__slug'),
            'maker': ('maker__id', 'maker__slug'),
            'series': ('series__id', 'series__slug'),
            'director': ('director__id', 'director__slug'),
            'author': ('authors__id', 'authors__slug'),
            'label': ('label__id', 'label__slug'),
        }

        for key, fields in filter_map.items():
            id_val = p.get(key)
            slug_val = p.get(f"{key}_slug")

            if id_val and id_val.isdigit():
                qs = qs.filter(**{fields[0]: id_val})
            elif slug_val:
                qs = qs.filter(**{fields[1]: slug_val})

        return qs.distinct().order_by('-release_date')

# --------------------------------------------------------------------------
# 💡 2. 階層ナビゲーションView (リアルタイム集計版)
# --------------------------------------------------------------------------
class FanzaFloorNavigationAPIView(views.APIView):
    permission_classes = [AllowAny]
    def get(self, request, *args, **kwargs):
        qs = FanzaFloorMaster.objects.filter(is_active=True)
        floor_counts = AdultProduct.objects.filter(is_active=True).values('floor_master_id').annotate(count=Count('id'))
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
            structure[site]["services"][svc]["floors"].append({"code": item.floor_code.lower(), "name": item.floor_name, "product_count": current_floor_count})
            structure[site]["services"][svc]["product_count"] += current_floor_count
            structure[site]["product_count"] += current_floor_count
        return response.Response({"status": "NAV_SYNC_COMPLETE", "data": structure})

# --------------------------------------------------------------------------
# 💡 3. 全項目インデックス取得View (汎用タクソノミー)
# --------------------------------------------------------------------------
class AdultTaxonomyIndexAPIView(views.APIView):
    permission_classes = [AllowAny]
    def get(self, request, *args, **kwargs):
        tax_type = request.query_params.get('type', 'genres')
        ordering = request.query_params.get('ordering', '-product_count')
        limit = request.query_params.get('limit')
        floor_code = request.query_params.get('floor_code')
        mapping = {'genres': 'genres', 'makers': 'maker', 'actresses': 'actresses', 'series': 'series', 'directors': 'director', 'authors': 'authors', 'labels': 'label'}
        relation_name = mapping.get(tax_type, 'genres')
        base_qs = AdultProduct.objects.filter(is_active=True)
        if floor_code: base_qs = base_qs.filter(Q(floor_code=floor_code) | Q(floor_master__floor_code=floor_code))
        items = base_qs.values(tmp_id=F(f'{relation_name}__id'), tmp_name=F(f'{relation_name}__name'), tmp_slug=F(f'{relation_name}__slug')).annotate(product_count=Count('id')).exclude(tmp_name=None)
        valid_order_fields = {'name': 'tmp_name', '-name': '-tmp_name', 'product_count': 'product_count', '-product_count': '-product_count', 'id': 'tmp_id', '-id': '-tmp_id'}
        items = items.order_by(valid_order_fields.get(ordering, '-product_count'))
        if limit and limit.isdigit(): items = items[:int(limit)]
        results = [{"id": i['tmp_id'], "name": i['tmp_name'], "slug": i['tmp_slug'] or i['tmp_name'], "product_count": i['product_count']} for i in items]
        return response.Response({"type": tax_type, "results": results})

# --------------------------------------------------------------------------
# 💡 4. サイドバー用分析View
# --------------------------------------------------------------------------
class PlatformMarketAnalysisAPIView(views.APIView):
    permission_classes = [AllowAny]
    def get(self, request, *args, **kwargs):
        base_qs = AdultProduct.objects.filter(is_active=True)
        return response.Response({"total_nodes": base_qs.count(), "platform_avg_score": round(base_qs.aggregate(avg=Avg('spec_score'))['avg'] or 0, 2)})

# --------------------------------------------------------------------------
# 💡 5. 各種個別リスト・詳細View (ランキング等不足分を追加)
# --------------------------------------------------------------------------
class AdultProductListAPIView(generics.ListAPIView):
    serializer_class = AdultProductSerializer
    permission_classes = [AllowAny]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter, filters.SearchFilter]
    queryset = AdultProduct.objects.filter(is_active=True).order_by('-release_date')

class AdultProductDetailAPIView(generics.RetrieveAPIView):
    queryset = AdultProduct.objects.all()
    serializer_class = AdultProductSerializer
    permission_classes = [AllowAny]
    lookup_field = 'product_id_unique'

class AdultProductRankingAPIView(generics.ListAPIView):
    """ ランキング用View (AttributeError解消用) """
    serializer_class = AdultProductSerializer
    permission_classes = [AllowAny]
    def get_queryset(self):
        return AdultProduct.objects.filter(spec_score__gt=0, is_active=True).order_by('-spec_score')[:30]

class LinkshareProductListAPIView(generics.ListAPIView):
    """ Linkshare用View (AttributeError解消用) """
    queryset = LinkshareProduct.objects.all().order_by('-updated_at')
    serializer_class = LinkshareProductSerializer
    permission_classes = [AllowAny]