# -*- coding: utf-8 -*-
# /home/maya/shin-dev/shin-vps/django/api/views/general_views.py

import logging

from urllib.parse import unquote

from django.db.models import (
    Count,
)

from django.shortcuts import (
    get_object_or_404,
)

from django_filters.rest_framework import (
    DjangoFilterBackend,
)

from rest_framework import (
    generics,
    filters,
    pagination,
)

from rest_framework.decorators import (
    api_view,
    permission_classes,
)

from rest_framework.permissions import (
    AllowAny,
)

from rest_framework.response import (
    Response,
)

# ==========================================================
# SEO
# ==========================================================

from api.utils.semantic.seo.metadata import (
    generate_semantic_metadata,
)

from api.utils.semantic.seo.faq import (
    generate_semantic_faq,
)

from api.utils.semantic.seo.breadcrumbs import (
    generate_semantic_breadcrumbs,
)

from api.utils.semantic.seo.schema import (
    generate_semantic_schemas,
)

# ==========================================================
# MODELS
# ==========================================================

from api.models.pc_products import (
    PCProduct,
)

from api.models import (
    PCAttribute,
)

# ==========================================================
# SERIALIZERS
# ==========================================================

from api.serializers.pc_product_serializer import (
    PCProductSerializer,
)

# ==========================================================
# SEMANTIC API SERVICE
# ==========================================================

from api.services.semantic.semantic_api_service import (

    build_semantic_product_payload,

    build_semantic_ranking_payload,

    build_semantic_related_products,

    build_semantic_discovery_payload,
)

logger = logging.getLogger(__name__)


# ==========================================================
# PAGINATION
# ==========================================================

class PCProductLimitOffsetPagination(
    pagination.LimitOffsetPagination
):

    default_limit = 20

    max_limit = 100


# ==========================================================
# UTIL
# ==========================================================

def safe_runtime(product):

    runtime = getattr(
        product,
        "semantic_runtime",
        {}
    )

    if not runtime:
        return {}

    return runtime


def safe_int(value):

    try:
        return int(value)

    except:
        return 0


# ==========================================================
# RANKING VIEW
# ==========================================================

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
        
        print("\n")
        print("=================================")
        print("RANKING VIEW TRACE")
        print("slug =", slug)
        print("kwargs =", self.kwargs)
        print("=================================")

        queryset = (

            PCProduct.objects

            .filter(
                is_active=True,
                unified_genre="PC",
            )

            .prefetch_related(
                "attributes"
            )

            .exclude(
                semantic_runtime__isnull=True
            )
        )

        # ==================================================
        # Semantic Runtime Filter
        # ==================================================

        queryset = queryset.exclude(
            product_type="accessory"
        )

        # ==================================================
        # Semantic Attribute Filtering
        # ==================================================

        print(
            f"FILTER CHECK slug={slug}"
        )

        if slug and slug != "score":

            # --------------------------------------------------
            # GPU
            # --------------------------------------------------

            if slug.startswith(
                "gpu-"
            ):

                queryset = queryset.filter(
                    attributes__slug=slug
                )

            # --------------------------------------------------
            # Maker
            # --------------------------------------------------

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

            # --------------------------------------------------
            # Generic Semantic
            # --------------------------------------------------

            else:

                queryset = queryset.filter(
                    attributes__slug=slug
                )

        # ==================================================
        # Semantic Sort
        # ==================================================

        queryset = queryset.order_by(

            "-semantic_score",

            "-spec_score",

            "-score_gpu",

            "-score_cpu",
        ).distinct()

        return queryset[:20]

    # ======================================================
    # LIST
    # ======================================================

    def list(self, request, *args, **kwargs):
        
        print("\n")
        print("=================================")
        print("RANKING LIST TRACE")
        print("path =", request.path)
        print("kwargs =", self.kwargs)
        print("=================================")

        queryset = self.get_queryset()

        slug = self.kwargs.get(
            "slug"
        )

        attribute = None

        ranking_mode = "listing"

        seo = {}
        faq = []
        breadcrumbs = []
        schemas = {}

        # ==================================================
        # Semantic SEO Runtime
        # ==================================================

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

            if attribute:

                seo = generate_semantic_metadata(
                    attribute
                )

                faq = generate_semantic_faq(
                    attribute
                )

                breadcrumbs = (
                    generate_semantic_breadcrumbs(
                        attribute
                    )
                )

                schemas = (
                    generate_semantic_schemas(

                        attribute=attribute,

                        seo=seo,

                        faq=faq,

                        breadcrumbs=breadcrumbs,
                    )
                )

        # ==================================================
        # Semantic Ranking Payload
        # ==================================================

        payload = (
            build_semantic_ranking_payload(
                queryset
            )
        )

        return Response({

            # ==============================================
            # Base
            # ==============================================
            "success":
                True,

            "ranking_mode":
                ranking_mode,

            "semantic_slug":
                slug,

            # ==============================================
            # Semantic Runtime
            # ==============================================
            "semantic_runtime":
                "v2",

            "semantic_authority":
                "backend",

            # ==============================================
            # Semantic Ranking Payload
            # ==============================================
            "results":
                payload.get(
                    "results",
                    []
                ),

            # ==============================================
            # Count
            # ==============================================
            "count":
                len(
                    payload.get(
                        "results",
                        []
                    )
                ),

            # ==============================================
            # SEO Runtime
            # ==============================================
            "seo":
                seo,

            "faq":
                faq,

            "breadcrumbs":
                breadcrumbs,

            "schemas":
                schemas,
        })


