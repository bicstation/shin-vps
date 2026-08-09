#!/usr/bin/env python3

"""
==============================================================================
FILE:
    acquisition/sources/scraping/sycom/acquire_listing.py

SHIN CORE LINX

SYCOM Listing Acquire Runtime

Reality First Pipeline


Seed Reality
        │
        ▼
Listing Page Acquire
        │
        ▼
Playwright Browser Runtime
        │
        ▼
JavaScript Rendered DOM
        │
        ▼
Rendered HTML
        │
        ▼
AcquisitionDocument
        │
        ▼
Listing Observation Runtime


Reality First
Observation First


Responsibilities

- Acquire Listing HTML
- Execute browser-rendered Reality
- Preserve rendered DOM
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


Important

SYCOM Listing Reality contains dynamically rendered values.

Therefore:

    requests.get()
        ↓
    incomplete HTML

is NOT sufficient.

This Runtime uses Playwright:

    Playwright
        ↓
    JavaScript execution
        ↓
    rendered page.content()
        ↓
    Playwright Runtime COMPLETE
        ↓
    Django ORM
        ↓
    AcquisitionDocument


Persistence Rule

IMPORTANT:

Playwright Runtime and Django ORM must NOT execute
inside the same Playwright context.

Therefore:

    Playwright
        ↓
    page.content()
        ↓
    browser/page/context CLOSED
        ↓
    Django ORM
        ↓
    AcquisitionDocument

Pagination Strategy

The Runtime does NOT assume a fixed page count.

The Runtime discovers pagination from the rendered Listing DOM.

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


from playwright.sync_api import (
    TimeoutError as PlaywrightTimeoutError,
    sync_playwright,
)


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

MAX_DISCOVERED_PAGES = 1000


# ==============================================================================
# Browser
# ==============================================================================

HEADLESS = True


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


# ==============================================================================
# Page Number
# ==============================================================================

def page_number(
    url: str,
) -> int:
    """
    Extract pageno from Listing URL.

    Page 1:

        /lineup/

    Page 2:

        /lineup/?pageno=2
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


# ==============================================================================
# Document Key
# ==============================================================================

def page_slug(
    slug: str,
    page: int,
) -> str:
    """
    Create stable AcquisitionDocument identity.

    Page 1:

        stdpc

    Page 2:

        stdpc__page_2
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
    Discover Listing Pagination URLs from rendered Listing HTML.

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
        # Same Host
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
    content: str,
    content_type: str,
) -> tuple[
    AcquisitionDocument,
    bool,
]:
    """
    Persist rendered Listing Reality.

    IMPORTANT:

    This function is intentionally called
    AFTER the Playwright Runtime has completely ended.
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

                "content_type": content_type,

                "content": content,

            },

        )
    )


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
# Browser
# ==============================================================================

def acquire_rendered_html(
    *,
    url: str,
) -> tuple[
    str,
    int,
]:
    """
    Acquire one Listing page using Playwright.

    IMPORTANT:

    This function is PURE acquisition.

    It does NOT touch Django ORM.

    Lifecycle:

        Playwright start
            ↓
        goto
            ↓
        JavaScript execution
            ↓
        page.content()
            ↓
        Page close
            ↓
        Context close
            ↓
        Browser close
            ↓
        return HTML

    Django persistence happens OUTSIDE this function.
    """

    print(
        "  Browser : Playwright"
    )

    content = ""

    status_code = 0

    # ==========================================================================
    # Playwright Runtime
    # ==========================================================================

    with sync_playwright() as playwright:

        browser = playwright.chromium.launch(
            headless=HEADLESS,
        )

        try:

            context = browser.new_context(

                user_agent=USER_AGENT,

                viewport={
                    "width": 1440,
                    "height": 1200,
                },

                locale="ja-JP",

                timezone_id="Asia/Tokyo",

            )

            try:

                browser_page = context.new_page()

                try:

                    # ------------------------------------------------------------------
                    # Navigation
                    # ------------------------------------------------------------------

                    response = browser_page.goto(

                        url,

                        wait_until="domcontentloaded",

                        timeout=TIMEOUT * 1000,

                    )

                    # ------------------------------------------------------------------
                    # JavaScript / DOM Rendering
                    # ------------------------------------------------------------------

                    try:

                        browser_page.wait_for_load_state(

                            "networkidle",

                            timeout=TIMEOUT * 1000,

                        )

                    except PlaywrightTimeoutError:

                        print(
                            "  Warning : "
                            "networkidle timeout"
                        )

                    # ------------------------------------------------------------------
                    # Wait for SYCOM Product Cards
                    # ------------------------------------------------------------------

                    try:

                        browser_page.wait_for_selector(

                            "div.inner01:has(.name01)",

                            timeout=TIMEOUT * 1000,

                        )

                    except PlaywrightTimeoutError:

                        print(
                            "  Warning : "
                            "Product cards not detected"
                        )

                    # ------------------------------------------------------------------
                    # Final Rendered DOM
                    # ------------------------------------------------------------------

                    content = browser_page.content()

                    # ------------------------------------------------------------------
                    # HTTP Status
                    # ------------------------------------------------------------------

                    status_code = (

                        response.status

                        if response is not None

                        else 200

                    )

                    print(
                        f"  HTTP   : {status_code}"
                    )

                    print(
                        f"  HTML   : {len(content):,} bytes"
                    )

                finally:

                    browser_page.close()

            finally:

                context.close()

        finally:

            browser.close()

    # ==========================================================================
    # IMPORTANT
    #
    # At this point:
    #
    #   Playwright is completely terminated.
    #
    # Therefore Django ORM can safely run after this function returns.
    # ==========================================================================

    return (
        content,
        status_code,
    )


