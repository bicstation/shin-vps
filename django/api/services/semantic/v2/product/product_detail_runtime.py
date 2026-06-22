# -*- coding: utf-8 -*-
# api/services/semantic/v2/product/product_detail_runtime.py

from api.models import ( PCProduct, )
from api.services.semantic.v2.authority.authority_runtime import ( build_authority_runtime,)
from api.services.semantic.v2.meaning.meaning_runtime import ( build_product_meaning, )
from api.services.semantic.v2.seo.seo_runtime import ( build_product_seo, )
from api.services.semantic.v2.product.product_semantic_runtime import ( build_product_semantic_runtime, )

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

    EXCLUDED_FIELDS = {

        "semantic_runtime",

        "workflow_tags",

        "semantic_labels",

        "runtime_profiles",

        "semantic_runtime_compiled",

        "semantic_updated_at",

    }

    product_data = {}

    for field in product._meta.fields:

        if field.name in EXCLUDED_FIELDS:

            continue

        product_data[
            field.name
        ] = getattr(
            product,
            field.name
        )

    # ------------------------------------------------------
    # COMPILED AUTHORITY RUNTIME
    # ------------------------------------------------------

    compiled_runtime = (

        product.semantic_runtime
        or {}
    )

    # ------------------------------------------------------
    # PRODUCT SEMANTIC RUNTIME
    # ------------------------------------------------------

    product_semantic_runtime = (

        build_product_semantic_runtime(
            product
        )
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
        # STATIC MEANING
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

            # --------------------------
            # Product Reality
            # --------------------------

            "product":
                product_data,

            # --------------------------
            # Semantic Authority Runtime
            # --------------------------

            "compiled_runtime":
                compiled_runtime,

            # --------------------------
            # Product Meaning Runtime
            # --------------------------

            "product_semantic_runtime":
                product_semantic_runtime,
        },

        # ----------------------------------------------
        # AUTHORITY METADATA
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

