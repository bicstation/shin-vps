#!/usr/bin/env python3

# ============================================================================
#
# FILE:
# acquisition/sources/scraping/hp/fetch_hawksearch.py
#
# SHIN CORE LINX
#
# HP HawkSearch Fetch Runtime
#
# Reality First
# Observation First
# Persistence Authority
#
# ============================================================================
#
# PURPOSE
#
# HawkSearch API が返す検索結果ページを、Reality を失わずに取得する。
#
# HawkSearch Response
#
#     ┌──────────────────────────────────────────┐
#     │ Success                                  │
#     │ TrackingId                               │
#     │ Pagination                               │
#     │ Facets                                   │
#     │ Keyword                                  │
#     │ Results                                  │
#     │   └─ Document                            │
#     │       └─ unique_id                       │
#     └──────────────────────────────────────────┘
#
# を、そのまま Raw Reality として保持する。
#
# ============================================================================
#
# PIPELINE
#
# Seed
#   │
#   ▼
# HawkSearch Request
#   │
#   ▼
# HawkSearch Response
#   │
#   ├── Pagination
#   │
#   ├── Facets
#   │
#   └── Results
#          │
#          └── Document
#                 │
#                 └── source unique_id
#   │
#   ▼
# Raw HawkSearch Reality
#   │
#   ▼
# Observation
#
# ============================================================================
#
# RESPONSIBILITIES
#
# - Receive HP Seed collection
# - Validate HP Seeds
# - Execute HawkSearch HTTP request
# - Follow API Pagination
# - Preserve every Page Response
# - Preserve Pagination
# - Preserve Facets
# - Preserve every Result
# - Preserve every Document
# - Preserve API source unique_id
# - Preserve purchase_link
# - Produce Fetch Runtime collection
# - Produce structural diagnostics
#
# ============================================================================
#
# NOT RESPONSIBILITIES
#
# - Observation classification
# - Reality aggregation
# - Duplicate elimination
# - Product counting
# - Specification combination
# - Specification inference
# - Specification normalization
# - Menu generation
# - Facet interpretation
# - Formatting
# - Mapping
# - Affiliate transformation
# - ImportDocument
# - PCProduct construction
# - Semantic processing
#
# ============================================================================
#
# IMPORTANT REALITY RULE
#
# One API Result is not interpreted here as a final PCProduct.
#
# One API unique_id is not converted into a Product model here.
#
# The API's Document is preserved exactly as returned.
#
# If the API returns:
#
#     unique_id = "8373-50668"
#
# then the complete Document associated with that Result remains together.
#
# We NEVER construct:
#
#     CPU A + Memory B + Storage C
#
# from separate Documents.
#
# ============================================================================
#
# HAWKSEARCH PAGINATION AUTHORITY
#
# Confirmed API response:
#
# "Pagination": {
#     "NofResults": 481,
#     "CurrentPage": 2,
#     "MaxPerPage": 48,
#     "NofPages": 11
# }
#
# Therefore:
#
#     NofResults
#         = total Results reported by HawkSearch
#
#     CurrentPage
#         = current API page
#
#     MaxPerPage
#         = current page size
#
#     NofPages
#         = total API pages
#
# Fetch Runtime MUST use these fields.
#
# Do NOT use:
#
#     Limit
#     Offset
#     TotalResults
#
# as pagination authority.
#
# ============================================================================
#
# MENU / PRODUCT REALITY
#
# HawkSearch returns both:
#
#     Pagination
#     Facets
#     Results
#
# in the same response.
#
# Facets:
#     Menu / Filter Reality
#
# Results:
#     Product Reality candidates
#
# Fetch Runtime does NOT separate or interpret them.
#
# The complete response is preserved.
#
# ============================================================================
#
# AFFILIATE / PURCHASE REALITY
#
# HawkSearch Document may contain:
#
#     purchase_link
#
# Fetch Runtime MUST preserve it.
#
# Fetch Runtime does NOT:
#
#     - rewrite it
#     - generate affiliate URLs
#     - transform commerce meaning
#
# Affiliate transformation belongs to Mapper / Contract stage.
#
# ============================================================================

from __future__ import annotations

from collections import Counter
from typing import Any

import requests

from acquisition.common.trace.reality_trace import (
    trace_pipeline,
)


# ============================================================================
# Runtime Constants
# ============================================================================