# ==============================================================================
# Acquire One Listing Page
# ==============================================================================

def acquire_page(
    *,
    slug: str,
    page_number_value: int,
    url: str,
    force: bool,
) -> tuple[
    AcquisitionDocument | None,
    bool,
    bool,
]:
    """
    Acquire and persist one Listing page.

    Runtime order:

        Cache Check
            ↓
        Playwright Acquire
            ↓
        Playwright COMPLETE
            ↓
        Django ORM
            ↓
        AcquisitionDocument

    Returns:

        document
        created
        success
    """

    document_key = page_slug(
        slug,
        page_number_value,
    )

    # ==========================================================================
    # Cache
    # ==========================================================================

    if not force:

        cached = get_cached_document(

            slug=slug,

            page=page_number_value,

        )

        if cached is not None:

            print(
                "  Status : CACHE"
            )

            print(
                f"  Key    : {document_key}"
            )

            return (
                cached,
                False,
                True,
            )

    # ==========================================================================
    # Playwright Reality Acquisition
    # ==========================================================================

    content, status_code = (
        acquire_rendered_html(
            url=url,
        )
    )

    if not content:

        raise RuntimeError(
            f"Rendered HTML is empty: {url}"
        )

    # ==========================================================================
    # IMPORTANT
    #
    # acquire_rendered_html() has already completely closed:
    #
    #   Page
    #   Context
    #   Browser
    #   Playwright
    #
    # Only NOW do we call Django ORM.
    # ==========================================================================

    document, created = save_document(

        slug=slug,

        page=page_number_value,

        url=url,

        content=content,

        content_type="text/html",

    )

    print(
        f"  Key    : {document_key}"
    )

    print(
        "  Saved  : "
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
    Execute SYCOM Listing Acquire Runtime.

    Reality acquisition is performed through Playwright.

    The resulting rendered HTML is persisted to
    AcquisitionDocument.

    Observation remains completely independent
    from browser execution.
    """

    seeds = discover()

    print("=" * 70)

    print(
        "🌐 SYCOM LISTING ACQUIRE"
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
            f"SEED "
            f"[{seed_index}/{len(seeds)}] "
            f": {slug}"
        )

        print(
            f"URL  : {base_url}"
        )

        print(
            "=" * 70
        )

        # ==========================================================================
        # Discovery State
        # ==========================================================================

        pending: deque[str] = deque()

        discovered: set[str] = set()

        acquired: set[str] = set()

        failed_urls: set[str] = set()

        # --------------------------------------------------------------------------
        # Seed Page
        # --------------------------------------------------------------------------

        pending.append(
            base_url,
        )

        discovered.add(
            base_url,
        )

        # ==========================================================================
        # Dynamic Pagination Runtime
        # ==========================================================================

        while pending:

            if (
                len(discovered)
                > MAX_DISCOVERED_PAGES
            ):

                raise RuntimeError(
                    "SYCOM pagination discovery "
                    "exceeded "
                    f"MAX_DISCOVERED_PAGES="
                    f"{MAX_DISCOVERED_PAGES}."
                )

            url = pending.popleft()

            if url in acquired:
                continue

            if url in failed_urls:
                continue

            current_page = page_number(
                url,
            )

            print()

            print(
                f"[{seed_index}/{len(seeds)}] "
                f"PAGE {current_page}"
            )

            print(
                f"URL   : {url}"
            )

            # ======================================================================
            # Acquire
            # ======================================================================

            try:

                document, _, success_flag = (
                    acquire_page(

                        slug=slug,

                        page_number_value=current_page,

                        url=url,

                        force=force,

                    )
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
                    f"  ERROR : {e}"
                )

                failed += 1

                failed_urls.add(
                    url,
                )

                continue

            # ======================================================================
            # Pagination Discovery
            # ======================================================================

            discovered_urls = (
                discover_pagination(

                    html=document.content or "",

                    base_url=url,

                )
            )

            print(
                "  Pagination Found : "
                f"{len(discovered_urls)}"
            )

            new_count = 0

            for discovered_url in (
                discovered_urls
            ):

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
                    "    DISCOVER : "
                    f"PAGE "
                    f"{page_number(discovered_url)}"
                )

            print(
                "  New Pages        : "
                f"{new_count}"
            )

        # ==========================================================================
        # Seed Result
        # ==========================================================================

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
            f"Discovered : "
            f"{len(discovered)}"
        )

        print(
            f"Acquired   : "
            f"{len(acquired)}"
        )

        print(
            f"Failed     : "
            f"{len(failed_urls)}"
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
        "SYCOM LISTING ACQUIRE RESULT"
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