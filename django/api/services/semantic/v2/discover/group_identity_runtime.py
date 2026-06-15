# -*- coding: utf-8 -*-
# api/services/semantic/v2/discover/group_identity_runtime.py

from collections import Counter

from api.services.semantic.v2.authority.authority_runtime import (
    build_authority_runtime,
)

from api.services.semantic.v2.traversal.traversal_builder import (
    build_traversal_runtime,
)


# ==========================================================
# GROUP IDENTITY
# ==========================================================

def build_group_identity_runtime(
    group_slug,
):

    authority = (
        build_authority_runtime()
    )

    traversal = (
        build_traversal_runtime()
    )

    # ------------------------------------------------------
    # GROUP
    # ------------------------------------------------------

    group = next(

        (
            g

            for g in authority.get(
                "groups",
                []
            )

            if (
                g.get(
                    "group_slug"
                )
                == group_slug
            )
        ),

        None,
    )

    if not group:

        return {

            "found":
                False,

            "group_slug":
                group_slug,
        }

    # ------------------------------------------------------
    # PRODUCT COUNT
    # ------------------------------------------------------

    product_count = 0

    for product in traversal.get(
        "products",
        []
    ):

        groups = set(

            product.get(
                "matched_groups",
                []
            )
        )

        if group_slug in groups:

            product_count += 1

    # ------------------------------------------------------
    # ATTRIBUTE
    # ------------------------------------------------------

    attribute = next(

        (
            a

            for a in authority.get(
                "attributes",
                []
            )

            if (
                a.get(
                    "slug"
                )
                == group_slug
            )
        ),

        None,
    )

    # ------------------------------------------------------
    # ALIASES
    # ------------------------------------------------------

    aliases = []

    for alias in authority.get(
        "aliases",
        []
    ):

        if (

            alias.get(
                "slug"
            )

            ==

            group_slug

        ):

            aliases.append(

                alias.get(
                    "alias"
                )
            )

    aliases = sorted(

        list(
            set(
                aliases
            )
        )
    )

    # ------------------------------------------------------
    # RELATED GROUPS
    # ------------------------------------------------------

    related_groups = []

    for mapping in authority.get(
        "group_mappings",
        []
    ):

        source = mapping.get(
            "source_group"
        )

        target = mapping.get(
            "target_group"
        )

        if source == group_slug:

            related_groups.append(
                target
            )

    # related_groups = sorted(

    #     list(
    #         set(
    #             related_groups
    #         )
    #     )
    # )

    # ------------------------------------------------------
    # PRODUCT SAMPLE
    # ------------------------------------------------------

    sample_products = []

    for product in traversal.get(
        "products",
        []
    ):

        groups = set(

            product.get(
                "matched_groups",
                []
            )
        )

        if group_slug in groups:

            sample_products.append({

                "unique_id":
                    product.get(
                        "unique_id"
                    ),

                "name":
                    product.get(
                        "name"
                    ),

                "maker":
                    product.get(
                        "maker"
                    ),

                "price":
                    product.get(
                        "price"
                    ),
                    
                "image_url":
                    product.get(
                        "image_url"
                    ),
            })

    sample_products = (
        sample_products[:10]
    )

    # ------------------------------------------------------
    # PAYLOAD
    # ------------------------------------------------------

    return {

        "found":
            True,

        "group_slug":
            group.get(
                "group_slug"
            ),

        "group_name":
            group.get(
                "group_name"
            ),

        "type":
            group.get(
                "type"
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

        "sort_order":
            group.get(
                "sort_order"
            ),

        "description":

            (
                attribute.get(
                    "name"
                )
                if attribute
                else ""
            ),

        "product_count":
            product_count,

        "aliases":
            aliases,

        "related_groups":
            related_groups,

        "sample_products":
            sample_products,

        "ready":
            True,
    }