#!/usr/bin/env python3
"""
==============================================================================
FRONTIER Model Discovery

Acquire Runtime

AcquisitionDocument (Seed)
        ↓
Discover Models
        ↓
Generate model_list.tsv
==============================================================================
"""

from __future__ import annotations

import csv

from bs4 import BeautifulSoup

from api.models.acquisition_document import AcquisitionDocument

from acquisition.common.trace.reality_trace import trace_pipeline

from .settings import (
    MODEL_LIST_TSV,
    BASE_URL,
    SITE_NAME,
)


# ==============================================================================
# Runtime
# ==============================================================================

HEADERS = (
    "category",
    "series_text",
    "vendor_text",
    "chipset_text",
    "model_slug",
    "url",
)

DESKTOP = {
    "full",
    "middle",
    "mini",
    "slim",
}


# ==============================================================================
# Helpers
# ==============================================================================

def absolute_url(href: str) -> str:

    if href.startswith("/"):
        return BASE_URL + href

    return href


def slugify(url: str) -> str:

    return url.rstrip("/").split("/")[-1]


def create_row(
    category: str,
    series_text: str,
    url: str,
    vendor_text: str = "",
    chipset_text: str = "",
):

    return {
        "category": category,
        "series_text": series_text,
        "vendor_text": vendor_text,
        "chipset_text": chipset_text,
        "model_slug": slugify(url),
        "url": url,
    }



# ==============================================================================
# Desktop Discovery
# ==============================================================================

def discover_desktop(
    category: str,
    soup: BeautifulSoup,
):

    rows = []

    cards = soup.select("div.uk-card")

    print(f"Series : {len(cards)}")

    for card in cards:

        title = card.select_one("h3")

        if title is None:
            continue

        series = title.get_text(strip=True)

        for link in card.select("a[href]"):
            
            link = card.select_one("a[href]")
            if link is None:
                continue
            
            series_text = title.get_text(strip=True)
            text = series_text

            vendor_text = ""
            chipset_text = ""

            if "Intel" in text:
                vendor_text = "Intel"
            elif "AMD" in text:
                vendor_text = "AMD"

            if "（" in text and "）" in text:
                chipset_text = text.split("（")[1].split("）")[0]

            rows.append(
                create_row(
                    category,
                    series_text,
                    absolute_url(link["href"]),
                    vendor_text,
                    chipset_text,
                )
            )

    return rows


# ==============================================================================
# Notebook Discovery
# ==============================================================================

def discover_notebook(
    category: str,
    soup: BeautifulSoup,
):

    rows = []

    cards = soup.select("div.uk-card")

    print(f"Products : {len(cards)}")

    for card in cards:

        title = card.select_one("h3")
        link = card.select_one("a[href]")

        if title is None or link is None:
            continue

        rows.append(
            create_row(
                category,
                title.get_text(strip=True),
                absolute_url(link["href"]),
            )
        )

    return rows


# ==============================================================================
# Discovery
# ==============================================================================

def discover():

    trace_pipeline("DISCOVER")

    rows = []

    documents = (
        AcquisitionDocument.objects
        .filter(
            source_name=SITE_NAME.lower(),
            document_type="seed",
        )
        .order_by("document_key")
    )

    for document in documents:

        category = document.document_key

        print("=" * 70)
        print(category)
        print("=" * 70)

        soup = BeautifulSoup(
            document.content,
            "html.parser",
        )

        if category in DESKTOP:

            rows.extend(
                discover_desktop(
                    category,
                    soup,
                )
            )

        else:

            rows.extend(
                discover_notebook(
                    category,
                    soup,
                )
            )

    rows.sort(
        key=lambda row: row["model_slug"]
    )

    with MODEL_LIST_TSV.open(
        "w",
        encoding="utf-8",
        newline="",
    ) as f:

        writer = csv.DictWriter(
            f,
            fieldnames=HEADERS,
            delimiter="\t",
        )

        writer.writeheader()
        writer.writerows(rows)

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