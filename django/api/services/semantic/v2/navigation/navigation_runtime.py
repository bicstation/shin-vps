# -*- coding: utf-8 -*-
# api/services/semantic/v2/navigation/navigation_runtime.py

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
    return sum(
        1
        for product in products
        if group_slug in product.get(
            "matched_groups",
            [],
        )
    )


# ==========================================================
# NAVIGATION
# ==========================================================

def build_navigation_runtime(
    traversal=None,
):

    print(
        "🔥 NAVIGATION RUNTIME START",
        {
            "traversal_injected":
                traversal is not None,
        },
    )

    # ------------------------------------------------------
    # TOPOLOGY
    # ------------------------------------------------------

    topology = build_topology_runtime()

    print(
        "🔥 NAVIGATION → TOPOLOGY",
        {
            "groups":
                len(
                    topology.get(
                        "groups",
                        [],
                    )
                ),
        },
    )

    # ------------------------------------------------------
    # TRAVERSAL
    # ------------------------------------------------------

    if traversal is None:

        print(
            "🔥 NAVIGATION → TRAVERSAL BUILD"
        )

        traversal = build_traversal_runtime()

    else:

        print(
            "🔥 NAVIGATION → TRAVERSAL INJECTED",
            {
                "product_count":
                    traversal.get(
                        "product_count",
                        0,
                    ),

                "products":
                    len(
                        traversal.get(
                            "products",
                            [],
                        )
                    ),
            },
        )

    products = traversal.get(
        "products",
        [],
    )

    print(
        "🔥 NAVIGATION → PRODUCTS",
        {
            "product_count":
                traversal.get(
                    "product_count",
                    0,
                ),

            "products":
                len(products),
        },
    )

    intents = []

    # ======================================================
    # GROUPS
    # ======================================================

    for group in topology.get(
        "groups",
        [],
    ):

        parent_group = group.get(
            "parent_group"
        )

        # --------------------------------------------------
        # Navigation Policy
        # --------------------------------------------------

        if not is_primary_group(
            parent_group
        ):
            continue

        # --------------------------------------------------
        # Canonical Group Identity
        # --------------------------------------------------

        group_slug = group.get(
            "group_slug"
        )

        # --------------------------------------------------
        # Reality Count
        # --------------------------------------------------

        product_count = calculate_product_count(
            products,
            group_slug,
        )

        # --------------------------------------------------
        # Runtime
        # --------------------------------------------------

        intents.append({
            **group,
            "product_count":
                product_count,
        })

    # ======================================================
    # SORT
    # ======================================================

    intents.sort(
        key=lambda x: (
            x.get(
                "parent_group",
                "",
            ),

            int(
                x.get(
                    "priority"
                ) or 0
            ),

            -x.get(
                "product_count",
                0,
            ),

            x.get(
                "name",
                "",
            ),
        )
    )

    # ======================================================
    # DEBUG
    # ======================================================

    if intents:

        print(
            "🔥 NAVIGATION SAMPLE",
            intents[0],
        )

    print(
        "🔥 NAVIGATION RUNTIME COMPLETE",
        {
            "intents":
                len(intents),

            "traversal_products":
                len(products),
        },
    )

    # ======================================================
    # PAYLOAD
    # ======================================================

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