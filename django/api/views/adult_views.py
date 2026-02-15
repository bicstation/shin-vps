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
# 💡 1. 統合ゲートウェイView (高度なレコメンドエンジン搭載)
# --------------------------------------------------------------------------
class UnifiedAdultProductListView(generics.ListAPIView):
    """
    FANZA / DMM / DUGA を一つのエンドポイントで統合管理。
    """
    permission_classes = [AllowAny]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter, filters.SearchFilter]
    
    queryset = AdultProduct.objects.none()
    # AI生成フィールド(ai_summary, ai_content)も検索対象に含め、SEOとユーザビリティを強化
    search_fields = [
        'title', 'product_description', 'ai_summary', 'ai_content', 
        'target_segment', 'actresses__name', 'genres__name', 'maker__name'
    ]
    # フロントエンドV9.9が必要とするスコアリングでのソートに対応
    ordering_fields = ['release_date', 'price', 'review_average', 'spec_score', 'rel_score']

    def get_queryset(self):
        return AdultProduct.objects.filter(is_active=True)

    def list(self, request, *args, **kwargs):
        source_param = self.request.query_params.get('api_source', '')
        source = source_param.upper() if source_param else None
        maker_slug = self.request.query_params.get('maker__slug')
        search_query = self.request.query_params.get('search')
        related_to_id = self.request.query_params.get('related_to_id')

        # --- 🔗 関連作品レコメンドロジック ---
        if related_to_id:
            base_product = AdultProduct.objects.filter(product_id_unique=related_to_id).first()
            if not base_product:
                base_product = AdultProduct.objects.filter(id=related_to_id).first()

            if base_product:
                qs_related = AdultProduct.objects.filter(is_active=True).exclude(id=base_product.id)
                # 属性、女優、シリーズ等から類似度スコアを算出
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

        # --- 🔍 通常リスト・フィルタリングロジック ---
        qs_adult = AdultProduct.objects.filter(is_active=True).select_related('maker', 'label', 'series').prefetch_related('actresses', 'genres', 'attributes')
        qs_fanza = FanzaProduct.objects.filter(is_active=True).select_related('maker', 'label').prefetch_related('actresses', 'genres')

        if maker_slug:
            qs_adult = qs_adult.filter(maker__slug=maker_slug)
            qs_fanza = qs_fanza.filter(maker__slug=maker_slug)

        if search_query:
            q_filter = Q(title__icontains=search_query) | \
                       Q(product_description__icontains=search_query) | \
                       Q(ai_summary__icontains=search_query) | \
                       Q(actresses__name__icontains=search_query) | \
                       Q(genres__name__icontains=search_query) | \
                       Q(maker__name__icontains=search_query)
            qs_adult = qs_adult.filter(q_filter).distinct()
            qs_fanza = qs_fanza.filter(q_filter).distinct()

        # ソース別分岐 (大文字小文字のゆれを吸収)
        if source == 'DUGA':
            queryset = qs_adult.filter(api_source__iexact='DUGA').order_by('-release_date')
            return self._get_paginated_response(queryset, AdultProductSerializer)
        elif source in ['FANZA', 'DMM']:
            # 既存のFanzaProductにデータがあるかチェック
            if qs_fanza.filter(site_code=source).exists():
                queryset = qs_fanza.filter(site_code=source).order_by('-release_date')
                return self._get_paginated_response(queryset, FanzaProductSerializer)
            else:
                # 統合モデル側のFANZAデータを参照
                queryset = qs_adult.filter(api_source__iexact=source).order_by('-release_date')
                return self._get_paginated_response(queryset, AdultProductSerializer)
        else:
            # 混合（全ソース）ソート: 発売日順
            def get_sort_key(instance):
                val = instance.release_date
                if not val: return "0000-00-00"
                if isinstance(val, date): return val.isoformat()
                return str(val)

            combined_list = sorted(chain(qs_adult, qs_fanza), key=get_sort_key, reverse=True)
            page = self.paginate_queryset(combined_list)
            if page is not None:
                data = self._serialize_mixed_list(page)
                return self.get_paginated_response(data)
            
            data = self._serialize_mixed_list(combined_list)
            return response.Response(data)

    def _serialize_mixed_list(self, instance_list):
        serialized_data = []
        for obj in instance_list:
            if isinstance(obj, AdultProduct):
                serialized_data.append(AdultProductSerializer(obj, context={'request': self.request}).data)
            elif isinstance(obj, FanzaProduct):
                serialized_data.append(FanzaProductSerializer(obj, context={'request': self.request}).data)
        return serialized_data

    def _get_paginated_response(self, queryset, serializer_class):
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = serializer_class(page, many=True, context={'request': self.request})
            return self.get_paginated_response(serializer.data)
        serializer = serializer_class(queryset, many=True, context={'request': self.request})
        return response.Response(serializer.data)

