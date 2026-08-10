#!/usr/bin/env python3

"""
==============================================================================
FILE:
    acquisition/sources/scraping/fujitsu/acquire_listing.py

SHIN CORE LINX

FUJITSU / FMV Manufacturer Reality Acquire Runtime

Reality First Pipeline

PCProduct DB
        │
        ▼
Seed Reality
        │
        ▼
URL Resolver Runtime
        │
        ▼
FUJITSU / FMV Official Product URL
        │
        ▼
HTTP Acquisition
        │
        ▼
HTML Reality
        │
        ▼
AcquisitionDocument
        │
        ▼
Listing Observation Runtime


Reality First
Observation First
Translation Authority
Semantic Later


Responsibilities

- Acquire FUJITSU / FMV Manufacturer HTML
- Resolve FUJITSU / FMV official URL
- Preserve raw HTML
- Persist AcquisitionDocument
- Preserve product identity
- Execute HTTP acquisition

NOT Responsibilities

- HTML Parsing
- Product Observation
- Specification Classification
- Formatter
- Mapper
- Semantic
- Product Building
- AI Analysis


IMPORTANT

FUJITSU / FMV does NOT use the normal
seed.tsv → listing page model.

The Runtime receives existing PCProduct records through
discover_seed.py.

The FUJITSU / FMV affiliate URL is resolved by:

    url_resolver.py

The resulting FUJITSU / FMV official URL is then acquired directly.

Pagination is NOT performed here.

Each PCProduct represents one Manufacturer Reality target.

==============================================================================
"""

from __future__ import annotations


import requests


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


from .url_resolver import (
    resolve_manufacturer_url,
)


# ==============================================================================
# Runtime Safety
# ==============================================================================

REQUEST_TIMEOUT = TIMEOUT


# ==============================================================================
# HTTP
# ==============================================================================

def acquire_http(
    *,
    url: str,
) -> tuple[str, int, str]:
    """
    Acquire one FUJITSU / FMV Manufacturer page.

    Returns
    -------

    content:
        Raw HTML.

    status_code:
        HTTP status code.

    content_type:
        Response Content-Type.
    """

    response = requests.get(

        url,

        headers={
            "User-Agent": USER_AGENT,
            "Accept-Language": "ja-JP,ja;q=0.9,en;q=0.8",
        },

        timeout=REQUEST_TIMEOUT,

        allow_redirects=True,

    )

    response.raise_for_status()

    content = response.text

    content_type = (
        response.headers.get(
            "Content-Type",
            "text/html",
        )
    )

    return (
        content,
        response.status_code,
        content_type,
    )


# ==============================================================================
# Persistence
# ==============================================================================

