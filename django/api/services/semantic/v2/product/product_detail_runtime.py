# -*- coding: utf-8 -*-
# api/services/semantic/v2/product/product_detail_runtime.py

from api.models import (
    PCProduct,
)

from api.services.semantic.v2.authority.authority_runtime import (
    build_authority_runtime,
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

            "runtime":
                "product_detail_v2",

            "found":
                False,

            "unique_id":
                unique_id,

            "ready":
                True,
        }

    semantic_runtime = (

        product.semantic_runtime
        or {}
    )

    # ------------------------------------------------------
    # SEO
    # ------------------------------------------------------

    seo = (

        build_product_seo(

            product=
                product,

            semantic_runtime=
                semantic_runtime,
        )
    )

    # ------------------------------------------------------
    # PAYLOAD
    # ------------------------------------------------------

    return {

        "runtime":
            "product_detail_v2",

        "seo":
            seo,

        "found":
            True,

        "ready":
            True,

        # --------------------------------------------------
        # PRODUCT
        # --------------------------------------------------

        "product_id":
            product.id,

        "unique_id":
            product.unique_id,

        "product_name":

            getattr(
                product,
                "name",
                ""
            ),

        "maker":

            getattr(
                product,
                "maker",
                ""
            ),

        "price":

            getattr(
                product,
                "price",
                None
            ),

        "image_url":

            getattr(
                product,
                "image_source",
                ""
            ),

        # --------------------------------------------------
        # SEMANTIC
        # --------------------------------------------------

        "semantic_runtime":
            semantic_runtime,

        "semantic_attributes":

            semantic_runtime.get(
                "semantic_attributes",
                []
            ),

        "semantic_groups":

            semantic_runtime.get(
                "semantic_groups",
                []
            ),

        "workflow_tags":

            semantic_runtime.get(
                "workflow_tags",
                []
            ),

        "semantic_labels":

            semantic_runtime.get(
                "semantic_labels",
                []
            ),

        # --------------------------------------------------
        # AUTHORITY
        # --------------------------------------------------

        "semantic_schema_version":

            authority.get(
                "semantic_schema_version"
            ),

        "semantic_authority":

            authority.get(
                "semantic_authority"
            ),
    }