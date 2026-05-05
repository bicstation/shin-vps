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

    def get_queryset(self):
        slug = self.kwargs.get("slug")
        print("SLUG DEBUG:", slug)

        queryset = PCProduct.objects.filter(
            is_active=True,
            unified_genre="PC"
        ).prefetch_related("attributes")

        use = self.request.GET.get("use", "score")

        if slug:
            if slug != "score":

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


# --------------------------------------------------------------------------
# 4. 📄 PC製品詳細
# --------------------------------------------------------------------------
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

# --------------------------------------------------------------------------
# 5. 🔗 関連商品API（最終完成版：段階ロジック対応）
# --------------------------------------------------------------------------
@api_view(["GET"])
@permission_classes([AllowAny])
def get_related_pc_products(request, unique_id):

    limit = 8

    try:
        base = PCProduct.objects.get(
            unique_id=unique_id,
            is_active=True
        )
    except PCProduct.DoesNotExist:
        return Response([])

    base_gpu = base.attributes.filter(attr_type="gpu").first()
    base_usage = base.attributes.filter(attr_type="usage").first()

    # -------------------------
    # デバイス判定
    # -------------------------
    def is_laptop(p):
        name = (p.name or "").lower()
        return (
            "ノート" in name
            or "laptop" in name
            or "book" in name
            or "zenbook" in name
            or "proart" in name
        )

    base_is_laptop = is_laptop(base)

    # -------------------------
    # GPU近似
    # -------------------------
    def get_neighbor_gpu_slugs(slug):
        mapping = {
            "gpu-rtx-4060": ["gpu-rtx-4050", "gpu-rtx-4060", "gpu-rtx-4070"],
            "gpu-rtx-4070": ["gpu-rtx-4060", "gpu-rtx-4070", "gpu-rtx-4080"],
            "gpu-rtx-4080": ["gpu-rtx-4070", "gpu-rtx-4080", "gpu-rtx-4090"],
            "gpu-rtx-4090": ["gpu-rtx-4080", "gpu-rtx-4090"],
        }
        return mapping.get(slug, [slug])

    # -------------------------
    # ベースQS
    # -------------------------
    base_qs = PCProduct.objects.filter(
        is_active=True,
        unified_genre="PC"
    ).exclude(id=base.id).prefetch_related("attributes")

    candidates = base_qs.order_by("-spec_score")[:50]

    # -------------------------
    # スコア
    # -------------------------
    def calc_score(p):
        score = 0

        if base.price and p.price:
            diff = abs(p.price - base.price) / base.price
            if diff <= 0.1:
                score += 0.4
            elif diff <= 0.2:
                score += 0.2

        if base_gpu and p.attributes.filter(slug=base_gpu.slug).exists():
            score += 0.3
        elif base_gpu and p.attributes.filter(
            slug__in=get_neighbor_gpu_slugs(base_gpu.slug)
        ).exists():
            score += 0.2

        if base_usage and p.attributes.filter(slug=base_usage.slug).exists():
            score += 0.2

        if base.spec_score and p.spec_score:
            diff = abs(p.spec_score - base.spec_score) / base.spec_score
            if diff <= 0.1:
                score += 0.1

        return round(score, 2)

    # -------------------------
    # reason
    # -------------------------
    def build_reason(p):
        reasons = []

        if base.price and p.price:
            diff = abs(p.price - base.price) / base.price
            if diff <= 0.2:
                reasons.append("価格帯が近い")

        if base_gpu and p.attributes.filter(slug=base_gpu.slug).exists():
            reasons.append("同クラスGPU")

        if base_usage and p.attributes.filter(slug=base_usage.slug).exists():
            reasons.append("用途一致")

        return "・".join(reasons) if reasons else "構成が近いモデル"

    # -------------------------
    # 段階抽出
    # -------------------------
    strict = []
    loose = []

    for p in candidates:

        # デバイス一致
        if is_laptop(p) != base_is_laptop:
            continue

        if not p.price or not base.price:
            continue

        diff = abs(p.price - base.price) / base.price
        score = calc_score(p)

        item = {
            "id": p.id,
            "unique_id": p.unique_id,
            "name": p.name,
            "price": p.price,
            "image_url": p.image_url,
            "url": p.url,
            "match_score": score,
            "match_reason": build_reason(p)
        }

        # -------------------------
        # 厳密
        # -------------------------
        if diff <= 0.2 and score >= 0.5:
            strict.append(item)

        # -------------------------
        # 緩和
        # -------------------------
        elif diff <= 0.3 and score >= 0.4:
            loose.append(item)

    # -------------------------
    # 合成
    # -------------------------
    results = strict + loose
    results = sorted(results, key=lambda x: x["match_score"], reverse=True)[:limit]

    return Response(results)