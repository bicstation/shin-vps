#!/usr/bin/env python3

"""
==============================================================================
FILE:
    acquisition/sources/scraping/storm/acquire_listing.py

SHIN CORE LINX

STORM Listing Acquire Runtime

Reality First Pipeline


Seed Reality
        │
        ▼
Listing Page Acquire
        │
        ▼
Pagination Discovery
        │
        ▼
New Page Discovery
        │
        ├── Page 1
        ├── Page 2
        ├── Page 3
        └── ...
        │
        ▼
AcquisitionDocument


Reality First
Observation First


Responsibilities

- Acquire Listing HTML
- Discover Listing Pagination
- Follow discovered Listing Pages
- Persist AcquisitionDocument
- Preserve Listing Reality
- Preserve Page Identity

NOT Responsibilities

- Product Card Parsing
- Product Observation
- Formatter
- Mapper
- Semantic
- Product Building


Pagination Strategy

The Runtime does NOT assume a fixed page count.

The Runtime does NOT generate page numbers blindly.

Instead:

1. Acquire the Seed Listing Page.
2. Observe pagination URLs from that page.
3. Add newly discovered pages to the pending queue.
4. Acquire the next pending page.
5. Observe pagination URLs from the newly acquired page.
6. Add newly discovered pages to the queue.
7. Continue until no undiscovered page remains.

Therefore:

    Reality → Discovery → Acquisition

not:

    Guess page count → HTTP requests


The number of pages is determined by the current Listing Reality.

==============================================================================

"""

from __future__ import annotations


from collections import deque


from urllib.parse import (
    parse_qsl,
    urlencode,
    urljoin,
    urlsplit,
    urlunsplit,
)


import requests


from bs4 import BeautifulSoup


from api.models import (
    AcquisitionDocument,
)


from acquisition.common.trace.reality_trace import (
    trace_pipeline,
)


from .discover_seed import (
    discover,
)


from .settings import (
    SOURCE_NAME,
    USER_AGENT,
    TIMEOUT,
)


# ==============================================================================
# Runtime Safety
# ==============================================================================

# This is NOT the page count.
#
# It is only a protection against a malformed website continuously generating
# meaningless pagination URLs.
#
# Normal STORM execution should terminate through Reality Discovery.
#
MAX_DISCOVERED_PAGES = 1000


# ==============================================================================
# URL Helpers
# ==============================================================================

def normalize_url(
    url: str,
) -> str:
    """
    Normalize URL.

    Responsibilities:

    - Preserve query parameters
    - Remove fragment
    - Preserve canonical Listing URL
    """

    if not isinstance(
        url,
        str,
    ):

        return ""

    url = url.strip()

    if not url:

        return ""

    parts = urlsplit(
        url,
    )

    query = urlencode(
        parse_qsl(
            parts.query,
            keep_blank_values=True,
        ),
    )

    return urlunsplit(
        (
            parts.scheme,
            parts.netloc,
            parts.path,
            query,
            "",
        )
    )


def page_number(
    url: str,
) -> int:
    """
    Extract pageno from Listing URL.

    Page 1:

        /products/list

    Page 2:

        /products/list?pageno=2
    """

    parts = urlsplit(
        url,
    )

    query = dict(
        parse_qsl(
            parts.query,
            keep_blank_values=True,
        )
    )

    value = query.get(
        "pageno",
    )

    if not value:

        return 1

    try:

        number = int(
            value,
        )

    except (
        TypeError,
        ValueError,
    ):

        return 1

    if number < 1:

        return 1

    return number


def page_slug(
    slug: str,
    page: int,
) -> str:
    """
    Create stable AcquisitionDocument identity.

    Page 1:

        storm

    Page 2:

        storm__page_2
    """

    if page <= 1:

        return slug

    return (
        f"{slug}__page_{page}"
    )


# ==============================================================================
# Pagination Discovery
# ==============================================================================

