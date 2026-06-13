# -*- coding: utf-8 -*-
# api/services/semantic/v2/top/top_runtime.py

from api.services.semantic.v2.authority.authority_runtime import (
    build_authority_runtime,
)

from api.services.semantic.v2.traversal.traversal_builder import (
    build_traversal_runtime,
)

from api.services.semantic.v2.discover.discover_runtime import (
    build_discover_runtime,
)

from api.services.semantic.v2.meaning.meaning_runtime import (
    build_top_meaning,
)

from api.services.semantic.v2.seo.seo_runtime import (
    build_top_seo,
)


# ==========================================================
# FEATURED PRODUCTS
# ==========================================================

def build_featured_products(
    products,
    limit=12,
):

    ranked = sorted(

        products,

        key=lambda x: (

            len(
                x.get(
                    "matched_groups",
                    []
                )
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

    return ranked[:limit]


# ==========================================================
# TOP
# ==========================================================

def build_top_runtime():

    authority = (
        build_authority_runtime()
    )

    traversal = (
        build_traversal_runtime()
    )

    discovery = (
        build_discover_runtime()
    )

    meaning = (
        build_top_meaning()
    )

    # ------------------------------------------------------
    # REALITY
    # ------------------------------------------------------

    products = (

        traversal.get(
            "products",
            []
        )
    )

    product_count = (

        traversal.get(
            "product_count",
            0
        )
    )

    group_count = len(

        authority.get(
            "groups",
            []
        )
    )

    attribute_count = len(

        authority.get(
            "attributes",
            []
        )
    )

    # ------------------------------------------------------
    # FEATURED GROUPS
    # ------------------------------------------------------

    featured_groups = (

        discovery

        .get(
            "data",
            {}
        )

        .get(
            "shelves",
            []
        )[:12]
    )

    # ------------------------------------------------------
    # FEATURED PRODUCTS
    # ------------------------------------------------------

    featured_products = (

        build_featured_products(
            products
        )
    )

    # ------------------------------------------------------
    # SEO
    # ------------------------------------------------------

    seo = (

        build_top_seo(

            meaning=
                meaning,

            product_count=
                product_count,

            group_count=
                group_count,

            attribute_count=
                attribute_count,
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

            "stats": {

                "product_count":
                    product_count,

                "group_count":
                    group_count,

                "attribute_count":
                    attribute_count,
            },

            "featured_groups":
                featured_groups,

            "featured_products":
                featured_products,
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