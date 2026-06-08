# -*- coding: utf-8 -*-
# /home/maya/shin-dev/shin-vps/django/api/services/semantic/v2/product/product_detail_runtime.py

from api.models import (
    PCProduct,
)

from api.services.semantic.v2.authority.authority_runtime import (
    build_authority_runtime,
)


# ==========================================================
# PRODUCT DETAIL RUNTIME
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

            .prefetch_related(
                "attributes"
            )

            .get(
                unique_id=unique_id,
                is_active=True,
            )
        )

    except PCProduct.DoesNotExist:

        return {

            "runtime":
                "product_detail_v2",

            "unique_id":
                unique_id,

            "found":
                False,

            "ready":
                True,
        }

    semantic_runtime = getattr(

        product,

        "semantic_runtime",

        {}
    )

    return {

        "runtime":
            "product_detail_v2",

        "found":
            True,

        "unique_id":
            product.unique_id,

        "product_id":
            product.id,

        "product_name":

            getattr(
                product,
                "name",
                ""
            ),

        "price":

            getattr(
                product,
                "price",
                None
            ),

        "maker":

            getattr(
                product,
                "maker",
                ""
            ),

        "image_url":

            getattr(
                product,
                "image_source",
                ""
            ),

        "semantic_runtime":
            semantic_runtime,

        "semantic_labels":

            semantic_runtime.get(
                "semantic_labels",
                []
            ),

        "grouped_attributes":

            semantic_runtime.get(
                "grouped_attributes",
                {}
            ),

        "semantic_graph":

            semantic_runtime.get(
                "semantic_graph",
                {}
            ),

        "workflow_tags":

            semantic_runtime.get(
                "workflow_tags",
                []
            ),

        "semantic_schema_version":

            authority.get(
                "semantic_schema_version"
            ),

        "semantic_authority":

            authority.get(
                "semantic_authority"
            ),

        "ready":
            True,
    }