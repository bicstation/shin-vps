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

# 💡 FanzaProduct を削除し、存在するモデルのみをインポート
from api.models import (
    AdultProduct, 
    LinkshareProduct, 
    AdultAttribute, 
    FanzaFloorMaster
)

# 💡 シリアライザーも同様に Fanza 用を削除（AdultProductSerializer に統合されている前提）
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
# 💡 1. 統合ゲートウェイView
# --------------------------------------------------------------------------
class UnifiedAdultProductListView(generics.ListAPIView):
    """
    FANZA / DMM / DUGA を AdultProduct モデルで一括管理。
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
        # 💡 FanzaProduct との chain をやめ、AdultProduct のみを取得
        qs = AdultProduct.objects.filter(is_active=True).select_related(
            'maker', 'label', 'series', 'director', 'floor_master'
        ).prefetch_related('actresses', 'genres', 'attributes', 'authors')

        source_param = self.request.query_params.get('api_source', '').strip().lower()
        service_code = self.request.query_params.get('service_code', '').strip().lower()
        floor_code = self.request.query_params.get('floor_code', '').strip().lower()
        
        # スラッグフィルタ
        genre_slug = self.request.query_params.get('genre_slug')
        actress_slug = self.request.query_params.get('actress_slug')
        maker_slug = self.request.query_params.get('maker_slug') or self.request.query_params.get('maker__slug')

        if source_param:
            qs = qs.filter(api_source__iexact=source_param)
        if service_code:
            qs = qs.filter(api_service__iexact=service_code)
        if floor_code:
            qs = qs.filter(Q(floor_code=floor_code) | Q(floor_master__floor_code=floor_code))
        
        if genre_slug: qs = qs.filter(genres__slug=genre_slug)
        if actress_slug: qs = qs.filter(actresses__slug=actress_slug)
        if maker_slug: qs = qs.filter(maker__slug=maker_slug)

        return qs.distinct().order_by('-release_date')

# --------------------------------------------------------------------------
# 💡 2. 階層ナビゲーションView (リアルタイム集計版)
# --------------------------------------------------------------------------
class FanzaFloorNavigationAPIView(views.APIView):
    """
    DMM/FANZAの階層構造に、DB内の実件数(product_count)をリアルタイムに付与して返す
    """
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        # 1. フロアマスタを取得
        qs = FanzaFloorMaster.objects.filter(is_active=True)
        
        # 2. AdultProductからフロアごとの件数を一括集計
        # floor_master_id ごとの商品数を取得（Group By floor_master_id）
        floor_counts = AdultProduct.objects.filter(is_active=True)\
            .values('floor_master_id')\
            .annotate(count=Count('id'))
        
        # 辞書形式に変換 {floor_master_id: count, ...}
        count_map = {item['floor_master_id']: item['count'] for item in floor_counts}

        structure = {}
        for item in qs:
            site = item.site_name
            # このフロア単体の件数を取得
            current_floor_count = count_map.get(item.id, 0)

            if site not in structure:
                structure[site] = {
                    "code": item.site_code.lower(), 
                    "name": site, 
                    "product_count": 0,  # サービス単位の合計
                    "services": {}
                }
            
            svc = item.service_name
            if svc not in structure[site]["services"]:
                structure[site]["services"][svc] = {
                    "code": item.service_code.lower(), 
                    "name": svc, 
                    "product_count": 0,  # フロア単位の合計
                    "floors": []
                }
            
            # フロア情報を追加
            structure[site]["services"][svc]["floors"].append({
                "code": item.floor_code.lower(), 
                "name": item.floor_name,
                "product_count": current_floor_count
            })

            # 親階層（Service, Site）に件数を累積加算
            structure[site]["services"][svc]["product_count"] += current_floor_count
            structure[site]["product_count"] += current_floor_count

        return response.Response({"status": "NAV_SYNC_COMPLETE", "data": structure})

# --------------------------------------------------------------------------
# 💡 3. 全項目インデックス取得View
# --------------------------------------------------------------------------
class AdultTaxonomyIndexAPIView(views.APIView):
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        tax_type = request.query_params.get('type', 'genres')
        mapping = {
            'genres': 'genres', 'makers': 'maker', 'actresses': 'actresses',
            'series': 'series', 'directors': 'director', 'authors': 'authors', 'labels': 'label',
        }
        relation_name = mapping.get(tax_type, 'genres')
        
        items = AdultProduct.objects.filter(is_active=True).values(
            tmp_id=F(f'{relation_name}__id'),
            tmp_name=F(f'{relation_name}__name'),
            tmp_slug=F(f'{relation_name}__slug')
        ).annotate(product_count=Count('id')).exclude(tmp_name=None).order_by('tmp_name')

        results = [{
            "id": i['tmp_id'], "name": i['tmp_name'],
            "slug": i['tmp_slug'] or i['tmp_name'], "product_count": i['product_count']
        } for i in items]

        return response.Response({"type": tax_type, "results": results})

# --------------------------------------------------------------------------
# 📊 4. サイドバー用集計View
# --------------------------------------------------------------------------
class PlatformMarketAnalysisAPIView(views.APIView):
    permission_classes = [AllowAny]
    def get(self, request, *args, **kwargs):
        base_qs = AdultProduct.objects.filter(is_active=True)
        return response.Response({
            "total_nodes": base_qs.count(),
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
    queryset = AdultProduct.objects.filter(is_active=True).order_by('-release_date')

class AdultProductDetailAPIView(generics.RetrieveAPIView):
    queryset = AdultProduct.objects.all()
    serializer_class = AdultProductSerializer
    permission_classes = [AllowAny]
    lookup_field = 'product_id_unique'

class AdultProductRankingAPIView(generics.ListAPIView):
    serializer_class = AdultProductSerializer
    permission_classes = [AllowAny]
    def get_queryset(self):
        return AdultProduct.objects.filter(spec_score__gt=0, is_active=True).order_by('-spec_score')[:30]

class LinkshareProductListAPIView(generics.ListAPIView):
    queryset = LinkshareProduct.objects.all().order_by('-updated_at')
    serializer_class = LinkshareProductSerializer
    permission_classes = [AllowAny]