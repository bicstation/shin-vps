# -*- coding: utf-8 -*-
# api/services/semantic/v2/inventory/inventory_runtime.py

from api.services.semantic.v2.authority.authority_runtime import (
    build_authority_runtime,
)

from api.services.semantic.v2.meaning.meaning_runtime import (
    build_inventory_meaning,
)

from api.services.semantic.v2.presentation.presentation_runtime import (
    build_inventory_presentation,
)

from api.services.semantic.v2.seo.seo_runtime import (
    build_inventory_seo,
)

from api.services.semantic.v2.inventory.inventory_query import (
    build_inventory_queryset,
)

from api.services.semantic.v2.inventory.inventory_search import (
    apply_inventory_search,
)

from api.services.semantic.v2.inventory.inventory_filter import (
    apply_inventory_filter,
)

from api.services.semantic.v2.inventory.inventory_sort import (
    apply_inventory_sort,
)


# ==========================================================
# INVENTORY
# ==========================================================

def build_inventory_runtime(

    page=1,

    page_size=100,

    sort="new",

    search=None,

    filters=None,
):

    # ------------------------------------------------------
    # AUTHORITY
    # ------------------------------------------------------

    authority = (
        build_authority_runtime()
    )

    # ------------------------------------------------------
    # MEANING
    # ------------------------------------------------------

    meaning = (
        build_inventory_meaning()
    )

    # ------------------------------------------------------
    # PRESENTATION
    # ------------------------------------------------------

    presentation = (
        build_inventory_presentation()
    )

    # ------------------------------------------------------
    # PARAMETER
    # ------------------------------------------------------

    try:
        page = int(page)
    except Exception:
        page = 1

    try:
        page_size = int(page_size)
    except Exception:
        page_size = 100

    if page < 1:
        page = 1

    if page_size < 1:
        page_size = 100

    if page_size > 10000:
        page_size = 10000

    # ------------------------------------------------------
    # QUERY
    # ------------------------------------------------------

    queryset = (
        build_inventory_queryset()
    )

    # ------------------------------------------------------
    # SEARCH
    # ------------------------------------------------------

    queryset = apply_inventory_search(

        queryset=queryset,

        search=search,
    )

    # ------------------------------------------------------
    # FILTER
    # ------------------------------------------------------

    queryset = apply_inventory_filter(

        queryset=queryset,

        filters=filters,
    )

    # ------------------------------------------------------
    # SORT
    # ------------------------------------------------------

    queryset = apply_inventory_sort(

        queryset=queryset,

        sort=sort,
    )

    # ------------------------------------------------------
    # PAGINATION
    # ------------------------------------------------------

    total_count = queryset.count()

    start = (
        (page - 1)
        * page_size
    )

    end = (
        start
        + page_size
    )

    # ------------------------------------------------------
    # PRODUCTS
    # ------------------------------------------------------

    products = []

    for product in queryset[start:end]:

        products.append({

            "unique_id":
                product.unique_id,

            "name":
                product.name,

            "maker":
                product.maker,

            "price":
                product.price,

            "image_url":
                product.image_url,

            "updated_at":
                product.updated_at,
        })

    # ------------------------------------------------------
    # SEO
    # ------------------------------------------------------

    seo = (

        build_inventory_seo(

            meaning=
                meaning,

            product_count=
                total_count,
        )
    )

    # ------------------------------------------------------
    # PAYLOAD
    # ------------------------------------------------------

    return {

        # ----------------------------------------------
        # MEANING
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
        # DATA
        # ----------------------------------------------

        "data": {

            "count":
                total_count,

            "page":
                page,

            "page_size":
                page_size,

            "sort":
                sort,

            "search":
                search,

            "has_next":
                end < total_count,

            "products":
                products,
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