# ==========================================================
# PRODUCT LIST
# ==========================================================

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

        "name",

        "cpu_model",

        "gpu_model",

        "description",
    ]

    ordering_fields = [

        "price",

        "created_at",

        "spec_score",

        "semantic_score",
    ]

    # ======================================================
    # QUERYSET
    # ======================================================

    def get_queryset(self):

        slug = self.kwargs.get(
            "slug"
        )

        queryset = (

            PCProduct.objects

            .filter(
                is_active=True,
                unified_genre="PC",
            )

            .prefetch_related(
                "attributes"
            )

            .exclude(
                semantic_runtime__isnull=True
            )

            .distinct()
        )

        # ==================================================
        # Maker Filter
        # ==================================================

        maker = (
            self.request.query_params.get(
                "maker"
            )
        )

        if maker:

            queryset = queryset.filter(
                maker__iexact=unquote(
                    maker
                )
            )

        # ==================================================
        # Semantic Attribute Filter
        # ==================================================

        attribute_slugs = (
            self.request.query_params.getlist(
                "attribute"
            )
        )

        for attr_slug in attribute_slugs:

            queryset = queryset.filter(
                attributes__slug=unquote(
                    attr_slug
                )
            )

        # ==================================================
        # Ranking Slug
        # ==================================================

        if slug:

            queryset = queryset.filter(
                attributes__slug=slug
            )

        # ==================================================
        # Max Price
        # ==================================================

        max_price = (
            self.request.query_params.get(
                "max_price"
            )
        )

        if max_price:

            try:

                queryset = queryset.filter(
                    price__lte=int(
                        max_price
                    )
                )

            except Exception:

                pass

        # ==================================================
        # Semantic Sort
        # ==================================================

        queryset = queryset.order_by(

            "-semantic_score",

            "-spec_score",
            
            "-created_at",
        )

        return queryset[:100]

    # ======================================================
    # LIST
    # ======================================================

    def list(self, request, *args, **kwargs):

        queryset = self.filter_queryset(
            self.get_queryset()
        )

        page = self.paginate_queryset(
            queryset
        )

        # ==================================================
        # Semantic Payload
        # ==================================================

        payload = (
            build_semantic_ranking_payload(
                page
            )
        )

        return Response({

            "success":
                True,

            "semantic_runtime":
                "v2",

            "semantic_authority":
                "backend",

            "count":
                self.paginator.count,

            "next":
                self.paginator.get_next_link(),

            "previous":
                self.paginator.get_previous_link(),

            "results":
                payload.get(
                    "results",
                    []
                ),

            # ==============================================
            # Discovery Runtime
            # ==============================================
            "discovery":
                build_semantic_discovery_payload(),
        })


# ==========================================================
# SIDEBAR STATS
# ==========================================================

@api_view(["GET"])
@permission_classes([AllowAny])

def pc_sidebar_stats(request):

    attrs = (

        PCAttribute.objects

        .annotate(
            product_count=Count(
                "products"
            )
        )

        .filter(
            product_count__gt=0
        )
    )

    sidebar = {}

    for attr in attrs:

        key = attr.attr_type

        # ==================================================
        # Semantic Group
        # ==================================================

        if key not in sidebar:

            sidebar[key] = {

                "meta": {

                    "name":
                        key.replace(
                            "_",
                            " "
                        ).title(),

                    "short_name":
                        key.upper(),

                    "description":
                        f"{key} semantic group",

                    "icon":
                        attr.icon,

                    "color":
                        attr.color,

                    "semantic_role":
                        attr.semantic_role,

                    "semantic_weight":
                        attr.semantic_weight,
                },

                "items": [],
            }

        # ==================================================
        # Item
        # ==================================================

        sidebar[key]["items"].append({

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

        "semantic_runtime":
            "v2",

        "semantic_authority":
            "backend",

        "grouped_attributes":
            sidebar,
    })


