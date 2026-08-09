#!/usr/bin/env python3

"""
==============================================================================
FILE:
    acquisition/sources/scraping/mouse/acquire_listing.py

SHIN CORE LINX

MOUSE Listing Acquire Runtime

Reality First Pipeline


Seed Reality
        │
        ▼
Listing Page Acquire
        │
        ▼
HTTP Response
        │
        ▼
Listing HTML
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
- Preserve Published Listing Reality
- Persist AcquisitionDocument
- Preserve Listing Identity

NOT Responsibilities

- Playwright
- JavaScript Rendering
- HTML Parsing
- Product Card Parsing
- Product Observation
- Formatter
- Mapper
- Semantic
- Product Building
- Pagination


Acquisition Strategy

MOUSE Listing categories are sufficiently granular.

Current Runtime Policy:

    One Seed
        ↓
    One Listing URL
        ↓
    One HTTP Request
        ↓
    One AcquisitionDocument

Pagination such as:

    /ra2010100/
    /ra2010100_p2/
    /ra2010100_p3/

is NOT acquired by this Runtime.

The first Listing Page is the current
MOUSE Reality Acquisition boundary.


Persistence Rule

HTTP acquisition and Django ORM are separate responsibilities.

    HTTP
        ↓
    HTML
        ↓
    HTTP Runtime COMPLETE
        ↓
    Django ORM
        ↓
    AcquisitionDocument

==============================================================================

"""

from __future__ import annotations


from urllib.request import (
    Request,
    urlopen,
)


from urllib.error import (
    HTTPError,
    URLError,
)


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
# HTTP
# ==============================================================================

def acquire_html(
    *,
    url: str,
) -> tuple[
    str,
    int,
]:
    """
    Acquire one Listing page through normal HTTP.

    This function is PURE acquisition.

    It does NOT:

    - parse HTML
    - inspect product cards
    - call Django ORM
    - perform mapping
    - perform semantic processing
    """

    request = Request(
        url,
        headers={
            "User-Agent": USER_AGENT,
            "Accept": (
                "text/html,"
                "application/xhtml+xml,"
                "application/xml;"
                "q=0.9,"
                "*/*;"
                "q=0.8"
            ),
            "Accept-Language": (
                "ja-JP,"
                "ja;"
                "q=0.9,"
                "en-US;"
                "q=0.8,"
                "en;"
                "q=0.7"
            ),
        },
        method="GET",
    )

    try:

        with urlopen(
            request,
            timeout=TIMEOUT,
        ) as response:

            status_code = (
                response.status
                if response.status
                else 200
            )

            raw = response.read()

            content_type = (
                response.headers.get(
                    "Content-Type",
                    "",
                )
            )

    except HTTPError as e:

        raise RuntimeError(
            f"HTTP ERROR {e.code}: {url}"
        ) from e

    except URLError as e:

        raise RuntimeError(
            f"URL ERROR: {url} / {e.reason}"
        ) from e

    except TimeoutError as e:

        raise RuntimeError(
            f"HTTP TIMEOUT: {url}"
        ) from e

    # ==========================================================================
    # Decode
    # ==========================================================================

    charset = "utf-8"

    if (
        "charset="
        in content_type.lower()
    ):

        try:

            charset = (
                content_type
                .lower()
                .split(
                    "charset=",
                    1,
                )[1]
                .split(
                    ";",
                    1,
                )[0]
                .strip()
            )

        except (
            IndexError,
        ):

            charset = "utf-8"

    try:

        content = raw.decode(
            charset,
            errors="replace",
        )

    except (
        LookupError,
    ):

        content = raw.decode(
            "utf-8",
            errors="replace",
        )

    return (
        content,
        status_code,
    )


# ==============================================================================
# Persistence
# ==============================================================================