def discover_pagination(
    *,
    html: str,
    base_url: str,
) -> list[str]:
    """
    Discover Listing Pagination URLs from one Listing HTML document.

    This function ONLY observes navigation URLs.

    It does NOT inspect product cards.
    """

    if not isinstance(
        html,
        str,
    ):

        return []

    if not html:

        return []

    soup = BeautifulSoup(
        html,
        "html.parser",
    )

    base_parts = urlsplit(
        base_url,
    )

    discovered: dict[int, str] = {}

    # --------------------------------------------------------------------------
    # Current Page
    # --------------------------------------------------------------------------

    current_url = normalize_url(
        base_url,
    )

    if current_url:

        discovered[
            page_number(
                current_url,
            )
        ] = current_url

    # --------------------------------------------------------------------------
    # Navigation Links
    # --------------------------------------------------------------------------

    for link in soup.select(
        "a[href]",
    ):

        href = link.get(
            "href",
            "",
        )

        if not isinstance(
            href,
            str,
        ):

            continue

        href = href.strip()

        if not href:

            continue

        url = normalize_url(
            urljoin(
                base_url,
                href,
            ),
        )

        if not url:

            continue

        parts = urlsplit(
            url,
        )

        # ----------------------------------------------------------------------
        # Same host
        # ----------------------------------------------------------------------

        if parts.netloc != base_parts.netloc:

            continue

        # ----------------------------------------------------------------------
        # Same Listing Path
        # ----------------------------------------------------------------------

        if parts.path != base_parts.path:

            continue

        query = dict(
            parse_qsl(
                parts.query,
                keep_blank_values=True,
            )
        )

        # ----------------------------------------------------------------------
        # Only pageno navigation
        # ----------------------------------------------------------------------

        if "pageno" not in query:

            continue

        number = page_number(
            url,
        )

        if number < 1:

            continue

        discovered[
            number
        ] = url

    return [
        discovered[number]
        for number in sorted(
            discovered,
        )
    ]


# ==============================================================================
# Persistence
# ==============================================================================

def save_document(
    *,
    slug: str,
    page: int,
    url: str,
    response: requests.Response,
) -> tuple[
    AcquisitionDocument,
    bool,
]:
    """
    Persist Listing Reality.
    """

    document_key = page_slug(
        slug,
        page,
    )

    return (
        AcquisitionDocument.objects.update_or_create(

            source_type="scraping",

            source_name=SOURCE_NAME,

            document_type="seed",

            document_key=document_key,

            defaults={

                "source_url": url,

                "content_type": response.headers.get(
                    "Content-Type",
                    "text/html",
                ),

                "content": response.text,

            },

        )
    )


# ==============================================================================
# HTTP Session
# ==============================================================================

def create_session() -> requests.Session:
    """
    Create Runtime HTTP Session.
    """

    session = requests.Session()

    session.headers.update({

        "User-Agent": USER_AGENT,

    })

    return session


# ==============================================================================
# Cached Document
# ==============================================================================

def get_cached_document(
    *,
    slug: str,
    page: int,
):
    """
    Return cached Listing AcquisitionDocument.
    """

    return (
        AcquisitionDocument.objects.filter(

            source_type="scraping",

            source_name=SOURCE_NAME,

            document_type="seed",

            document_key=page_slug(
                slug,
                page,
            ),

        ).first()
    )


# ==============================================================================
# Acquire One Page
# ==============================================================================

def acquire_page(
    *,
    session: requests.Session,
    slug: str,
    page: int,
    url: str,
    force: bool,
) -> tuple[
    AcquisitionDocument | None,
    bool,
    bool,
]:
    """
    Acquire one Listing page.

    Returns:

        document
        created
        success
    """

    document_key = page_slug(
        slug,
        page,
    )

    # --------------------------------------------------------------------------
    # Cache
    # --------------------------------------------------------------------------

    if not force:

        cached = get_cached_document(

            slug=slug,

            page=page,

        )

        if cached is not None:

            print(
                f"  Status : CACHE"
            )

            print(
                f"  Key    : {document_key}"
            )

            return (
                cached,
                False,
                True,
            )

    # --------------------------------------------------------------------------
    # HTTP
    # --------------------------------------------------------------------------

    response = session.get(

        url,

        timeout=TIMEOUT,

    )

    response.raise_for_status()

    # --------------------------------------------------------------------------
    # Persistence
    # --------------------------------------------------------------------------

    document, created = save_document(

        slug=slug,

        page=page,

        url=url,

        response=response,

    )

    print(
        f"  HTTP   : {response.status_code}"
    )

    print(
        f"  Key    : {document_key}"
    )

    print(
        f"  Saved  : "
        f"{'CREATED' if created else 'UPDATED'}"
    )

    return (
        document,
        created,
        True,
    )


# ==============================================================================
# Runtime
# ==============================================================================

