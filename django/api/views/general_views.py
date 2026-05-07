# -*- coding: utf-8 -*-
# /home/maya/dev/shin-vps/django/api/views/general_views.py

import json
import requests
import logging

from urllib.parse import unquote

from django.db.models import (
    Count,
    Q,
)

from django.http import (
    StreamingHttpResponse
)

from django.shortcuts import (
    get_object_or_404
)

from django_filters.rest_framework import (
    DjangoFilterBackend
)

from rest_framework import (
    generics,
    filters,
    pagination,
    views,
)

from rest_framework.decorators import (
    api_view,
    permission_classes,
)

from rest_framework.permissions import (
    AllowAny
)

from rest_framework.response import (
    Response
)

from rest_framework.views import (
    APIView
)

# ==========================================================
# Models
# ==========================================================
from api.models.pc_products import (
    PCProduct
)

from api.models import (
    PCAttribute,
    PriceHistory,
)

# ==========================================================
# Serializers
# ==========================================================
from api.serializers.general_serializers import (
    PCProductSerializer
)

logger = logging.getLogger(__name__)


# --------------------------------------------------------------------------
# 0. Pagination
# --------------------------------------------------------------------------
class PCProductLimitOffsetPagination(
    pagination.LimitOffsetPagination
):

    default_limit = 20

    max_limit = 100


# --------------------------------------------------------------------------
# 1. 🏆 PC製品ランキング
# --------------------------------------------------------------------------
class PCProductRankingView(
    generics.ListAPIView
):

    serializer_class = (
        PCProductSerializer
    )

    permission_classes = [
        AllowAny
    ]

    def get_queryset(self):

        slug = self.kwargs.get(
            "slug"
        )

        queryset = (
            PCProduct.objects
            .filter(
                is_active=True,
                unified_genre="PC"
            )
            .prefetch_related(
                "attributes"
            )
        )

        # --------------------------------------------------
        # Semantic Filtering
        # --------------------------------------------------
        if slug:

            if slug != "score":

                # GPU
                if slug.startswith(
                    "gpu-"
                ):

                    queryset = queryset.filter(
                        attributes__attr_type="gpu",
                        attributes__slug=slug
                    )

                # Maker
                elif slug.startswith(
                    "maker-"
                ):

                    maker = slug.replace(
                        "maker-",
                        ""
                    )

                    queryset = queryset.filter(
                        maker__iexact=maker
                    )

                # Generic Semantic
                else:

                    queryset = queryset.filter(
                        attributes__slug=slug
                    )

                queryset = queryset.distinct()

        return queryset.order_by(
            "-spec_score"
        )[:20]


# --------------------------------------------------------------------------
# 2. 📦 PC製品一覧
# --------------------------------------------------------------------------
class PCProductListAPIView(
    generics.ListAPIView
):

    serializer_class = (
        PCProductSerializer
    )

    pagination_class = (
        PCProductLimitOffsetPagination
    )

    permission_classes = [
        AllowAny
    ]

    filter_backends = [

        DjangoFilterBackend,

        filters.OrderingFilter,

        filters.SearchFilter,
    ]

    search_fields = [

        'name',
        'cpu_model',
        'gpu_model',
        'description'
    ]

    ordering_fields = [

        'price',
        'created_at',
        'spec_score'
    ]

    def get_queryset(self):

        queryset = (

            PCProduct.objects

            .filter(
                is_active=True,
                unified_genre="PC"
            )

            .exclude(
                cpu_model__isnull=True
            )

            .exclude(
                cpu_model=''
            )

            .prefetch_related(
                'attributes'
            )

            .distinct()
        )

        # --------------------------------------------------
        # Maker Filter
        # --------------------------------------------------
        maker = (
            self.request.query_params.get(
                'maker'
            )
        )

        if maker:

            queryset = queryset.filter(
                maker__iexact=unquote(maker)
            )

        # --------------------------------------------------
        # Semantic Attribute Filter
        # --------------------------------------------------
        attribute_slugs = (
            self.request.query_params.getlist(
                'attribute'
            )
        )

        for slug in attribute_slugs:

            queryset = queryset.filter(
                attributes__slug=unquote(slug)
            )

        # --------------------------------------------------
        # Price Filter
        # --------------------------------------------------
        max_price = (
            self.request.query_params.get(
                'max_price'
            )
        )

        if max_price:

            try:

                queryset = queryset.filter(
                    price__lte=int(max_price)
                )

            except:
                pass

        return queryset


# --------------------------------------------------------------------------
# 3. 📊 Sidebar Stats
# --------------------------------------------------------------------------
@api_view(['GET'])
@permission_classes([AllowAny])
def pc_sidebar_stats(request):

    attrs = (

        PCAttribute.objects

        .annotate(
            product_count=Count('products')
        )

        .filter(
            product_count__gt=0
        )
    )

    sidebar = {}

    for attr in attrs:

        key = attr.attr_type

        sidebar.setdefault(
            key,
            []
        ).append({

            "name": attr.name,

            "slug": attr.slug,

            "count": attr.product_count
        })

    makers = (

        PCProduct.objects

        .filter(
            is_active=True
        )

        .values('maker')

        .annotate(
            count=Count('maker')
        )

        .order_by('-count')
    )

    sidebar["makers"] = makers

    return Response(
        sidebar
    )


