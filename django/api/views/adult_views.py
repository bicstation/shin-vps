# -*- coding: utf-8 -*-
from rest_framework import generics, filters, pagination, response, views
from rest_framework.permissions import AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Count, Avg
from django.shortcuts import get_object_or_404
from django.http import Http404
from itertools import chain
from datetime import date
import re

from api.models import AdultProduct, FanzaProduct, LinkshareProduct
from api.serializers import AdultProductSerializer, FanzaProductSerializer, LinkshareProductSerializer

# --------------------------------------------------------------------------
# 0. ページネーション設定
# --------------------------------------------------------------------------
class StandardResultsSetPagination(pagination.PageNumberPagination):
    """
    Next.js側の表示数に合わせた標準ページネーション
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
    'related_to_id' パラメータが渡された場合、モデル間のリレーションを活用して
    出演者・属性・シリーズ・ジャンルに基づいた高精度な関連商品を抽出します。
    """
    permission_classes = [AllowAny]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter, filters.SearchFilter]
    
    queryset = AdultProduct.objects.none()
    search_fields = ['title', 'product_description', 'ai_summary', 'actresses__name', 'genres__name']
    ordering_fields = ['release_date', 'price', 'review_average', 'spec_score', 'rel_score']

    def get_queryset(self):
        """
        通常のフィルタリング用。Listメソッドで詳細な制御を行うため、
        基本的には空のQuerySetを返し、オーバーライドしたlistメソッドで実データを制御。
        """
        return AdultProduct.objects.filter(is_active=True)

    def list(self, request, *args, **kwargs):
        # --- 1. パラメータ取得 ---
        source = self.request.query_params.get('api_source', '').upper()
        maker_slug = self.request.query_params.get('maker__slug')
        search_query = self.request.query_params.get('search')
        related_to_id = self.request.query_params.get('related_to_id') # 👈 関連商品用の鍵

        # --- 2. [NEW] 関連商品抽出ロジック (最優先パス) ---
        if related_to_id:
            # 基準となる作品を特定
            base_product = AdultProduct.objects.filter(product_id_unique=related_to_id).first()
            if not base_product:
                # 統合IDで見つからない場合は通常IDで試行
                base_product = AdultProduct.objects.filter(id=related_to_id).first()

            if base_product:
                # 🧠 高度なスコアリング: モデルのリレーションをフル活用
                # 
                qs_related = AdultProduct.objects.filter(is_active=True).exclude(id=base_product.id)
                
                # 重み付け計算 (Annotate)
                qs_related = qs_related.annotate(
                    rel_score=(
                        # 出演女優の一致: 20点
                        Count('actresses', filter=Q(actresses__in=base_product.actresses.all())) * 20 +
                        # シリーズの一致: 15点
                        Count('series', filter=Q(series=base_product.series)) * 15 +
                        # 詳細スペック属性(巨乳/清楚など)の一致: 10点
                        Count('attributes', filter=Q(attributes__in=base_product.attributes.all())) * 10 +
                        # ジャンルの一致: 5点
                        Count('genres', filter=Q(genres__in=base_product.genres.all())) * 5 +
                        # メーカーの一致: 2点
                        Count('maker', filter=Q(maker=base_product.maker)) * 2
                    )
                ).filter(rel_score__gt=0).order_by('-rel_score', '-release_date')

                return self._get_paginated_response(qs_related, AdultProductSerializer)

        # --- 3. 通常の一覧表示ロジック (現状維持) ---
        qs_adult = AdultProduct.objects.filter(is_active=True).select_related('maker', 'label', 'series').prefetch_related('actresses', 'genres', 'attributes')
        qs_fanza = FanzaProduct.objects.filter(is_active=True).select_related('maker', 'label').prefetch_related('actresses', 'genres')

        # フィルタリング適用
        if maker_slug:
            qs_adult = qs_adult.filter(maker__slug=maker_slug)
            qs_fanza = qs_fanza.filter(maker__slug=maker_slug)

        if search_query:
            q_filter = Q(title__icontains=search_query) | \
                       Q(product_description__icontains=search_query) | \
                       Q(actresses__name__icontains=search_query) | \
                       Q(genres__name__icontains=search_query) | \
                       Q(maker__name__icontains=search_query)
            
            qs_adult = qs_adult.filter(q_filter).distinct()
            qs_fanza = qs_fanza.filter(q_filter).distinct()

        # ソース別の出力
        if source == 'DUGA':
            queryset = qs_adult.order_by('-release_date')
            return self._get_paginated_response(queryset, AdultProductSerializer)
            
        elif source in ['FANZA', 'DMM']:
            if qs_fanza.count() == 0:
                queryset = qs_adult.filter(api_source__iexact=source).order_by('-release_date')
                return self._get_paginated_response(queryset, AdultProductSerializer)
            
            queryset = qs_fanza.filter(site_code=source).order_by('-release_date')
            return self._get_paginated_response(queryset, FanzaProductSerializer)

        else:
            # 全ソース混合表示 (既存のchain + sortedロジックを完全維持)
            def get_sort_key(instance):
                val = instance.release_date
                if not val: return "0000-00-00"
                if isinstance(val, date): return val.isoformat()
                return str(val)

            combined_list = sorted(
                chain(qs_adult, qs_fanza),
                key=get_sort_key,
                reverse=True
            )
            
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
# 📊 MarketAnalysisView (既存機能を完全維持)
# --------------------------------------------------------------------------
class PlatformMarketAnalysisAPIView(views.APIView):
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        source = request.query_params.get('source', 'FANZA').upper()
        maker_id = request.query_params.get('maker_id')

        base_qs = AdultProduct.objects.filter(api_source__iexact=source, is_active=True)
        if maker_id:
            base_qs = base_qs.filter(maker_id=maker_id)

        genre_stats = base_qs.values('genres__name').annotate(
            count=Count('genres')
        ).exclude(genres__name=None).order_by('-count')[:8]

        avg_score = base_qs.aggregate(avg=Avg('spec_score'))

        return response.Response({
            "source": source,
            "genre_distribution": list(genre_stats),
            "platform_avg_score": round(avg_score['avg'] or 0, 2),
            "total_nodes": base_qs.count(),
            "status": "NODE_SYNC_COMPLETE"
        })

