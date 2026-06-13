# -*- coding: utf-8 -*-
# api/services/semantic/v2/discover/discover_runtime.py

from collections import Counter

from api.services.semantic.v2.authority.authority_runtime import (
    build_authority_runtime,
)

from api.services.semantic.v2.traversal.traversal_builder import (
    build_traversal_runtime,
)


# ==========================================================
# DISCOVER
# ==========================================================

def build_discover_runtime():

    authority = (
        build_authority_runtime()
    )

    traversal = (
        build_traversal_runtime()
    )

    # ------------------------------------------------------
    # GROUP INDEX
    # ------------------------------------------------------

    group_map = {

        group.get(
            "group_slug"
        ): group

        for group in authority.get(
            "groups",
            []
        )
    }

    # ------------------------------------------------------
    # COUNT
    # ------------------------------------------------------

    group_counter = Counter()

    for product in traversal.get(
        "products",
        []
    ):

        group_counter.update(

            product.get(
                "matched_groups",
                []
            )
        )

    # ------------------------------------------------------
    # SHELVES
    # ------------------------------------------------------

    shelves = []

    for group_slug, group_info in group_map.items():

        shelves.append({

            # ------------------------------------------
            # GROUP REALITY
            # ------------------------------------------

            **group_info,

            # ------------------------------------------
            # DISCOVERY REALITY
            # ------------------------------------------

            "product_count":

                group_counter.get(
                    group_slug,
                    0
                ),
        })

    # ------------------------------------------------------
    # SORT
    # ------------------------------------------------------

    shelves.sort(

        key=lambda x:

            x.get(
                "product_count",
                0
            ),

        reverse=True,
    )

    # ------------------------------------------------------
    # SEO
    # ------------------------------------------------------

    seo = {

        "page_type":
            "discover",

        "title":
            "PC Discovery",

        "description":

            (
                f"{len(shelves)}個の"
                "セマンティックグループから"
                "PCを探索"
            ),

        "canonical":
            "/pc/discover/",

        "keywords": [

            "PC",

            "Discovery",
        ],

        "schema_jsonld": {},
    }

    # ------------------------------------------------------
    # PAYLOAD
    # ------------------------------------------------------

    return {

        "runtime":
            "discover_v2",

        "seo":
            seo,

        # --------------------------------------------------
        # REALITY
        # --------------------------------------------------

        "product_count":

            traversal.get(
                "product_count",
                0
            ),

        "group_count":

            len(
                authority.get(
                    "groups",
                    []
                )
            ),

        "shelf_count":
            len(
                shelves
            ),

        "shelves":
            shelves,

        # --------------------------------------------------
        # AUTHORITY
        # --------------------------------------------------

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