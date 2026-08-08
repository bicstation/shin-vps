#!/usr/bin/env python3
"""
==============================================================================
FILE:
    acquisition/sources/scraping/frontier/acquire_card.py

SHIN CORE LINX

FRONTIER Card Acquire Runtime

Reality First Pipeline

Card Reality
        │
        ▼
Acquire Runtime
        │
        ▼
AcquisitionDocument

Responsibilities

- Acquire Card HTML
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

from api.models import (
    AcquisitionDocument,
)

from acquisition.common.trace.reality_trace import (
    trace_pipeline,
)

from ..settings import (
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
    Persist Card Reality.
    """

    return AcquisitionDocument.objects.update_or_create(

        source_type="scraping",

        source_name=SOURCE_NAME,

        document_type="card",

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
    Execute Card Acquire Runtime.
    """

    print("=" * 70)
    print("🌐 FRONTIER CARD ACQUIRE")
    print("=" * 70)

    trace_pipeline(
        "CARD ACQUIRE",
    )

    documents = (

        AcquisitionDocument.objects

        .filter(

            source_type="scraping",

            source_name=SOURCE_NAME,

            document_type="card",

        )

        .order_by(

            "document_key",

        )

        .iterator()

    )

    session = create_session()

    success = 0
    failed = 0

    for index, document in enumerate(

        documents,

        start=1,

    ):

        slug = document.document_key

        url = document.source_url

        print(

            f"[{index}] {slug}"

        )

        #
        # Cache
        #

        if (

            not force

            and document.content

        ):

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

    print()

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