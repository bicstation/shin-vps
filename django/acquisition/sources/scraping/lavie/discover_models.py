#!/usr/bin/env python3
"""
==============================================================================
SHIN CORE LINX

LAVIE Model Discovery

Acquire Runtime

AcquisitionDocument (Seed)
        │
        ▼
Discover Product Cards
        │
        ▼
model_list.tsv

Reality First
Observation First

Responsibilities

- Observe Product Cards
- Observe Product URL
- Observe Product ID
- Observe Product Code
- Produce model_list.tsv

Not Responsibilities

- Semantic Mapping
- Series Classification
- Brand Detection
==============================================================================
"""

from __future__ import annotations

import csv
from urllib.parse import urlparse

from bs4 import BeautifulSoup

from api.models.acquisition_document import AcquisitionDocument

from acquisition.common.trace.reality_trace import trace_pipeline

from .settings import (
    MODEL_LIST_TSV,
    BASE_URL,
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
    "model_slug",
    "url",
)

# ==============================================================================
# Helpers
# ==============================================================================
def absolute_url(url: str) -> str:

    if not url:
        return ""

    #
    # Protocol Relative URL
    #
    if url.startswith("//"):
        return "https:" + url

    #
    # Relative URL
    #
    if url.startswith("/"):
        return BASE_URL + url

    #
    # Absolute URL
    #
    return url

def observe_series_slug(url: str) -> str:
    """
    Observe series slug from URL.
    Reality only.
    """

    if not url:
        return ""

    path = urlparse(url).path.strip("/")

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
        "MODEL DISCOVERY",
    )

    rows = []

    seen = set()

    documents = (
        AcquisitionDocument.objects
        .filter(
            source_name=SITE_NAME.lower(),
            document_type="seed",
        )
        .order_by(
            "document_key",
        )
    )

    print("=" * 70)
    print(f"{SITE_NAME} MODEL DISCOVERY")
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

            title = card.select_one("h3")

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

            link = card.select_one(
                "a[href]",
            )
            
            #
            # URL
            #

            url = ""

            for a in card.select("a[href]"):

                href = absolute_url(
                    a.get(
                        "href",
                        "",
                    )
                )

                #
                # Ignore PDF
                #

                if href.lower().endswith(".pdf"):
                    continue

                #
                # Prefer Product Page
                #

                if "nec-lavie.jp/products/" in href:

                    url = href

                    break

                #
                # Fallback Cart
                #

                if "/cart/" in href and not url:

                    url = href

            #
            # Skip if URL not found
            #

            if not url:
                continue


            model_slug = product_id.lower()

            series_slug = observe_series_slug(
                url,
            )

            if model_slug in seen:
                continue

            seen.add(
                model_slug,
            )

            rows.append(
                {
                    "category": category,
                    "series_slug": series_slug,
                    "raw_title": raw_title,
                    "product_id": product_id,
                    "product_code": product_code,
                    "model_slug": model_slug,
                    "url": url,
                }
            )

    rows.sort(
        key=lambda row: row["model_slug"],
    )

    with MODEL_LIST_TSV.open(
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
    print(f"Models : {len(rows)}")
    print(f"Saved  : {MODEL_LIST_TSV}")
    print("=" * 70)


# ==============================================================================
# Entry Point
# ==============================================================================

def main():

    discover()


if __name__ == "__main__":
    main()