#!/usr/bin/env python3

"""
==============================================================================
FILE:
    acquisition/sources/scraping/mouse/formatter_cards.py

SHIN CORE LINX

mouse Card Formatter Runtime

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


mouse Card Reality

    product_name
    product_url
    description
    specifications
    price
    image_url


Specification Reality is preserved as:

    list[str]

Example:

    [
        "Windows 11 Home 64ビット",
        "AMD Ryzen™ 7 7700 プロセッサ",
        "NVIDIA® GeForce RTX™ 5070",
        "32GB (16GB×2 / デュアルチャネル)",
        "2TB (NVMe Gen4×4)",
        "Wi-Fi 6E( 最大2.4Gbps )対応 IEEE 802.11 ax/ac/a/b/g/n準拠 ＋ Bluetooth 5内蔵",
        "3年間センドバック修理保証・24時間×365日電話サポート"
    ]


The Formatter MUST NOT translate these meanings.

The Formatter MUST preserve the published specification strings.

Semantic interpretation belongs to later Runtime stages.

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

    value = str(
        value,
    ).strip()

    value = value.replace(
        "販売価格",
        "",
    )

    value = value.replace(
        "標準構成",
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
        "〜",
        "",
    )

    value = value.replace(
        "~",
        "",
    )

    value = value.replace(
        ",",
        "",
    )

    return value.strip()


def normalize_text(
    value: str | None,
) -> str:
    """
    Normalize published text.

    Only remove unnecessary surrounding whitespace.
    """

    if value is None:
        return ""

    return str(
        value,
    ).strip()


def normalize_specifications(
    value,
) -> list[str]:
    """
    Normalize Published Specification Reality.

    IMPORTANT:

    This function does NOT translate specification meaning.

    It only guarantees:

        list[str]

    Published specification strings are preserved.

    Example:

        [
            "Windows 11 Home 64ビット",
            "AMD Ryzen™ 7 7700 プロセッサ",
            "NVIDIA® GeForce RTX™ 5070",
            "32GB (16GB×2 / デュアルチャネル)",
            "2TB (NVMe Gen4×4)"
        ]

    The Formatter MUST NOT convert these into:

        CPU
        GPU
        Memory
        Storage
        OS

    Such semantic interpretation belongs to later Runtime stages.
    """

    if not value:
        return []

    if not isinstance(
        value,
        list,
    ):
        return []

    specifications: list[str] = []

    for item in value:

        if not isinstance(
            item,
            str,
        ):
            continue

        normalized = normalize_text(
            item,
        )

        if not normalized:
            continue

        specifications.append(
            normalized,
        )

    return specifications


# ==============================================================================
# Card Reality Loader
# ==============================================================================

def load_observations() -> list[dict]:
    """
    Load persisted Card Reality.

    Source:

        AcquisitionDocument
            source_type = scraping
            source_name = mouse
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
                "ERROR : Invalid Card JSON"
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
                "ERROR : Invalid Card Reality"
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
    Normalize mouse Product Observation.

    Preserve Reality.
    Never translate meaning.
    """

    return {

        # ----------------------------------------------------------------------
        # Identity Reality
        # ----------------------------------------------------------------------

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

        # ----------------------------------------------------------------------
        # Description Reality
        # ----------------------------------------------------------------------

        "raw_description":
            normalize_text(
                observation.get(
                    "description",
                    "",
                ),
            ),

        # ----------------------------------------------------------------------
        # Commerce Reality
        # ----------------------------------------------------------------------

        "raw_price":
            normalize_price(
                observation.get(
                    "price",
                    "",
                ),
            ),

        # ----------------------------------------------------------------------
        # Media Reality
        # ----------------------------------------------------------------------

        "raw_image":
            normalize_text(
                observation.get(
                    "image_url",
                    "",
                ),
            ),

        # ----------------------------------------------------------------------
        # Specification Reality
        # ----------------------------------------------------------------------

        "raw_specs":
            normalize_specifications(
                observation.get(
                    "specifications",
                    [],
                ),
            ),
    }


# ==============================================================================
# Formatter Runtime
# ==============================================================================

def formatter() -> list[dict]:
    """
    Execute mouse Card Formatter Runtime.

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
        "mouse CARD FORMATTER"
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


# ==============================================================================
# Direct Execution
# ==============================================================================

if __name__ == "__main__":

    main()