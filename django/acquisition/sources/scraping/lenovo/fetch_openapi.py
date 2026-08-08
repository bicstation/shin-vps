#!/usr/bin/env python3

# ============================================================================
# FILE:
# acquisition/sources/scraping/lenovo/fetch_openapi.py
#
# SHIN CORE LINX
#
# LENOVO OpenAPI Listing Fetch Runtime
#
# Seed Collection
# │
# ▼
# Results Page
# │
# ▼
# Discover pageFilterId
# │
# ▼
# Lenovo OpenAPI
# │
# ▼
# Reality Runtime Collection
#
# Reality First
# Observation First
#
# Responsibilities
#
# - Receive Lenovo Seed collection
# - Validate Lenovo Seeds
# - Fetch Lenovo Results Pages
# - Discover pageFilterId
# - Fetch Lenovo OpenAPI
# - Discover Page Count
# - Fetch All Pages
# - Produce Reality Runtime collection
#
# NOT Responsibilities
#
# - Pipeline orchestration
# - Formatter
# - Mapper
# - Builder
# - Semantic Runtime
# - Persistence
#
# IMPORTANT
#
# Pipeline does NOT iterate over Seeds.
#
# This Runtime owns iteration over the Seed collection.
#
# ============================================================================

from __future__ import annotations

import json

import requests

from bs4 import BeautifulSoup

from acquisition.common.trace.reality_trace import (
    trace_pipeline,
)


# ============================================================================
# Runtime Constants
# ============================================================================

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

FACET_ID = "2115"

CLASSIFICATION_GROUP_ID = "400001"

PAGE_SIZE = 20


# ============================================================================
# Seed Validation
# ============================================================================

def validate_seed(
    seed: dict,
) -> None:
    """
    Validate one Lenovo Listing Seed.

    Required fields:

    - entry_name
    - maker
    - series
    - slug
    - runtime
    - url
    """

    if not isinstance(
        seed,
        dict,
    ):

        raise ValueError(
            "LENOVO seed must be a dict."
        )

    required = (
        "entry_name",
        "maker",
        "series",
        "slug",
        "runtime",
        "url",
    )

    missing = [

        field

        for field in required

        if not seed.get(field)

    ]

    if missing:

        raise ValueError(
            "LENOVO seed missing fields: "
            + ", ".join(missing)
        )

    if seed["runtime"] != "api":

        raise ValueError(
            "LENOVO OpenAPI Runtime requires "
            f"runtime='api'. "
            f"Got: {seed['runtime']}"
        )


def validate_seeds(
    seeds: list[dict],
) -> None:
    """
    Validate Lenovo Seed collection.
    """

    if not isinstance(
        seeds,
        list,
    ):

        raise ValueError(
            "LENOVO seeds must be a list."
        )

    if not seeds:

        raise ValueError(
            "LENOVO Seed collection is empty."
        )

    for seed in seeds:

        validate_seed(
            seed,
        )


# ============================================================================
# Discovery
# ============================================================================

def discover_page_filter_id(
    session: requests.Session,
    *,
    result_url: str,
) -> str:
    """
    Discover pageFilterId from Lenovo Results Page.

    The pageFilterId is Runtime Reality.

    It must NOT be hard-coded.
    """

    print()

    print("=" * 70)

    print("DISCOVER PAGE FILTER ID")

    print("=" * 70)

    print(
        f"Results URL : {result_url}"
    )

    response = session.get(

        result_url,

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
        "Facet Name   : "
        f"{facet_name.get_text(strip=True)}"
    )

    print(
        "PageFilterId : "
        f"{page_filter_id}"
    )

    print()

    return page_filter_id


# ============================================================================
# OpenAPI Request
# ============================================================================

def request_page(
    session: requests.Session,
    *,
    result_url: str,
    page_filter_id: str,
    series: str,
    page: int,
) -> dict:
    """
    Request one Lenovo OpenAPI page.

    Series is supplied by Seed.

    Example:

        ThinkPad
        Legion
    """

    params = {

        "classificationGroupIds":
            CLASSIFICATION_GROUP_ID,

        "pageFilterId":
            page_filter_id,

        "facets": [

            {

                "facetId":
                    FACET_ID,

                "selectedValues":
                    series,

            }

        ],

        "page":
            str(page),

        "pageSize":
            PAGE_SIZE,

        "groupCode":
            "",

        "init":
            page == 1,

        "sorts": [

            "priceUp",

            "priceUp",

        ],

        "version":
            "v2",

        "enablePreselect":
            True,

        "subseriesCode":
            "",

    }

    response = session.get(

        OPENAPI_URL,

        headers={

            "User-Agent":
                USER_AGENT,

            "Referer":
                result_url,

            "Origin":
                "https://www.lenovo.com",

            "Accept":
                "application/json",

        },

        params={

            "pageFilterId":
                page_filter_id,

            "subSeriesCode":
                "",

            "loyalty":
                "false",

            "params":
                json.dumps(

                    params,

                    separators=(
                        ",",
                        ":",
                    ),

                    ensure_ascii=False,

                ),

        },

        timeout=60,

    )

    response.raise_for_status()

    return response.json()


# ============================================================================
# Single Seed Fetch
# ============================================================================

