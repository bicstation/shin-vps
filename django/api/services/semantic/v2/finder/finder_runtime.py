# -*- coding: utf-8 -*-
# /home/maya/shin-vps/django/api/services/semantic/v2/finder/finder_runtime.py

from api.services.semantic.v2.authority.authority_runtime import (
    build_authority_runtime,
)

from api.services.semantic.v2.traversal.traversal_builder import (
    build_traversal_runtime,
)


# ==========================================================
# MATCH SCORE
# ==========================================================

def calculate_match_score(

    product,

    selected_attributes,
):

    if not selected_attributes:
        return 0

    matched_attributes = set(

        product.get(
            "matched_attributes",
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

    for node in selected_attributes:

        if node in matched_attributes:

            score += 1

            matched_nodes.append(
                node
            )

        elif node in matched_groups:

            score += 1

            matched_nodes.append(
                node
            )

    return score, matched_nodes


# ==========================================================
# FINDER RUNTIME
# ==========================================================

def build_finder_runtime(

    selected_attributes=None,

    limit=100,
):

    if selected_attributes is None:

        selected_attributes = []

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
            )
        )

        if selected_attributes:

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

            x[
                "match_score"
            ],

            len(
                x.get(
                    "matched_attributes",
                    []
                )
            )
        ),

        reverse=True,
    )

    return {

        "runtime":
            "finder_v2",

        "selected_attributes":
            selected_attributes,

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