#!/usr/bin/env python3
"""
==============================================================================
FILE:
    acquisition/sources/scraping/frontier/formatter_cards.py

SHIN CORE LINX

FRONTIER Card Formatter Runtime

Reality First Pipeline

Observation
        │
        ▼
Runtime Contract

Reality First
Observation First

Responsibilities

- Normalize Published Reality
- Preserve Published Information
- Produce Runtime Contract

NOT Responsibilities

- HTML Parsing
- HTTP Acquisition
- BeautifulSoup
- Runtime Mapping
- Semantic Processing
- Database Integration

==============================================================================
"""

from __future__ import annotations

from acquisition.common.trace.reality_trace import (
    trace_pipeline,
)

from .observe_card import (
    observe,
)

# ==============================================================================
# Helpers
# ==============================================================================

def normalize_price(
    value: str,
) -> str:
    """
    Normalize Published Price.
    """

    if not value:

        return ""

    value = value.replace(
        "販売価格",
        "",
    )

    value = value.replace(
        "（税込）",
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


# ==============================================================================
# Product Formatter
# ==============================================================================

def format_product(
    observation: dict,
) -> dict:
    """
    Normalize Product Observation.

    Preserve Reality.
    Never translate meaning.
    """

    return {

        #
        # Identity Reality
        #

        "raw_title":

            observation["product_code"],

        "raw_detail_url":

            observation["product_url"],

        #
        # Commerce Reality
        #

        "raw_price":

            normalize_price(

                observation["price"],

            ),

        #
        # Media Reality
        #

        "raw_image":

            observation["image_url"],

        #
        # Specification Reality
        #

        "raw_specs":

            observation["specifications"],

    }


# ==============================================================================
# Formatter Runtime
# ==============================================================================

def formatter():
    """
    Execute Card Formatter Runtime.
    """

    trace_pipeline(
        "CARD FORMATTER",
    )

    print("=" * 70)
    print("FRONTIER CARD FORMATTER")
    print("=" * 70)

    observations = observe()

    runtimes = []

    for observation in observations:

        runtime = format_product(

            observation,

        )

        runtimes.append(

            runtime,

        )

        print(

            runtime["raw_title"]

        )

    print()

    print("=" * 70)
    print("RESULT")
    print("=" * 70)
    print(f"Runtime Contracts : {len(runtimes)}")
    print("=" * 70)

    return runtimes


# ==============================================================================
# Entry Point
# ==============================================================================

def main():
    """
    Runtime Entry Point.
    """

    formatter()


if __name__ == "__main__":

    main()