def fetch_seed(
    *,
    session: requests.Session,
    seed: dict,
) -> dict:
    """
    Fetch one Lenovo Seed.

    This function owns one Seed acquisition.

    The collection-level fetch() owns iteration.
    """

    validate_seed(
        seed,
    )

    print()

    print("=" * 70)

    print(
        f"🌐 {seed['entry_name']} "
        "OPENAPI FETCH"
    )

    print("=" * 70)

    print(
        f"Maker  : {seed['maker']}"
    )

    print(
        f"Series : {seed['series']}"
    )

    print(
        f"URL    : {seed['url']}"
    )

    print("=" * 70)

    # ------------------------------------------------------------------------
    # Discovery
    # ------------------------------------------------------------------------

    page_filter_id = (
        discover_page_filter_id(

            session,

            result_url=seed["url"],

        )
    )

    # ------------------------------------------------------------------------
    # First Page
    #
    # Used to discover pageCount.
    # ------------------------------------------------------------------------

    runtime = request_page(

        session,

        result_url=seed["url"],

        page_filter_id=page_filter_id,

        series=seed["series"],

        page=1,

    )

    page_count = (
        runtime["data"]["pageCount"]
    )

    print()

    print(
        f"Page Count : {page_count}"
    )

    # ------------------------------------------------------------------------
    # All Pages
    # ------------------------------------------------------------------------

    products = []

    for page in range(

        1,

        page_count + 1,

    ):

        runtime = request_page(

            session,

            result_url=seed["url"],

            page_filter_id=page_filter_id,

            series=seed["series"],

            page=page,

        )

        page_products = []

        for group in (
            runtime["data"]["data"]
        ):

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

            f"Page {page:>2} : "
            f"{len(page_products)}"

        )

    # ------------------------------------------------------------------------
    # Reality Runtime
    # ------------------------------------------------------------------------

    print()

    print("=" * 70)

    print("RESULT")

    print("=" * 70)

    print(
        f"Entry          : "
        f"{seed['entry_name']}"
    )

    print(
        f"Series         : "
        f"{seed['series']}"
    )

    print(
        f"Page Count     : "
        f"{page_count}"
    )

    print(
        f"Total Products : "
        f"{len(products)}"
    )

    print("=" * 70)

    return {

        "entry_name":
            seed["entry_name"],

        "maker":
            seed["maker"],

        "series":
            seed["series"],

        "slug":
            seed["slug"],

        "runtime":
            seed["runtime"],

        "url":
            seed["url"],

        "page_filter_id":
            page_filter_id,

        "page_count":
            page_count,

        "total_products":
            len(products),

        "products":
            products,

    }


# ============================================================================
# Collection Runtime
# ============================================================================

def fetch(
    *,
    seeds: list[dict],
) -> list[dict]:
    """
    Execute Lenovo OpenAPI Listing Runtime.

    Collection Contract

        Seed Collection
              ↓
        fetch_seed()
              ↓
        Reality Runtime Collection

    The Pipeline does NOT iterate over Seeds.

    This Runtime owns Seed iteration.
    """

    validate_seeds(
        seeds,
    )

    trace_pipeline(
        "OPENAPI FETCH",
    )

    print()

    print("=" * 70)

    print("LENOVO OPENAPI FETCH RUNTIME")

    print("=" * 70)

    print(
        f"Seed Entries : {len(seeds)}"
    )

    print("=" * 70)

    runtimes = []

    with requests.Session() as session:

        for index, seed in enumerate(

            seeds,

            start=1,

        ):

            print()

            print(
                "=" * 70
            )

            print(
                f"LENOVO ACQUISITION "
                f"[{index}/{len(seeds)}]"
            )

            print(
                f"Entry  : "
                f"{seed['entry_name']}"
            )

            print(
                f"Series : "
                f"{seed['series']}"
            )

            print(
                "=" * 70
            )

            runtime = fetch_seed(

                session=session,

                seed=seed,

            )

            runtimes.append(
                runtime,
            )

    # ========================================================================
    # Collection Result
    # ========================================================================

    print()

    print("=" * 70)

    print("LENOVO OPENAPI FETCH COMPLETE")

    print("=" * 70)

    print(
        f"Seeds   : {len(seeds)}"
    )

    print(
        f"Runtime : {len(runtimes)}"
    )

    print("=" * 70)

    return runtimes


# ============================================================================
# Entry Point
# ============================================================================

def main(
    *,
    seeds: list[dict],
) -> list[dict]:
    """
    Runtime Entry Point.

    Receives the complete Lenovo Seed collection.
    """

    return fetch(
        seeds=seeds,
    )


# ============================================================================
# Standalone Execution
# ============================================================================

if __name__ == "__main__":

    test_seeds = [

        {

            "entry_name":
                "ThinkPad",

            "maker":
                "LENOVO",

            "series":
                "ThinkPad",

            "slug":
                "thinkpad",

            "runtime":
                "api",

            "url":
                (
                    "https://www.lenovo.com/"
                    "jp/ja/laptops/results/"
                    "?visibleDatas=2115%3AThinkPad"
                ),

        },

        {

            "entry_name":
                "Legion",

            "maker":
                "LENOVO",

            "series":
                "Legion",

            "slug":
                "legion",

            "runtime":
                "api",

            "url":
                (
                    "https://www.lenovo.com/"
                    "jp/ja/laptops/results/"
                    "?visibleDatas=2115%3ALegion"
                ),

        },

    ]

    main(
        seeds=test_seeds,
    )