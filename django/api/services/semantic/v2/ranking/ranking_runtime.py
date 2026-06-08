# -*- coding: utf-8 -*-
# /home/maya/shin-dev/shin-vps/django/api/services/semantic/v2/ranking/ranking_runtime.py

from api.services.semantic.v2.authority.authority_runtime import (
    build_authority_runtime,
)

from api.services.semantic.v2.traversal.traversal_builder import (
    build_traversal_runtime,
)


# ==========================================================
# SCORE
# ==========================================================

def calculate_product_score(
    product
):

    return len(

        product.get(
            "matched_attributes",
            []
        )

    )


# ==========================================================
# RANKING RUNTIME
# ==========================================================

def build_ranking_runtime(

    group_slug=None,

    limit=100,
):

    authority = (
        build_authority_runtime()
    )

    traversal = (
        build_traversal_runtime()
    )

    products = []

    # ======================================================
    # SCORE RANKING
    # ======================================================

    if group_slug == "score":

        products = traversal.get(
            "products",
            []
        )

    # ======================================================
    # GROUP RANKING
    # ======================================================

    else:

        for product in traversal.get(
            "products",
            []
        ):

            if group_slug:

                if group_slug not in product.get(
                    "matched_groups",
                    []
                ):
                    continue

            products.append(
                product
            )

    # ======================================================
    # SORT
    # ======================================================

    products = sorted(

        products,

        key=lambda x:

            calculate_product_score(
                x
            ),

        reverse=True,
    )

    # ======================================================
    # PAYLOAD
    # ======================================================

    return {

        "runtime":
            "ranking_v2",

        "group_slug":
            group_slug,

        "product_count":
            len(
                products
            ),

        "products":
            products[
                :limit
            ],

        "semantic_schema_version":

            authority.get(
                "semantic_schema_version"
            ),

        "semantic_authority":

            authority.get(
                "semantic_authority"
            ),

        "ready":
            True,
    }