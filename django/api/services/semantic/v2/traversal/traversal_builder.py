# -*- coding: utf-8 -*-
# api/services/semantic/v2/traversal/traversal_builder.py

from api.models import (
    PCProduct,
)


# ==========================================================
# PRODUCT
# ==========================================================

def build_product_traversal(

    product,

    runtime=None,
):

    runtime = (

        runtime

        or

        product.semantic_runtime

        or {}
    )

    return {

        # --------------------------------------------------
        # Identity
        # --------------------------------------------------

        "product_id":
            product.id,

        "unique_id":
            product.unique_id,

        "name":
            getattr(
                product,
                "name",
                ""
            ),

        "maker":
            getattr(
                product,
                "maker",
                ""
            ),

        # --------------------------------------------------
        # Commerce
        # --------------------------------------------------

        "price":
            getattr(
                product,
                "price",
                None
            ),

        "image_url":
            getattr(
                product,
                "image_url",
                ""
            ),

        # --------------------------------------------------
        # Reality
        # --------------------------------------------------

        "semantic_attributes":

            runtime.get(
                "semantic_attributes",
                []
            ),

        "matched_groups":

            runtime.get(
                "semantic_groups",
                []
            ),

        "reality_scores":

            runtime.get(
                "reality_scores",
                {}
            ),

        # --------------------------------------------------
        # Meaning
        # --------------------------------------------------

        "product_type":

            runtime.get(
                "product_type"
            ),

        "primary_workflow":

            runtime.get(
                "primary_workflow"
            ),

        "workflow_score":

            runtime.get(
                "workflow_score",
                0
            ),

        "semantic_score":

            runtime.get(
                "semantic_score",
                0
            ),

        # --------------------------------------------------
        # Workflow
        # --------------------------------------------------

        "workflow_tags":

            runtime.get(
                "workflow_tags",
                []
            ),

        "workflows":

            runtime.get(
                "workflows",
                []
            ),

        # --------------------------------------------------
        # Human Labels
        # --------------------------------------------------

        "semantic_labels":

            runtime.get(
                "semantic_labels",
                []
            ),

        # --------------------------------------------------
        # Adaptive Runtime
        # --------------------------------------------------

        "adaptive_runtime":

            runtime.get(
                "adaptive_runtime",
                {}
            ),

        # --------------------------------------------------
        # Runtime Metadata
        # --------------------------------------------------

        "semantic_version":

            runtime.get(
                "semantic_version"
            ),

        "semantic_authority":

            runtime.get(
                "semantic_authority"
            ),

        "runtime_valid":

            runtime.get(
                "runtime_valid",
                False
            ),
    }


# ==========================================================
# ALL PRODUCTS
# ==========================================================

def build_traversal_runtime():

    traversals = []

    products = (
        PCProduct.objects.filter(
            is_active=True
        )
    )

    for product in products:

        runtime = (
            product.semantic_runtime
            or {}
        )

        # ==========================================================
        # DEBUG
        # ==========================================================

        if product.id == 1:

            from pprint import pprint

            print()
            print("=" * 80)
            print("SEMANTIC RUNTIME")
            print("=" * 80)

            pprint(runtime)

            print("=" * 80)
            print()

        # ==========================================================

        if not runtime:
            continue

        try:

            traversals.append(

                build_product_traversal(

                    product=product,

                    runtime=runtime,
                )
            )

        except Exception:

            continue

    return {

        "runtime":
            "traversal_v2",

        "product_count":
            len(traversals),

        "products":
            traversals,

        "ready":
            True,
    }


# ==========================================================
# LOOKUP
# ==========================================================

def get_product_traversal(
    unique_id
):

    products = (

        build_traversal_runtime()

        .get(
            "products",
            []
        )
    )

    return next(

        (
            product

            for product in products

            if product.get(
                "unique_id"
            ) == unique_id
        ),

        None,
    )