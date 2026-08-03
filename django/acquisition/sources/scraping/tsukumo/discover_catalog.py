#!/usr/bin/env python3
"""
==============================================================================
SHIN CORE LINX

TSUKUMO Catalog Discovery

Acquire Runtime

AcquisitionDocument (catalog)
        │
        ▼
Catalog HTML
        │
        ▼
Series Discovery
        │
        ▼
AcquisitionDocument (series)

Reality First
Observation First

Responsibilities

- Discover Published Series
- Preserve Reality
- Produce Series AcquisitionDocument

Not Responsibilities

- Card Discovery
- Observation
- Formatter
- Mapper
- Integration
==============================================================================
"""

from __future__ import annotations

import json

from bs4 import BeautifulSoup

from api.models.acquisition_document import (
    AcquisitionDocument,
)

from acquisition.common.trace.reality_trace import (
    trace_pipeline,
)

from .settings import (
    SITE_NAME,
)


# ==============================================================================
# Acquisition
# ==============================================================================

DOCUMENT_INPUT = "catalog"

DOCUMENT_OUTPUT = "series"


# ==============================================================================
# Cache
# ==============================================================================

def exists(
    slug: str,
) -> bool:

    return AcquisitionDocument.objects.filter(

        source_type="scraping",

        source_name=SITE_NAME.lower(),

        document_type=DOCUMENT_OUTPUT,

        document_key=slug,

    ).exists()


# ==============================================================================
# Persistence
# ==============================================================================

def save_series(
    *,
    slug: str,
    observation: dict,
) -> tuple[AcquisitionDocument, bool]:

    document, created = AcquisitionDocument.objects.update_or_create(

        source_type="scraping",

        source_name=SITE_NAME.lower(),

        document_type=DOCUMENT_OUTPUT,

        document_key=slug,

        defaults={

            "content_type": "application/json",

            "content": json.dumps(

                observation,

                ensure_ascii=False,

                indent=2,

            ),

        },

    )

    return document, created


# ==============================================================================
# Runtime
# ==============================================================================

def discover(
    *,
    force: bool = False,
) -> None:

    trace_pipeline(
        "SERIES DISCOVERY",
    )

    print("=" * 70)
    print(f"🔎 {SITE_NAME} SERIES DISCOVERY")
    print("=" * 70)

    documents = (

        AcquisitionDocument.objects

        .filter(

            source_type="scraping",

            source_name=SITE_NAME.lower(),

            document_type=DOCUMENT_INPUT,

        )

        .order_by(

            "document_key",

        )

    )

    success: list[str] = []

    failed: list[tuple[str, str]] = []

    for document in documents:

        slug = document.document_key

        if not force and exists(slug):

            success.append(slug)

            print(f"[CACHE] {slug}")

            continue

        print(slug)

        try:

            soup = BeautifulSoup(

                document.content,

                "html.parser",

            )

            observation = {

                "slug": slug,

                "title": soup.title.get_text(
                    strip=True,
                ) if soup.title else "",

                "html_length": len(
                    document.content,
                ),

            }

            _, created = save_series(

                slug=slug,

                observation=observation,

            )

            success.append(
                slug,
            )

            print(
                f"  Title : {observation['title']}"
            )

            print(
                f"  HTML  : {observation['html_length']:,} chars"
            )

            print(
                f"  Saved : {'CREATED' if created else 'UPDATED'}"
            )

        except Exception as e:

            failed.append(
                (
                    slug,
                    str(e),
                )
            )

            print(
                "  Status : ERROR"
            )

            print(
                f"  Reason : {e}"
            )

        print()

    print("=" * 70)
    print("RESULT")
    print("=" * 70)
    print(f"SUCCESS : {len(success)}")
    print(f"FAILED  : {len(failed)}")
    print("=" * 70)


# ==============================================================================
# Entry Point
# ==============================================================================

def main(
    **kwargs,
) -> None:

    discover(
        force=kwargs.get(
            "force",
            False,
        ),
    )


if __name__ == "__main__":

    main()