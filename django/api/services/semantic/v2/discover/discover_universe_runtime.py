# -*- coding: utf-8 -*-
# /home/maya/shin-dev/shin-vps/django/api/services/semantic/v2/discover/discover_universe_runtime.py

from api.services.semantic.v2.authority.authority_runtime import (
    build_authority_runtime,
)

from api.services.semantic.v2.traversal.traversal_builder import (
    build_traversal_runtime,
)

from api.services.semantic.v2.navigation.navigation_runtime import (
    build_navigation_runtime,
)

from api.services.semantic.v2.sidebar.sidebar_runtime import (
    build_sidebar_runtime,
)

from api.services.semantic.v2.discover.discover_runtime import (
    build_discover_runtime,
)


# ==========================================================
# DISCOVER UNIVERSE
# ==========================================================

def build_discover_universe_runtime():

    authority = build_authority_runtime()
    traversal = build_traversal_runtime()

    navigation = build_navigation_runtime(
        traversal=traversal,
    )

    universes = authority.get(
        "universes",
        []
    )

    sidebar = build_sidebar_runtime(
        traversal=traversal,
    )

    discover = build_discover_runtime(
        traversal=traversal,
    )

    # ------------------------------------------------------
    # SUMMARY
    # ------------------------------------------------------

    discover_data = discover.get(
        "data",
        {}
    )

    insights = discover_data.get(
        "insights",
        {}
    )

    summary = {
        "navigation_count":
            len(navigation.get("intents", [])),

        "sidebar_count":
            len(sidebar.get("filters", [])),

        "shelf_count":
            discover_data.get(
                "shelf_count",
                0,
            ),

        "product_count":
            discover_data.get(
                "product_count",
                0,
            ),

        "average_semantic_score":
            insights.get(
                "average_semantic_score",
                0,
            ),

        "average_workflow_score":
            insights.get(
                "average_workflow_score",
                0,
            ),
    }

    # ------------------------------------------------------
    # PAYLOAD
    # ------------------------------------------------------

    return {
        "universes":
            universes,

        "navigation":
            navigation.get(
                "intents",
                [],
            ),

        "sidebar":
            sidebar.get(
                "filters",
                [],
            ),

        "discover":
            discover_data,

        "meaning":
            discover.get(
                "meaning",
                {},
            ),

        "seo":
            discover.get(
                "seo",
                {},
            ),

        "summary":
            summary,

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


# ==========================================================
# UNIVERSE INDEX
# ==========================================================

def build_universe_index(
    navigation_items,
):

    universe_map = {}

    for item in navigation_items:

        parent_group = item.get(
            "parent_group"
        )

        if not parent_group:
            continue

        if parent_group not in universe_map:

            universe_map[parent_group] = {
                "slug":
                    parent_group,

                "name":
                    parent_group.title(),

                "group_count":
                    0,

                "product_count":
                    0,
            }

        universe_map[parent_group]["group_count"] += 1

        universe_map[parent_group]["product_count"] += item.get(
            "product_count",
            0,
        )

    universes = list(
        universe_map.values()
    )

    universes.sort(
        key=lambda x:
            x.get(
                "product_count",
                0,
            ),
        reverse=True,
    )

    return universes