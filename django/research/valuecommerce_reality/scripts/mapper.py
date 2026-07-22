# =========================================================
# FILE:
# /home/maya/shin-vps/django/research/valuecommerce_reality/scripts/mapper.py
# =========================================================

from __future__ import annotations

from typing import Any


def map_product(
    product: dict[str, Any],
    maker: str,
    prefix: str = "vc",
) -> dict[str, Any]:
    """
    Map ProductDB product to SHIN CORE LINX Import Contract.

    No semantic interpretation is performed.
    """

    return {
        "source": "valuecommerce",
        "data": {
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
        },
        "import_options": {
            "maker": maker,
            "prefix": prefix,
        },
    }


def map_products(
    products: list[dict[str, Any]],
    maker: str,
    prefix: str = "vc",
) -> list[dict[str, Any]]:
    """
    Map ProductDB products to SHIN CORE LINX Import Contracts.
    """

    return [
        map_product(
            product,
            maker=maker,
            prefix=prefix,
        )
        for product in products
    ]