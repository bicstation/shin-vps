#!/usr/bin/env python3
"""
==============================================================================
FILE:
    acquisition/sources/runtime/identity/identity_classifier.py

SHIN CORE LINX
Identity Runtime Classifier

Responsibilities

- Load Identity Runtime TSV
- Resolve Brand
- Resolve Series
- Resolve Collaboration
- Resolve Model

NOT

- AI
- Semantic Runtime
- Guessing
==============================================================================
"""

from __future__ import annotations

import csv
import re
from pathlib import Path


# ============================================================================
# Runtime
# ============================================================================

BASE_DIR = Path(__file__).parent

BRANDS_TSV = BASE_DIR / "brands.tsv"
SERIES_TSV = BASE_DIR / "series.tsv"
COLLABORATIONS_TSV = BASE_DIR / "collaborations.tsv"


# ============================================================================
# TSV Loader
# ============================================================================

def load_tsv(
    path: Path,
) -> list[dict]:

    if not path.exists():
        return []

    with path.open(
        encoding="utf-8",
        newline="",
    ) as fp:

        rows = list(
            csv.DictReader(
                fp,
                delimiter="\t",
            )
        )

    rows.sort(
        key=lambda row: int(
            row.get(
                "priority",
                0,
            )
        ),
        reverse=True,
    )

    return rows


BRANDS = load_tsv(
    BRANDS_TSV,
)

SERIES = load_tsv(
    SERIES_TSV,
)

COLLABORATIONS = load_tsv(
    COLLABORATIONS_TSV,
)


# ============================================================================
# Generic Matcher
# ============================================================================

def match_runtime(
    runtime: list[dict],
    *,
    maker: str,
    text: str,
    result_field: str,
) -> str:

    maker = maker.lower()
    text = text.lower()

    for row in runtime:

        if row.get(
            "maker",
            "",
        ).lower() != maker:

            continue

        keyword = (
            row.get(
                "keyword",
                "",
            )
            .strip()
            .lower()
        )

        if not keyword:
            continue

        if keyword in text:

            return row.get(
                result_field,
                "",
            )

    return ""


# ============================================================================
# Model Resolver
# ============================================================================

MODEL_PATTERNS = (

    #
    # 型番：W6PZMA5PAB
    #

    r"型番[:：]\s*([A-Za-z0-9/_\-]+)",

    #
    # Model: XXX
    #

    r"model[:：]?\s*([A-Za-z0-9/_\-]+)",

)


def resolve_model(
    *,
    text: str,
) -> str:

    for pattern in MODEL_PATTERNS:

        match = re.search(
            pattern,
            text,
            flags=re.IGNORECASE,
        )

        if match:

            return match.group(1)

    return ""


# ============================================================================
# Identity Runtime
# ============================================================================

def classify_identity(
    *,
    maker: str,
    product_name: str,
    description: str = "",
) -> dict:

    text = " ".join(

        [

            product_name,

            description,

        ]

    )

    return {

        "brand": match_runtime(

            BRANDS,

            maker=maker,

            text=text,

            result_field="brand",

        ),

        "series": match_runtime(

            SERIES,

            maker=maker,

            text=text,

            result_field="series",

        ),

        "collaboration": match_runtime(

            COLLABORATIONS,

            maker=maker,

            text=text,

            result_field="collaboration",

        ),

        "model": resolve_model(

            text=text,

        ),

    }