# --------------------------------------------------------------------------
# 📊 MarketAnalysisView (サイドバー用：女優・監督・著者対応・完全版)
# --------------------------------------------------------------------------
class PlatformMarketAnalysisAPIView(views.APIView):
    """
    サイドバーに必要な全マスターデータを一括で返却。
    """
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        source_param = request.query_params.get('source')
        source = source_param.upper() if source_param else None
        
        base_qs = AdultProduct.objects.filter(is_active=True)
        if source:
            base_qs = base_qs.filter(api_source__iexact=source)

        def get_top_items(qs, relation_name, limit=15):
            items = qs.values(
                tmp_id=F(f'{relation_name}__id'), 
                tmp_name=F(f'{relation_name}__name'), 
                tmp_slug=F(f'{relation_name}__slug')
            ).annotate(
                product_count=Count('id')
            ).exclude(tmp_name=None).order_by('-product_count')[:limit]
            
            return [
                {"id": i['tmp_id'], "name": i['tmp_name'], "slug": i['tmp_slug'], "product_count": i['product_count']}
                for i in items
            ]

        # マスター集計 (モデルのリレーション名 'authors' に修正済み)
        genres = get_top_items(base_qs, 'genres')
        makers = get_top_items(base_qs, 'maker')
        series = get_top_items(base_qs, 'series')
        actresses = get_top_items(base_qs, 'actresses')
        directors = get_top_items(base_qs, 'director')
        authors = get_top_items(base_qs, 'authors') 

        avg_score = base_qs.aggregate(avg=Avg('spec_score'))
        
        # 動的メニュー構築 (Next.js Link用)
        menu_items = []
        if not source or source in ['FANZA', 'DMM']:
            fanza_base = FanzaProduct.objects.filter(is_active=True)
            if source: fanza_base = fanza_base.filter(site_code=source)
            floors = fanza_base.values('service_code', 'floor_code').annotate(count=Count('id')).order_by('-count')[:5]
            for f in floors:
                menu_items.append({
                    "label": f"{f['service_code'].upper()} / {f['floor_code'].capitalize()}",
                    "link": f"/{source.lower() if source else 'fanza'}/{f['service_code']}/{f['floor_code']}",
                    "count": f['count'],
                    "source": "FANZA/DMM"
                })

        if not source or source == 'DUGA':
            attr_data = AdultAttribute.objects.filter(products__is_active=True)
            if source: attr_data = attr_data.filter(products__api_source='DUGA')
            attr_summary = attr_data.annotate(count=Count('products', distinct=True)).filter(count__gt=0).order_by('-count')[:5]
            for a in attr_summary:
                menu_items.append({
                    "label": a.name,
                    "link": f"/brand/duga?attribute={a.slug or a.id}",
                    "count": a.count,
                    "source": "DUGA"
                })

        return response.Response({
            "source": source or "UNIFIED_MATRIX",
            "status": "NODE_SYNC_COMPLETE",
            "total_nodes": base_qs.count(),
            "platform_avg_score": round(avg_score['avg'] or 0, 2),
            "genres": genres,
            "makers": makers,
            "series": series,
            "actresses": actresses,
            "directors": directors,
            "authors": authors,
            "menu_items": menu_items
        })

