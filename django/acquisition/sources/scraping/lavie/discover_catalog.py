#!/usr/bin/env python3
"""
==============================================================================
SHIN CORE LINX

LAVIE Catalog Discovery

Acquire Runtime

AcquisitionDocument(catalog)
        │
        ▼
Catalog HTML
        │
        ▼
Discover Series
        │
        ▼
series.tsv

Reality First
Observation First

Responsibilities

- Discover Series
- Discover Raw Title
- Discover Product ID
- Produce Series TSV

Not Responsibilities

- Card Discovery
- Observation
- Formatter
- Semantic
- AI Inference
==============================================================================
"""

from __future__ import annotations

import csv
import re

from bs4 import BeautifulSoup

from api.models.acquisition_document import AcquisitionDocument

from acquisition.common.trace.reality_trace import trace_pipeline

from .settings import (
    SERIES_TSV,
    SITE_NAME,
)

# ==============================================================================
# TSV
# ==============================================================================

HEADERS = (
    "series_slug",
    "raw_title",
    "product_id",
)

# ==============================================================================
# Series
# ==============================================================================

def build_series_slug(title: str) -> str:
    """
    Build Series Slug.

    Example

    N15(R) (標準ソフト)
        ↓
    n15-r
    """

    title = title.strip()

    m = re.match(
        r"([A-Za-z0-9()\-]+)",
        title,
    )

    if not m:
        return ""

    slug = m.group(1)

    slug = slug.lower()

    slug = slug.replace(
        "(",
        "-",
    )

    slug = slug.replace(
        ")",
        "",
    )

    slug = re.sub(
        r"[^a-z0-9\-]+",
        "-",
        slug,
    )

    slug = re.sub(
        "-+",
        "-",
        slug,
    ).strip("-")

    return slug


# ==============================================================================
# Runtime
# ==============================================================================

def discover():

    trace_pipeline(
        "SERIES DISCOVERY",
    )

    rows = []

    seen = set()

    documents = (

        AcquisitionDocument.objects

        .filter(

            source_name=SITE_NAME.lower(),

            document_type="catalog",

        )

        .order_by(
            "document_key",
        )

    )

    print("=" * 70)
    print(f"{SITE_NAME} SERIES DISCOVERY")
    print("=" * 70)

    for document in documents:

        soup = BeautifulSoup(
            document.content,
            "html.parser",
        )

        cards = soup.select(
            ".dlp-products-card",
        )

        print(
            f"{document.document_key} : {len(cards)} cards"
        )

        for card in cards:

            h3 = card.select_one(
                "h3",
            )

            image = card.select_one(
                "[data-id]",
            )

            if h3 is None or image is None:
                continue

            raw_title = h3.get_text(
                " ",
                strip=True,
            )

            product_id = image.get(
                "data-id",
                "",
            )

            series_slug = build_series_slug(
                raw_title,
            )

            key = (
                series_slug,
                product_id,
            )

            if key in seen:
                continue

            seen.add(
                key,
            )

            rows.append(

                {

                    "series_slug": series_slug,

                    "raw_title": raw_title,

                    "product_id": product_id,

                }

            )

    rows.sort(

        key=lambda row: (

            row["series_slug"],

            row["product_id"],

        )

    )

    with SERIES_TSV.open(

        "w",

        encoding="utf-8",

        newline="",

    ) as fp:

        writer = csv.DictWriter(

            fp,

            fieldnames=HEADERS,

            delimiter="\t",

        )

        writer.writeheader()

        writer.writerows(
            rows,
        )

    print()

    print("=" * 70)
    print("RESULT")
    print("=" * 70)
    print(f"Observed : {len(rows)}")
    print(f"Saved    : {SERIES_TSV}")
    print("=" * 70)


# ==============================================================================
# Entry Point
# ==============================================================================

def main():

    discover()


if __name__ == "__main__":
    main()