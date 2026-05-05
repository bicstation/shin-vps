# -*- coding: utf-8 -*-
import json
import requests
import logging
from urllib.parse import unquote

from django.db.models import Count, Q
from django.http import StreamingHttpResponse
from django.shortcuts import get_object_or_404

from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import generics, filters, pagination, views
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from api.models.pc_products import PCProduct
from api.models import PCAttribute, PriceHistory

from api.serializers.pc_product_serializer import PCProductSerializer

logger = logging.getLogger(__name__)

# --------------------------------------------------------------------------
# 0. ページネーション
# --------------------------------------------------------------------------

class PCProductLimitOffsetPagination(pagination.LimitOffsetPagination):
    default_limit = 20
    max_limit = 100


# --------------------------------------------------------------------------
# 1. 🏆 PC製品ランキング
# --------------------------------------------------------------------------
class PCProductRankingView(generics.ListAPIView):
    serializer_class = PCProductSerializer
    permission_classes = [AllowAny]

    # -------------------------
    # 🔥 スコア計算（将来用）
    # -------------------------
    def calculate_score(self, product, use: str):
        cpu = float(product.score_cpu or 0)
        gpu = float(product.score_gpu or 0)
        cost = float(product.score_cost or 0)
        mem = float(product.memory_gb or 0)
        ai = float(product.score_ai or 0)

        if use == "gaming":
            return gpu * 0.6 + cpu * 0.3 + cost * 0.1

        if use == "price-low":
            return cost * 0.7 + cpu * 0.2 + gpu * 0.1

        if use == "work":
            return cpu * 0.5 + (mem * 2) * 0.3 + cost * 0.2

        if use == "ai":
            return ai * 0.6 + cpu * 0.3 + cost * 0.1

        return float(product.spec_score or 0)

    # -------------------------
    # 🔥 クエリ生成
    # -------------------------
    def get_queryset(self):
        slug = self.kwargs.get("slug")
        print("SLUG DEBUG:", slug)  # ←これ追加
        

        queryset = PCProduct.objects.filter(
            is_active=True,
            unified_genre="PC"
        ).prefetch_related("attributes")

        use = self.request.GET.get("use", "score")
        slug = self.kwargs.get("slug")

        # -------------------------
        # 🔥 フィルタ処理（scoreは除外）
        # -------------------------
        if slug:
            
            slug = self.kwargs.get("slug")

            if slug and slug != "score":

                if slug.startswith("gpu-"):
                    queryset = queryset.filter(
                        attributes__attr_type="gpu",
                        attributes__slug=slug
                    )

                elif slug.startswith("maker-"):
                    maker = slug.replace("maker-", "")
                    queryset = queryset.filter(maker__iexact=maker)

                else:
                    queryset = queryset.filter(
                        attributes__slug=slug
                    )

                queryset = queryset.distinct()

        # -------------------------
        # 🔥 並び替え（安定版）
        # -------------------------
        # 👉 今はDBソート（高速・安定）
        return queryset.order_by("-spec_score")[:20]

# --------------------------------------------------------------------------
# 2. 📦 PC製品一覧
# --------------------------------------------------------------------------

class PCProductListAPIView(generics.ListAPIView):
    serializer_class = PCProductSerializer
    pagination_class = PCProductLimitOffsetPagination
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter, filters.SearchFilter]

    search_fields = ['name', 'cpu_model', 'gpu_model', 'description']
    ordering_fields = ['price', 'created_at', 'spec_score']

    def get_queryset(self):
        queryset = PCProduct.objects.filter(
            is_active=True,
            unified_genre="PC"
        ).exclude(cpu_model__isnull=True).exclude(cpu_model='') \
         .prefetch_related('attributes') \
         .distinct()

        maker = self.request.query_params.get('maker')
        if maker:
            queryset = queryset.filter(maker__iexact=unquote(maker))

        attribute_slugs = self.request.query_params.getlist('attribute')
        for slug in attribute_slugs:
            queryset = queryset.filter(attributes__slug=unquote(slug))

        max_price = self.request.query_params.get('max_price')
        if max_price:
            try:
                queryset = queryset.filter(price__lte=int(max_price))
            except:
                pass

        return queryset


# --------------------------------------------------------------------------
# 3. 📊 サイドバー統計
# --------------------------------------------------------------------------

@api_view(['GET'])
@permission_classes([AllowAny])
def pc_sidebar_stats(request):

    attrs = PCAttribute.objects.annotate(
        product_count=Count('products')
    ).filter(product_count__gt=0)

    sidebar = {}

    for attr in attrs:
        key = attr.attr_type
        sidebar.setdefault(key, []).append({
            "name": attr.name,
            "slug": attr.slug,
            "count": attr.product_count
        })

    makers = PCProduct.objects.filter(is_active=True) \
        .values('maker') \
        .annotate(count=Count('maker')) \
        .order_by('-count')

    sidebar["makers"] = makers

    return Response(sidebar)

# -------------------------
# 📄 PC製品詳細
# -------------------------
@api_view(["GET"])
@permission_classes([AllowAny])
def pc_product_detail(request, unique_id):

    print("DETAIL HIT:", unique_id)

    try:
        product = PCProduct.objects.get(unique_id=unique_id)

        serializer = PCProductSerializer(product)
        return Response(serializer.data)

    except PCProduct.DoesNotExist:
        return Response({"error": "not found"}, status=404)