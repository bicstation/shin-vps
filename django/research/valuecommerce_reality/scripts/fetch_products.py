# =========================================================
# FILE:
# /home/maya/shin-vps/django/research/valuecommerce_reality/scripts/fetch_products.py
# =========================================================

from __future__ import annotations

from typing import Any

from client import ValueCommerceClient
from config import VALUECOMMERCE_EC_CODE


def fetch_products(
    keyword: str = "ThinkPad",
    page: int = 1,
) -> dict[str, Any]:
    """
    Fetch products from the ValueCommerce ProductDB API.
    """

    client = ValueCommerceClient()

    return client.search_products(
        keyword=keyword,
        page=page,
        ecCode=VALUECOMMERCE_EC_CODE,
    )


def main() -> None:

    data = fetch_products()

    print(data)


if __name__ == "__main__":
    main()