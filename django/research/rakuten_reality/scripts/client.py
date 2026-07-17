# /home/maya/shin-dev/shin-vps/django/research/rakuten_reality/scripts/client.py

"""
Rakuten Reality Research

Client

Responsibility
--------------
Communicate with the Rakuten Ichiba Item Search API.

Input
-----
Search parameters

Output
------
Raw JSON response

This module MUST NOT:

- Generate Observations
- Validate Data
- Map Payloads
- Save Files
"""

from __future__ import annotations

from typing import Any

import requests

from config import (
    ACCESS_KEY,
    APPLICATION_ID,
    BASE_URL,
    DEFAULT_HITS,
    DEFAULT_TIMEOUT,
)

def build_params(
    *,
    keyword: str | None = None,
    shop_code: str | None = None,
    item_code: str | None = None,
    genre_id: str | None = None,
    page: int = 1,
    hits: int = DEFAULT_HITS,
) -> dict[str, Any]:
    """
    Build Rakuten API request parameters.
    """

    params: dict[str, Any] = {
        "applicationId": APPLICATION_ID,
        "accessKey": ACCESS_KEY,
        "format": "json",
        "page": page,
        "hits": hits,
    }

    if keyword:
        params["keyword"] = keyword

    if shop_code:
        params["shopCode"] = shop_code

    if item_code:
        params["itemCode"] = item_code

    if genre_id is not None:
        params["genreId"] = genre_id

    return params

def fetch_items(
    *,
    keyword: str | None = None,
    shop_code: str | None = None,
    item_code: str | None = None,
    genre_id: str | None = None,
    page: int = 1,
    hits: int = DEFAULT_HITS,
) -> dict[str, Any]:
    """
    Fetch items from the Rakuten Ichiba Item Search API.
    """

    response = requests.get(
        BASE_URL,
        params=build_params(
            keyword=keyword,
            shop_code=shop_code,
            item_code=item_code,
            genre_id=genre_id,
            page=page,
            hits=hits,
        ),
        timeout=DEFAULT_TIMEOUT,
    )

    print("=" * 80)
    print("Request URL:")
    print(response.url)
    print()

    print("Status:")
    print(response.status_code)
    print()

    print("Response:")
    print(response.text)
    print("=" * 80)

    response.raise_for_status()
    

    return response.json()