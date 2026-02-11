# -*- coding: utf-8 -*-
from rest_framework import generics, filters, pagination, response
from rest_framework.permissions import AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
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
# 💡 1. 統合ゲートウェイView (FANZA / DMM / DUGA 共通エンドポイント)
# --------------------------------------------------------------------------
class UnifiedAdultProductListView(generics.ListAPIView):
    """
    FANZA / DMM / DUGA を一つのエンドポイントで統合管理。
    """
    permission_classes = [AllowAny]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter, filters.SearchFilter]
    
    queryset = AdultProduct.objects.none()
    search_fields = ['title', 'product_description', 'ai_summary', 'actresses__name', 'genres__name']
    ordering_fields = ['release_date', 'price', 'review_average', 'spec_score']

    def get_queryset(self):
        source = self.request.query_params.get('api_source', '').upper()
        # FanzaProductが空である現状に合わせ、FANZA/DMM指定時もAdultProductを探索対象に含める
        if source == 'DUGA':
            return AdultProduct.objects.filter(is_active=True)
        elif source in ['FANZA', 'DMM']:
            # FanzaProductにデータがない場合、AdultProduct側の api_source='FANZA' 等を探す
            return AdultProduct.objects.filter(is_active=True, api_source__iexact=source)
        return AdultProduct.objects.filter(is_active=True)

    def list(self, request, *args, **kwargs):
        source = self.request.query_params.get('api_source', '').upper()
        maker_slug = self.request.query_params.get('maker__slug')
        search_query = self.request.query_params.get('search')
        
        # 1. 各モデルからベースとなるQuerySetを構築
        qs_adult = AdultProduct.objects.filter(is_active=True).select_related('maker', 'label').prefetch_related('actresses', 'genres')
        qs_fanza = FanzaProduct.objects.filter(is_active=True).select_related('maker', 'label').prefetch_related('actresses', 'genres')

        # 2. パラメータによるフィルタリング
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

        # 3. 出力ロジックの分岐
        if source == 'DUGA':
            queryset = qs_adult.order_by('-release_date')
            return self._get_paginated_response(queryset, AdultProductSerializer)
            
        elif source in ['FANZA', 'DMM']:
            # FanzaProductが空ならAdultProduct内のFANZAデータを返す
            if qs_fanza.count() == 0:
                queryset = qs_adult.filter(api_source__iexact=source).order_by('-release_date')
                return self._get_paginated_response(queryset, AdultProductSerializer)
            
            queryset = qs_fanza.filter(site_code=source).order_by('-release_date')
            return self._get_paginated_response(queryset, FanzaProductSerializer)

        else:
            # 混合リストのソート
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
# 2. 個別 View (特定のモデルに特化した一覧)
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

# --------------------------------------------------------------------------
# 3. 詳細 View (【2026-02-11 統合・深層探索版】)
# --------------------------------------------------------------------------
class FanzaProductDetailAPIView(generics.RetrieveAPIView):
    """
    FANZA作品詳細。FanzaProductになければ AdultProductをフォールバック探索。
    """
    queryset = FanzaProduct.objects.all().select_related('maker', 'label').prefetch_related('genres', 'actresses')
    serializer_class = FanzaProductSerializer
    permission_classes = [AllowAny]
    lookup_field = 'unique_id'

    def get_object(self):
        raw_id = self.kwargs[self.lookup_url_kwarg or self.lookup_field]
        # プレフィックスを剥離（DMM_n_1058... -> n_1058...）
        clean_id = re.sub(r'^(FANZA_|DMM_|DUGA_|fz_)', '', raw_id, flags=re.IGNORECASE)
        
        # 1. まず本来の FanzaProduct モデルを探す
        obj = self.get_queryset().filter(
            Q(unique_id__iexact=raw_id) | Q(unique_id__iexact=clean_id) | Q(unique_id__icontains=clean_id)
        ).first()

        # 2. 【重要】FanzaProductになければ AdultProduct モデル内を探索
        if not obj:
            fallback_obj = AdultProduct.objects.filter(
                Q(product_id_unique__iexact=raw_id) | 
                Q(product_id_unique__iexact=f"FANZA_{clean_id}") | 
                Q(product_id_unique__icontains=clean_id)
            ).first()
            
            if fallback_obj:
                # AdultProductが見つかった場合、Serializerを切り替えて返却
                self.serializer_class = AdultProductSerializer
                return fallback_obj
            
            raise Http404(f"Product Not Found: {raw_id}")
            
        return obj

class AdultProductDetailAPIView(generics.RetrieveAPIView):
    """
    DUGA等詳細。大文字小文字やプレフィックスの有無を無視して柔軟にマッチング。
    """
    queryset = AdultProduct.objects.all().select_related('maker', 'label').prefetch_related('genres', 'actresses')
    serializer_class = AdultProductSerializer
    permission_classes = [AllowAny]
    lookup_field = 'product_id_unique'

    def get_object(self):
        raw_id = self.kwargs[self.lookup_url_kwarg or self.lookup_field]
        # プレフィックスを剥離（DMM_n_1058... -> n_1058...）
        clean_id = re.sub(r'^(FANZA_|DMM_|DUGA_|fz_)', '', raw_id, flags=re.IGNORECASE)
        
        # 大文字小文字を無視 (__iexact) し、かつ複数のIDパターンで検索
        obj = self.get_queryset().filter(
            Q(product_id_unique__iexact=raw_id) | 
            Q(product_id_unique__iexact=f"FANZA_{clean_id}") |
            Q(product_id_unique__iexact=f"DUGA_{clean_id}") |
            Q(product_id_unique__icontains=clean_id)
        ).first()

        if not obj:
            raise Http404(f"AdultProduct Not Found: {raw_id}")
            
        return obj

class AdultProductRankingAPIView(generics.ListAPIView):
    serializer_class = AdultProductSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return AdultProduct.objects.filter(
            spec_score__gt=0, 
            is_active=True
        ).exclude(ai_summary="").select_related('maker', 'label').order_by('-spec_score', '-release_date')[:30]

class LinkshareProductListAPIView(generics.ListAPIView):
    queryset = LinkshareProduct.objects.all().order_by('-updated_at')
    serializer_class = LinkshareProductSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    search_fields = ['product_name', 'sku']