# -*- coding: utf-8 -*-
# api/services/semantic/v2/discover/discover_runtime.py

from collections import Counter

from api.services.semantic.v2.authority.authority_runtime import (
    build_authority_runtime,
)

from api.services.semantic.v2.traversal.traversal_builder import (
    build_traversal_runtime,
)

from api.services.semantic.v2.meaning.meaning_runtime import (
    build_discovery_meaning,
)

from api.services.semantic.v2.seo.seo_runtime import (
    build_discovery_seo,
)

from api.services.semantic.v2.discover.discover_insight_runtime import (
    build_discover_insight_runtime,
)

from api.services.semantic.v2.presentation.presentation_runtime import (
    build_discovery_presentation,
)


# ==========================================================
# DISCOVERY
# ==========================================================

def build_discover_runtime(

    slug=None,

):

    authority = (
        build_authority_runtime()
    )

    traversal = (
        build_traversal_runtime()
    )

    meaning = (
        build_discovery_meaning()
    )

    presentation = (
        build_discovery_presentation(

            slug=slug,

        )
    )

    insights = (
        build_discover_insight_runtime()
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
    # PRODUCT COUNT
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

    for group_slug, group_info in (

        group_map.items()

    ):

        if (

            group_info.get(
                "parent_group"
            )

            ==

            "adult"

        ):

            continue

        shelves.append({

            **group_info,

            "product_count":

                group_counter.get(

                    group_slug,

                    0,

                ),
        })

    # ------------------------------------------------------
    # SORT
    # ------------------------------------------------------

    shelves.sort(

        key=lambda x: (

            int(

                x.get(
                    "discovery_priority",
                    0,
                )
            ),

            x.get(
                "product_count",
                0,
            ),

        ),

        reverse=True,
    )

    # ------------------------------------------------------
    # REALITY
    # ------------------------------------------------------

    product_count = (

        traversal.get(
            "product_count",
            0,
        )
    )

    group_count = len(
        shelves
    )

    attribute_count = len(

        authority.get(
            "attributes",
            []
        )
    )

    # ------------------------------------------------------
    # SEO
    # ------------------------------------------------------

    seo = (

        build_discovery_seo(

            meaning=meaning,

            product_count=product_count,

            group_count=group_count,

            attribute_count=attribute_count,
        )
    )

    # ------------------------------------------------------
    # PAYLOAD
    # ------------------------------------------------------

    return {

        "meaning":
            meaning,

        "presentation":
            presentation,

        "seo":
            seo,

        "data": {

            "product_count":
                product_count,

            "group_count":
                group_count,

            "attribute_count":
                attribute_count,

            "shelf_count":
                len(shelves),

            "shelves":
                shelves,

            "insights":
                insights,
        },

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




    authority = (
        build_authority_runtime()
    )

    traversal = (
        build_traversal_runtime()
    )

    meaning = (
        build_discovery_meaning()
    )
    
    presentation = (
        build_discovery_presentation()
    )

    insights = (
        build_discover_insight_runtime()
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
    # PRODUCT COUNT
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
    
    
    for group_slug, group_info in (

        group_map.items()
    ):

        # --------------------------------------------------
        # PC Runtime Only
        # --------------------------------------------------

        if (
            group_info.get(
                "parent_group"
            ) == "adult"
        ):
            continue

        shelves.append({

            **group_info,

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

        key=lambda x: (

            int(
                x.get(
                    "discovery_priority",
                    0
                )
            ),

            x.get(
                "product_count",
                0
            ),
        ),

        reverse=True,
    )

    # ------------------------------------------------------
    # REALITY
    # ------------------------------------------------------

    product_count = (

        traversal.get(
            "product_count",
            0
        )
    )

    group_count = (
        len(shelves)
    )

    attribute_count = (

        len(

            authority.get(
                "attributes",
                []
            )
        )
    )

    # ------------------------------------------------------
    # SEO
    # ------------------------------------------------------

    seo = (

        build_discovery_seo(

            meaning=
                meaning,

            product_count=
                product_count,

            group_count=
                group_count,

            attribute_count=
                attribute_count,
        )
    )

    # ------------------------------------------------------
    # PAYLOAD
    # ------------------------------------------------------

    return {

        # ----------------------------------------------
        # STATIC AUTHORITY
        # ----------------------------------------------

        "meaning":
            meaning,

        # ----------------------------------------------
        # PRESENTATION
        # ---------------------------------------------- 
        
        "presentation":
            presentation,

        # ----------------------------------------------
        # SEO
        # ----------------------------------------------

        "seo":
            seo,

        # ----------------------------------------------
        # REALITY
        # ----------------------------------------------
        
        "data": {

            "product_count":
                product_count,

            "group_count":
                group_count,

            "attribute_count":
                attribute_count,

            "shelf_count":
                len(
                    shelves
                ),

            "shelves":
                shelves,

            "insights":
                insights,
        },

        # ----------------------------------------------
        # AUTHORITY
        # ----------------------------------------------

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