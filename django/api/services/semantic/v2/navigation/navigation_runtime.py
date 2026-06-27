# -*- coding: utf-8 -*-

from api.services.semantic.v2.topology.topology_runtime import (
    build_topology_runtime,
)

from api.services.semantic.v2.traversal.traversal_builder import (
    build_traversal_runtime,
)

from .navigation_rules import (
    is_primary_group,
)

# ==========================================================
# COUNT
# ==========================================================

def calculate_product_count(

    products,

    group_slug,
):

    return len([

        product

        for product in products

        if group_slug in

        product.get(
            "matched_groups",
            []
        )
    ])


# ==========================================================
# NAVIGATION
# ==========================================================

def build_navigation_runtime():

    topology = (
        build_topology_runtime()
    )

    traversal = (
        build_traversal_runtime()
    )

    products = (

        traversal.get(
            "products",
            []
        )
    )

    intents = []

    # ==========================================================
    # GROUPS
    # ==========================================================

    for group in topology.get(
        "groups",
        []
    ):

        parent_group = (
            group.get(
                "parent_group"
            )
        )

        # ------------------------------------------------------
        # Navigation Policy
        # ------------------------------------------------------

        if not is_primary_group(
            parent_group
        ):
            continue

        # ------------------------------------------------------
        # Reality
        # ------------------------------------------------------

        product_count = (

            calculate_product_count(

                products,

                group.get(
                    "slug"
                ),
            )
        )

        # ------------------------------------------------------
        # Runtime
        # ------------------------------------------------------

        intents.append({

            # Presentation Authority
            **group,

            # Reality
            "product_count":
                product_count,
        })

    # ------------------------------------------------------
    # SORT
    # ------------------------------------------------------

    intents.sort(

        key=lambda x: (

            x.get(
                "parent_group",
                ""
            ),

            int(
                x.get(
                    "priority"
                ) or 0
            ),

            -x.get(
                "product_count",
                0
            ),

            x.get(
                "name",
                ""
            ),
        )
    )

    # ------------------------------------------------------
    # DEBUG
    # ------------------------------------------------------

    if intents:

        print(
            "🔥 NAVIGATION SAMPLE",
            intents[0]
        )

    # ------------------------------------------------------
    # PAYLOAD
    # ------------------------------------------------------

    return {

        "intents":
            intents,

        "semantic_schema_version":

            topology.get(
                "semantic_schema_version"
            ),

        "authority_version":

            topology.get(
                "authority_version"
            ),

        "semantic_authority":

            topology.get(
                "semantic_authority"
            ),

        "ready":
            True,
    }