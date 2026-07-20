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

import time
from typing import Any

import requests

from config import (
    ACCESS_KEY,
    APPLICATION_ID,
    BASE_URL,
    DEFAULT_HITS,
    DEFAULT_TIMEOUT,
    REQUEST_INTERVAL,
)

MAX_RETRIES = 5
BACKOFF_FACTOR = 2


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


def fetch_page(
    *,
    keyword: str | None = None,
    shop_code: str | None = None,
    item_code: str | None = None,
    genre_id: str | None = None,
    page: int = 1,
    hits: int = DEFAULT_HITS,
) -> dict[str, Any]:
    """
    Fetch a single page from the Rakuten Ichiba Item Search API.
    """

    params = build_params(
        keyword=keyword,
        shop_code=shop_code,
        item_code=item_code,
        genre_id=genre_id,
        page=page,
        hits=hits,
    )

    for retry in range(MAX_RETRIES):

        response = requests.get(
            BASE_URL,
            params=params,
            timeout=DEFAULT_TIMEOUT,
        )

        if response.status_code == 200:
            return response.json()

        if response.status_code == 429:

            wait = REQUEST_INTERVAL * (BACKOFF_FACTOR ** retry)

            print(
                f"⚠️ Rate limit reached "
                f"(retry {retry + 1}/{MAX_RETRIES}) "
                f"waiting {wait:.1f}s..."
            )

            time.sleep(wait)
            continue

        response.raise_for_status()

    raise RuntimeError(
        f"Rakuten API rate limit exceeded after {MAX_RETRIES} retries."
    )


def fetch_all_pages(
    *,
    keyword: str | None = None,
    shop_code: str | None = None,
    item_code: str | None = None,
    genre_id: str | None = None,
    hits: int = DEFAULT_HITS,
) -> dict[str, Any]:
    """
    Fetch all pages from the Rakuten Ichiba Item Search API.
    """

    result = fetch_page(
        keyword=keyword,
        shop_code=shop_code,
        item_code=item_code,
        genre_id=genre_id,
        page=1,
        hits=hits,
    )

    page_count = result.get("pageCount", 1)

    items = list(result.get("Items", []))

    for page in range(2, page_count + 1):

        print(f"Fetching page {page} / {page_count}...")

        time.sleep(REQUEST_INTERVAL)

        response = fetch_page(
            keyword=keyword,
            shop_code=shop_code,
            item_code=item_code,
            genre_id=genre_id,
            page=page,
            hits=hits,
        )

        items.extend(response.get("Items", []))

    result["Items"] = items

    return result


def fetch_items(
    *,
    keyword: str | None = None,
    shop_code: str | None = None,
    item_code: str | None = None,
    genre_id: str | None = None,
    page: int = 1,
    hits: int = DEFAULT_HITS,
    fetch_all: bool = False,
) -> dict[str, Any]:
    """
    Fetch items from the Rakuten Ichiba Item Search API.
    """

    if fetch_all:
        return fetch_all_pages(
            keyword=keyword,
            shop_code=shop_code,
            item_code=item_code,
            genre_id=genre_id,
            hits=hits,
        )

    return fetch_page(
        keyword=keyword,
        shop_code=shop_code,
        item_code=item_code,
        genre_id=genre_id,
        page=page,
        hits=hits,
    )