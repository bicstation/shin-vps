#!/usr/bin/env python3
"""
==============================================================================
FRONTIER Model Token Observation

Acquire Runtime

AcquisitionDocument
        │
        ▼
Observe Model Tokens
        │
        ▼
model_token_list.tsv

Reality First
Observation First

Responsibilities

- Observe Model Slug
- Observe Raw Tokens
- Produce Observation TSV

Not Responsibilities

- Series Classification
- Brand Detection
- Category Detection
- Semantic Mapping
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
    "raw_slug",
    "raw_tokens",
)

# ==============================================================================
# Observation
# ==============================================================================

def observe_tokens(
    model_slug: str,
) -> str:
    """
    Observe slug tokens.

    No semantic classification.
    """

    tokens = re.findall(
        r"[A-Za-z]+|\d+",
        model_slug,
    )

    return " ".join(tokens)

# ==============================================================================
# Runtime
# ==============================================================================

def discover():

    trace_pipeline(
        "TOKEN OBSERVATION",
    )

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
    print(f"{SITE_NAME} TOKEN OBSERVATION")
    print("=" * 70)

    for document in documents:

        model_slug = document.document_key

        if model_slug in seen:
            continue

        seen.add(model_slug)

        rows.append(
            {
                "model_slug": model_slug,
                "raw_slug": model_slug,
                "raw_tokens": observe_tokens(
                    model_slug,
                ),
            }
        )

    rows.sort(
        key=lambda row: row["model_slug"]
    )

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
    print(f"Observed : {len(rows)}")
    print(f"Saved    : {SERIES_LIST_TSV}")
    print("=" * 70)

# ==============================================================================
# Entry Point
# ==============================================================================

def main():

    discover()


if __name__ == "__main__":
    main()