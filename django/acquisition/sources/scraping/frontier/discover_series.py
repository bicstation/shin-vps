#!/usr/bin/env python3
"""
==============================================================================
FRONTIER Series Discovery

Acquire Runtime

AcquisitionDocument
    ↓
Discover Series
    ↓
Generate series_list.tsv
==============================================================================
"""

from __future__ import annotations

import csv
import re

from api.models.acquisition_document import AcquisitionDocument

from acquisition.common.trace.reality_trace import trace_pipeline

from .settings import (
    SERIES_LIST_TSV,
    SITE_NAME,
)


# ==============================================================================
# TSV
# ==============================================================================

HEADERS = (
    "model_slug",
    "brand",
    "category",
    "series",
)


# ==============================================================================
# Series Resolution
# ==============================================================================

def detect_series(model_slug: str) -> str:

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


# ==============================================================================
# Category Resolution
# ==============================================================================

def detect_category(series: str) -> str:

    if series == "Creator":
        return "Creator Desktop"

    if series == "Slim":
        return "Desktop"

    return "Gaming Desktop"


# ==============================================================================
# Discovery
# ==============================================================================

def discover():

    trace_pipeline("DISCOVER")

    rows = []
    seen = set()

    documents = (
        AcquisitionDocument.objects
        .filter(
            source_name=SITE_NAME.lower(),
            document_type="product",
        )
        .order_by("document_key")
    )

    print("=" * 70)
    print(f"{SITE_NAME} SERIES DISCOVERY")
    print("=" * 70)

    for document in documents:

        model_slug = document.document_key

        #
        # Skip
        #

        if re.fullmatch(r"g\d+", model_slug):
            continue

        if model_slug in seen:
            continue

        seen.add(model_slug)

        series = detect_series(model_slug)

        rows.append({
            "model_slug": model_slug,
            "brand": SITE_NAME,
            "category": detect_category(series),
            "series": series,
        })

        print(
            f"{model_slug:20} -> {series}"
        )

    rows.sort(
        key=lambda row: row["model_slug"]
    )

    #
    # Save TSV
    #

    with SERIES_LIST_TSV.open(
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
    print(f"Series : {len(rows)}")
    print(f"Saved   : {SERIES_LIST_TSV}")
    print("=" * 70)


# ==============================================================================
# Entry Point
# ==============================================================================

def main():

    discover()


if __name__ == "__main__":
    main()