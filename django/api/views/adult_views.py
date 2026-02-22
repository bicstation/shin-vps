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
    FanzaFloorMaster,
    # マスターモデル
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
    page_size = 24
    page_size_query_param = 'page_size'
    max_page_size = 100

# --------------------------------------------------------------------------
# 💡 1. 統合ゲートウェイView (AIスコア・並び替え拡張版)
# --------------------------------------------------------------------------
class UnifiedAdultProductListView(generics.ListAPIView):
    permission_classes = [AllowAny]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter, filters.SearchFilter]
    serializer_class = AdultProductSerializer
    
    # AI解析テキスト（キャッチコピーやサマリー）も検索対象に含める
    search_fields = [
        'title', 'product_description', 'ai_summary', 'ai_content', 'ai_catchcopy',
        'target_segment', 'actresses__name', 'genres__name', 'maker__name'
    ]
    
    # 🚀 AIソムリエのスコアとスペックスコアを並び替え可能に
    ordering_fields = [
        'release_date', 'price', 'review_average', 'spec_score',
        'score_visual', 'score_story', 'score_erotic', 'score_rarity', 'score_cost_performance',
        'ai_score_visual', 'ai_score_story', 'ai_score_erotic' # 追加: AI解析スコア
    ]

    def get_queryset(self):
        # 女優のプロフィール（黄金比）も同時に引けるよう select_related/prefetch_related を最適化
        qs = AdultProduct.objects.filter(is_active=True).select_related(
            'maker', 'label', 'series', 'director', 'floor_master'
        ).prefetch_related(
            'actresses', 
            'actresses__adultactressprofile', # 💡 修正: 正しい逆参照名に変更
            'genres', 
            'attributes', 
            'authors'
        )

        p = self.request.query_params

        # --- 🎯 関連作品ロジック ---
        related_id = p.get('related_to_id')
        axis_params = ['actress_id', 'maker_id', 'genre', 'actress', 'maker', 'series_id', 'label_id']
        has_specific_axis = any(p.get(k) for k in axis_params)

        if related_id and not has_specific_axis:
            try:
                base_obj = AdultProduct.objects.get(product_id_unique=related_id)
                related_qs = qs.filter(
                    Q(maker=base_obj.maker) | 
                    Q(actresses__in=base_obj.actresses.all()) |
                    Q(genres__in=base_obj.genres.all())
                ).exclude(product_id_unique=related_id).distinct()
                
                if related_qs.exists():
                    return related_qs.order_by('-release_date')
            except AdultProduct.DoesNotExist:
                pass

        # --- A. 基本ソース・階層フィルタ ---
        source_param = p.get('api_source', '').strip().lower()
        service_code = p.get('service_code', '').strip().lower()
        floor_code = p.get('floor_code', '').strip().lower()
        
        if source_param: qs = qs.filter(api_source__iexact=source_param)
        if service_code: qs = qs.filter(api_service__iexact=service_code)
        if floor_code:  qs = qs.filter(Q(floor_code=floor_code) | Q(floor_master__floor_code=floor_code))

        # --- B. 全方位フィルタリング ---
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
            id_val = p.get(key) or p.get(f"{key}_id")
            slug_val = p.get(f"{key}_slug")

            if id_val and str(id_val).isdigit():
                qs = qs.filter(**{fields[0]: id_val})
            elif slug_val:
                qs = qs.filter(**{fields[1]: slug_val})

        if related_id:
            qs = qs.exclude(product_id_unique=related_id)

        return qs.distinct().order_by('-release_date')

# --------------------------------------------------------------------------
# 💡 2. 階層ナビゲーションView
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
# 💡 3. 全項目インデックス取得View (黄金比スコア対応版)
# --------------------------------------------------------------------------
class AdultTaxonomyIndexAPIView(views.APIView):
    """
    女優、ジャンル、メーカー等の一覧を、ブランド(api_source)ごとに独立して取得します。
    """
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        p = request.query_params
        tax_type = p.get('type', 'genres')
        ordering = p.get('ordering', '-product_count')
        limit = p.get('limit')
        api_source = p.get('api_source')

        model_map = {
            'genres': Genre, 
            'makers': Maker, 
            'actresses': Actress, 
            'series': Series, 
            'directors': Director, 
            'authors': Author, 
            'labels': Label
        }
        TargetModel = model_map.get(tax_type)

        if not TargetModel:
            return response.Response({"error": "Invalid type"}, status=status.HTTP_400_BAD_REQUEST)

        qs = TargetModel.objects.all()

        # 女優一覧の場合はスコア順の並び替えも可能にする
        if tax_type == 'actresses':
            # 💡 修正: 正しい逆参照名 adultactressprofile を指定
            qs = qs.select_related('adultactressprofile')

        if api_source:
            qs = qs.filter(api_source__iexact=api_source)

        qs = qs.filter(product_count__gt=0)

        # 女優専用の並び替えフィールド（黄金比スコア）を許可
        valid_order_fields = ['name', '-name', 'product_count', '-product_count', 'id', '-id']
        if tax_type == 'actresses':
            # 💡 修正: 正しい逆参照名ベースで並び替え
            valid_order_fields += ['adultactressprofile__ai_power_score', '-adultactressprofile__ai_power_score']
        
        if ordering not in valid_order_fields:
            # 💡 補足: profile__... できた場合も adultactressprofile__... に読み替える
            if 'profile__' in ordering:
                ordering = ordering.replace('profile__', 'adultactressprofile__')
            else:
                ordering = '-product_count'
        
        qs = qs.order_by(ordering)

        if limit and limit.isdigit():
            qs = qs[:int(limit)]

        # 🚀 レスポンス整形 (女優の場合はスコアとカップ数を追加)
        results = []
        for item in qs:
            data = {
                "id": item.id, 
                "name": item.name, 
                "slug": item.slug or item.name, 
                "product_count": item.product_count,
                "api_source": item.api_source
            }
            if tax_type == 'actresses':
                # 💡 修正: 逆参照名 adultactressprofile を使用してデータを取得
                profile = getattr(item, 'adultactressprofile', None)
                data["ai_power_score"] = profile.ai_power_score if profile else None
                data["score_style"] = profile.score_style if profile else None
                data["cup"] = profile.cup if profile else ""
            
            results.append(data)

        return response.Response({
            "type": tax_type, 
            "api_source": api_source,
            "results": results
        })

# --------------------------------------------------------------------------
# 💡 4. サイドバー用分析View
# --------------------------------------------------------------------------
class PlatformMarketAnalysisAPIView(views.APIView):
    permission_classes = [AllowAny]
    def get(self, request, *args, **kwargs):
        base_qs = AdultProduct.objects.filter(is_active=True)
        return response.Response({
            "total_nodes": base_qs.count(), 
            "platform_avg_score": round(base_qs.aggregate(avg=Avg('spec_score'))['avg'] or 0, 2)
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