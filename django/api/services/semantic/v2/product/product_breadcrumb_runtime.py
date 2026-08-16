# -*- coding: utf-8 -*-
# api/services/semantic/v2/product/product_breadcrumb_runtime.py


# ==========================================================
# PRODUCT BREADCRUMB RUNTIME
# ==========================================================

def build_product_breadcrumbs(
    product,
):

    return [

        {
            "name": "HOME",
            "url": "/",
        },

        {
            "name": "商品一覧",
            "url": "/catalog/",
        },

        {
            "name": product.name,
            "url": f"/product/{product.unique_id}",
        },

    ]