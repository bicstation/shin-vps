# -*- coding: utf-8 -*-
# /home/maya/shin-dev/shin-vps/django/api/utils/semantic/runtime/compile_adult_runtime.py

from collections import defaultdict
from api.utils.semantic.authority.loader import (
load_semantic_master,
)

# =========================================================
# COMPILE ADULT RUNTIME
# =========================================================

def compile_adult_runtime(
product,
trace_runtime=False,
):


    semantic_master = (
        load_semantic_master()
    )

    group_mappings = (
        semantic_master.get(
            "group_mappings",
            [],
        )
    )

    groups_master = (
        semantic_master.get(
            "groups",
            [],
        )
    )

    # =====================================================
    # ATTRIBUTES
    # =====================================================

    attribute_slugs = list(

        product.attributes

        .values_list(
            "slug",
            flat=True,
        )

    )

    # =====================================================
    # GROUP INDEX
    # =====================================================

    attribute_to_groups = (
        defaultdict(list)
    )

    for row in group_mappings:

        group_slug = (
            str(
                row.get(
                    "group_slug",
                    "",
                )
            )
            .strip()
        )

        attribute_slug = (
            str(
                row.get(
                    "attribute_slug",
                    "",
                )
            )
            .strip()
        )

        if (
            not group_slug
            or
            not attribute_slug
        ):
            continue

        attribute_to_groups[
            attribute_slug
        ].append(
            group_slug
        )

    # =====================================================
    # GROUP RUNTIME
    # =====================================================

    runtime_groups = (
        defaultdict(list)
    )

    for slug in attribute_slugs:

        matched_groups = (
            attribute_to_groups.get(
                slug,
                [],
            )
        )

        for group_slug in matched_groups:

            runtime_groups[
                group_slug
            ].append(
                slug
            )

    # =====================================================
    # UNIQUE
    # =====================================================

    runtime_groups = {

        group_slug:

        sorted(
            list(
                set(
                    attributes
                )
            )
        )

        for (
            group_slug,
            attributes,
        )

        in runtime_groups.items()

    }

    # =====================================================
    # GROUP METADATA
    # =====================================================

    runtime_group_metadata = {}

    for row in groups_master:

        group_slug = (
            str(
                row.get(
                    "group_slug",
                    "",
                )
            )
            .strip()
        )

        if (
            group_slug
            not in
            runtime_groups
        ):
            continue

        runtime_group_metadata[
            group_slug
        ] = {

            "group_name":
                row.get(
                    "group_name",
                    "",
                ),

            "parent_group":
                row.get(
                    "parent_group",
                    "",
                ),

            "type":
                row.get(
                    "type",
                    "",
                ),

            "icon":
                row.get(
                    "icon",
                    "",
                ),

            "color":
                row.get(
                    "color",
                    "",
                ),

            "sort_order":
                row.get(
                    "sort_order",
                    "",
                ),
        }

    # =====================================================
    # PAYLOAD
    # =====================================================

    runtime_payload = {

        "product_id":
            product.id,

        "product_id_unique":
            product.product_id_unique,

        "attributes":
            sorted(
                attribute_slugs
            ),

        "groups":
            runtime_groups,

        "group_metadata":
            runtime_group_metadata,
    }

    # =====================================================
    # TRACE
    # =====================================================

    if trace_runtime:

        print("")

        print(
            "=" * 60
        )

        print(
            "ADULT RUNTIME"
        )

        print(
            "=" * 60
        )

        print(
            f"Product : "
            f"{product.title}"
        )

        print(
            f"Attributes : "
            f"{attribute_slugs}"
        )

        print(
            f"Groups : "
            f"{runtime_groups}"
        )

        print(
            "=" * 60
        )

        print("")

    return runtime_payload