# ==========================================================
# PRODUCT DETAIL
# ==========================================================

@api_view(["GET"])
@permission_classes([AllowAny])

def pc_product_detail(
    request,
    unique_id
):

    product = get_object_or_404(

        PCProduct.objects.prefetch_related(
            "attributes"
        ),

        unique_id=unique_id,
    )

    # ======================================================
    # Semantic Product Payload
    # ======================================================

    semantic_payload = (
        build_semantic_product_payload(
            product
        )
    )

    # ======================================================
    # Semantic Related
    # ======================================================

    related_products = (
        build_semantic_related_products(
            product
        )
    )

    # ======================================================
    # SEO
    # ======================================================

    seo = {

        "title":
            (
                f"{product.name}"
                f" | SHIN CORE LINX"
            ),

        "description":
            (
                f"{product.name}"
                f" の性能・特徴・"
                f"おすすめ用途を比較"
            ),

        "canonical":
            (
                f"/product/"
                f"{product.unique_id}/"
            ),
    }

    # ======================================================
    # FAQ
    # ======================================================

    runtime = safe_runtime(
        product
    )

    primary_workflow = runtime.get(
        "primary_workflow"
    )

    faq = [

        {

            "question":
                (
                    f"{product.name}"
                    f" はどんな用途向け？"
                ),

            "answer":
                (
                    f"{primary_workflow}"
                    f" ワークフローに"
                    f"適しています。"
                ),
        },

        {

            "question":
                (
                    f"{product.name}"
                    f" の特徴は？"
                ),

            "answer":
                (
                    "semantic runtime "
                    "に基づき"
                    "高い探索価値を"
                    "持っています。"
                ),
        },
    ]

    # ======================================================
    # Breadcrumbs
    # ======================================================

    breadcrumbs = [

        {
            "name": "Home",
            "url": "/",
        },

        {
            "name": "Ranking",
            "url": "/ranking/",
        },

        {
            "name":
                product.name,

            "url":
                (
                    f"/product/"
                    f"{product.unique_id}/"
                ),
        },
    ]

    # ======================================================
    # Schemas
    # ======================================================

    schemas = {

        "product_schema": {

            "@context":
                "https://schema.org",

            "@type":
                "Product",

            "name":
                product.name,

            "image":
                product.image_url,

            "sku":
                product.unique_id,
        }
    }

    # ======================================================
    # Response
    # ======================================================

    return Response({

        # ==============================================
        # Base
        # ==============================================
        "success":
            True,

        # ==============================================
        # Semantic Runtime
        # ==============================================
        "semantic_runtime":
            "v2",

        "semantic_authority":
            "backend",

        # ==============================================
        # Product
        # ==============================================
        "product":
            semantic_payload,

        # ==============================================
        # Semantic Continuation
        # ==============================================
        "semantic_related":
            related_products,

        # ==============================================
        # Discovery Runtime
        # ==============================================
        "discovery":
            build_semantic_discovery_payload(),

        # ==============================================
        # Frontend Runtime
        # ==============================================
        "ui_mode":
            "cinematic",

        "exploration_mode":
            "semantic_continuation",

        # ==============================================
        # SEO
        # ==============================================
        "seo":
            seo,

        "faq":
            faq,

        "breadcrumbs":
            breadcrumbs,

        "schemas":
            schemas,
    })


# ==========================================================
# RELATED PRODUCTS
# ==========================================================

@api_view(["GET"])
@permission_classes([AllowAny])

def get_related_pc_products(
    request,
    unique_id
):

    product = get_object_or_404(

        PCProduct.objects.prefetch_related(
            "attributes"
        ),

        unique_id=unique_id,
    )

    related_products = (
        build_semantic_related_products(
            product
        )
    )

    return Response({

        "success":
            True,

        "semantic_runtime":
            "v2",

        "semantic_authority":
            "backend",

        "continuation_runtime":
            "semantic_graph",

        "count":
            len(
                related_products
            ),

        "products":
            related_products,
    })