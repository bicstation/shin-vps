#!/usr/bin/env python3

"""
==============================================================================
FILE:
    acquisition/sources/scraping/dell/formatter_cards.py

SHIN CORE LINX

DELL Card Formatter Runtime

Reality First Pipeline

AcquisitionDocument
        │
        ▼
DELL Observation Runtime
        │
        ▼
Observed Reality
        │
        ▼
Card Formatter
        │
        ▼
Runtime Contract

Reality First
Observation First
Translation Authority
Semantic Later

Responsibilities

- Receive DELL Product Observation
- Normalize Published Reality
- Preserve Published Information
- Produce Runtime Contract

NOT

- HTML Parsing
- HTTP Acquisition
- BeautifulSoup
- Product Observation
- Runtime Mapping
- Semantic Processing
- Database Integration

IMPORTANT

Listing Observation Runtime has already performed:

    DELL HTML
        ↓
    Product Observation
        ↓
    Observation list

Therefore Formatter MUST NOT:

- read AcquisitionDocument.content
- call json.loads()
- call observe_listing()
- call observe()
- perform HTTP requests
- parse HTML

DELL Product Reality

    product_name
    product_url
    description
    specification
    price
    image_url

Specification Reality is preserved as:

    list[dict]

Example:

    [
        {
            "label": "プロセッサー",
            "value": "Intel Core Ultra 5 335"
        },
        {
            "label": "メモリー",
            "value": "16 GB LPDDR5x"
        }
    ]

The Formatter MUST NOT translate these meanings.
==============================================================================
"""

from __future__ import annotations

from acquisition.common.trace.reality_trace import (
    trace_pipeline,
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
    value: str,
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
) -> list[dict]:
    """
    Normalize Published Specification Reality.

    IMPORTANT:

    This function does NOT translate specification meaning.

    It only guarantees:

        list[dict]

    and preserves:

        label
        value
    """

    if not value:
        return []

    if not isinstance(
        value,
        list,
    ):
        return []

    specifications: list[dict] = []

    for item in value:

        if not isinstance(
            item,
            dict,
        ):
            continue

        label = normalize_text(
            item.get(
                "label",
                "",
            ),
        )

        specification_value = normalize_text(
            item.get(
                "value",
                "",
            ),
        )

        specifications.append(
            {
                "label": label,
                "value": specification_value,
            }
        )

    return specifications


# ==============================================================================
# Product Formatter
# ==============================================================================

def format_product(
    observation: dict,
) -> dict:
    """
    Normalize DELL Product Observation.

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

def formatter(
    observations: list[dict],
) -> list[dict]:
    """
    Execute DELL Product Formatter Runtime.

    Input:

        Observation Runtime

    Output:

        Runtime Contracts

    Pipeline:

        DELL HTML
             ↓
        Observation Runtime
             ↓
        observations
             ↓
        Card Formatter
             ↓
        Runtime Contracts
    """

    trace_pipeline(
        "DELL CARD FORMATTER",
    )

    print()

    print(
        "=" * 70
    )

    print(
        "DELL CARD FORMATTER"
    )

    print(
        "=" * 70
    )

    print(
        f"INPUT OBSERVATIONS : "
        f"{len(observations)}"
    )

    runtimes: list[dict] = []

    for index, observation in enumerate(
        observations,
        start=1,
    ):

        runtime = format_product(
            observation,
        )

        runtimes.append(
            runtime,
        )

        print()

        print(
            f"[{index:03}] "
            f"{observation.get('document_key', '')}"
        )

        print(
            f"FORMAT : "
            f"{observation.get('format', '')}"
        )

        print(
            f"SPECS  : "
            f"{len(runtime['raw_specs'])}"
        )

        print(
            f"TITLE  : "
            f"{runtime['raw_title']}"
        )

    # ==========================================================================
    # Result
    # ==========================================================================

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
        f"Product Observations : "
        f"{len(observations)}"
    )

    print(
        f"Runtime Contracts    : "
        f"{len(runtimes)}"
    )

    print(
        "=" * 70
    )

    return runtimes


# ==============================================================================
# Entry Point
# ==============================================================================

def main(
    observations: list[dict] | None = None,
):
    """
    Runtime Entry Point.

    Direct execution without observations is intentionally unsupported.

    The Pipeline owns Observation acquisition.
    """

    if observations is None:

        raise RuntimeError(
            "DELL Formatter requires "
            "Observation Runtime output."
        )

    return formatter(
        observations,
    )


if __name__ == "__main__":

    main()