# -*- coding: utf-8 -*-
# api/services/semantic/v2/finder/finder_runtime.py

from api.services.semantic.v2.authority.authority_runtime import (
    build_authority_runtime,
)

from api.services.semantic.v2.traversal.traversal_builder import (
    build_traversal_runtime,
)


# ==========================================================
# SCORE
# ==========================================================

def calculate_match_score(

    product,

    selected_attributes,

    selected_groups,
):

    semantic_attributes = set(

        product.get(
            "semantic_attributes",
            []
        )
    )

    matched_groups = set(

        product.get(
            "matched_groups",
            []
        )
    )

    score = 0

    matched_nodes = []

    # --------------------------------------------------
    # ATTRIBUTE
    # --------------------------------------------------

    for attribute in selected_attributes:

        if attribute in semantic_attributes:

            score += 1

            matched_nodes.append(
                attribute
            )

    # --------------------------------------------------
    # GROUP
    # --------------------------------------------------

    for group in selected_groups:

        if group in matched_groups:

            score += 1

            matched_nodes.append(
                group
            )

    return score, matched_nodes


# ==========================================================
# FINDER
# ==========================================================

def build_finder_runtime(

    selected_attributes=None,

    selected_groups=None,

    limit=100,
):

    selected_attributes = (
        selected_attributes
        or []
    )

    selected_groups = (
        selected_groups
        or []
    )

    authority = (
        build_authority_runtime()
    )

    traversal = (
        build_traversal_runtime()
    )

    matched_products = []

    for product in traversal.get(
        "products",
        []
    ):

        score, matched_nodes = (

            calculate_match_score(

                product,

                selected_attributes,

                selected_groups,
            )
        )

        if (

            selected_attributes
            or
            selected_groups

        ):

            if score == 0:

                continue

        matched_products.append({

            **product,

            "match_score":
                score,

            "matched_nodes":
                matched_nodes,
        })

    matched_products = sorted(

        matched_products,

        key=lambda x: (

            x.get(
                "match_score",
                0
            ),

            len(
                x.get(
                    "semantic_attributes",
                    []
                )
            ),
        ),

        reverse=True,
    )

    return {

        "runtime":
            "finder_v2",

        "selected_attributes":
            selected_attributes,

        "selected_groups":
            selected_groups,

        "product_count":
            len(
                matched_products
            ),

        "products":
            matched_products[
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