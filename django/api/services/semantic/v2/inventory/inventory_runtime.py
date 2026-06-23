# -*- coding: utf-8 -*-
# api/services/semantic/v2/inventory/inventory_runtime.py

from api.models import (
    PCProduct,
)

from api.services.semantic.v2.authority.authority_runtime import (
    build_authority_runtime,
)

from api.services.semantic.v2.meaning.meaning_runtime import (
    build_inventory_meaning,
)

from api.services.semantic.v2.seo.seo_runtime import (
    build_inventory_seo,
)


# ==========================================================
# INVENTORY
# ==========================================================

def build_inventory_runtime(

    page=1,

    page_size=100,
):

    authority = (
        build_authority_runtime()
    )

    meaning = (
        build_inventory_meaning()
    )

    try:

        page = int(page)

    except Exception:

        page = 1

    
    try:

        page_size = int(page_size)

    except Exception:

        page_size = 10000

    if page < 1:
        page = 1

    if page_size < 1:
        page_size = 100

    if page_size > 10000:
        page_size = 10000  
 
    queryset = (

        PCProduct.objects
        
        .all()

        # .filter(
        #     # is_active=True
        # )

        .order_by(
            "-updated_at"
        )
    )

    total_count = (
        queryset.count()
    )

    start = (
        (page - 1)
        * page_size
    )

    end = (
        start
        + page_size
    )

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

    seo = (

        build_inventory_seo(

            meaning=
                meaning,

            product_count=
                total_count,
        )
    )

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

            "count":
                total_count,

            "page":
                page,

            "page_size":
                page_size,

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