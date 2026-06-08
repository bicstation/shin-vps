# -*- coding: utf-8 -*-
# /home/maya/shin-vps/django/api/services/semantic/v2/discovery_runtime_v2.py

"""
SHIN CORE LINX

Discovery Runtime V2

Authority Runtime
↓
Relation Runtime
↓
Authority Graph
↓
Traversal Runtime
↓
Shelf Runtime
↓
Discovery Runtime V2

Responsibility

Backend Discovery API Contract

Only.

NO RULES
NO HARDCODE
NO WORKFLOW LOGIC
"""

from api.services.semantic.v2.shelves.shelf_builder import (
    build_shelf_runtime,
)

from api.services.semantic.v2.authority.authority_runtime import (
    build_authority_runtime,
)


# ==========================================================
# SHELF CONTRACT
# ==========================================================

def serialize_shelf(shelf):

    return {

        "shelf_type":
            shelf.get(
                "shelf_type"
            ),

        "title":
            shelf.get(
                "title"
            ),

        "parent_group":
            shelf.get(
                "parent_group"
            ),

        "icon":
            shelf.get(
                "icon"
            ),

        "color":
            shelf.get(
                "color"
            ),

        "product_count":
            shelf.get(
                "product_count",
                0
            ),

        "products":
            shelf.get(
                "products",
                []
            ),
    }


# ==========================================================
# DISCOVERY PAYLOAD
# ==========================================================

def build_discovery_runtime_v2():

    authority = (
        build_authority_runtime()
    )

    shelf_runtime = (
        build_shelf_runtime()
    )

    shelves = []

    for shelf in shelf_runtime.get(
        "shelves",
        []
    ):

        shelves.append(

            serialize_shelf(
                shelf
            )
        )

    return {

        # ==============================================
        # Semantic Contract
        # ==============================================

        "semantic_schema_version":
            authority.get(
                "semantic_schema_version"
            ),

        "semantic_authority":
            authority.get(
                "semantic_authority"
            ),

        "authority_version":
            authority.get(
                "authority_version"
            ),

        # ==============================================
        # Runtime
        # ==============================================

        "runtime":
            "discovery_runtime_v2",

        "source":
            "tsv_authority",

        "ready":
            True,

        # ==============================================
        # Statistics
        # ==============================================

        "group_count":
            len(
                authority.get(
                    "groups",
                    []
                )
            ),

        "attribute_count":
            len(
                authority.get(
                    "attributes",
                    []
                )
            ),

        "mapping_count":
            len(
                authority.get(
                    "group_mappings",
                    []
                )
            ),

        "alias_count":
            len(
                authority.get(
                    "aliases",
                    []
                )
            ),

        # ==============================================
        # Discovery
        # ==============================================

        "shelf_count":
            len(
                shelves
            ),

        "semantic_shelves":
            shelves,
    }


# ==========================================================
# LOOKUP
# ==========================================================

def get_discovery_shelf(

    shelf_slug
):

    runtime = (
        build_discovery_runtime_v2()
    )

    for shelf in runtime.get(
        "semantic_shelves",
        []
    ):

        if (

            shelf.get(
                "shelf_type"
            )

            ==

            shelf_slug

        ):

            return shelf

    return None


# ==========================================================
# DEBUG
# ==========================================================

if __name__ == "__main__":

    runtime = (
        build_discovery_runtime_v2()
    )

    print()

    print("=" * 60)
    print("DISCOVERY RUNTIME V2")
    print("=" * 60)

    print()

    print(
        "Groups:",
        runtime["group_count"]
    )

    print(
        "Attributes:",
        runtime["attribute_count"]
    )

    print(
        "Mappings:",
        runtime["mapping_count"]
    )

    print(
        "Aliases:",
        runtime["alias_count"]
    )

    print(
        "Shelves:",
        runtime["shelf_count"]
    )

    print()