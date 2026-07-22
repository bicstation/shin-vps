# =========================================================
# FILE:
# /home/maya/shin-vps/django/research/valuecommerce_reality/scripts/observe.py
# =========================================================

from __future__ import annotations

from typing import Any


def observe(
    data: dict[str, Any],
) -> dict[str, Any]:
    """
    Observe ProductDB response without modifying Reality.
    """

    products = data.get("items", [])

    return {
        "product_count": len(products),
        "response_keys": sorted(data.keys()),
        "sample_keys": (
            sorted(products[0].keys())
            if products
            else []
        ),
        "sample": (
            {
                "title": products[0].get("title"),
                "merchantName": products[0].get("merchantName"),
                "brand_name": products[0].get("brand_name"),
                "janCode": products[0].get("janCode"),
                "modelCode": products[0].get("modelCode"),
                "productCode": products[0].get("productCode"),
                "price": products[0].get("price"),
                "guid": products[0].get("guid"),
                "link": products[0].get("link"),
            }
            if products
            else {}
        ),
    }