def acquire(
    *,
    force: bool = False,
) -> None:
    """
    Execute STORM Listing Acquire Runtime.

    Pagination is discovered dynamically from the actual Listing HTML.

    The Runtime continues until no new pagination URL is discovered.
    """

    seeds = discover()

    print("=" * 70)

    print(
        "🌐 STORM LISTING ACQUIRE"
    )

    print("=" * 70)

    print(
        f"Target : {len(seeds)}"
    )

    print("=" * 70)

    trace_pipeline(
        "ACQUIRE",
    )

    success = 0

    failed = 0

    total_pages = 0

    session = create_session()

    # ==========================================================================
    # Seed Runtime
    # ==========================================================================

    for seed_index, seed in enumerate(
        seeds,
        start=1,
    ):

        slug = seed["slug"]

        base_url = normalize_url(
            seed["url"],
        )

        print()

        print(
            "=" * 70
        )

        print(
            f"SEED [{seed_index}/{len(seeds)}] : {slug}"
        )

        print(
            f"URL  : {base_url}"
        )

        print(
            "=" * 70
        )

        # ======================================================================
        # Discovery State
        # ======================================================================

        pending: deque[str] = deque()

        discovered: set[str] = set()

        acquired: set[str] = set()

        failed_urls: set[str] = set()

        # ----------------------------------------------------------------------
        # Seed Page
        # ----------------------------------------------------------------------

        pending.append(
            base_url,
        )

        discovered.add(
            base_url,
        )

        # ======================================================================
        # Dynamic Pagination Runtime
        # ======================================================================

        while pending:

            if len(discovered) > MAX_DISCOVERED_PAGES:

                raise RuntimeError(
                    "STORM pagination discovery exceeded "
                    f"MAX_DISCOVERED_PAGES="
                    f"{MAX_DISCOVERED_PAGES}."
                )

            url = pending.popleft()

            if url in acquired:

                continue

            if url in failed_urls:

                continue

            page = page_number(
                url,
            )

            print()

            print(
                f"[{seed_index}/{len(seeds)}] "
                f"PAGE {page}"
            )

            print(
                f"  URL   : {url}"
            )

            # ------------------------------------------------------------------
            # Acquire
            # ------------------------------------------------------------------

            try:

                document, _, success_flag = acquire_page(

                    session=session,

                    slug=slug,

                    page=page,

                    url=url,

                    force=force,

                )

                if not success_flag:

                    failed += 1

                    failed_urls.add(
                        url,
                    )

                    continue

                success += 1

                total_pages += 1

                acquired.add(
                    url,
                )

            except Exception as e:

                print(
                    f"  ERROR  : {e}"
                )

                failed += 1

                failed_urls.add(
                    url,
                )

                continue

            # ------------------------------------------------------------------
            # Pagination Discovery
            # ------------------------------------------------------------------

            discovered_urls = discover_pagination(

                html=document.content or "",

                base_url=url,

            )

            print(
                f"  Pagination Found : "
                f"{len(discovered_urls)}"
            )

            new_count = 0

            for discovered_url in discovered_urls:

                if discovered_url in discovered:

                    continue

                discovered.add(
                    discovered_url,
                )

                pending.append(
                    discovered_url,
                )

                new_count += 1

                print(
                    f"    DISCOVER : "
                    f"PAGE {page_number(discovered_url)}"
                )

            print(
                f"  New Pages        : "
                f"{new_count}"
            )

        # ======================================================================
        # Seed Result
        # ======================================================================

        print()

        print(
            "=" * 70
        )

        print(
            f"SEED COMPLETE : {slug}"
        )

        print(
            "=" * 70
        )

        print(
            f"Discovered : {len(discovered)}"
        )

        print(
            f"Acquired   : {len(acquired)}"
        )

        print(
            f"Failed     : {len(failed_urls)}"
        )

        print(
            "=" * 70
        )

    # ==========================================================================
    # Result
    # ==========================================================================

    print()

    print(
        "=" * 70
    )

    print(
        "STORM LISTING ACQUIRE RESULT"
    )

    print(
        "=" * 70
    )

    print(
        f"SEEDS   : {len(seeds)}"
    )

    print(
        f"PAGES   : {total_pages}"
    )

    print(
        f"SUCCESS : {success}"
    )

    print(
        f"FAILED  : {failed}"
    )

    print(
        "=" * 70
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

    acquire(
        force=force,
    )


if __name__ == "__main__":

    main()