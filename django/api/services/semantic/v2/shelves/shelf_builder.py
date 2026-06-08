# -*- coding: utf-8 -*-
# /home/maya/shin-vps/django/api/services/semantic/v2/shelves/shelf_builder.py

"""
SHIN CORE LINX

Shelf Runtime V2

Traversal Runtime
↓
Group Aggregation
↓
Shelf Runtime

NO HARDCODE

Shelf Authority
=
semantic_groups.tsv
"""

from collections import defaultdict

from api.services.semantic.v2.traversal.traversal_builder import (
    build_traversal_runtime,
)

from api.services.semantic.v2.authority.authority_runtime import (
    build_authority_runtime,
)


# ==========================================================
# GROUP INDEX
# ==========================================================

def build_group_index(groups):

    return {

        group["group_slug"]: group

        for group in groups
    }


# ==========================================================
# SHELF
# ==========================================================

def build_group_shelf(

    group,

    products
):

    return {

        "shelf_type":
            group["group_slug"],

        "title":
            group.get(
                "group_name"
            ),

        "parent_group":
            group.get(
                "parent_group"
            ),

        "icon":
            group.get(
                "icon"
            ),

        "color":
            group.get(
                "color"
            ),

        "product_count":
            len(products),

        "products":
            products,
    }


# ==========================================================
# MAIN
# ==========================================================

def build_shelf_runtime():

    authority = (
        build_authority_runtime()
    )

    traversal = (
        build_traversal_runtime()
    )

    group_index = (

        build_group_index(

            authority[
                "groups"
            ]
        )
    )

    shelves = defaultdict(
        list
    )

    # ======================================================
    # Product
    # ======================================================

    for product in traversal.get(
        "products",
        []
    ):

        for group_slug in product.get(
            "matched_groups",
            []
        ):

            shelves[
                group_slug
            ].append({

                "product_id":
                    product[
                        "product_id"
                    ],

                "unique_id":
                    product[
                        "unique_id"
                    ],
            })

    # ======================================================
    # Shelf Build
    # ======================================================

    shelf_payload = []

    for group_slug, products in (

        shelves.items()
    ):

        group = group_index.get(
            group_slug
        )

        if not group:
            continue

        shelf_payload.append(

            build_group_shelf(

                group,

                products
            )
        )

    # ======================================================
    # Sort
    # ======================================================

    shelf_payload = sorted(

        shelf_payload,

        key=lambda x:
            x[
                "product_count"
            ],

        reverse=True
    )

    return {

        "runtime":
            "shelf_runtime_v2",

        "shelf_count":
            len(
                shelf_payload
            ),

        "shelves":
            shelf_payload,

        "ready":
            True,
    }


# ==========================================================
# LOOKUP
# ==========================================================

def get_shelf(

    shelf_slug
):

    runtime = (
        build_shelf_runtime()
    )

    for shelf in runtime.get(
        "shelves",
        []
    ):

        if (

            shelf[
                "shelf_type"
            ]

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
        build_shelf_runtime()
    )

    print()

    print("=" * 60)
    print("SHELF RUNTIME V2")
    print("=" * 60)

    print()

    print(
        "Shelves:",
        runtime[
            "shelf_count"
        ]
    )

    print()

    for shelf in runtime[
        "shelves"
    ][:10]:

        print(

            shelf[
                "title"
            ],

            shelf[
                "product_count"
            ]
        )