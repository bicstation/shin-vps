# -*- coding: utf-8 -*-
# api/services/semantic/v2/traversal/traversal_builder.py

from api.models import (
    PCProduct,
)


# ==========================================================
# PRODUCT
# ==========================================================

def build_product_traversal(
    product
):

    runtime = (
        product.semantic_runtime
        or {}
    )

    return {

        "product_id":
            product.id,

        "unique_id":
            product.unique_id,

        "name":
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

        "semantic_attributes":

            runtime.get(
                "semantic_attributes",
                []
            ),

        "matched_groups":

            runtime.get(
                "semantic_groups",
                []
            ),

        "workflow_tags":

            runtime.get(
                "workflow_tags",
                []
            ),

        "semantic_labels":

            runtime.get(
                "semantic_labels",
                []
            ),
    }


# ==========================================================
# ALL PRODUCTS
# ==========================================================

def build_traversal_runtime():

    traversals = []

    products = (

        PCProduct.objects

        .filter(
            is_active=True
        )
    )

    for product in products:

        runtime = (
            product.semantic_runtime
            or {}
        )

        if not runtime:
            continue

        try:

            traversals.append(

                build_product_traversal(
                    product
                )
            )

        except Exception:

            continue

    return {

        "runtime":
            "traversal_v2",

        "product_count":
            len(
                traversals
            ),

        "products":
            traversals,

        "ready":
            True,
    }


# ==========================================================
# LOOKUP
# ==========================================================

def get_product_traversal(
    unique_id
):

    for product in (

        build_traversal_runtime()

        .get(
            "products",
            []
        )
    ):

        if (

            product.get(
                "unique_id"
            )

            ==

            unique_id

        ):

            return product

    return None