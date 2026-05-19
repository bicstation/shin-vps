# -*- coding: utf-8 -*-
# /home/maya/shin-vps/django/api/views/finder_view.py

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

import traceback

from api.models import PCProduct

# ==========================================================
# SEMANTIC API SERVICE
# ==========================================================

from api.services.semantic.semantic_api_service import (

    build_semantic_product_payload,

    build_semantic_shelf_payload,

    build_semantic_discovery_payload,
)

# ==========================================================
# DEBUG
# ==========================================================

DEBUG_MODE = True


# ==========================================================
# UTIL
# ==========================================================

def safe_int(value):

    try:
        return int(value)

    except:
        return 0


def safe_runtime(product):

    runtime = getattr(
        product,
        "semantic_runtime",
        {}
    )

    if not runtime:
        return {}

    return runtime


# ==========================================================
# IMAGE URL
# IMPORTANT:
# Docker-safe image runtime
# ==========================================================

def build_image_url(
    product,
    request,
):

    base_url = (
        f"{request.scheme}"
        f"://"
        f"{request.get_host()}"
    )

    try:

        # ==================================================
        # Local Image
        # ==================================================

        if getattr(

            product,

            "image_local",

            None
        ):

            return (

                f"{base_url}"
                f"/media/"
                f"{product.image_local}"
            )

        # ==================================================
        # Thumbnail URL
        # ==================================================

        thumbnail_url = getattr(

            product,

            "thumbnail_url",

            None
        )

        if thumbnail_url:

            return thumbnail_url.replace(

                "http://django-v3:8000",

                base_url
            )

        # ==================================================
        # External Image
        # ==================================================

        image_source = getattr(

            product,

            "image_source",

            None
        )

        if image_source:

            return image_source

    except Exception:

        pass

    return ""


# ==========================================================
# FINDER FILTER
# ==========================================================

def filter_products_by_intent(

    queryset,

    workflow=None,

    semantic=None,

    intent=None,
):

    results = []

    for product in queryset:

        runtime = safe_runtime(
            product
        )

        if not runtime:
            continue

        workflows = [

            workflow_data.get(
                "workflow"
            )

            for workflow_data
            in runtime.get(
                "workflows",
                []
            )

            if isinstance(
                workflow_data,
                dict
            )
        ]

        labels = runtime.get(
            "semantic_labels",
            []
        )

        # ==================================================
        # Workflow
        # ==================================================

        if workflow:

            if workflow not in workflows:
                continue

        # ==================================================
        # Semantic
        # ==================================================

        if semantic:

            semantic_found = False

            for label in labels:

                if semantic.lower() in str(
                    label
                ).lower():

                    semantic_found = True
                    break

            if not semantic_found:
                continue

        # ==================================================
        # Intent
        # ==================================================

        if intent:

            primary_workflow = runtime.get(
                "primary_workflow"
            )

            if (
                primary_workflow
                and
                intent.lower()
                not in primary_workflow.lower()
            ):

                continue

        results.append(
            product
        )

    return results


# ==========================================================
# SORT
# ==========================================================

def sort_products(products):

    def score(product):

        runtime = safe_runtime(
            product
        )

        semantic_score = safe_int(

            runtime.get(
                "semantic_score"
            )
        )

        workflow_score = safe_int(

            runtime.get(
                "workflow_score"
            )
        )

        return (

            semantic_score
            +
            workflow_score
        )

    return sorted(

        products,

        key=score,

        reverse=True
    )


# ==========================================================
# SEMANTIC FINDER
# ==========================================================

@api_view(["GET"])
@permission_classes([AllowAny])

def semantic_finder(request):

    """
    SHIN CORE LINX
    Semantic Discovery Finder

    examples:

    ?workflow=creator
    ?workflow=gaming
    ?workflow=ai

    ?semantic=OLED
    ?semantic=immersive

    ?intent=ai
    """

    try:

        # ==================================================
        # Query Params
        # ==================================================

        workflow = request.GET.get(
            "workflow"
        )

        semantic = request.GET.get(
            "semantic"
        )

        intent = request.GET.get(
            "intent"
        )

        limit = safe_int(

            request.GET.get(
                "limit",
                24
            )
        )

        # ==================================================
        # Base Query
        # ==================================================

        queryset = PCProduct.objects.exclude(
            semantic_runtime__isnull=True
        )[:500]

        # ==================================================
        # Semantic Filtering
        # ==================================================

        filtered_products = (

            filter_products_by_intent(

                queryset,

                workflow=workflow,

                semantic=semantic,

                intent=intent,
            )
        )

        # ==================================================
        # Sort
        # ==================================================

        filtered_products = sort_products(
            filtered_products
        )

        # ==================================================
        # Limit
        # ==================================================

        filtered_products = filtered_products[
            :limit
        ]

        # ==================================================
        # Semantic Product Payloads
        # ==================================================

        product_payloads = []

        for product in filtered_products:

            payload = (
                build_semantic_product_payload(
                    product
                )
            )

            # ==============================================
            # Runtime Image Override
            # ==============================================

            payload["image_url"] = (
                build_image_url(

                    product,

                    request,
                )
            )

            product_payloads.append(
                payload
            )

        # ==================================================
        # Semantic Shelves
        # ==================================================

        shelves_payload = (
            build_semantic_shelf_payload()
        )

        # ==================================================
        # Discovery Runtime
        # ==================================================

        discovery_payload = (
            build_semantic_discovery_payload()
        )

        # ==================================================
        # Response
        # ==================================================

        return Response({

            # ==============================================
            # Semantic Authority
            # ==============================================
            "semantic_runtime":
                "v2",

            "semantic_authority":
                "backend",

            # ==============================================
            # Finder
            # ==============================================
            "finder_runtime":
                "semantic_discovery",

            # ==============================================
            # Query
            # ==============================================
            "query": {

                "workflow":
                    workflow,

                "semantic":
                    semantic,

                "intent":
                    intent,

                "limit":
                    limit,
            },

            # ==============================================
            # Results
            # ==============================================
            "count":
                len(product_payloads),

            "results":
                product_payloads,

            # ==============================================
            # Cinematic Shelves
            # ==============================================
            "semantic_shelves":
                shelves_payload,

            # ==============================================
            # Discovery Runtime
            # ==============================================
            "discovery":
                discovery_payload,

            # ==============================================
            # UX Runtime
            # ==============================================
            "ui_mode":
                "semantic_exploration",

            "exploration_type":
                "human_intent_navigation",

            # ==============================================
            # Debug
            # ==============================================
            "debug": {

                "workflow":
                    workflow,

                "semantic":
                    semantic,

                "intent":
                    intent,

                "filtered":
                    len(filtered_products),
            }

            if DEBUG_MODE
            else None,
        })

    except Exception as e:

        traceback.print_exc()

        if DEBUG_MODE:

            return Response({

                "error":
                    str(e),

                "type":
                    str(type(e)),
            }, status=500)

        return Response({

            "error":
                "internal_server_error"

        }, status=500)