def save_document(
    *,
    slug: str,
    url: str,
    content: str,
    content_type: str,
) -> tuple[
    AcquisitionDocument,
    bool,
]:
    """
    Persist Listing Reality.

    One Seed = One Listing Document.
    """

    return (
        AcquisitionDocument.objects.update_or_create(

            source_type="scraping",

            source_name=SOURCE_NAME,

            document_type="listing",

            document_key=slug,

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
):
    """
    Return cached Listing AcquisitionDocument.
    """

    return (
        AcquisitionDocument.objects.filter(

            source_type="scraping",

            source_name=SOURCE_NAME,

            document_type="listing",

            document_key=slug,

        ).first()
    )


# ==============================================================================
# Acquire One Listing
# ==============================================================================

def acquire_page(
    *,
    slug: str,
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
        HTTP Acquire
            ↓
        HTTP COMPLETE
            ↓
        Django ORM
            ↓
        AcquisitionDocument
    """

    # ==========================================================================
    # Cache
    # ==========================================================================

    if not force:

        cached = get_cached_document(
            slug=slug,
        )

        if cached is not None:

            print(
                "  Status : CACHE"
            )

            print(
                f"  Key    : {slug}"
            )

            return (
                cached,
                False,
                True,
            )

    # ==========================================================================
    # HTTP Reality Acquisition
    # ==========================================================================

    print(
        "  Browser : HTTP"
    )

    content, status_code = (
        acquire_html(
            url=url,
        )
    )

    print(
        f"  HTTP   : {status_code}"
    )

    print(
        f"  HTML   : {len(content):,} bytes"
    )

    if not content:

        raise RuntimeError(
            f"Listing HTML is empty: {url}"
        )

    # ==========================================================================
    # Django ORM
    #
    # HTTP acquisition has completely finished.
    # ==========================================================================

    document, created = save_document(

        slug=slug,

        url=url,

        content=content,

        content_type="text/html",

    )

    print(
        f"  Key    : {slug}"
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
    Execute MOUSE Listing Acquire Runtime.

    Current acquisition boundary:

        Seed URL
            ↓
        HTTP GET
            ↓
        Listing HTML
            ↓
        AcquisitionDocument

    No pagination discovery is performed.
    """

    seeds = discover()

    print("=" * 70)

    print(
        "🌐 MOUSE LISTING ACQUIRE"
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

    created = 0

    updated = 0

    # ==========================================================================
    # Seed Runtime
    # ==========================================================================

    for seed_index, seed in enumerate(
        seeds,
        start=1,
    ):

        slug = (
            seed.get(
                "slug",
                "",
            )
            .strip()
        )

        url = (
            seed.get(
                "url",
                "",
            )
            .strip()
        )

        # ----------------------------------------------------------------------
        # Seed Validation
        # ----------------------------------------------------------------------

        if not slug:

            print()

            print(
                f"[{seed_index}/{len(seeds)}]"
            )

            print(
                "ERROR : Seed slug is empty"
            )

            failed += 1

            continue

        if not url:

            print()

            print(
                f"[{seed_index}/{len(seeds)}]"
            )

            print(
                f"ERROR : Seed URL is empty"
            )

            print(
                f"SLUG  : {slug}"
            )

            failed += 1

            continue

        # ==========================================================================
        # Listing
        # ==========================================================================

        print()

        print(
            "=" * 70
        )

        print(
            f"[{seed_index}/{len(seeds)}] "
            f"LISTING"
        )

        print(
            f"SLUG : {slug}"
        )

        print(
            f"URL  : {url}"
        )

        print(
            "=" * 70
        )

        try:

            (
                _document,
                is_created,
                success_flag,
            ) = acquire_page(

                slug=slug,

                url=url,

                force=force,

            )

            if not success_flag:

                failed += 1

                continue

            success += 1

            if is_created:

                created += 1

            else:

                updated += 1

        except Exception as e:

            print(
                f"ERROR : {e}"
            )

            failed += 1

    # ==========================================================================
    # Result
    # ==========================================================================

    print()

    print(
        "=" * 70
    )

    print(
        "MOUSE LISTING ACQUIRE RESULT"
    )

    print(
        "=" * 70
    )

    print(
        f"SEEDS   : {len(seeds)}"
    )

    print(
        f"SUCCESS : {success}"
    )

    print(
        f"FAILED  : {failed}"
    )

    print(
        f"CREATED : {created}"
    )

    print(
        f"UPDATED : {updated}"
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


# ==============================================================================
# Direct Execution
# ==============================================================================

if __name__ == "__main__":

    main()