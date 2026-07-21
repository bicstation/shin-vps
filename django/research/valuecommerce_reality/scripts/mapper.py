# /home/maya/shin-vps/django/research/valuecommerce_reality/scripts/mapper.py

from __future__ import annotations

from typing import Any


def map_product(product: dict[str, Any]) -> dict[str, Any]:
    """
    Map ProductDB product to SHIN CORE LINX Identity.

    No semantic interpretation is performed.
    """

    return {
        "identity": {
            "title": product.get("title"),
            "brand": product.get("brand_name"),
            "manufacturer": product.get("merchantName"),
            "model": product.get("modelCode"),
            "jan": product.get("janCode"),
            "product_code": product.get("productCode"),
            "guid": product.get("guid"),
        },
        "commerce": {
            "price": product.get("price"),
            "affiliate_url": product.get("link"),
        },
        "raw": product,
    }


def map_products(
    products: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    """
    Map ProductDB product list.
    """

    return [
        map_product(product)
        for product in products
    ]