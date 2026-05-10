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
        print("SLUG:", slug)
        print(self.request.query_params)

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
        attribute = None
        ranking_mode = "listing"
        
        if slug:

            attribute = (
                PCAttribute.objects.filter(
                    slug=slug
                ).first()
             )

            if (
                attribute
                and
                attribute.is_ranking_enabled
            ):

                ranking_mode = "semantic"

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

        print("COUNT:", queryset.count())
        # return queryset.order_by(
        #     "-spec_score"
        # )[:20]
        
        if ranking_mode == "semantic":
            queryset = queryset.order_by(
                "-spec_score"
            )
        else:
            queryset = queryset.order_by(
                "-created_at"
            )
        return queryset[:20]
      
    def list(self, request, *args, **kwargs):

        queryset = self.get_queryset()

        serializer = self.get_serializer(
            queryset,
            many=True
        )

        # ==========================================
        # Recalculate Ranking Mode
        # ==========================================
        slug = self.kwargs.get("slug")

        ranking_mode = "listing"

        if slug:

            attribute = (
                PCAttribute.objects.filter(
                    slug=slug
                ).first()
            )

            if (
                attribute
                and
                attribute.is_ranking_enabled
            ):

                ranking_mode = "semantic"

        print(
            "LIST RANKING MODE:",
            ranking_mode
        )

        return Response({

            "success": True,

            "ranking_mode":
                ranking_mode,

            "semantic_slug":
                slug,

            "count":
                len(serializer.data),

            "products":
                serializer.data
        })
        
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

        print("==========")
        print("KWARGS:", self.kwargs)

        slug = self.kwargs.get("slug")

        print("SLUG:", slug)

        # ==========================================
        # Semantic Ranking Detection
        # ==========================================
        attribute = None

        ranking_mode = "listing"

        if slug:

            attribute = (
                PCAttribute.objects.filter(
                    slug=slug
                ).first()
            )

            if (
                attribute
                and
                attribute.is_ranking_enabled
            ):

                ranking_mode = "semantic"

        print("ATTRIBUTE:", attribute)

        if attribute:

            print(
                "RANKING ENABLED:",
                attribute.is_ranking_enabled
            )

        print(
            "RANKING MODE:",
            ranking_mode
        )

        print("==========")

        # ==========================================
        # Save ranking mode
        # ==========================================
        self._ranking_mode = (
            ranking_mode
        )

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

        for attr_slug in attribute_slugs:

            queryset = queryset.filter(
                attributes__slug=unquote(attr_slug)
            )

        # --------------------------------------------------
        # Ranking Slug Filter
        # --------------------------------------------------
        if slug:

            queryset = queryset.filter(
                attributes__slug=slug
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

        # ==========================================
        # Semantic Ranking Branch
        # ==========================================
        if ranking_mode == "semantic":

            queryset = queryset.order_by(
                "-spec_score"
            )

        else:

            queryset = queryset.order_by(
                "-created_at"
            )

        return queryset[:20]
    
    def list(self, request, *args, **kwargs):

        queryset = self.filter_queryset(
            self.get_queryset()
        )

        page = self.paginate_queryset(
            queryset
        )

        serializer = self.get_serializer(
            page,
            many=True
        )

        return Response({

            "success": True,

            "count":
                self.paginator.count,

            "next":
                self.paginator.get_next_link(),

            "previous":
                self.paginator.get_previous_link(),

            "products":
                serializer.data
        })

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

            "name":
                attr.name,

            "slug":
                attr.slug,

            "count":
                attr.product_count,

            "icon":
                attr.icon,

            "color":
                attr.color,

            "semantic_role":
                attr.semantic_role,

            "semantic_weight":
                attr.semantic_weight,
        })

    return Response({

        "success": True,

        "sidebar":
            sidebar
    })


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

        return Response({

            "success": True,

            "product":
                serializer.data
        })
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

    base_device = (

        base.attributes.filter(
            attr_type="device"
        ).first()
    )

    base_maker = (

        base.attributes.filter(
            attr_type="maker"
        ).first()
    )

    # ------------------------------------------------------
    # GPU Neighbor Mapping
    # ------------------------------------------------------
    def get_neighbor_gpu_slugs(slug):

        mapping = {

            "gpu-rtx-4050": [
                "gpu-rtx-4050",
                "gpu-rtx-4060",
            ],

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
        )[:150]
    )

    # ------------------------------------------------------
    # Match Score
    # ------------------------------------------------------
    def calc_score(product):

        score = 0

        matched_attributes = []

        # ==================================================
        # Device Semantic
        # ==================================================
        if base_device:

            if product.attributes.filter(
                slug=base_device.slug
            ).exists():

                score += 0.25

                matched_attributes.append(
                    base_device.slug
                )

            else:

                # ------------------------------------------
                # Soft semantic fallback
                # ------------------------------------------
                score -= 0.15

        # ==================================================
        # Price Similarity
        # ==================================================
        if base.price and product.price:

            diff = abs(
                product.price - base.price
            ) / base.price

            if diff <= 0.10:

                score += 0.20

            elif diff <= 0.20:

                score += 0.10

        # ==================================================
        # GPU Exact Match
        # ==================================================
        if (

            base_gpu

            and product.attributes.filter(
                slug=base_gpu.slug
            ).exists()
        ):

            score += 0.20

            matched_attributes.append(
                base_gpu.slug
            )

        # ==================================================
        # GPU Neighbor Match
        # ==================================================
        elif (

            base_gpu

            and product.attributes.filter(
                slug__in=get_neighbor_gpu_slugs(
                    base_gpu.slug
                )
            ).exists()
        ):

            score += 0.12

        # ==================================================
        # Usage Semantic
        # ==================================================
        if (

            base_usage

            and product.attributes.filter(
                slug=base_usage.slug
            ).exists()
        ):

            score += 0.20

            matched_attributes.append(
                base_usage.slug
            )

        # ==================================================
        # Maker Semantic
        # ==================================================
        if (

            base_maker

            and product.attributes.filter(
                slug=base_maker.slug
            ).exists()
        ):

            score += 0.10

            matched_attributes.append(
                base_maker.slug
            )

        # ==================================================
        # Spec Score Similarity
        # ==================================================
        if (

            base.spec_score
            and product.spec_score
        ):

            diff = abs(
                product.spec_score
                - base.spec_score
            ) / base.spec_score

            if diff <= 0.10:

                score += 0.10

        return round(
            score,
            2
        ), matched_attributes

    # ------------------------------------------------------
    # Candidate Selection
    # ------------------------------------------------------
    scored = []

    for product in candidates:

        # ==================================================
        # Skip invalid price
        # ==================================================
        if (
            not product.price
            or not base.price
        ):
            continue

        # ==================================================
        # Price Range Filter
        # ==================================================
        diff = abs(
            product.price - base.price
        ) / base.price

        if diff > 0.35:
            continue

        # ==================================================
        # Calculate Semantic Score
        # ==================================================
        score, matched_attributes = (
            calc_score(product)
        )

        # ==================================================
        # Soft Semantic Threshold
        # ==================================================
        if score < 0.20:
            continue

        product._semantic_score = score

        product._matched_attributes = (
            matched_attributes
        )

        scored.append(product)

    # ------------------------------------------------------
    # Sort Results
    # ------------------------------------------------------
    results = sorted(

        scored,

        key=lambda x: (
            x._semantic_score,
            x.spec_score or 0
        ),

        reverse=True

    )[:limit]

    # ------------------------------------------------------
    # Serialize
    # ------------------------------------------------------
    serializer = (
        PCProductSerializer(
            results,
            many=True
        )
    )

    data = serializer.data

    # ------------------------------------------------------
    # Semantic Recommendation Metadata
    # ------------------------------------------------------
    for i, item in enumerate(data):

        item["similarity_score"] = (
            results[i]._semantic_score
        )

        item["matched_attributes"] = (
            results[i]._matched_attributes
        )


    return Response({

        "success": True,

        "products":
            data
    })
