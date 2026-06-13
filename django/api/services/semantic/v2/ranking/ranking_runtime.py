# -*- coding: utf-8 -*-
# api/services/semantic/v2/ranking/ranking_runtime.py

from api.services.semantic.v2.authority.authority_runtime import (
    build_authority_runtime,
)

from api.services.semantic.v2.traversal.traversal_builder import (
    build_traversal_runtime,
)

from api.services.semantic.v2.meaning.meaning_runtime import (
    build_ranking_meaning,
)

from api.services.semantic.v2.seo.seo_runtime import (
    build_ranking_seo,
)


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

    meaning = (
        build_ranking_meaning()
    )

    products = []

    # ------------------------------------------------------
    # ALL
    # ------------------------------------------------------

    if (

        not group_slug

        or

        group_slug == "all"

    ):

        products = (

            traversal.get(
                "products",
                []
            )
        )

        group_name = (
            "All Products"
        )

    # ------------------------------------------------------
    # GROUP
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

        group_name = (
            group_slug
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

    products = (
        products[:limit]
    )

    # ------------------------------------------------------
    # SEO
    # ------------------------------------------------------

    seo = (

        build_ranking_seo(

            meaning=
                meaning,

            group_name=
                group_name,

            product_count=
                len(products),
        )
    )

    # ------------------------------------------------------
    # PAYLOAD
    # ------------------------------------------------------

    return {

        # ----------------------------------------------
        # STATIC AUTHORITY
        # ----------------------------------------------

        "meaning":
            meaning,

        # ----------------------------------------------
        # SEO
        # ----------------------------------------------

        "seo":
            seo,

        # ----------------------------------------------
        # REALITY
        # ----------------------------------------------

        "data": {

            "group_slug":
                group_slug,

            "group_name":
                group_name,

            "product_count":
                len(products),

            "products":
                products,
        },

        # ----------------------------------------------
        # AUTHORITY
        # ----------------------------------------------

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