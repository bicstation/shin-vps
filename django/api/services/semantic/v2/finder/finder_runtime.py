# -*- coding: utf-8 -*-
# api/services/semantic/v2/finder/finder_runtime.py

from api.services.semantic.v2.authority.authority_runtime import (
    build_authority_runtime,
)

from api.services.semantic.v2.traversal.traversal_builder import (
    build_traversal_runtime,
)

from api.services.semantic.v2.meaning.meaning_runtime import (
    build_finder_meaning,
)

from api.services.semantic.v2.seo.seo_runtime import (
    build_finder_seo,
)

from api.services.semantic.v2.presentation.presentation_runtime import (
    build_finder_presentation,
)


# ==========================================================
# SCORE
# ==========================================================

def calculate_match_score(

    product,

    filters,
):

    if not filters:
        return 0

    groups = set(

        product.get(
            "matched_groups",
            []
        )
    )

    attributes = set(

        product.get(
            "semantic_attributes",
            []
        )
    )

    score = 0

    for value in filters:

        if value in groups:
            score += 3

        if value in attributes:
            score += 1

    return score


# ==========================================================
# FINDER
# ==========================================================
def build_finder_runtime(

    selected_attributes=None,
    selected_groups=None,
    max_price=None,
    limit=100,
):

    authority = (
        build_authority_runtime()
    )

    traversal = (
        build_traversal_runtime()
    )

    meaning = (
        build_finder_meaning()
    )

    selected_attributes = (
        selected_attributes or []
    )

    selected_groups = (
        selected_groups or []
    )

    presentation = (
        build_finder_presentation()
    )

    filters = list(

        set(
            selected_attributes
            +
            selected_groups
        )
    )

    # ------------------------------------------------------
    # MATCH
    # ------------------------------------------------------
    
    if max_price is not None:

        try:

            max_price = int(
                max_price
            )

        except:

            max_price = None

    filters = list(

        set(
            selected_attributes
            +
            selected_groups
        )
    )

    matches = []
    
    
    for product in traversal.get(
        "products",
        []
    ):

        price = product.get(
            "price",
            0
        )

        try:

            price = int(price)

        except:

            price = 0

        if (
            max_price is not None
            and
            price > max_price
        ):
            
            continue

        score = (
            calculate_match_score(
                product,
                filters,
            )
        )

        if filters and score <= 0:
            continue

        matches.append({

            "score":
                score,

            **product,
        })
    
    
    # ------------------------------------------------------
    # SORT
    # ------------------------------------------------------

    matches = sorted(

        matches,

        key=lambda x: (

            x.get(
                "score",
                0
            ),

            x.get(
                "semantic_score",
                0
            ),

            x.get(
                "workflow_score",
                0
            ),

            len(

                x.get(
                    "matched_groups",
                    []
                )
            ),
        ),

        reverse=True,
    )
    

    # ------------------------------------------------------
    # SEO
    # ------------------------------------------------------

    seo = (

        build_finder_seo(

            meaning=
                meaning,

            product_count=
                len(matches),
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

            "filters":
                filters,

            "result_count":

                len(
                    matches
                ),

            "products":
                matches,
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