#!/usr/bin/env python3

# ============================================================================
#
# FILE:
# acquisition/sources/scraping/ark/fetch_ark.py
#
# SHIN CORE LINX
#
# ARK Fetch Runtime
#
# Reality First
#
# Responsibilities
#
# - Load ARK Seed URL
# - Build ARK request URL
# - HTTP GET
# - Observe Pagination count required for acquisition
# - Fetch every page
# - Preserve raw HTML Reality
#
# NOT Responsibilities
#
# - Product HTML parsing
# - Product Observation
# - Formatting
# - Mapping
# - Contract Building
# - Persistence
# - Product Building
#
# ============================================================================

from __future__ import annotations

import re

from urllib.parse import (
    parse_qs,
    urlencode,
    urlparse,
    urlunparse,
)

import requests

from .settings import (
    ENCODING,
    TIMEOUT,
    USER_AGENT,
)


# ============================================================================
# Runtime Constants
# ============================================================================

PJAX_SELECTOR = ".rez_parent"


# ============================================================================
# Request URL Builder
# ============================================================================

def build_request_url(
    seed_url: str,
    *,
    page: int = 1,
) -> str:
    """
    Build ARK request URL from Seed URL.

    Seed URL is the authority for the category/query parameters.

    Runtime adds:
        _pjax=.rez_parent

    Runtime adds:
        page=N
    only when page > 1.
    """

    parsed = urlparse(
        seed_url,
    )

    query = parse_qs(
        parsed.query,
        keep_blank_values=True,
    )

    # ------------------------------------------------------------------------
    # PJAX
    # ------------------------------------------------------------------------

    query["_pjax"] = [
        PJAX_SELECTOR,
    ]

    # ------------------------------------------------------------------------
    # Pagination
    # ------------------------------------------------------------------------

    if page > 1:

        query["page"] = [
            str(page),
        ]

    else:

        query.pop(
            "page",
            None,
        )

    new_query = urlencode(
        query,
        doseq=True,
    )

    return urlunparse(
        (
            parsed.scheme,
            parsed.netloc,
            parsed.path,
            parsed.params,
            new_query,
            parsed.fragment,
        )
    )


# ============================================================================
# Pagination Observer
# ============================================================================

def observe_total_pages(
    html: str,
) -> int:
    """
    Observe the maximum pagination page number from ARK HTML.

    Example:

        ?list_tag=sc_gaming
        &sort_para=st_new
        &_pjax=.rez_parent
        &page=22

    returns:

        22

    If no pagination link is found,
    the current response is treated as a single page.
    """

    if not html:

        return 1

    # ------------------------------------------------------------------------
    # Find page query parameters inside pagination links.
    #
    # We intentionally observe the HTML rather than inventing
    # a page count.
    # ------------------------------------------------------------------------

    page_numbers = []

    matches = re.findall(
        r"""[?&]page=(\d+)""",
        html,
        flags=re.IGNORECASE,
    )

    for value in matches:

        try:

            page_numbers.append(
                int(value),
            )

        except ValueError:

            continue

    # ------------------------------------------------------------------------
    # No explicit page links.
    # ------------------------------------------------------------------------

    if not page_numbers:

        return 1

    return max(
        page_numbers,
    )


# ============================================================================
# HTTP Session
# ============================================================================

def create_session() -> requests.Session:

    session = requests.Session()

    session.headers.update(
        {
            "User-Agent": USER_AGENT,
            "Accept": (
                "text/html,"
                "application/xhtml+xml"
            ),
            "X-Requested-With": (
                "XMLHttpRequest"
            ),
        }
    )

    return session


# ============================================================================
# Single Page Fetch
# ============================================================================

def fetch_page(
    session: requests.Session,
    seed: dict,
    *,
    page: int,
) -> dict:
    """
    Fetch one ARK page.

    Returns raw HTTP Reality.
    """

    seed_url = (
        seed.get(
            "url",
            "",
        )
        or ""
    ).strip()

    if not seed_url:

        raise ValueError(
            "ARK Seed URL is empty"
        )

    request_url = build_request_url(
        seed_url,
        page=page,
    )

    print()
    print("=" * 70)
    print("ARK REQUEST")
    print("=" * 70)

    print(
        f"Entry : "
        f"{seed.get('entry_name', '')}"
    )

    print(
        f"Page  : "
        f"{page}"
    )

    print(
        f"URL   : "
        f"{request_url}"
    )

    response = session.get(
        request_url,
        timeout=TIMEOUT,
    )

    response.encoding = (
        response.encoding
        or ENCODING
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

    return {
        "seed": seed,
        "page": page,
        "request_url": request_url,
        "status_code": response.status_code,
        "content_type": response.headers.get(
            "Content-Type",
            "",
        ),
        "response_text": response.text,
        "response_size": len(
            response.content,
        ),
    }


# ============================================================================
# Seed Fetch
# ============================================================================

def fetch_seed(
    session: requests.Session,
    seed: dict,
) -> list[dict]:
    """
    Fetch every page belonging to one ARK Seed.

    Flow:

        Page 1
          ↓
        Observe Total Pages
          ↓
        Page 2 ... Page N
    """

    # ------------------------------------------------------------------------
    # Page 1
    # ------------------------------------------------------------------------

    first_runtime = fetch_page(
        session,
        seed,
        page=1,
    )

    first_html = first_runtime[
        "response_text"
    ]

    total_pages = observe_total_pages(
        first_html,
    )

    print()
    print(
        f"Total Pages : "
        f"{total_pages}"
    )

    runtimes = [
        first_runtime,
    ]

    # ------------------------------------------------------------------------
    # Remaining Pages
    # ------------------------------------------------------------------------

    for page in range(
        2,
        total_pages + 1,
    ):

        print()
        print(
            f"▶ NEXT ARK PAGE "
            f"{page}/{total_pages}"
        )

        runtime = fetch_page(
            session,
            seed,
            page=page,
        )

        runtimes.append(
            runtime,
        )

    # ------------------------------------------------------------------------
    # Seed Summary
    # ------------------------------------------------------------------------

    print()
    print("=" * 70)
    print("ARK SEED COMPLETE")
    print("=" * 70)

    print(
        f"Seed          : "
        f"{seed.get('entry_name', '')}"
    )

    print(
        f"Pages Observed: "
        f"{len(runtimes)}"
    )

    print(
        f"Total Pages   : "
        f"{total_pages}"
    )

    return runtimes


# ============================================================================
# Runtime
# ============================================================================

def fetch(
    *,
    seeds: list[dict],
    **kwargs,
) -> list[dict]:
    """
    Fetch all ARK pages for all Seeds.
    """

    session = create_session()

    runtimes = []

    for seed in seeds:

        seed_runtimes = fetch_seed(
            session,
            seed,
        )

        runtimes.extend(
            seed_runtimes,
        )

    print()
    print("=" * 70)
    print("ARK FETCH COMPLETE")
    print("=" * 70)

    print(
        f"Seeds         : "
        f"{len(seeds)}"
    )

    print(
        f"Page Runtimes : "
        f"{len(runtimes)}"
    )

    print("=" * 70)

    return runtimes


# ============================================================================
# Entry Point
# ============================================================================

def main(
    *,
    seeds: list[dict],
    **kwargs,
):

    return fetch(
        seeds=seeds,
        **kwargs,
    )


# ============================================================================
# Standalone Execution
# ============================================================================

if __name__ == "__main__":

    main(
        seeds=[],
    )