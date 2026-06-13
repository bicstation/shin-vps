# -*- coding: utf-8 -*-
# api/services/semantic/v2/product/product_detail_runtime.py

from api.models import (
    PCProduct,
)

from api.services.semantic.v2.authority.authority_runtime import (
    build_authority_runtime,
)

from api.services.semantic.v2.meaning.meaning_runtime import (
    build_product_meaning,
)

from api.services.semantic.v2.seo.seo_runtime import (
    build_product_seo,
)


# ==========================================================
# PRODUCT DETAIL
# ==========================================================

def build_product_detail_runtime(
    unique_id,
):

    authority = (
        build_authority_runtime()
    )

    meaning = (
        build_product_meaning()
    )

    try:

        product = (

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
    # PRODUCT REALITY
    # ------------------------------------------------------

    product_data = {}

    for field in product._meta.fields:

        product_data[
            field.name
        ] = getattr(
            product,
            field.name
        )

    semantic_runtime = (

        product.semantic_runtime
        or {}
    )

    # ------------------------------------------------------
    # SEO
    # ------------------------------------------------------

    seo = (

        build_product_seo(

            meaning=
                meaning,

            product=
                product,
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

            "product":
                product_data,

            "semantic_runtime":
                semantic_runtime,
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