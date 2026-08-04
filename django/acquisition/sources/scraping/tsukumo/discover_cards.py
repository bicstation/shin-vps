#!/usr/bin/env python3
"""
==============================================================================
SHIN CORE LINX

TSUKUMO Card Discovery

Catalog Runtime

AcquisitionDocument (catalog_runtime)
        │
        ▼
Catalog Runtime
        │
        ▼
Product Card Discovery
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

from bs4 import BeautifulSoup

from api.models.acquisition_document import AcquisitionDocument
from acquisition.common.trace.reality_trace import trace_pipeline
from .settings import SITE_NAME


# ==============================================================================
# Runtime
# ==============================================================================

DOCUMENT_INPUT = "catalog_runtime"
DOCUMENT_OUTPUT = "cards"


# ==============================================================================
# Cache
# ==============================================================================

def exists(document_key: str) -> bool:

    return AcquisitionDocument.objects.filter(
        source_type="scraping",
        source_name=SITE_NAME.lower(),
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

    document, created = AcquisitionDocument.objects.update_or_create(

        source_type="scraping",
        source_name=SITE_NAME.lower(),
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

    return document, created


# ==============================================================================
# Runtime
# ==============================================================================

def discover(
    *,
    force: bool = False,
) -> None:

    trace_pipeline("CARD DISCOVERY")

    print("=" * 70)
    print(f"🃏 {SITE_NAME} CARD DISCOVERY")
    print("=" * 70)

    documents = (
        AcquisitionDocument.objects
        .filter(
            source_type="scraping",
            source_name=SITE_NAME.lower(),
            document_type=DOCUMENT_INPUT,
        )
        .order_by("document_key")
    )

    success: list[str] = []
    failed: list[tuple[str, str]] = []

    for document in documents:

        document_key = document.document_key

        if not force and exists(document_key):

            success.append(document_key)
            print(f"[CACHE] {document_key}")
            continue

        print(document_key)

        try:
            
            # -----------------------------------------------------------------------------
            # Catalog Runtime
            # -----------------------------------------------------------------------------

            catalog_runtime = json.loads(
                document.content,
            )

            html = catalog_runtime["html"]

            #
            # Schema Check
            #

            has_sku = 'itemprop="sku"' in html
            has_desc = 'itemprop="description"' in html
            has_price = 'itemprop="price"' in html
            has_image = 'itemprop="image"' in html
            has_avail = 'itemprop="availability"' in html

            print("=" * 70)
            print("CATALOG RUNTIME")
            print("=" * 70)

            print(f"HTML Length    : {len(html):,}")
            print(f"SKU Meta       : {has_sku}")
            print(f"DESC Meta      : {has_desc}")
            print(f"PRICE Meta     : {has_price}")
            print(f"IMAGE Meta     : {has_image}")
            print(f"AVAIL Meta     : {has_avail}")

            # -----------------------------------------------------------------------------
            # Parse
            # -----------------------------------------------------------------------------

            soup = BeautifulSoup(
                html,
                "html.parser",
            )

            selector_cards = soup.select(
                ".search-box__product",
            )

            print(f"Selector Count : {len(selector_cards)}")

            # -----------------------------------------------------------------------------
            # Card Discovery
            # -----------------------------------------------------------------------------

            cards: list[dict] = []

            for card in selector_cards:

                cards.append(
                    {
                        "html": str(card),
                    }
                )

            runtime = {
                "document_key": document_key,
                "cards": cards,
            }

            _, created = save_cards(
                document_key=document_key,
                runtime=runtime,
            )

            success.append(
                document_key,
            )

            print(f"Cards          : {len(cards)}")

            if cards:

                first_html = cards[0]["html"]

                first_has_sku = 'itemprop="sku"' in first_html
                first_has_desc = 'itemprop="description"' in first_html
                first_has_price = 'itemprop="price"' in first_html
                first_has_image = 'itemprop="image"' in first_html
                first_has_avail = 'itemprop="availability"' in first_html

                print(f"First Card     : {len(first_html):,} chars")

                print("-" * 70)
                print("FIRST CARD CHECK")
                print("-" * 70)

                print(f"SKU Meta       : {first_has_sku}")
                print(f"DESC Meta      : {first_has_desc}")
                print(f"PRICE Meta     : {first_has_price}")
                print(f"IMAGE Meta     : {first_has_image}")
                print(f"AVAIL Meta     : {first_has_avail}")

                print("-" * 70)
                print("HEAD")
                print("-" * 70)
                print(first_html[:500])

                print("-" * 70)
                print("TAIL")
                print("-" * 70)
                print(first_html[-1000:])

                print("-" * 70)
                print("DIAGNOSIS")
                print("-" * 70)

                if not has_sku and not first_has_sku:
                    print("Catalog Runtime ❌  Card Discovery ❌")
                    print("→ HTML取得時点でSKU Metaが存在しない可能性")

                elif has_sku and not first_has_sku:
                    print("Catalog Runtime ✅  Card Discovery ❌")
                    print("→ Card Discovery(BeautifulSoup/Selector)で欠落")

                elif has_sku and first_has_sku:
                    print("Catalog Runtime ✅  Card Discovery ✅")
                    print("→ Observation Runtime以降を調査")

                else:
                    print("Catalog Runtime ❌  Card Discovery ✅")
                    print("→ 想定外の状態")

            print(
                f"Saved          : {'CREATED' if created else 'UPDATED'}"
            )


        except Exception as e:

            failed.append(
                (
                    document_key,
                    str(e),
                )
            )

            print("Status : ERROR")
            print(f"Reason : {e}")

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

def main(**kwargs) -> None:

    discover(
        force=kwargs.get(
            "force",
            False,
        ),
    )


if __name__ == "__main__":

    main()