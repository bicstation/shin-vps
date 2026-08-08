#!/usr/bin/env python3
"""
==============================================================================
FILE:
    acquisition/sources/scraping/lenovo/fetch_listing_api.py

SHIN CORE LINX

LENOVO OpenAPI Listing Fetch Runtime

Seed TSV
        │
        ▼
Results Page
        │
        ▼
Discover facetId
        │
        ▼
Lenovo OpenAPI
        │
        ▼
Reality JSON
        │
        ▼
AcquisitionDocument(seed)

Reality First
Observation First

Responsibilities

- Read Seed
- Discover facetId
- Fetch OpenAPI Runtime
- Export Reality JSON

NOT Responsibilities

- Observation
- Formatter
- Mapper
- Builder
- Integration
- Semantic Processing

==============================================================================
"""

from __future__ import annotations

import json
import urllib.parse

import requests
from bs4 import BeautifulSoup

from acquisition.common.trace.reality_trace import (
    trace_pipeline,
)

from ..settings import (
    USER_AGENT,
)

# ==============================================================================
# Constants
# ==============================================================================

RESULT_URL = (
    "https://www.lenovo.com/jp/ja/laptops/results/"
    "?visibleDatas=2115%3AThinkPad"
)

OPENAPI_URL = (
    "https://openapi.lenovo.com/"
    "jp/ja/ofp/search/dlp/product/query/get/_tsc"
)


# ==============================================================================
# Discovery
# ==============================================================================

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

    soup = BeautifulSoup(

        response.text,

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
    *,
    session: requests.Session,
    page_filter_id: str,
    page: int,
) -> dict:
    """
    Request Lenovo OpenAPI.
    """

    params = {

        "classificationGroupIds": "400001",

        "pageFilterId": page_filter_id,

        "facets": [

            {

                "facetId": "2115",

                "selectedValues": "ThinkPad",

            },

        ],

        "page": str(page),

        "pageSize": 20,

        "groupCode": "",

        "init": True,

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

            "Accept": "application/json",

        },

        params={

            "pageFilterId": page_filter_id,

            "subSeriesCode": "",

            "loyalty": "false",

            "params": urllib.parse.quote(

                json.dumps(

                    params,

                    separators=(",", ":"),

                )

            ),

        },

        timeout=60,

    )

    response.raise_for_status()

    return response.json()

# ==============================================================================
# Runtime
# ==============================================================================

def fetch_seed(
    *,
    seed: dict,
) -> str:
    """
    Fetch OpenAPI Reality JSON.
    """

    trace_pipeline(

        "OPENAPI FETCH",

    )

    print()

    print("=" * 70)

    print(f"🌐 {seed['entry_name']} OPENAPI FETCH")

    print("=" * 70)

    with requests.Session() as session:

        page_filter_id = discover_page_filter_id(

            session,

        )

        runtime = request_page(

            session=session,

            page_filter_id=page_filter_id,

            page=1,

        )

        page_count = runtime["data"]["pageCount"]

        print(

            f"Page Count : {page_count}"

        )

        products = []

        for page in range(

            1,

            page_count + 1,

        ):

            runtime = request_page(

                session=session,

                page_filter_id=page_filter_id,

                page=page,

            )

            page_products = (

                runtime["data"]["data"][0]["products"]

            )

            print(

                f"Page {page:2d} : {len(page_products)}"

            )

            products.extend(

                page_products,

            )

    print()

    print("=" * 70)

    print("RESULT")

    print("=" * 70)

    print(

        f"TOTAL PRODUCTS : {len(products)}"

    )

    print("=" * 70)

    return json.dumps(

        {

            "entry_name": seed["entry_name"],

            "maker": seed["maker"],

            "series": seed["series"],

            "slug": seed["slug"],

            "runtime": "api",

            "total_products": len(products),

            "products": products,

        },

        ensure_ascii=False,

        indent=2,

    )


# ==============================================================================
# Entry Point
# ==============================================================================

def main(
    *,
    force: bool = False,
) -> None:
    """
    Runtime Entry Point.
    """

    seed = {

        "entry_name": "ThinkPad",

        "maker": "LENOVO",

        "series": "ThinkPad",

        "slug": "thinkpad",

    }

    fetch_seed(

        seed=seed,

    )


if __name__ == "__main__":

    main()