# --------------------------------------------------------------------------
# 2. 個別 View / 3. 詳細 View (以下、既存コードをすべて維持)
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
    queryset = AdultProduct.objects.filter(is_active=True).select_related('maker', 'label').prefetch_related('genres', 'actresses').order_by('-release_date')
    serializer_class = AdultProductSerializer
    permission_classes = [AllowAny]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter, filters.SearchFilter]
    filterset_fields = ['maker__slug']
    search_fields = ['title', 'product_description', 'actresses__name', 'genres__name']

class FanzaProductDetailAPIView(generics.RetrieveAPIView):
    queryset = FanzaProduct.objects.all().select_related('maker', 'label').prefetch_related('genres', 'actresses')
    serializer_class = FanzaProductSerializer
    permission_classes = [AllowAny]
    lookup_field = 'unique_id'

    def get_object(self):
        raw_id = self.kwargs[self.lookup_url_kwarg or self.lookup_field]
        clean_id = re.sub(r'^(FANZA_|DMM_|DUGA_|fz_)', '', raw_id, flags=re.IGNORECASE)
        obj = self.get_queryset().filter(Q(unique_id__iexact=raw_id) | Q(unique_id__iexact=clean_id) | Q(unique_id__icontains=clean_id)).first()

        if not obj:
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
        obj = self.get_queryset().filter(Q(product_id_unique__iexact=raw_id) | Q(product_id_unique__iexact=f"FANZA_{clean_id}") | Q(product_id_unique__iexact=f"DUGA_{clean_id}") | Q(product_id_unique__icontains=clean_id)).first()
        if not obj:
            raise Http404(f"AdultProduct Not Found: {raw_id}")
        return obj

class AdultProductRankingAPIView(generics.ListAPIView):
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