def save_document(
    *,
    unique_id: str,
    manufacturer_url: str,
    content: str,
    content_type: str,
) -> tuple[
    AcquisitionDocument,
    bool,
]:
    """
    Persist FUJITSU / FMV Manufacturer Reality.

    Django ORM is intentionally isolated from HTTP acquisition.

    Returns
    -------

    document:
        Persisted AcquisitionDocument.

    created:
        True when a new document was created.
        False when an existing document was updated.
    """

    document_key = (
        f"product__{unique_id}"
    )

    return (
        AcquisitionDocument.objects.update_or_create(

            source_type="scraping",

            source_name=SOURCE_NAME,

            document_type="product",

            document_key=document_key,

            defaults={

                "source_url": manufacturer_url,

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
    unique_id: str,
):
    """
    Return cached FUJITSU / FMV Manufacturer
    AcquisitionDocument.
    """

    document_key = (
        f"product__{unique_id}"
    )

    return (
        AcquisitionDocument.objects.filter(

            source_type="scraping",

            source_name=SOURCE_NAME,

            document_type="product",

            document_key=document_key,

        ).first()
    )


# ==============================================================================
# Acquire One Product
# ==============================================================================

def acquire_product(
    *,
    seed: dict[str, str],
    force: bool = False,
) -> tuple[
    AcquisitionDocument | None,
    bool,
    bool,
]:
    """
    Acquire one FUJITSU / FMV Manufacturer Reality target.

    Runtime order:

        Seed
            ↓
        URL Resolver
            ↓
        FUJITSU / FMV Official URL
            ↓
        HTTP
            ↓
        AcquisitionDocument

    Returns
    -------

    document:
        AcquisitionDocument or None.

    success:
        True when acquisition succeeds.

    created:
        True when a new AcquisitionDocument was created.
        False when an existing document was updated or cached.
    """

    unique_id = (
        seed.get(
            "unique_id",
            "",
        )
        or ""
    ).strip()

    name = (
        seed.get(
            "name",
            "",
        )
        or ""
    ).strip()

    affiliate_url = (
        seed.get(
            "affiliate_url",
            "",
        )
        or ""
    ).strip()

    # ==========================================================================
    # Validation
    # ==========================================================================

    if not unique_id:

        print(
            "  SKIP : unique_id missing"
        )

        return (
            None,
            False,
            False,
        )

    if not affiliate_url:

        print(
            f"  SKIP [{unique_id}] "
            "affiliate_url missing"
        )

        return (
            None,
            False,
            False,
        )

    # ==========================================================================
    # Cache
    # ==========================================================================

    if not force:

        cached = get_cached_document(
            unique_id=unique_id,
        )

        if cached is not None:

            print(
                "  Status : CACHE"
            )

            print(
                f"  Key    : "
                f"product__{unique_id}"
            )

            return (
                cached,
                True,
                False,
            )

    # ==========================================================================
    # URL Resolver
    # ==========================================================================

    manufacturer_url = (
        resolve_manufacturer_url(
            affiliate_url,
        )
    )

    if not manufacturer_url:

        print(
            f"  SKIP [{unique_id}] "
            "Manufacturer URL not resolved"
        )

        return (
            None,
            False,
            False,
        )

    print(
        f"  URL    : {manufacturer_url}"
    )

    # ==========================================================================
    # HTTP Acquisition
    # ==========================================================================

    print(
        "  Browser : HTTP"
    )

    try:

        content, status_code, content_type = (
            acquire_http(
                url=manufacturer_url,
            )
        )

    except requests.RequestException as exc:

        print(
            f"  ERROR  : {exc}"
        )

        return (
            None,
            False,
            False,
        )

    # ==========================================================================
    # HTTP Result
    # ==========================================================================

    print(
        f"  HTTP   : {status_code}"
    )

    print(
        f"  HTML   : {len(content):,} bytes"
    )

    print(
        f"  Type   : {content_type}"
    )

    if not content:

        print(
            "  ERROR  : Empty HTML"
        )

        return (
            None,
            False,
            False,
        )

    # ==========================================================================
    # Persistence
    # ==========================================================================

    document, created = save_document(

        unique_id=unique_id,

        manufacturer_url=manufacturer_url,

        content=content,

        content_type=content_type,

    )

    print(
        f"  Key    : "
        f"product__{unique_id}"
    )

    print(
        "  Saved  : "
        f"{'CREATED' if created else 'UPDATED'}"
    )

    return (
        document,
        True,
        created,
    )


# ==============================================================================
# Runtime
# ==============================================================================

def acquire(
    *,
    force: bool = False,
) -> None:
    """
    Execute FUJITSU / FMV Manufacturer Reality
    Acquisition Runtime.

    Target:

        All existing FUJITSU PCProduct records.

    Flow:

        PCProduct
            ↓
        Seed Reality
            ↓
        URL Resolver
            ↓
        FUJITSU / FMV Official URL
            ↓
        HTTP
            ↓
        AcquisitionDocument
    """

    seeds = discover()

    print(
        "=" * 70
    )

    print(
        "🌐 FUJITSU / FMV MANUFACTURER REALITY ACQUIRE"
    )

    print(
        "=" * 70
    )

    print(
        f"Target : {len(seeds)}"
    )

    print(
        "=" * 70
    )

    trace_pipeline(
        "ACQUIRE",
    )

    success = 0

    failed = 0

    skipped = 0

    created = 0

    updated = 0

    # ==========================================================================
    # Product Runtime
    # ==========================================================================

    for index, seed in enumerate(
        seeds,
        start=1,
    ):

        unique_id = (
            seed.get(
                "unique_id",
                "",
            )
            or ""
        )

        name = (
            seed.get(
                "name",
                "",
            )
            or ""
        )

        print()

        print(
            "=" * 70
        )

        print(
            f"[{index}/{len(seeds)}] PRODUCT"
        )

        print(
            f"ID   : {unique_id}"
        )

        print(
            f"NAME : {name}"
        )

        print(
            "=" * 70
        )

        try:

            (
                document,
                success_flag,
                was_created,
            ) = acquire_product(

                seed=seed,

                force=force,

            )

        except Exception as exc:

            print(
                f"  ERROR : {exc}"
            )

            failed += 1

            continue

        if not success_flag:

            skipped += 1

            continue

        success += 1

        # ----------------------------------------------------------------------
        # Created / Updated
        # ----------------------------------------------------------------------

        if document is not None:

            if was_created:

                created += 1

            else:

                updated += 1

    # ==========================================================================
    # Result
    # ==========================================================================

    print()

    print(
        "=" * 70
    )

    print(
        "FUJITSU / FMV MANUFACTURER REALITY ACQUIRE RESULT"
    )

    print(
        "=" * 70
    )

    print(
        f"PRODUCTS : {len(seeds)}"
    )

    print(
        f"SUCCESS  : {success}"
    )

    print(
        f"FAILED   : {failed}"
    )

    print(
        f"SKIPPED  : {skipped}"
    )

    print(
        f"CREATED  : {created}"
    )

    print(
        f"UPDATED  : {updated}"
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