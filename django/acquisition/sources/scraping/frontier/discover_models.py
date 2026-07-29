#!/usr/bin/env python3
"""
FRONTIER Model Discovery

Reality First
Observation First
"""

from __future__ import annotations

import csv

from bs4 import BeautifulSoup

from api.models.acquisition_document import AcquisitionDocument

from acquisition.common.trace.reality_trace import (
    trace_pipeline,
)

from .settings import (
    MODEL_LIST_TSV,
)

BASE_URL = "https://www.frontier-direct.jp"

DESKTOP = {
    "full",
    "middle",
    "mini",
    "slim",
}

rows = []


# ==========================================================
# Helpers
# ==========================================================

def absolute_url(href):

    if href.startswith("/"):
        return BASE_URL + href

    return href


def slugify(url):

    return url.rstrip("/").split("/")[-1]


def add_row(
    category,
    series,
    url,
    vendor="",
    chipset="",
):

    rows.append({
        "category": category,
        "series": series,
        "vendor": vendor,
        "chipset": chipset,
        "slug": slugify(url),
        "url": url,
    })


# ==========================================================
# Desktop
# ==========================================================

def discover_desktop(category, soup):

    cards = soup.select("div.uk-card")

    print(f"Series : {len(cards)}")

    for card in cards:

        title = card.select_one("h3")

        if title is None:
            continue

        series = title.get_text(strip=True)

        for link in card.select("a[href]"):

            text = link.get_text(" ", strip=True)

            vendor = ""
            chipset = ""

            if "Intel" in text:
                vendor = "Intel"
            elif "AMD" in text:
                vendor = "AMD"

            if "（" in text and "）" in text:
                chipset = text.split("（")[1].split("）")[0]

            add_row(
                category,
                series,
                absolute_url(link["href"]),
                vendor,
                chipset,
            )


# ==========================================================
# Notebook
# ==========================================================

def discover_notebook(category, soup):

    cards = soup.select("div.uk-card")

    print(f"Products : {len(cards)}")

    for card in cards:

        title = card.select_one("h3")
        link = card.select_one("a[href]")

        if title is None or link is None:
            continue

        add_row(
            category,
            title.get_text(strip=True),
            absolute_url(link["href"]),
        )


# ==========================================================
# Discover
# ==========================================================

def discover():

    trace_pipeline("DISCOVER")

    documents = (
        AcquisitionDocument.objects
        .filter(
            source_name="frontier",
            document_type="seed",
        )
        .order_by("document_key")
    )

    for document in documents:

        category = document.document_key

        print("=" * 60)
        print(category)
        print("=" * 60)

        soup = BeautifulSoup(
            document.content,
            "html.parser",
        )

        if category in DESKTOP:
            discover_desktop(category, soup)
        else:
            discover_notebook(category, soup)

    with MODEL_LIST_TSV.open(
        "w",
        encoding="utf-8",
        newline="",
    ) as f:

        writer = csv.DictWriter(
            f,
            fieldnames=[
                "category",
                "series",
                "vendor",
                "chipset",
                "slug",
                "url",
            ],
            delimiter="\t",
        )

        writer.writeheader()
        writer.writerows(rows)

    print()
    print("=" * 60)
    print("DISCOVERY COMPLETE")
    print(f"Entries : {len(rows)}")
    print(f"Saved   : {MODEL_LIST_TSV}")
    print("=" * 60)


def main():
    discover()


if __name__ == "__main__":
    main()