HAWKSEARCH_URL = (
    "https://hp.searchapi-ap.hawksearch.com/"
    "api/v2/search"
)

HAWKSEARCH_CLIENTGUID = (
    "6354e590e62c426cbe346df11f99d2e0"
)

HP_ORIGIN = (
    "https://jp.ext.hp.com"
)

HP_REFERER = (
    "https://jp.ext.hp.com/"
)

USER_AGENT = (
    "Mozilla/5.0 "
    "(Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 "
    "(KHTML, like Gecko) "
    "Chrome/151.0.0.0 "
    "Safari/537.36"
)

TIMEOUT = 60


# ============================================================================
# Confirmed Request Defaults
# ============================================================================

CONFIRMED_KEYWORD = ""

CONFIRMED_QUERY = (
    "tab_facet.keyword: store"
)

CONFIRMED_PAGE_NO = 1


# ============================================================================
# Validation
# ============================================================================

def validate_seed(
    seed: dict,
) -> None:
    """
    Validate one HP Seed.

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
            "HP seed must be a dict."
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
            "HP seed missing fields: "
            + ", ".join(missing)
        )

    if seed["runtime"] != "scraping":
        raise ValueError(
            "HP HawkSearch Runtime requires "
            "runtime='scraping'. "
            f"Got: {seed['runtime']}"
        )


def validate_seeds(
    seeds: list[dict],
) -> None:
    """
    Validate HP Seed collection.
    """

    if not isinstance(
        seeds,
        list,
    ):
        raise ValueError(
            "HP seeds must be a list."
        )

    if not seeds:
        raise ValueError(
            "HP Seed collection is empty."
        )

    for seed in seeds:
        validate_seed(
            seed,
        )


# ============================================================================
# Request Body
# ============================================================================

def build_request_body(
    *,
    keyword: str = CONFIRMED_KEYWORD,
    query: str = CONFIRMED_QUERY,
    page_no: int = CONFIRMED_PAGE_NO,
) -> dict[str, Any]:
    """
    Build confirmed HawkSearch request body.

    IMPORTANT
    ------------------------------------------------------------------------

    Seed-specific query generation is intentionally NOT performed here.

    The currently confirmed query is passed unchanged unless the caller
    explicitly provides another query.

    PageNo is controlled by Fetch Runtime.
    """

    if page_no < 1:
        raise ValueError(
            "HawkSearch page_no must be >= 1."
        )

    return {
        "Keyword": keyword,
        "query": query,
        "PageNo": str(page_no),
    }


# ============================================================================
# Request Headers
# ============================================================================

def build_headers() -> dict[str, str]:
    """
    Build HawkSearch request headers.
    """

    return {
        "Accept": (
            "application/json, "
            "text/javascript, "
            "*/*; q=0.01"
        ),
        "Content-Type": (
            "application/json; charset=UTF-8"
        ),
        "Origin": HP_ORIGIN,
        "Referer": HP_REFERER,
        "User-Agent": USER_AGENT,
        "x-hawksearch-clientguid": (
            HAWKSEARCH_CLIENTGUID
        ),
    }


# ============================================================================
# Pagination Access
# ============================================================================

def get_pagination(
    response: dict[str, Any],
) -> dict[str, Any]:
    """
    Return HawkSearch Pagination object.

    HawkSearch Pagination is the authoritative pagination source.
    """

    pagination = response.get(
        "Pagination",
        {},
    )

    if not isinstance(
        pagination,
        dict,
    ):
        raise RuntimeError(
            "HawkSearch response has invalid "
            "Pagination structure."
        )

    return pagination


def get_total_results(
    response: dict[str, Any],
) -> int:
    """
    Return API reported total result count.
    """

    pagination = get_pagination(
        response,
    )

    value = pagination.get(
        "NofResults",
        0,
    )

    try:
        return int(value or 0)
    except (
        TypeError,
        ValueError,
    ):

        raise RuntimeError(
            "HawkSearch Pagination.NofResults "
            "must be numeric."
        )


def get_current_page(
    response: dict[str, Any],
) -> int:
    """
    Return API reported current page.
    """

    pagination = get_pagination(
        response,
    )

    value = pagination.get(
        "CurrentPage",
        0,
    )

    try:
        return int(value or 0)
    except (
        TypeError,
        ValueError,
    ):

        raise RuntimeError(
            "HawkSearch Pagination.CurrentPage "
            "must be numeric."
        )


def get_max_per_page(
    response: dict[str, Any],
) -> int:
    """
    Return API reported page size.
    """

    pagination = get_pagination(
        response,
    )

    value = pagination.get(
        "MaxPerPage",
        0,
    )

    try:
        return int(value or 0)
    except (
        TypeError,
        ValueError,
    ):

        raise RuntimeError(
            "HawkSearch Pagination.MaxPerPage "
            "must be numeric."
        )


def get_total_pages(
    response: dict[str, Any],
) -> int:
    """
    Return API reported total page count.
    """

    pagination = get_pagination(
        response,
    )

    value = pagination.get(
        "NofPages",
        0,
    )

    try:
        return int(value or 0)
    except (
        TypeError,
        ValueError,
    ):

        raise RuntimeError(
            "HawkSearch Pagination.NofPages "
            "must be numeric."
        )


def validate_pagination(
    response: dict[str, Any],
    *,
    requested_page: int,
) -> None:
    """
    Validate pagination returned by HawkSearch.

    Structural validation only.

    No interpretation of Product meaning occurs here.
    """

    current_page = get_current_page(
        response,
    )

    total_pages = get_total_pages(
        response,
    )

    max_per_page = get_max_per_page(
        response,
    )

    total_results = get_total_results(
        response,
    )

    if current_page < 1:
        raise RuntimeError(
            "HawkSearch returned invalid "
            f"CurrentPage: {current_page}"
        )

    if total_pages < 1:
        raise RuntimeError(
            "HawkSearch returned invalid "
            f"NofPages: {total_pages}"
        )

    if max_per_page < 1:
        raise RuntimeError(
            "HawkSearch returned invalid "
            f"MaxPerPage: {max_per_page}"
        )

    if total_results < 0:
        raise RuntimeError(
            "HawkSearch returned invalid "
            f"NofResults: {total_results}"
        )

    if current_page > total_pages:
        raise RuntimeError(
            "HawkSearch pagination inconsistency: "
            f"CurrentPage={current_page}, "
            f"NofPages={total_pages}"
        )

    if current_page != requested_page:
        raise RuntimeError(
            "HawkSearch returned unexpected page: "
            f"requested={requested_page}, "
            f"received={current_page}"
        )


# ============================================================================
# Raw Result Access
# ============================================================================

def get_results(
    response: dict[str, Any],
) -> list[dict[str, Any]]:
    """
    Return raw HawkSearch Results.

    No filtering.
    No deduplication.
    No grouping.
    """

    results = response.get(
        "Results",
        [],
    )

    if not isinstance(
        results,
        list,
    ):
        return []

    return [
        result
        for result in results
        if isinstance(
            result,
            dict,
        )
    ]


def get_documents(
    response: dict[str, Any],
) -> list[dict[str, Any]]:
    """
    Return Documents from Results.

    Structural extraction only.

    Every Result containing a Document is preserved.
    """

    documents: list[
        dict[str, Any]
    ] = []

    for result in get_results(
        response,
    ):

        document = result.get(
            "Document",
        )

        if isinstance(
            document,
            dict,
        ):

            documents.append(
                document,
            )

    return documents


def get_source_unique_ids(
    response: dict[str, Any],
) -> list[str]:
    """
    Extract source unique_id values in Result order.

    Duplicates are intentionally preserved.
    """

    source_ids: list[str] = []

    for document in get_documents(
        response,
    ):

        values = document.get(
            "unique_id",
            [],
        )

        if isinstance(
            values,
            list,
        ):

            for value in values:

                if value is None:
                    continue

                value = str(
                    value
                ).strip()

                if value:
                    source_ids.append(
                        value
                    )

        elif values is not None:

            value = str(
                values
            ).strip()

            if value:
                source_ids.append(
                    value
                )

    return source_ids


# ============================================================================
# Facet / Menu Access
# ============================================================================

def get_facets(
    response: dict[str, Any],
) -> Any:
    """
    Return HawkSearch Facets exactly as supplied by API.

    IMPORTANT
    ------------------------------------------------------------------------

    Facets are Menu / Filter Reality.

    This function does NOT:

    - rename facets
    - calculate counts
    - select facets
    - create navigation
    - create semantic meaning
    """

    return response.get(
        "Facets",
        [],
    )


# ============================================================================
# Request Runtime
# ============================================================================

def request_page(
    session: requests.Session,
    *,
    seed: dict,
    page_no: int,
    keyword: str = CONFIRMED_KEYWORD,
    query: str = CONFIRMED_QUERY,
) -> dict[str, Any]:
    """
    Execute one HawkSearch page request.

    Raw JSON response is returned unchanged.
    """

    body = build_request_body(
        keyword=keyword,
        query=query,
        page_no=page_no,
    )

    headers = build_headers()

    print()
    print("-" * 70)

    print(
        "HAWKSEARCH REQUEST"
    )

    print(
        f"Entry : {seed['entry_name']}"
    )

    print(
        f"Page  : {page_no}"
    )

    print(
        f"URL   : {HAWKSEARCH_URL}"
    )

    print()
    print(
        "REQUEST BODY"
    )

    print(
        body
    )

    print("-" * 70)

    response = session.post(
        HAWKSEARCH_URL,
        headers=headers,
        json=body,
        timeout=TIMEOUT,
    )

    print(
        f"HTTP Status  : "
        f"{response.status_code}"
    )

    print(
        f"Response Size: "
        f"{len(response.content):,} bytes"
    )

    response.raise_for_status()

    payload = response.json()

    if not isinstance(
        payload,
        dict,
    ):
        raise RuntimeError(
            "HP HawkSearch response must "
            "be a JSON object."
        )

    validate_pagination(
        payload,
        requested_page=page_no,
    )

    return payload


# ============================================================================
# Page Runtime Builder
# ============================================================================

def build_page_runtime(
    *,
    seed: dict,
    response: dict[str, Any],
    requested_page: int,
    keyword: str,
    query: str,
) -> dict[str, Any]:
    """
    Build one page-level Fetch Runtime.

    IMPORTANT
    ------------------------------------------------------------------------

    `response` remains the complete raw HawkSearch response.

    No Result is removed.
    No Document is merged.
    No Unique ID is rewritten.
    No Facet is transformed.
    """

    pagination = get_pagination(
        response,
    )

    results = get_results(
        response,
    )

    documents = get_documents(
        response,
    )

    source_ids = get_source_unique_ids(
        response,
    )

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

        "endpoint":
            HAWKSEARCH_URL,

        "page_no":
            requested_page,

        "request":
            {
                "body":
                    build_request_body(
                        keyword=keyword,
                        query=query,
                        page_no=requested_page,
                    ),
            },

        "pagination":
            {
                "nof_results":
                    pagination.get(
                        "NofResults"
                    ),

                "current_page":
                    pagination.get(
                        "CurrentPage"
                    ),

                "max_per_page":
                    pagination.get(
                        "MaxPerPage"
                    ),

                "nof_pages":
                    pagination.get(
                        "NofPages"
                    ),
            },

        "summary":
            {
                "result_count":
                    len(results),

                "document_count":
                    len(documents),

                "unique_id_occurrences":
                    len(source_ids),

                "distinct_api_unique_id_count":
                    len(set(source_ids)),
            },

        # ====================================================================
        # COMPLETE RAW HAWKSEARCH REALITY
        # ====================================================================

        "response":
            response,
    }


# ============================================================================
# Page Diagnostics
# ============================================================================

def inspect_page(
    runtime: dict[str, Any],
) -> None:
    """
    Print structural information for one API page.

    Diagnostic only.
    """

    response = runtime.get(
        "response",
        {},
    )

    pagination = get_pagination(
        response,
    )

    results = get_results(
        response,
    )

    documents = get_documents(
        response,
    )

    source_ids = get_source_unique_ids(
        response,
    )

    counts = Counter(
        source_ids
    )

    print()
    print("=" * 70)

    print(
        "HAWKSEARCH PAGE REALITY"
    )

    print("=" * 70)

    print(
        f"Current Page          : "
        f"{pagination.get('CurrentPage')}"
    )

    print(
        f"Total Pages           : "
        f"{pagination.get('NofPages')}"
    )

    print(
        f"Total Results         : "
        f"{pagination.get('NofResults')}"
    )

    print(
        f"Max Per Page          : "
        f"{pagination.get('MaxPerPage')}"
    )

    print(
        f"Results Received      : "
        f"{len(results)}"
    )

    print(
        f"Documents Received    : "
        f"{len(documents)}"
    )

    print(
        f"Unique ID Occurrences : "
        f"{len(source_ids)}"
    )

    print(
        f"Distinct API IDs      : "
        f"{len(counts)}"
    )

    print(
        f"Facets Present        : "
        f"{'YES' if 'Facets' in response else 'NO'}"
    )

    print(
        f"TrackingId Present    : "
        f"{'YES' if response.get('TrackingId') else 'NO'}"
    )

    print(
        f"Success               : "
        f"{response.get('Success')}"
    )

    print("=" * 70)


# ============================================================================
# Single Seed / All Pages
# ============================================================================

def fetch_seed(
    *,
    session: requests.Session,
    seed: dict,
    start_page: int = CONFIRMED_PAGE_NO,
    keyword: str = CONFIRMED_KEYWORD,
    query: str = CONFIRMED_QUERY,
) -> list[dict[str, Any]]:
    """
    Fetch ALL HawkSearch pages for one Seed.

    Pagination is controlled exclusively by:

        Pagination.NofPages

    returned by HawkSearch.

    Returns
    -------

    list[dict]

        One Fetch Runtime per API page.

    IMPORTANT
    ------------------------------------------------------------------------

    If HawkSearch reports:

        NofResults = 481
        MaxPerPage = 48
        NofPages = 11

    this function performs:

        Page 1
        Page 2
        ...
        Page 11

    and returns 11 page runtimes.

    It does NOT reduce those 11 pages into 481 products.
    """

    validate_seed(
        seed,
    )

    if start_page < 1:
        raise ValueError(
            "start_page must be >= 1."
        )

    print()
    print("=" * 70)

    print(
        f"🌐 {seed['entry_name']} "
        "HAWKSEARCH FETCH"
    )

    print("=" * 70)

    print(
        f"Maker  : {seed['maker']}"
    )

    print(
        f"Series : {seed['series']}"
    )

    print(
        f"Slug   : {seed['slug']}"
    )

    print(
        f"URL    : {seed['url']}"
    )

    print(
        f"Start Page : {start_page}"
    )

    print("=" * 70)

    runtimes: list[
        dict[str, Any]
    ] = []

    page_no = start_page

    # ========================================================================
    # First Page
    #
    # The first response determines the API-authoritative NofPages.
    # ========================================================================

    response = request_page(
        session,
        seed=seed,
        page_no=page_no,
        keyword=keyword,
        query=query,
    )

    total_pages = get_total_pages(
        response,
    )

    total_results = get_total_results(
        response,
    )

    max_per_page = get_max_per_page(
        response,
    )

    print()
    print("=" * 70)

    print(
        "HAWKSEARCH PAGINATION AUTHORITY"
    )

    print("=" * 70)

    print(
        f"NofResults : "
        f"{total_results:,}"
    )

    print(
        f"MaxPerPage : "
        f"{max_per_page:,}"
    )

    print(
        f"NofPages   : "
        f"{total_pages:,}"
    )

    print("=" * 70)

    # ========================================================================
    # Page Loop
    # ========================================================================

    while True:

        runtime = build_page_runtime(
            seed=seed,
            response=response,
            requested_page=page_no,
            keyword=keyword,
            query=query,
        )

        runtimes.append(
            runtime,
        )

        inspect_page(
            runtime,
        )

        current_page = get_current_page(
            response,
        )

        # ====================================================================
        # API Authority End
        # ====================================================================

        if current_page >= total_pages:

            break

        next_page = current_page + 1

        print()
        print(
            f"▶ NEXT HAWKSEARCH PAGE "
            f"{next_page}/{total_pages}"
        )

        response = request_page(
            session,
            seed=seed,
            page_no=next_page,
            keyword=keyword,
            query=query,
        )

        page_no = next_page

        # ====================================================================
        # Defensive Consistency Check
        # ====================================================================

        next_total_pages = get_total_pages(
            response,
        )

        next_total_results = get_total_results(
            response,
        )

        next_max_per_page = get_max_per_page(
            response,
        )

        if next_total_pages != total_pages:

            raise RuntimeError(
                "HawkSearch pagination changed "
                "during fetch: "
                f"initial NofPages={total_pages}, "
                f"page {next_page} returned "
                f"NofPages={next_total_pages}"
            )

        if next_total_results != total_results:

            raise RuntimeError(
                "HawkSearch result count changed "
                "during fetch: "
                f"initial NofResults={total_results}, "
                f"page {next_page} returned "
                f"NofResults={next_total_results}"
            )

        if next_max_per_page != max_per_page:

            raise RuntimeError(
                "HawkSearch page size changed "
                "during fetch: "
                f"initial MaxPerPage={max_per_page}, "
                f"page {next_page} returned "
                f"MaxPerPage={next_max_per_page}"
            )

    # ========================================================================
    # Seed Summary
    # ========================================================================

    result_count = 0
    document_count = 0
    unique_id_occurrences = 0

    all_source_ids: list[str] = []

    for runtime in runtimes:

        summary = runtime.get(
            "summary",
            {},
        )

        result_count += int(
            summary.get(
                "result_count",
                0,
            ) or 0
        )

        document_count += int(
            summary.get(
                "document_count",
                0,
            ) or 0
        )

        unique_id_occurrences += int(
            summary.get(
                "unique_id_occurrences",
                0,
            ) or 0
        )

        all_source_ids.extend(
            get_source_unique_ids(
                runtime.get(
                    "response",
                    {},
                )
            )
        )

    print()
    print("=" * 70)

    print(
        "HP HAWKSEARCH SEED COMPLETE"
    )

    print("=" * 70)

    print(
        f"Seed                  : "
        f"{seed['entry_name']}"
    )

    print(
        f"Pages Observed        : "
        f"{len(runtimes):,}"
    )

    print(
        f"API NofResults        : "
        f"{total_results:,}"
    )

    print(
        f"Results Received      : "
        f"{result_count:,}"
    )

    print(
        f"Documents Received    : "
        f"{document_count:,}"
    )

    print(
        f"Unique ID Occurrences : "
        f"{unique_id_occurrences:,}"
    )

    print(
        f"Distinct API IDs      : "
        f"{len(set(all_source_ids)):,}"
    )

    print()
    print(
        "NOTE:"
    )

    print(
        "These are HawkSearch/API "
        "structural observations."
    )

    print(
        "They are NOT final PCProduct counts."
    )

    print("=" * 70)

    return runtimes


# ============================================================================
# Collection Runtime
# ============================================================================

def fetch(
    *,
    seeds: list[dict],
    start_page: int = CONFIRMED_PAGE_NO,
    keyword: str = CONFIRMED_KEYWORD,
    query: str = CONFIRMED_QUERY,
) -> list[dict[str, Any]]:
    """
    Execute HP HawkSearch Fetch Runtime.

    Collection flow:

        Seeds
          ↓
        Seed
          ↓
        Page 1
          ↓
        API Pagination
          ↓
        Page 2 ... Page N
          ↓
        Raw Page Runtimes

    IMPORTANT
    ------------------------------------------------------------------------

    No Product aggregation occurs here.

    No duplicate elimination occurs here.

    No specification combination occurs here.

    No affiliate transformation occurs here.
    """

    validate_seeds(
        seeds,
    )

    trace_pipeline(
        "HAWKSEARCH FETCH",
    )

    print()
    print("=" * 70)

    print(
        "HP HAWKSEARCH FETCH RUNTIME"
    )

    print("=" * 70)

    print(
        f"Seed Entries : "
        f"{len(seeds)}"
    )

    print(
        f"Start Page   : "
        f"{start_page}"
    )

    print(
        f"Query        : "
        f"{query}"
    )

    print("=" * 70)

    print()
    print(
        "REALITY POLICY"
    )

    print(
        "✓ Pagination is API-authoritative"
    )

    print(
        "✓ Full Response is preserved"
    )

    print(
        "✓ Facets are preserved"
    )

    print(
        "✓ Results are preserved"
    )

    print(
        "✓ Documents are preserved"
    )

    print(
        "✓ API Unique IDs are preserved"
    )

    print(
        "✓ purchase_link is preserved"
    )

    print(
        "✓ No specification combination"
    )

    print(
        "✓ No duplicate elimination"
    )

    print(
        "✓ No Product counting"
    )

    print("=" * 70)

    runtimes: list[
        dict[str, Any]
    ] = []

    with requests.Session() as session:

        for index, seed in enumerate(
            seeds,
            start=1,
        ):

            print()
            print("=" * 70)

            print(
                f"HP ACQUISITION "
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

            print("=" * 70)

            try:

                seed_runtimes = fetch_seed(
                    session=session,
                    seed=seed,
                    start_page=start_page,
                    keyword=keyword,
                    query=query,
                )

            except Exception as exc:

                print()
                print(
                    f"FAILED : "
                    f"{seed['entry_name']}"
                )

                print(
                    f"ERROR  : {exc}"
                )

                raise

            runtimes.extend(
                seed_runtimes,
            )

    # ========================================================================
    # Collection Structural Summary
    # ========================================================================

    total_pages = len(
        runtimes
    )

    total_results_received = 0
    total_documents_received = 0
    total_unique_id_occurrences = 0

    all_source_ids: list[str] = []

    for runtime in runtimes:

        summary = runtime.get(
            "summary",
            {},
        )

        total_results_received += int(
            summary.get(
                "result_count",
                0,
            ) or 0
        )

        total_documents_received += int(
            summary.get(
                "document_count",
                0,
            ) or 0
        )

        total_unique_id_occurrences += int(
            summary.get(
                "unique_id_occurrences",
                0,
            ) or 0
        )

        response = runtime.get(
            "response",
            {},
        )

        all_source_ids.extend(
            get_source_unique_ids(
                response,
            )
        )

    distinct_api_ids = set(
        all_source_ids
    )

    # ========================================================================
    # API Pagination Reality
    # ========================================================================

    api_total_results = 0
    api_total_pages = 0
    api_max_per_page = 0

    if runtimes:

        first_pagination = runtimes[0].get(
            "pagination",
            {},
        )

        api_total_results = int(
            first_pagination.get(
                "nof_results",
                0,
            ) or 0
        )

        api_total_pages = int(
            first_pagination.get(
                "nof_pages",
                0,
            ) or 0
        )

        api_max_per_page = int(
            first_pagination.get(
                "max_per_page",
                0,
            ) or 0
        )

    # ========================================================================
    # Final Fetch Summary
    # ========================================================================

    print()
    print("=" * 70)

    print(
        "HP HAWKSEARCH FETCH COMPLETE"
    )

    print("=" * 70)

    print(
        f"Seeds                  : "
        f"{len(seeds):,}"
    )

    print(
        f"Page Runtimes          : "
        f"{total_pages:,}"
    )

    print(
        f"API NofResults         : "
        f"{api_total_results:,}"
    )

    print(
        f"API NofPages           : "
        f"{api_total_pages:,}"
    )

    print(
        f"API MaxPerPage         : "
        f"{api_max_per_page:,}"
    )

    print(
        f"Results Received       : "
        f"{total_results_received:,}"
    )

    print(
        f"Documents Received     : "
        f"{total_documents_received:,}"
    )

    print(
        f"Unique ID Occurrences  : "
        f"{total_unique_id_occurrences:,}"
    )

    print(
        f"Distinct API Unique IDs: "
        f"{len(distinct_api_ids):,}"
    )

    print()

    print(
        "IMPORTANT"
    )

    print(
        "API NofResults is the number "
        "reported by HawkSearch."
    )

    print(
        "Distinct API Unique IDs are "
        "observed identities."
    )

    print(
        "Neither value is converted "
        "into a final PCProduct count here."
    )

    print()

    print(
        "MENU REALITY"
    )

    print(
        "✓ HawkSearch Facets preserved "
        "inside each raw Response."
    )

    print()

    print(
        "PRODUCT REALITY"
    )

    print(
        "✓ HawkSearch Results preserved "
        "inside each raw Response."
    )

    print()

    print(
        "AFFILIATE REALITY"
    )

    print(
        "✓ purchase_link preserved "
        "inside each Document."
    )

    print("=" * 70)

    return runtimes


# ============================================================================
# Entry Point
# ============================================================================

def main(
    *,
    seeds: list[dict],
    start_page: int = CONFIRMED_PAGE_NO,
    keyword: str = CONFIRMED_KEYWORD,
    query: str = CONFIRMED_QUERY,
) -> list[dict[str, Any]]:
    """
    Runtime Entry Point.
    """

    return fetch(
        seeds=seeds,
        start_page=start_page,
        keyword=keyword,
        query=query,
    )


# ============================================================================
# Standalone Execution
# ============================================================================

if __name__ == "__main__":

    test_seeds = [
        {
            "entry_name":
                "HP",

            "maker":
                "hp",

            "series":
                "HP",

            "slug":
                "hp",

            "runtime":
                "scraping",

            "url":
                (
                    "https://jp.ext.hp.com/"
                    "search/"
                    "?orderBy=score"
                    "&type=Product"
                ),
        },
    ]

    main(
        seeds=test_seeds,
        start_page=CONFIRMED_PAGE_NO,
    )