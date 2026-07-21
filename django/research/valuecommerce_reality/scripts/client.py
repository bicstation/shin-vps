# /home/maya/shin-vps/django/research/valuecommerce_reality/scripts/client.py

from __future__ import annotations

from typing import Any

import requests

from config import (
    VALUECOMMERCE_ACCEPT,
    VALUECOMMERCE_PRODUCTDB_TOKEN,
    VALUECOMMERCE_PRODUCTDB_URL,
    VALUECOMMERCE_TIMEOUT,
)


class ValueCommerceClient:
    """
    ValueCommerce ProductDB Client.
    """

    def __init__(self) -> None:
        self.base_url = VALUECOMMERCE_PRODUCTDB_URL
        self.token = VALUECOMMERCE_PRODUCTDB_TOKEN

    def search_products(
        self,
        **params: Any,
    ) -> dict[str, Any]:
        """
        Search products from ProductDB API.
        """

        query = {
            "token": self.token,
            "format": "json",
            **params,
        }

        headers = {
            "Accept": VALUECOMMERCE_ACCEPT,
        }

        response = requests.get(
            self.base_url,
            headers=headers,
            params=query,
            timeout=VALUECOMMERCE_TIMEOUT,
        )

        #
        # Reality Observation
        #
        print("=" * 80)
        print("Request URL")
        print(response.request.url)
        print()

        print("Status")
        print(response.status_code)
        print()

        print("Response")
        print(response.text)
        print("=" * 80)

        response.raise_for_status()

        return response.json()