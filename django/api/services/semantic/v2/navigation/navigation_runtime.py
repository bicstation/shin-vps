# -*- coding: utf-8 -*-

from api.services.semantic.v2.topology.topology_runtime import (
    build_topology_runtime,
)

from api.services.semantic.v2.authority.authority_runtime import (
    build_authority_runtime,
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

    authority = (
        build_authority_runtime()
    )

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

        group_slug = (
            group.get(
                "slug"
            )
        )
               
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
        # Reality Count
        # ------------------------------------------------------

        product_count = (

            calculate_product_count(

                products,

                group_slug,
            )
        )

        # ------------------------------------------------------
        # Runtime
        # ------------------------------------------------------

        intents.append({

            "slug":
                group_slug,

            "name":
                group.get(
                    "name"
                ),
                
            "title":
                group.get(
                    "title"
                ),

            "description":
                group.get(
                    "description"
                ),
 
            "type":
                group.get(
                    "type"
                ),

            "icon":
                group.get(
                    "icon"
                ),

            "color":
                group.get(
                    "color"
                ),

            "parent_group":
                parent_group,

            "attribute_count":

                len(
                    group.get(
                        "attributes",
                        []
                    )
                ),

            # Reality
            "product_count":
                product_count,
        })



    # ------------------------------------------------------
    # SORT
    # ------------------------------------------------------

    intents = sorted(

        intents,

        key=lambda x: (

            x.get(
                "parent_group",
                ""
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


    print(
        "🔥 NAVIGATION SAMPLE",
        intents[0]
    )

    # ==========================================================
    # DEBUG
    # ==========================================================

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
    
