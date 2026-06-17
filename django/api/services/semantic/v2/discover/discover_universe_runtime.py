# -*- coding: utf-8 -*-
# /home/maya/shin-dev/shin-vps/django/api/services/semantic/v2/discover/discover_universe_runtime.py

from api.services.semantic.v2.authority.authority_runtime import (
    build_authority_runtime,
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

    authority = (
        build_authority_runtime()
    )

    navigation = (
        build_navigation_runtime()
    )
    
    universes = (

        build_universe_index(

            navigation.get(
                "intents",
                []
            )
        )
    )

    sidebar = (
        build_sidebar_runtime()
    )

    discover = (
        build_discover_runtime()
    )

    # ------------------------------------------------------
    # SUMMARY
    # ------------------------------------------------------

    summary = {

        "navigation_count":

            len(
                navigation.get(
                    "intents",
                    []
                )
            ),

        "sidebar_count":

            len(
                sidebar.get(
                    "filters",
                    []
                )
            ),

        "shelf_count":

            discover.get(
                "data",
                {}
            ).get(
                "shelf_count",
                0
            ),

        "product_count":

            discover.get(
                "data",
                {}
            ).get(
                "product_count",
                0
            ),
    }

    # ------------------------------------------------------
    # PAYLOAD
    # ------------------------------------------------------

    return {
        
         "universes":
            universes,

        # ==============================================
        # UNIVERSE
        # ==============================================

        "navigation":

            navigation.get(
                "intents",
                []
            ),

        "sidebar":

            sidebar.get(
                "filters",
                []
            ),

        "discover":

            discover.get(
                "data",
                {}
            ),

        "meaning":

            discover.get(
                "meaning",
                {}
            ),

        "seo":

            discover.get(
                "seo",
                {}
            ),

        # ==============================================
        # SUMMARY
        # ==============================================

        "summary":
            summary,

        # ==============================================
        # AUTHORITY
        # ==============================================

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

        parent_group = (
            item.get(
                "parent_group"
            )
        )

        if not parent_group:
            continue

        if parent_group not in universe_map:

            universe_map[
                parent_group
            ] = {

                "slug":
                    parent_group,

                "name":
                    parent_group.title(),

                "group_count":
                    0,

                "product_count":
                    0,
            }

        universe_map[
            parent_group
        ][
            "group_count"
        ] += 1

        universe_map[
            parent_group
        ][
            "product_count"
        ] += item.get(
            "product_count",
            0
        )

    universes = list(
        universe_map.values()
    )

    universes.sort(

        key=lambda x:

            x.get(
                "product_count",
                0
            ),

        reverse=True,
    )

    return universes