# -*- coding: utf-8 -*-
# /home/maya/shin-dev/shin-vps/django/api/services/semantic/v2/related/related_runtime.py

from api.models import (
    PCProduct,
)

from api.services.semantic.v2.authority.authority_runtime import (
    build_authority_runtime,
)

from api.services.semantic.v2.traversal.traversal_builder import (
    build_traversal_runtime,
)


# ==========================================================
# SCORE
# ==========================================================

def calculate_related_score(

    source_groups,

    target_groups,
):

    return len(

        set(source_groups)

        &

        set(target_groups)
    )


# ==========================================================
# RELATED RUNTIME
# ==========================================================

def build_related_runtime(

    unique_id,

    limit=20,
):

    authority = (
        build_authority_runtime()
    )

    traversal = (
        build_traversal_runtime()
    )

    source_product = None

    for product in traversal.get(
        "products",
        []
    ):

        if product.get(
            "unique_id"
        ) == unique_id:

            source_product = product

            break

    if not source_product:

        return {

            "runtime":
                "related_v2",

            "found":
                False,

            "unique_id":
                unique_id,

            "products":
                [],

            "ready":
                True,
        }

    source_groups = (

        source_product.get(
            "matched_groups",
            []
        )
    )

    related_products = []

    for product in traversal.get(
        "products",
        []
    ):

        if product.get(
            "unique_id"
        ) == unique_id:

            continue

        score = (

            calculate_related_score(

                source_groups,

                product.get(
                    "matched_groups",
                    []
                ),
            )
        )

        if score < 5 :
            continue

        related_products.append({

            **product,

            "related_score":
                score,
        })

    related_products = sorted(

        related_products,

        key=lambda x:

            x[
                "related_score"
            ],

        reverse=True,
    )

    return {

        "runtime":
            "related_v2",

        "found":
            True,

        "unique_id":
            unique_id,

        "product_count":
            len(
                related_products
            ),

        "products":
            related_products[
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