# --------------------------------------------------------------------------
# 2. 個別 / 詳細 / ランキング / 各種リストView (全機能維持)
# --------------------------------------------------------------------------
class FanzaProductListAPIView(generics.ListAPIView):
    queryset = FanzaProduct.objects.filter(is_active=True).select_related('maker', 'label').prefetch_related('genres', 'actresses').order_by('-release_date')
    serializer_class = FanzaProductSerializer
    permission_classes = [AllowAny]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter, filters.SearchFilter]
    filterset_fields = ['site_code', 'maker__slug', 'is_recommend']
    search_fields = ['title', 'product_description', 'actresses__name', 'genres__name']

class AdultProductListAPIView(generics.ListAPIView):
    serializer_class = AdultProductSerializer
    permission_classes = [AllowAny]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter, filters.SearchFilter]
    filterset_fields = ['maker__slug']
    search_fields = ['title', 'product_description', 'actresses__name', 'genres__name']
    
    def get_queryset(self):
        queryset = AdultProduct.objects.filter(is_active=True).select_related('maker', 'label').prefetch_related('genres', 'actresses')
        source = self.request.query_params.get('api_source')
        if source: 
            queryset = queryset.filter(api_source__iexact=source)
        return queryset.order_by('-release_date')

class FanzaProductDetailAPIView(generics.RetrieveAPIView):
    queryset = FanzaProduct.objects.all().select_related('maker', 'label').prefetch_related('genres', 'actresses')
    serializer_class = FanzaProductSerializer
    permission_classes = [AllowAny]
    lookup_field = 'unique_id'

    def get_object(self):
        raw_id = self.kwargs[self.lookup_url_kwarg or self.lookup_field]
        # IDから接頭辞を除去して曖昧検索
        clean_id = re.sub(r'^(FANZA_|DMM_|DUGA_|fz_)', '', raw_id, flags=re.IGNORECASE)
        obj = self.get_queryset().filter(Q(unique_id__iexact=raw_id) | Q(unique_id__iexact=clean_id) | Q(unique_id__icontains=clean_id)).first()
        
        if not obj:
            # AdultProduct側のFANZA/DUGAデータからフォールバック
            fallback_obj = AdultProduct.objects.filter(Q(product_id_unique__iexact=raw_id) | Q(product_id_unique__iexact=f"FANZA_{clean_id}") | Q(product_id_unique__icontains=clean_id)).first()
            if fallback_obj:
                self.serializer_class = AdultProductSerializer
                return fallback_obj
            raise Http404(f"Product Not Found: {raw_id}")
        return obj

class AdultProductDetailAPIView(generics.RetrieveAPIView):
    queryset = AdultProduct.objects.all().select_related('maker', 'label').prefetch_related('genres', 'actresses')
    serializer_class = AdultProductSerializer
    permission_classes = [AllowAny]
    lookup_field = 'product_id_unique'

    def get_object(self):
        raw_id = self.kwargs[self.lookup_url_kwarg or self.lookup_field]
        clean_id = re.sub(r'^(FANZA_|DMM_|DUGA_|fz_)', '', raw_id, flags=re.IGNORECASE)
        obj = self.get_queryset().filter(
            Q(product_id_unique__iexact=raw_id) | 
            Q(product_id_unique__iexact=f"FANZA_{clean_id}") | 
            Q(product_id_unique__iexact=f"DUGA_{clean_id}") | 
            Q(product_id_unique__icontains=clean_id)
        ).first()
        if not obj: raise Http404(f"AdultProduct Not Found: {raw_id}")
        return obj

class AdultProductRankingAPIView(generics.ListAPIView):
    """
    AIサマリーが存在し、スコアが高い順に上位30件を返却
    """
    serializer_class = AdultProductSerializer
    permission_classes = [AllowAny]
    def get_queryset(self):
        return AdultProduct.objects.filter(spec_score__gt=0, is_active=True).exclude(ai_summary="").select_related('maker', 'label').order_by('-spec_score', '-release_date')[:30]

class LinkshareProductListAPIView(generics.ListAPIView):
    queryset = LinkshareProduct.objects.all().order_by('-updated_at')
    serializer_class = LinkshareProductSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    search_fields = ['product_name', 'sku']