# --------------------------------------------------------------------------
# 4. 📄 PC製品詳細
# --------------------------------------------------------------------------
@api_view(["GET"])
@permission_classes([AllowAny])
def pc_product_detail(
    request,
    unique_id
):

    print(
        "DETAIL HIT:",
        unique_id
    )

    try:

        product = (

            PCProduct.objects

            .prefetch_related(
                "attributes"
            )

            .get(
                unique_id=unique_id
            )
        )

        serializer = (
            PCProductSerializer(
                product
            )
        )

        return Response(
            serializer.data
        )

    except PCProduct.DoesNotExist:

        return Response(
            {
                "error": "not found"
            },
            status=404
        )


# --------------------------------------------------------------------------
# 5. 🔗 関連商品API
# --------------------------------------------------------------------------
@api_view(["GET"])
@permission_classes([AllowAny])
def get_related_pc_products(
    request,
    unique_id
):

    limit = 8

    try:

        base = (

            PCProduct.objects

            .prefetch_related(
                "attributes"
            )

            .get(
                unique_id=unique_id,
                is_active=True
            )
        )

    except PCProduct.DoesNotExist:

        return Response([])

    # ------------------------------------------------------
    # Base Semantic Attributes
    # ------------------------------------------------------
    base_gpu = (

        base.attributes.filter(
            attr_type="gpu"
        ).first()
    )

    base_usage = (

        base.attributes.filter(
            attr_type="usage"
        ).first()
    )

    # ------------------------------------------------------
    # Device Detection
    # ------------------------------------------------------
    def is_laptop(product):

        name = (
            product.name or ""
        ).lower()

        return (

            "ノート" in name
            or "laptop" in name
            or "book" in name
            or "zenbook" in name
            or "proart" in name
        )

    base_is_laptop = (
        is_laptop(base)
    )

    # ------------------------------------------------------
    # GPU Neighbor Mapping
    # ------------------------------------------------------
    def get_neighbor_gpu_slugs(slug):

        mapping = {

            "gpu-rtx-4060": [
                "gpu-rtx-4050",
                "gpu-rtx-4060",
                "gpu-rtx-4070",
            ],

            "gpu-rtx-4070": [
                "gpu-rtx-4060",
                "gpu-rtx-4070",
                "gpu-rtx-4080",
            ],

            "gpu-rtx-4080": [
                "gpu-rtx-4070",
                "gpu-rtx-4080",
                "gpu-rtx-4090",
            ],

            "gpu-rtx-4090": [
                "gpu-rtx-4080",
                "gpu-rtx-4090",
            ],
        }

        return mapping.get(
            slug,
            [slug]
        )

    # ------------------------------------------------------
    # Candidate Base Query
    # ------------------------------------------------------
    candidates = (

        PCProduct.objects

        .filter(
            is_active=True,
            unified_genre="PC"
        )

        .exclude(
            id=base.id
        )

        .prefetch_related(
            "attributes"
        )

        .order_by(
            "-spec_score"
        )[:50]
    )

    # ------------------------------------------------------
    # Match Score
    # ------------------------------------------------------
    def calc_score(product):

        score = 0

        # Price
        if base.price and product.price:

            diff = abs(
                product.price - base.price
            ) / base.price

            if diff <= 0.1:
                score += 0.4

            elif diff <= 0.2:
                score += 0.2

        # GPU
        if (

            base_gpu

            and product.attributes.filter(
                slug=base_gpu.slug
            ).exists()
        ):

            score += 0.3

        elif (

            base_gpu

            and product.attributes.filter(
                slug__in=get_neighbor_gpu_slugs(
                    base_gpu.slug
                )
            ).exists()
        ):

            score += 0.2

        # Usage
        if (

            base_usage

            and product.attributes.filter(
                slug=base_usage.slug
            ).exists()
        ):

            score += 0.2

        # Spec Score
        if (

            base.spec_score

            and product.spec_score
        ):

            diff = abs(
                product.spec_score
                - base.spec_score
            ) / base.spec_score

            if diff <= 0.1:
                score += 0.1

        return round(
            score,
            2
        )

    # ------------------------------------------------------
    # Candidate Selection
    # ------------------------------------------------------
    strict = []

    loose = []

    for product in candidates:

        # Device Match
        if (
            is_laptop(product)
            != base_is_laptop
        ):
            continue

        if (
            not product.price
            or not base.price
        ):
            continue

        diff = abs(
            product.price - base.price
        ) / base.price

        score = calc_score(
            product
        )

        # --------------------------------------------------
        # Strict
        # --------------------------------------------------
        if (
            diff <= 0.2
            and score >= 0.5
        ):

            strict.append(
                product
            )

        # --------------------------------------------------
        # Loose
        # --------------------------------------------------
        elif (
            diff <= 0.3
            and score >= 0.4
        ):

            loose.append(
                product
            )

    # ------------------------------------------------------
    # Merge
    # ------------------------------------------------------
    results = strict + loose

    results = sorted(
        results,
        key=lambda x: calc_score(x),
        reverse=True
    )[:limit]

    # ------------------------------------------------------
    # Serializer
    # ------------------------------------------------------
    serializer = (
        PCProductSerializer(
            results,
            many=True
        )
    )

    return Response(
        serializer.data
    )