# -*- coding: utf-8 -*-
# api/services/semantic/v2/ranking/ranking_runtime.py

from api.services.semantic.v2.ranking.ranking_topology_runtime import (
    build_ranking_topology_runtime,
)

from api.services.semantic.v2.authority.authority_runtime import (
    build_authority_runtime,
)

from api.services.semantic.v2.traversal.traversal_builder import (
    build_traversal_runtime,
)

from api.services.semantic.v2.meaning.meaning_runtime import (
    build_ranking_meaning,
)

from api.services.semantic.v2.presentation.presentation_runtime import (
    build_ranking_presentation,
)

from api.services.semantic.v2.seo.seo_runtime import (
    build_ranking_seo,
)


# ==========================================================
# SCORE
# ==========================================================

def calculate_product_score(
    product,
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

    # ------------------------------------------------------
    # AUTHORITY
    # ------------------------------------------------------

    authority = (
        build_authority_runtime()
    )

    meaning = (
        build_ranking_meaning()
    )

    presentation = (
        build_ranking_presentation(
            group_slug
        )
    )

    traversal = (
        build_traversal_runtime()
    )

    ranking_topology = (
        build_ranking_topology_runtime()
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

    # ------------------------------------------------------
    # GROUP
    # ------------------------------------------------------

    else:

        for product in (

            traversal.get(
                "products",
                []
            )
        ):

            groups = set(

                product.get(
                    "matched_groups",
                    []
                )
            )

            # ==================================================
            # DEBUG
            # ==================================================

            if product.get("primary_workflow") == "usage-creator":

                print()
                print("=" * 80)
                print("CREATOR DEBUG")
                print("=" * 80)

                print(
                    "unique_id       :",
                    product.get("unique_id")
                )

                print(
                    "name            :",
                    product.get("name")
                )

                print(
                    "primary_workflow:",
                    product.get("primary_workflow")
                )

                print(
                    "matched_groups  :",
                    product.get("matched_groups")
                )

                print(
                    "workflow_tags   :",
                    product.get("workflow_tags")
                )

                print(
                    "workflows       :",
                    product.get("workflows")
                )

                print(
                    "semantic_labels :",
                    product.get("semantic_labels")
                )

                print(
                    "semantic_attrs  :",
                    product.get("semantic_attributes")
                )

                print(
                    "score           :",
                    product.get("semantic_score")
                )

                print("=" * 80)
                print()

            # ==================================================
            # GROUP MATCH
            # ==================================================

            if group_slug in groups:

                products.append(
                    product
                )

    # ------------------------------------------------------
    # GROUP NAME
    # ------------------------------------------------------

    if (

        group_slug

        and

        group_slug != "all"

    ):

        group_name = (

            presentation.get(
                "name"
            )

            or

            group_slug
        )

    else:

        group_name = (

            presentation.get(
                "title"
            )

            or

            "All Products"
        )

    # ------------------------------------------------------
    # SORT
    # ------------------------------------------------------

    products = sorted(

        products,

        key=lambda product:

            calculate_product_score(
                product
            ),

        reverse=True,
    )[:limit]

    
    # ------------------------------------------------------
    # SEO
    # ------------------------------------------------------

    seo = (

        build_ranking_seo(

            meaning=meaning,

            presentation=presentation,

            group_slug=group_slug,

            product_count=len(products),
        )
    )

    # ------------------------------------------------------
    # PAYLOAD
    # ------------------------------------------------------

    return {

        # ----------------------------------------------
        # Meaning Authority
        # ----------------------------------------------

        "meaning":
            meaning,

        # ----------------------------------------------
        # Presentation Authority
        # ----------------------------------------------

        "presentation":
            presentation,

        # ----------------------------------------------
        # SEO
        # ----------------------------------------------

        "seo":
            seo,
           
        # ----------------------------------------------
        # Navigation Topology
        # ----------------------------------------------

        "categories":
            ranking_topology.get(
                "categories",
                []
            ),

        # ----------------------------------------------
        # Reality
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
        # Authority
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