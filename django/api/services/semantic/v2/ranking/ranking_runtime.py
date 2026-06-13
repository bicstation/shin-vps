# -*- coding: utf-8 -*-

from api.services.semantic.v2.authority.authority_runtime import (build_authority_runtime,)
from api.services.semantic.v2.traversal.traversal_builder import (build_traversal_runtime,)

# ==========================================================
# SCORE
# ==========================================================

def calculate_product_score(
    product
    ):

    return len(

        product.get(
            "matched_groups",
            []
        )

    )

# ==========================================================
# RANKING
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

    try:

        limit = int(limit)

    except Exception:

        limit = 100

    products = []

    # ------------------------------------------------------
    # ALL RANKING
    # ------------------------------------------------------

    if (

        not group_slug

        or

        group_slug in [

            "all",

            "score",
        ]

    ):

        products = (

            traversal.get(
                "products",
                []
            )
        )

    # ------------------------------------------------------
    # GROUP FILTER
    # ------------------------------------------------------

    else:

        for product in traversal.get(
            "products",
            []
        ):

            groups = set(

                product.get(
                    "matched_groups",
                    []
                )
            )

            if group_slug in groups:

                products.append(
                    product
                )

    # ------------------------------------------------------
    # SORT
    # ------------------------------------------------------

    products = sorted(

        products,

        key=lambda x:

            calculate_product_score(
                x
            ),

        reverse=True,
    )

    # ------------------------------------------------------
    # PAYLOAD
    # ------------------------------------------------------

    return {

        "runtime":
            "ranking_v2",

        "group_slug":
            group_slug or "all",

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

        "authority_version":

            authority.get(
                "authority_version"
            ),

        "semantic_authority":

            authority.get(
                "semantic_authority"
            ),

        "ready":
            True,
    }