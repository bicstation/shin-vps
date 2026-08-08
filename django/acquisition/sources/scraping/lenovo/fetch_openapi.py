# /home/maya/shin-vps/django/acquisition/sources/scraping/lenovo/fetch_openapi.py
#!/usr/bin/env python3
"""
==============================================================================
FILE:
    acquisition/sources/scraping/lenovo/fetch_listing_api.py

SHIN CORE LINX

LENOVO OpenAPI Listing Fetch Runtime

ThinkPad Results
        │
        ▼
OpenAPI
        │
        ▼
Reality JSON

Reality First
Observation First

Responsibilities

- Fetch Lenovo OpenAPI
- Discover Page Count
- Fetch All Pages
- Produce Reality JSON

NOT Responsibilities

- Formatter
- Mapper
- Builder
- Semantic Runtime
- Persistence

==============================================================================
"""

from __future__ import annotations

import json

import requests

from acquisition.common.trace.reality_trace import (
    trace_pipeline,
)

# ==============================================================================
# Constants
# ==============================================================================

RESULT_URL = (
    "https://www.lenovo.com/"
    "jp/ja/laptops/results/"
    "?visibleDatas=2115%3AThinkPad"
)

OPENAPI_URL = (
    "https://openapi.lenovo.com/"
    "jp/ja/ofp/search/dlp/product/query/get/_tsc"
)

USER_AGENT = (
    "Mozilla/5.0 "
    "(Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 "
    "(KHTML, like Gecko) "
    "Chrome/151.0.0.0 "
    "Safari/537.36"
)

# ==============================================================================
# Discovery
# ==============================================================================

from bs4 import BeautifulSoup


def discover_page_filter_id(
    session: requests.Session,
) -> str:
    """
    Discover pageFilterId from Results page.
    """

    print()

    print("=" * 70)

    print("DISCOVER PAGE FILTER ID")

    print("=" * 70)

    response = session.get(

        RESULT_URL,

        headers={

            "User-Agent": USER_AGENT,

        },

        timeout=60,

    )

    response.raise_for_status()

    html = response.text

    soup = BeautifulSoup(

        html,

        "html.parser",

    )

    facet_name = soup.select_one(

        "div.facetName",

    )

    facet_id = soup.select_one(

        "div.facetId",

    )

    if facet_name is None:

        raise RuntimeError(

            "facetName not found."

        )

    if facet_id is None:

        raise RuntimeError(

            "facetId not found."

        )

    page_filter_id = facet_id.get_text(

        strip=True,

    )

    print(

        f"Facet Name   : {facet_name.get_text(strip=True)}"

    )

    print(

        f"PageFilterId : {page_filter_id}"

    )

    print()

    return page_filter_id

# ==============================================================================
# OpenAPI
# ==============================================================================

def request_page(
    session: requests.Session,
    *,
    page_filter_id: str,
    page: int,
) -> dict:
    """
    Request OpenAPI page.
    """

    params = {

        "classificationGroupIds": "400001",

        "pageFilterId": page_filter_id,

        "facets": [

            {

                "facetId": "2115",

                "selectedValues": "ThinkPad",

            }

        ],

        "page": str(page),

        "pageSize": 20,

        "groupCode": "",

        "init": page == 1,

        "sorts": [

            "priceUp",

            "priceUp",

        ],

        "version": "v2",

        "enablePreselect": True,

        "subseriesCode": "",

    }

    response = session.get(

        OPENAPI_URL,

        headers={

            "User-Agent": USER_AGENT,

            "Referer": RESULT_URL,

            "Origin": "https://www.lenovo.com",

        },

        params={

            "pageFilterId": page_filter_id,

            "subSeriesCode": "",

            "loyalty": "false",

            "params": json.dumps(

                params,

                separators=(",", ":"),

                ensure_ascii=False,

            ),

        },

        timeout=60,

    )

    response.raise_for_status()

    return response.json()

# ==============================================================================
# Runtime
# ==============================================================================

def fetch() -> dict:
    """
    Execute OpenAPI Runtime.
    """

    trace_pipeline(
        "OPENAPI FETCH",
    )

    print()

    print("=" * 70)

    print("LENOVO OPENAPI TEST")

    print("=" * 70)

    session = requests.Session()

    page_filter_id = discover_page_filter_id(

        session,

    )

    runtime = request_page(

        session,

        page_filter_id=page_filter_id,

        page=1,

    )

    page_count = runtime["data"]["pageCount"]

    print()

    print(

        f"Page Count : {page_count}"

    )

    products = []

    for page in range(

        1,

        page_count + 1,

    ):

        runtime = request_page(

            session,

            page_filter_id=page_filter_id,

            page=page,

        )

        page_products = []

        for group in runtime["data"]["data"]:

            page_products.extend(

                group.get(

                    "products",

                    [],

                )

            )

        products.extend(

            page_products,

        )

        print(

            f"Page {page:>2} : {len(page_products)}"

        )

    print()

    print("=" * 70)

    print("RESULT")

    print("=" * 70)

    print(

        f"TOTAL PRODUCTS : {len(products)}"

    )

    print("=" * 70)
    
    runtime = {

        "entry_name": "ThinkPad",

        "maker": "LENOVO",

        "series": "ThinkPad",

        "slug": "thinkpad",

        "runtime": "openapi",

        "page_filter_id": page_filter_id,

        "page_count": page_count,

        "total_products": len(products),

        "products": products,

    }
    
    return runtime


# ==============================================================================
# Entry Point
# ==============================================================================

def main() -> dict:
    """
    Runtime Entry Point.
    """

    return fetch()

if __name__ == "__main__":

    main()
    