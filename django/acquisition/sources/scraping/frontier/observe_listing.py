#!/usr/bin/env python3
"""
==============================================================================
FRONTIER Listing Observation Runtime

Listing HTML
        │
        ▼
Observe Card URL
        │
        ▼
AcquisitionDocument(card)

Reality First
Observation First

Responsibilities

- Observe Card URL
- Preserve Published URL
- Produce Card AcquisitionDocument

Not Responsibilities

- Product Observation
- Semantic Classification
- Runtime Contract
- Formatter
==============================================================================
"""

from __future__ import annotations

from bs4 import BeautifulSoup

from api.models import (
    AcquisitionDocument,
)

from acquisition.common.trace.reality_trace import (
    trace_pipeline,
)

from .settings import (
    BASE_URL,
    SITE_NAME,
)


# ==============================================================================
# Helpers
# ==============================================================================

def absolute_url(
    href: str,
) -> str:
    """
    Convert relative URL into absolute URL.
    """

    if href.startswith("/"):

        return BASE_URL + href

    return href


def document_key(
    url: str,
) -> str:
    """
    Create document key from URL.
    """

    return url.rstrip("/").split("/")[-1]


# ==============================================================================
# Observation Runtime
# ==============================================================================

def observe_listing():

    trace_pipeline(
        "LISTING OBSERVATION",
    )

    print("=" * 70)
    print(f"{SITE_NAME} LISTING OBSERVATION")
    print("=" * 70)

    created_count = 0
    updated_count = 0

    documents = (

        AcquisitionDocument.objects

        .filter(

            source_name=SITE_NAME.lower(),

            document_type="seed",

        )

        .order_by(

            "document_key",

        )

        .iterator()

    )

    seen = set()

    for document in documents:

        soup = BeautifulSoup(

            document.content,

            "html.parser",

        )

        cards = soup.select(

            "div.uk-card.uk-card-default.iw-card-border"

        )

        print()

        print(f"Seed  : {document.document_key}")
        print(f"Cards : {len(cards)}")

        for card in cards:

            for link in card.select("a[href]"):

                href = link.get(
                    "href",
                    "",
                ).strip()

                if not href:
                    continue

                url = absolute_url(
                    href,
                )

                if url in seen:
                    continue

                seen.add(
                    url,
                )

                key = document_key(
                    url,
                )

                _, created = (

                    AcquisitionDocument.objects

                    .update_or_create(

                        source_type="scraping",

                        source_name=SITE_NAME.lower(),

                        document_type="card",

                        document_key=key,

                        defaults={

                            "source_url": url,

                        },

                    )

                )

                if created:

                    created_count += 1

                    print(f"CREATE : {key}")

                else:

                    updated_count += 1

                    print(f"UPDATE : {key}")

    print()

    print("=" * 70)
    print("RESULT")
    print("=" * 70)
    print(f"Created : {created_count}")
    print(f"Updated : {updated_count}")
    print(f"Observed: {created_count + updated_count}")
    print("=" * 70)


# ==============================================================================
# Entry Point
# ==============================================================================

def main():

    observe_listing()


if __name__ == "__main__":

    main()