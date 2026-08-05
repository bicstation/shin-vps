#!/usr/bin/env python3
"""
==============================================================================
SHIN CORE LINX

ARK Card Discovery Runtime

Catalog Runtime

AcquisitionDocument (catalog_runtime)
        │
        ▼
Card Discovery Runtime
        │
        ▼
AcquisitionDocument (cards)

Reality First
Observation First

Responsibilities

- Discover Published Product Cards
- Preserve Card Reality
- Produce Card Runtime

Not Responsibilities

- Observation
- Formatter
- Mapper
- Integration

==============================================================================
"""

from __future__ import annotations

import json

import requests
from bs4 import BeautifulSoup

from api.models.acquisition_document import AcquisitionDocument

from acquisition.common.trace.reality_trace import (
    trace_pipeline,
)

from .settings import (
    SITE_NAME,
    USER_AGENT,
    TIMEOUT,
)

# ==============================================================================
# Runtime
# ==============================================================================

SOURCE_TYPE = "scraping"

DOCUMENT_INPUT = "catalog_runtime"

DOCUMENT_OUTPUT = "cards"


# ==============================================================================
# Cache
# ==============================================================================

def exists(
    document_key: str,
) -> bool:

    return AcquisitionDocument.objects.filter(

        source_type=SOURCE_TYPE,

        source_name=SITE_NAME,

        document_type=DOCUMENT_OUTPUT,

        document_key=document_key,

    ).exists()


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

    headers = {

        "User-Agent": USER_AGENT,

    }

    documents = (

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

    success = []

    failed = []

    for document in documents:

        document_key = document.document_key

        if (

            not force

            and exists(
                document_key,
            )

        ):

            print(
                f"[CACHE] {document_key}",
            )

            success.append(
                document_key,
            )

            continue

        print(document_key)

        try:

            catalog_runtime = json.loads(

                document.content,

            )

            cards = []

            for page in catalog_runtime["pages"]:

                response = requests.get(

                    page["url"],

                    headers=headers,

                    timeout=TIMEOUT,

                )

                response.raise_for_status()

                soup = BeautifulSoup(

                    response.text,

                    "html.parser",

                )

                page_cards = soup.select(

                    ".mdl-card",

                )

                print(

                    f"  Page {page['page']:>2} : {len(page_cards)} cards"

                )

                for card in page_cards:

                    cards.append(

                        {

                            "page": page["page"],

                            "source_url": page["url"],

                            "html": str(card),

                        }

                    )

            runtime = {

                "document_key": document_key,

                "card_count": len(cards),

                "cards": cards,

            }

            _, created = save_cards(

                document_key=document_key,

                runtime=runtime,

            )

            print(

                f"  Total : {len(cards)} cards"

            )

            print(

                f"  Saved : {'CREATED' if created else 'UPDATED'}"

            )

            success.append(
                document_key,
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