#!/usr/bin/env python3
"""
==============================================================================
FILE:
    acquisition/sources/scraping/frontier/acquire_listing.py

SHIN CORE LINX

FRONTIER Listing Acquire Runtime

Reality First Pipeline

Seed Reality
        │
        ▼
Acquire Runtime
        │
        ▼
AcquisitionDocument

Responsibilities

- Acquire Listing HTML
- Persist AcquisitionDocument
- Preserve Reality

NOT Responsibilities

- HTML Parsing
- Observation
- Formatter
- Mapper
- Semantic
- Product Building

==============================================================================
"""

from __future__ import annotations

import requests

from api.models import AcquisitionDocument

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
# Persistence
# ==============================================================================

def save_document(
    *,
    slug: str,
    url: str,
    response: requests.Response,
) -> tuple[AcquisitionDocument, bool]:
    """
    Persist Listing Reality.
    """

    return AcquisitionDocument.objects.update_or_create(

        source_type="scraping",

        source_name=SOURCE_NAME,

        document_type="seed",

        document_key=slug,

        defaults={

            "source_url": url,

            "content_type": response.headers.get(
                "Content-Type",
                "text/html",
            ),

            "content": response.text,

        },

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
# Runtime
# ==============================================================================

def acquire(
    *,
    force: bool = False,
) -> None:
    """
    Execute Listing Acquire Runtime.
    """

    seeds = discover()

    print("=" * 70)
    print("🌐 FRONTIER LISTING ACQUIRE")
    print("=" * 70)
    print(f"Target : {len(seeds)}")
    print("=" * 70)

    trace_pipeline(
        "ACQUIRE",
    )

    success = 0
    failed = 0

    session = create_session()

    for index, seed in enumerate(
        seeds,
        start=1,
    ):

        slug = seed["slug"]

        url = seed["url"]

        print(
            f"[{index}/{len(seeds)}] {slug}"
        )

        #
        # Cache
        #

        if not force:

            exists = AcquisitionDocument.objects.filter(

                source_type="scraping",

                source_name=SOURCE_NAME,

                document_type="seed",

                document_key=slug,

            ).exists()

            if exists:

                print("  Status : CACHE")
                print()

                success += 1

                continue

        #
        # HTTP Fetch
        #

        try:

            response = session.get(

                url,

                timeout=TIMEOUT,

            )

            response.raise_for_status()

            _, created = save_document(

                slug=slug,

                url=url,

                response=response,

            )

            print(
                f"  HTTP   : {response.status_code}"
            )

            print(
                f"  Saved  : {'CREATED' if created else 'UPDATED'}"
            )

            print()

            success += 1

        except Exception as e:

            print(
                f"  ERROR  : {e}"
            )

            print()

            failed += 1
           
        print("=" * 70)
        print("RESULT")
        print("=" * 70)
        print(f"SUCCESS : {success}")
        print(f"FAILED  : {failed}")
        print("=" * 70)


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

