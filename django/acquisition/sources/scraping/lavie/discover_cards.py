#!/usr/bin/env python3
"""
==============================================================================
SHIN CORE LINX

LAVIE Card Discovery

Acquire Runtime

AcquisitionDocument(catalog)
        │
        ▼
Catalog HTML
        │
        ▼
Discover Product Cards
        │
        ▼
cards.tsv

Reality First

Responsibilities

- Discover Product Cards
- Discover Product URL
- Discover Product ID
- Discover Product Code
- Produce Cards TSV

Not Responsibilities

- Observation
- Formatter
- Mapping
- Semantic
- AI Inference
==============================================================================
"""

from __future__ import annotations

import csv
from urllib.parse import urlparse

from bs4 import BeautifulSoup

from api.models.acquisition_document import AcquisitionDocument

from acquisition.common.trace.reality_trace import trace_pipeline

from .settings import (
    BASE_URL,
    CARDS_TSV,
    SITE_NAME,
)

# ==============================================================================
# TSV
# ==============================================================================

HEADERS = (
    "category",
    "series_slug",
    "raw_title",
    "product_id",
    "product_code",
    "product_slug",
    "url",
)


# ==============================================================================
# URL
# ==============================================================================

def absolute_url(url: str) -> str:

    if not url:
        return ""

    if url.startswith("//"):
        return "https:" + url

    if url.startswith("/"):
        return BASE_URL + url

    return url


def build_series_slug(url: str) -> str:
    """
    Build Series Slug from Product URL.
    """

    if not url:
        return ""

    path = urlparse(
        url,
    ).path.strip("/")

    parts = path.split("/")

    if not parts:
        return ""

    if parts[0] == "cart":
        return ""

    if parts[-1] == "index.html":
        parts.pop()

    if not parts:
        return ""

    if parts[-1].endswith(".html"):
        parts[-1] = parts[-1][:-5]

    if len(parts) >= 3:
        return parts[-1].lower()

    return ""


# ==============================================================================
# Runtime
# ==============================================================================

def discover():

    trace_pipeline(
        "CARD DISCOVERY",
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
    print(f"{SITE_NAME} CARD DISCOVERY")
    print("=" * 70)

    for document in documents:

        category = document.document_key

        soup = BeautifulSoup(
            document.content,
            "html.parser",
        )

        cards = soup.select(
            ".dlp-products-card",
        )

        print(
            f"{category} : {len(cards)} cards"
        )

        for card in cards:

            title = card.select_one(
                "h3",
            )

            if title is None:
                continue

            raw_title = title.get_text(
                " ",
                strip=True,
            )

            image = card.select_one(
                "[data-id]",
            )

            if image is None:
                continue

            product_id = image.get(
                "data-id",
                "",
            )

            product_code = image.get(
                "data-productcode",
                "",
            )

            url = ""

            for a in card.select(
                "a[href]",
            ):

                href = absolute_url(
                    a.get(
                        "href",
                        "",
                    )
                )

                if href.lower().endswith(
                    ".pdf",
                ):
                    continue

                if "nec-lavie.jp/products/" in href:

                    url = href

                    break

                if "/cart/" in href and not url:

                    url = href

            if not url:
                continue

            product_slug = product_id.lower()

            series_slug = build_series_slug(
                url,
            )

            if product_slug in seen:
                continue

            seen.add(
                product_slug,
            )

            rows.append(

                {

                    "category": category,

                    "series_slug": series_slug,

                    "raw_title": raw_title,

                    "product_id": product_id,

                    "product_code": product_code,

                    "product_slug": product_slug,

                    "url": url,

                }

            )

    rows.sort(

        key=lambda row: row["product_slug"],

    )

    with CARDS_TSV.open(

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
    print(f"Cards : {len(rows)}")
    print(f"Saved : {CARDS_TSV}")
    print("=" * 70)


# ==============================================================================
# Entry Point
# ==============================================================================

def main():

    discover()


if __name__ == "__main__":

    main()