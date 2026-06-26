# -*- coding: utf-8 -*-
# api/services/semantic/v2/related/related_runtime.py

from api.models import (
    PCProduct,
)

from api.services.semantic.v2.authority.authority_runtime import (
    build_authority_runtime,
)

from api.services.semantic.v2.meaning.meaning_runtime import (
    build_related_meaning,
)

from api.services.semantic.v2.seo.seo_runtime import (
    build_related_seo,
)

from api.services.semantic.v2.presentation.presentation_runtime import (
    build_related_presentation,
)


# ==========================================================
# SCORE
# ==========================================================

def calculate_related_score(

    source_groups,

    target_groups,
):

    return len(

        set(
            source_groups
        )

        &

        set(
            target_groups
        )
    )


# ==========================================================
# RELATED
# ==========================================================

def build_related_runtime(

    unique_id,

    limit=20,
):

    authority = (
        build_authority_runtime()
    )

    meaning = (
        build_related_meaning()
    )
    
    presentation = (
        build_related_presentation()
    )

    try:

        source_product = (

            PCProduct.objects

            .get(
                unique_id=unique_id,
                is_active=True,
            )
        )

    except PCProduct.DoesNotExist:

        return {

            "meaning":
                meaning,
            
            "presentation":
                presentation,

            "seo":
                {},

            "data": {

                "found":
                    False,

                "unique_id":
                    unique_id,
            },

            "ready":
                True,
        }

    # ------------------------------------------------------
    # SOURCE
    # ------------------------------------------------------

    source_runtime = (

        source_product.semantic_runtime
        or {}
    )

    source_groups = (

        source_runtime.get(
            "semantic_groups",
            []
        )
    )

    # ------------------------------------------------------
    # RELATED SEARCH
    # ------------------------------------------------------

    related_products = []

    for product in (

        PCProduct.objects

        .filter(
            is_active=True
        )

        .exclude(
            id=source_product.id
        )
    ):

        runtime = (
            product.semantic_runtime
            or {}
        )

        groups = (

            runtime.get(
                "semantic_groups",
                []
            )
        )

        score = (

            calculate_related_score(

                source_groups,

                groups,
            )
        )

        if score <= 0:
            continue

        product_data = {}

        for field in product._meta.fields:

            product_data[
                field.name
            ] = getattr(
                product,
                field.name
            )

        related_products.append({

            "score":
                score,

            "product":
                product_data,

            "semantic_runtime":
                runtime,
        })

    # ------------------------------------------------------
    # SORT
    # ------------------------------------------------------

    related_products = sorted(

        related_products,

        key=lambda x:

            x["score"],

        reverse=True,
    )

    related_products = (
        related_products[:limit]
    )

    # ------------------------------------------------------
    # SEO
    # ------------------------------------------------------

    seo = (

        build_related_seo(

            meaning=
                meaning,

            product_name=
                source_product.name,

            related_count=
                len(
                    related_products
                ),
        )
    )

    # ------------------------------------------------------
    # SOURCE REALITY
    # ------------------------------------------------------

    source_data = {}

    for field in source_product._meta.fields:

        source_data[
            field.name
        ] = getattr(
            source_product,
            field.name
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
        # SEO
        # ----------------------------------------------

        "seo":
            seo,

        # ----------------------------------------------
        # REALITY
        # ----------------------------------------------

        "data": {

            "found":
                True,

            "source_product":
                source_data,

            "source_runtime":
                source_runtime,

            "related_count":

                len(
                    related_products
                ),

            "related_products":
                related_products,
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