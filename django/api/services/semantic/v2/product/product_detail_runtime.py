# -*- coding: utf-8 -*-
# api/services/semantic/v2/product/product_detail_runtime.py

from api.models import PCProduct

from api.services.semantic.v2.authority.authority_runtime import (
    build_authority_runtime,
)

from api.services.semantic.v2.meaning.meaning_runtime import (
    build_product_meaning,
)

from api.services.semantic.v2.seo.seo_runtime import (
    build_product_seo,
)

from api.services.semantic.v2.product.product_semantic_runtime import (
    build_product_semantic_runtime,
)


# ==========================================================
# PRODUCT DETAIL
# ==========================================================

def build_product_detail_runtime(
    unique_id,
):

    import inspect

    print("FILE :", __file__)
    print("FUNC :", inspect.getfile(build_product_detail_runtime))

    authority = build_authority_runtime()
    meaning = build_product_meaning()

    # ------------------------------------------------------
    # OBSERVATION
    # ------------------------------------------------------

    print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    print("🔥 PRODUCT DETAIL RUNTIME")

    print(
        "INPUT :",
        repr(unique_id),
    )

    qs = PCProduct.objects.filter(
        unique_id=unique_id,
    )

    print(
        "EXISTS :",
        qs.exists(),
    )

    if qs.exists():

        print(
            "DB :",
            repr(
                qs.first().unique_id
            ),
        )

    print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")

    # ------------------------------------------------------
    # PRODUCT REALITY
    # ------------------------------------------------------

    try:

        product = (

            PCProduct.objects.get(

                unique_id=unique_id,

                # is_active=True,

            )

        )

    except PCProduct.DoesNotExist:

        print(
            "❌ PRODUCT NOT FOUND"
        )

        return {

            "meaning": meaning,

            "seo": {},

            "data": {

                "found": False,

                "unique_id": unique_id,

            },

            "ready": True,

        }

    # ------------------------------------------------------
    # PRODUCT DATA
    # ------------------------------------------------------

    EXCLUDED_FIELDS = {

        "semantic_runtime",
        "workflow_tags",
        "semantic_labels",
        "runtime_profiles",
        "semantic_runtime_compiled",
        "semantic_updated_at",

    }

    product_data = {

        field.name: getattr(product, field.name)

        for field in product._meta.fields

        if field.name not in EXCLUDED_FIELDS

    }

    # ------------------------------------------------------
    # RUNTIMES
    # ------------------------------------------------------

    compiled_runtime = (

        product.semantic_runtime
        or {}

    )

    product_semantic_runtime = (

        build_product_semantic_runtime(
            product
        )

    )

    seo = (

        build_product_seo(

            meaning=meaning,

            product=product,

        )

    )

    # ------------------------------------------------------
    # RESPONSE
    # ------------------------------------------------------

    return {

        "meaning": meaning,

        "seo": seo,

        "data": {

            "found": True,

            "product": product_data,

            "compiled_runtime": compiled_runtime,

            "product_semantic_runtime": product_semantic_runtime,

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

        "ready": True,

    }