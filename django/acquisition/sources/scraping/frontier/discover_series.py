#!/usr/bin/env python3
"""
FRONTIER Series Discovery

Mission:
    Discover FRONTIER Series
    Generate series_list.tsv
"""

from __future__ import annotations

import csv
import re

from bs4 import BeautifulSoup

from api.models.acquisition_document import AcquisitionDocument

from acquisition.common.trace.reality_trace import (
    trace_pipeline,
)

from .settings import (
    SERIES_LIST_TSV,
)

HEADERS = [
    "model_slug",
    "brand",
    "category",
    "series",
]


def detect_series(model_slug):

    slug = model_slug.lower()

    if "asus" in slug:
        return "ASUS Collaboration"

    if "msi" in slug:
        return "MSI Collaboration"

    if "ghl" in slug:
        return "GHL"

    if "gpl" in slug:
        return "GPL"

    if "gbl" in slug:
        return "GBL"

    if "gam" in slug:
        return "GAM"

    if "gk" in slug:
        return "GK"

    if "za" in slug:
        return "ZA"

    if "xa" in slug:
        return "XA"

    if re.fullmatch(r"ejgb.*", slug):
        return "GB"

    if "cr" in slug:
        return "Creator"

    if "cs" in slug:
        return "Slim"

    return ""


def detect_category(series):

    if series == "Creator":
        return "Creator Desktop"

    if series == "Slim":
        return "Desktop"

    return "Gaming Desktop"


def discover():

    trace_pipeline("DISCOVER")

    rows = []
    seen = set()

    documents = (
        AcquisitionDocument.objects
        .filter(
            source_name="frontier",
            document_type="product",
        )
        .order_by("document_key")
    )

    print("=" * 60)
    print("DISCOVER SERIES")
    print("=" * 60)

    for document in documents:

        model_slug = document.document_key

        if re.fullmatch(r"g\d+", model_slug):
            continue

        if model_slug in seen:
            continue

        seen.add(model_slug)

        BeautifulSoup(
            document.content,
            "html.parser",
        )

        series = detect_series(model_slug)

        rows.append({
            "model_slug": model_slug,
            "brand": "FRONTIER",
            "category": detect_category(series),
            "series": series,
        })

        print(f"{model_slug:20} -> {series}")

    rows.sort(key=lambda x: x["model_slug"])

    with SERIES_LIST_TSV.open(
        "w",
        newline="",
        encoding="utf-8",
    ) as f:

        writer = csv.DictWriter(
            f,
            fieldnames=HEADERS,
            delimiter="\t",
        )

        writer.writeheader()
        writer.writerows(rows)

    print()
    print("=" * 60)
    print(f"Series : {len(rows)}")
    print(f"Saved   : {SERIES_LIST_TSV}")
    print("DONE")
    print("=" * 60)


def main():
    discover()


if __name__ == "__main__":
    main()