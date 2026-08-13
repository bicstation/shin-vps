#!/usr/bin/env python3
"""
==============================================================================
SHIN CORE LINX

ARK Card Discovery Runtime

Catalog
        │
        ▼
Card Discovery Runtime
        │
        ▼
AcquisitionDocument (cards)

Reality First
Observation First

Responsibilities

- Discover Product Cards
- Preserve Card Reality
- Produce Card Runtime

Not Responsibilities

- Fetch
- Observation
- Formatter
- Mapper
- Integration

==============================================================================
"""

from __future__ import annotations

import json

from bs4 import BeautifulSoup

from api.models.acquisition_document import AcquisitionDocument

from acquisition.common.trace.reality_trace import (
    trace_pipeline,
)

from .settings import (
    SITE_NAME,
)

# ==============================================================================
# Runtime
# ==============================================================================

SOURCE_TYPE = "scraping"

DOCUMENT_INPUT = "catalog"

DOCUMENT_OUTPUT = "cards"


# ==============================================================================
# Persistence
# ==============================================================================

def save_cards(
    *,
    document_key: str,
    runtime: dict,
):

    return AcquisitionDocument.objects.update_or_create(

        source_type=SOURCE_TYPE,

        source_name=SITE_NAME,

        document_type=DOCUMENT_OUTPUT,

        document_key=document_key,

        defaults={

            "content_type": "application/json",

            "content": json.dumps(

                runtime,

                ensure_ascii=False,

                indent=2,

            ),

        },

    )


# ==============================================================================
# Runtime
# ==============================================================================

def discover(
    *,
    force: bool = False,
) -> None:

    trace_pipeline(
        "CARD DISCOVERY",
    )

    print()

    print("=" * 70)

    print(f"🃏 {SITE_NAME.upper()} CARD DISCOVERY")

    print("=" * 70)

    # --------------------------------------------------------------------------
    # ORM (READ ONLY)
    # --------------------------------------------------------------------------

    documents = list(

        AcquisitionDocument.objects

        .filter(

            source_type=SOURCE_TYPE,

            source_name=SITE_NAME,

            document_type=DOCUMENT_INPUT,

        )

        .order_by(

            "document_key",

        )

    )

    existing_keys = set(

        AcquisitionDocument.objects

        .filter(

            source_type=SOURCE_TYPE,

            source_name=SITE_NAME,

            document_type=DOCUMENT_OUTPUT,

        )

        .values_list(

            "document_key",

            flat=True,

        )

    )

    success: list[str] = []

    failed: list[tuple[str, str]] = []

    runtimes: list[dict] = []

    # --------------------------------------------------------------------------
    # Parse
    # --------------------------------------------------------------------------

    for document in documents:

        document_key = document.document_key

        if (

            not force

            and document_key in existing_keys

        ):

            print(

                f"[CACHE] {document_key}"

            )

            success.append(

                document_key,

            )

            continue

        print(

            document_key,

        )

        try:

            soup = BeautifulSoup(

                document.content,

                "html.parser",

            )

            page_cards = soup.select(

                ".mdl-card",

            )

            print(

                f"  HTML Cards : {len(page_cards)}"

            )

            if (

                document_key == "full"

            ):

                print(

                    f"  HTML Size  : {len(document.content):,}"

                )

            cards = []

            for card in page_cards:

                cards.append(

                    {

                        "source_url": document.source_url,

                        "html": str(card),

                    }

                )

            print(

                f"  Cards      : {len(cards)}"

            )

            runtimes.append(

                {

                    "document_key": document_key,

                    "runtime": {

                        "document_key": document_key,

                        "card_count": len(cards),

                        "cards": cards,

                    },

                }

            )

        except Exception as e:

            failed.append(

                (

                    document_key,

                    str(e),

                )

            )

            print(

                f"  ERROR : {e}"

            )

        print()

    # --------------------------------------------------------------------------
    # ORM (WRITE ONLY)
    # --------------------------------------------------------------------------

    for item in runtimes:

        _, created = save_cards(

            document_key=item["document_key"],

            runtime=item["runtime"],

        )

        print(

            f"{item['document_key']} : "

            f"{'CREATED' if created else 'UPDATED'}"

        )

        success.append(

            item["document_key"],

        )

    print("=" * 70)

    print("RESULT")

    print("=" * 70)

    print(

        f"SUCCESS : {len(success)}"

    )

    print(

        f"FAILED  : {len(failed)}"

    )

    print("=" * 70)


# ==============================================================================
# Entry Point
# ==============================================================================

def main(
    *,
    method: str = "default",
    mid: str | None = None,
    list_only: bool = False,
    force: bool = False,
) -> None:

    discover(

        force=force,

    )


if __name__ == "__main__":

    main()