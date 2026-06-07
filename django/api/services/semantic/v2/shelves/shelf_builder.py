# -*- coding: utf-8 -*-

"""
SHIN CORE LINX

Shelf Builder V2

Authority Runtime
↓
Relation Runtime
↓
Shelf Runtime

NO HARDCODED SHELVES
"""

from collections import defaultdict

from api.services.semantic.v2.compiler.relation_compiler import (
    build_relation_runtime,
)


# ==========================================================
# CONSTANTS
# ==========================================================

DEFAULT_LIMIT = 12


# ==========================================================
# UTIL
# ==========================================================

def safe_str(value):

    if value is None:
        return ""

    return str(value).strip()


def safe_int(value):

    try:
        return int(value)

    except Exception:
        return 0


# ==========================================================
# GROUP INDEX
# ==========================================================

def build_group_index(runtime):

    result = {}

    groups = runtime.get(
        "groups",
        []
    )

    if isinstance(groups, dict):

        for group_name, payload in groups.items():

            result[group_name] = payload

    else:

        for row in groups:

            group_name = safe_str(
                row.get("group")
            )

            if not group_name:
                continue

            result[group_name] = row

    return result


# ==========================================================
# ATTRIBUTE INDEX
# ==========================================================

def build_attribute_index(runtime):

    result = {}

    attributes = runtime.get(
        "attributes",
        []
    )

    if isinstance(attributes, dict):

        for attribute_name, payload in attributes.items():

            result[attribute_name] = payload

    else:

        for row in attributes:

            attribute_name = safe_str(
                row.get("attribute")
            )

            if not attribute_name:
                continue

            result[attribute_name] = row

    return result


# ==========================================================
# SHELF PAYLOAD
# ==========================================================

def build_shelf_payload(

    shelf_type,
    title,
    description,
    attributes,
):

    return {

        "shelf_type":
            shelf_type,

        "title":
            title,

        "description":
            description,

        "attribute_count":
            len(attributes),

        "attributes":
            sorted(
                attributes
            ),

        "ui_mode":
            "exploration",

        "next_shelves":
            [],
    }


# ==========================================================
# SHELF FROM GROUP
# ==========================================================

def build_shelf_from_group(

    group_name,

    group_row,

    attributes,
):

    title = (

        group_row.get(
            "title"
        )

        or

        group_row.get(
            "display_name"
        )

        or

        group_name
    )

    description = (

        group_row.get(
            "description"
        )

        or
        ""
    )

    return build_shelf_payload(

        shelf_type=group_name,

        title=title,

        description=description,

        attributes=attributes,
    )


# ==========================================================
# SHELF CONNECTIONS
# ==========================================================

def build_shelf_connections(shelves):

    shelf_names = [

        shelf["shelf_type"]

        for shelf in shelves
    ]

    for index, shelf in enumerate(
        shelves
    ):

        next_shelves = []

        if index + 1 < len(
            shelf_names
        ):

            next_shelves.append(
                shelf_names[
                    index + 1
                ]
            )

        shelf[
            "next_shelves"
        ] = next_shelves

    return shelves


# ==========================================================
# MAIN
# ==========================================================

def build_shelves():

    runtime = (
        build_relation_runtime()
    )

    groups = build_group_index(
        runtime
    )

    relations = runtime.get(
        "relations",
        []
    )

    shelf_attributes = (
        defaultdict(list)
    )

    # ==========================================
    # Group -> Attribute
    # ==========================================

    for relation in relations:

        group_name = relation.get(
            "group"
        )

        attribute_name = relation.get(
            "attribute"
        )

        if not group_name:
            continue

        if not attribute_name:
            continue

        shelf_attributes[
            group_name
        ].append(
            attribute_name
        )

    shelves = []

    # ==========================================
    # Shelf Generation
    # ==========================================

    for group_name in sorted(

        shelf_attributes.keys()
    ):

        group_row = groups.get(
            group_name,
            {}
        )

        shelf = (
            build_shelf_from_group(

                group_name,

                group_row,

                shelf_attributes[
                    group_name
                ],
            )
        )

        shelves.append(
            shelf
        )

    shelves = (
        build_shelf_connections(
            shelves
        )
    )

    return shelves


# ==========================================================
# DISCOVERY RUNTIME
# ==========================================================

def build_discovery_shelves():

    shelves = (
        build_shelves()
    )

    return {

        "runtime":
            "discovery_shelves_v2",

        "shelf_count":
            len(
                shelves
            ),

        "shelves":
            shelves,
    }


# ==========================================================
# DEBUG
# ==========================================================

if __name__ == "__main__":

    runtime = (
        build_discovery_shelves()
    )

    print()

    print("=" * 60)
    print("DISCOVERY SHELVES V2")
    print("=" * 60)

    print()

    print(
        "Shelf Count:",
        runtime[
            "shelf_count"
        ]
    )

    print()

    for shelf in runtime[
        "shelves"
    ]:

        print(
            shelf["title"]
        )

        print(
            "Attributes:",
            shelf[
                "attribute_count"
            ]
        )

        print()