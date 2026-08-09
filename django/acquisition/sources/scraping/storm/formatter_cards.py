#!/usr/bin/env python3

"""
==============================================================================
FILE:
    acquisition/sources/scraping/storm/formatter_cards.py

SHIN CORE LINX

STORM Card Formatter Runtime

Reality First Pipeline

AcquisitionDocument(card)
│
▼
Observed Reality
│
▼
Runtime Contract

Reality First
Observation First
Translation Authority
Semantic Later

Responsibilities

- Read Card AcquisitionDocument
- Normalize Published Reality
- Preserve Published Information
- Produce Runtime Contract

NOT Responsibilities

- HTML Parsing
- HTTP Acquisition
- BeautifulSoup
- Product Observation
- Runtime Mapping
- Semantic Processing
- Database Integration

IMPORTANT

Listing Observation Runtime has already performed:

    Listing HTML
        ↓
    Product Card Observation
        ↓
    AcquisitionDocument(card)

Therefore Formatter MUST NOT:

- call observe_listing()
- call observe()
- perform HTTP requests
- parse HTML

Formatter reads persisted Card Reality only.

==============================================================================
"""

from __future__ import annotations


import json


from api.models import (
    AcquisitionDocument,
)


from acquisition.common.trace.reality_trace import (
    trace_pipeline,
)


from .settings import (
    SOURCE_NAME,
)


# ==============================================================================
# Helpers
# ==============================================================================


def normalize_price(
    value: str,
) -> str:
    """
    Normalize Published Price.

    Preserve numeric price information.
    Do not assign semantic meaning.
    """

    if not value:
        return ""

    value = value.strip()

    value = value.replace(
        "販売価格",
        "",
    )

    value = value.replace(
        "（税込）",
        "",
    )

    value = value.replace(
        "(税込)",
        "",
    )

    value = value.replace(
        "円",
        "",
    )

    value = value.replace(
        ",",
        "",
    )

    return value.strip()


def normalize_text(
    value: str,
) -> str:
    """
    Normalize published text.

    Only remove unnecessary surrounding whitespace.
    """

    if not value:
        return ""

    return value.strip()


# ==============================================================================
# Card Reality Loader
# ==============================================================================


def load_observations() -> list[dict]:
    """
    Load persisted Card Reality.

    Source:

        AcquisitionDocument
            source_type = scraping
            source_name = STORM
            document_type = card

    Card content is JSON produced by
    Listing Observation Runtime.
    """

    documents = (

        AcquisitionDocument.objects

        .filter(

            source_type="scraping",

            source_name=SOURCE_NAME,

            document_type="card",

        )

        .exclude(

            content="",

        )

        .order_by(
            "document_key",
        )

    )

    observations: list[dict] = []

    for document in documents:

        try:

            observation = json.loads(
                document.content,
            )

        except json.JSONDecodeError as e:

            print()

            print(
                f"ERROR : Invalid Card JSON"
            )

            print(
                f"        Key : "
                f"{document.document_key}"
            )

            print(
                f"        {e}"
            )

            continue

        if not isinstance(
            observation,
            dict,
        ):

            print()

            print(
                f"ERROR : Invalid Card Reality"
            )

            print(
                f"        Key : "
                f"{document.document_key}"
            )

            continue

        observations.append(
            observation,
        )

    return observations


# ==============================================================================
# Product Formatter
# ==============================================================================


def format_product(
    observation: dict,
) -> dict:
    """
    Normalize STORM Product Observation.

    Preserve Reality.
    Never translate meaning.
    """

    return {

        # ------------------------------------------------------------------
        # Identity Reality
        # ------------------------------------------------------------------

        "raw_title":
            normalize_text(
                observation.get(
                    "product_name",
                    "",
                ),
            ),

        "raw_detail_url":
            normalize_text(
                observation.get(
                    "product_url",
                    "",
                ),
            ),

        # ------------------------------------------------------------------
        # Commerce Reality
        # ------------------------------------------------------------------

        "raw_price":
            normalize_price(
                observation.get(
                    "price",
                    "",
                ),
            ),

        "raw_stock":
            normalize_text(
                observation.get(
                    "stock_status",
                    "",
                ),
            ),

        # ------------------------------------------------------------------
        # Media Reality
        # ------------------------------------------------------------------

        "raw_image":
            normalize_text(
                observation.get(
                    "image_url",
                    "",
                ),
            ),

        # ------------------------------------------------------------------
        # Specification Reality
        # ------------------------------------------------------------------

        "raw_specs":
            normalize_text(
                observation.get(
                    "specification",
                    "",
                ),
            ),
    }


# ==============================================================================
# Formatter Runtime
# ==============================================================================


def formatter() -> list[dict]:
    """
    Execute STORM Card Formatter Runtime.

    Pipeline:

        AcquisitionDocument(card)
                    ↓
              JSON Reality
                    ↓
                Formatter
                    ↓
            Runtime Contract
    """

    trace_pipeline(
        "CARD FORMATTER",
    )

    print()

    print(
        "=" * 70
    )

    print(
        "STORM CARD FORMATTER"
    )

    print(
        "=" * 70
    )

    observations = load_observations()

    runtimes: list[dict] = []

    for observation in observations:

        runtime = format_product(
            observation,
        )

        runtimes.append(
            runtime,
        )

        print(
            f"FORMAT : "
            f"{runtime['raw_title']}"
        )

    print()

    print(
        "=" * 70
    )

    print(
        "RESULT"
    )

    print(
        "=" * 70
    )

    print(
        f"Card Observations : "
        f"{len(observations)}"
    )

    print(
        f"Runtime Contracts : "
        f"{len(runtimes)}"
    )

    print(
        "=" * 70
    )

    return runtimes


# ==============================================================================
# Entry Point
# ==============================================================================


def main():
    """
    Runtime Entry Point.
    """

    return formatter()


if __name__ == "__main__":

    main()