# -*- coding: utf-8 -*-

from api.services.semantic.v2.authority.authority_runtime import (
    build_authority_runtime,
)

from api.services.semantic.v2.traversal.traversal_builder import (
    build_traversal_runtime as build_runtime,
)


# ==========================================================
# TRAVERSAL RUNTIME
# ==========================================================

def build_traversal_runtime():

    authority = (
        build_authority_runtime()
    )

    runtime = (
        build_runtime()
    )

    products = runtime.get(
        "products",
        []
    )

    return {

        "runtime":
            "traversal_v2",

        "product_count":
            len(
                products
            ),

        "products":
            products,

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