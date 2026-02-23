# -*- coding: utf-8 -*-
import re
import json
from datetime import date
from itertools import chain

from django.db.models import Q, Count, Avg, F
from django.http import Http404, JsonResponse
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
    """
    標準的な一覧表示用のページネーション。1ページあたり24件。
    """
    page_size = 24
    page_size_query_param = 'page_size'
    max_page_size = 100

# --------------------------------------------------------------------------
# 💡 1. 統合ゲートウェイView
# --------------------------------------------------------------------------
class UnifiedAdultProductListView(generics.ListAPIView):
    """
    アダルト商品の統合一覧View。
    検索、フィルタリング、並び替え、および関連商品の取得をサポート。
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
        qs = AdultProduct.objects.filter(is_active=True).select_related(
            'maker', 'label', 'series', 'director', 'floor_master'
        ).prefetch_related(
            'actresses', 
            'genres', 
            'attributes', 
            'authors'
        )

        p = self.request.query_params
        related_id = p.get('related_to_id')
        axis_params = ['actress_id', 'maker_id', 'genre', 'actress', 'maker', 'series_id', 'label_id']
        has_specific_axis = any(p.get(k) for k in axis_params)

        # 関連商品の取得ロジック
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

        # 基本フィルタリング
        source_param = p.get('api_source', '').strip().lower()
        service_code = p.get('service_code', '').strip().lower()
        floor_code = p.get('floor_code', '').strip().lower()
        
        if source_param: qs = qs.filter(api_source__iexact=source_param)
        if service_code: qs = qs.filter(api_service__iexact=service_code)
        if floor_code:  qs = qs.filter(Q(floor_code=floor_code) | Q(floor_master__floor_code=floor_code))

        # タクソノミー（ID/Slug）フィルタリング
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
# 💡 3. 全項目インデックス取得View (AIソムリエ・データ強化版)
# --------------------------------------------------------------------------
class AdultTaxonomyIndexAPIView(views.APIView):
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        p = request.query_params
        tax_type = p.get('type', 'genres')
        ordering_raw = p.get('ordering', '-product_count')
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

        if tax_type == 'actresses':
            qs = TargetModel.objects.all().select_related('profile')
        else:
            qs = TargetModel.objects.all()

        if api_source:
            qs = qs.filter(api_source__iexact=api_source)

        qs = qs.filter(product_count__gt=0)

        valid_db_fields = ['name', '-name', 'product_count', '-product_count', 'id', '-id']
        db_ordering = ordering_raw if ordering_raw in valid_db_fields else '-product_count'
        qs = qs.order_by(db_ordering)

        fetch_limit = 1000 if 'score' in ordering_raw else (int(limit) if limit and limit.isdigit() else 100)
        qs = qs[:fetch_limit]

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
                profile = getattr(item, 'profile', None)
                if profile:
                    # 🖼️ ビジュアル & AI説明
                    data["image_url_small"] = getattr(profile, 'image_url_small', None)
                    data["image_url_large"] = getattr(profile, 'image_url_large', None)
                    data["ai_description"] = getattr(profile, 'ai_description', "")
                    data["ai_catchcopy"] = getattr(profile, 'ai_catchcopy', "")
                    
                    # 📏 フィジカルデータ
                    data["bust"] = getattr(profile, 'bust', None)
                    data["cup"] = getattr(profile, 'cup', None)
                    data["height"] = getattr(profile, 'height', None)
                    data["hobby"] = getattr(profile, 'hobby', None)
                    
                    # 🔗 SNS
                    data["x_url"] = getattr(profile, 'x_url', None)
                    data["instagram_url"] = getattr(profile, 'instagram_url', None)
                    
                    # 📊 スコア
                    data["ai_power_score"] = getattr(profile, 'ai_power_score', 0)
                    data["score_visual"] = getattr(profile, 'score_visual', 0)
                else:
                    data["ai_power_score"] = 0
            
            results.append(data)

        if 'score' in ordering_raw or 'ai_power_score' in ordering_raw:
            reverse_flag = '-' in ordering_raw
            sort_key = ordering_raw.replace('-', '').split('__')[-1]
            results = sorted(results, key=lambda x: (x.get(sort_key) is not None, x.get(sort_key) or 0), reverse=reverse_flag)
            if limit and limit.isdigit():
                results = results[:int(limit)]

        return response.Response({"type": tax_type, "api_source": api_source, "results": results})

# --------------------------------------------------------------------------
# 💡 4. 🚀 AIソムリエ専用: 女優検索API (新規追加)
# --------------------------------------------------------------------------
class ActressSearchAPIView(views.APIView):
    """
    Next.jsのAIソムリエから呼ばれる検索専用エンドポイント。
    AIが作成した紹介文(ai_description)を対象に全文検索を行います。
    """
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        query = request.GET.get('q', '').strip()
        if not query:
            return response.Response({"results": []})

        # 名前、読み、AI紹介文、趣味をまたいで検索
        # 5.9万人の中から、より精鋭(ai_power_score)を優先して3件抽出
        results = Actress.objects.filter(
            Q(name__icontains=query) |
            Q(ruby__icontains=query) |
            Q(profile__ai_description__icontains=query) |
            Q(profile__hobby__icontains=query)
        ).select_related('profile').filter(product_count__gt=0).order_by('-profile__ai_power_score', '-product_count')[:3]

        data = []
        for act in results:
            profile = getattr(act, 'profile', None)
            data.append({
                "actress_id": act.id,
                "name": act.name,
                "ai_description": getattr(profile, 'ai_description', ""),
                "image_url_large": getattr(profile, 'image_url_large', ""),
                "cup": getattr(profile, 'cup', ""),
                "ai_power_score": getattr(profile, 'ai_power_score', 0)
            })

        return response.Response({"results": data})

# --------------------------------------------------------------------------
# 💡 5. サイドバー用分析View
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
# 💡 6. 各種個別リスト・詳細View
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