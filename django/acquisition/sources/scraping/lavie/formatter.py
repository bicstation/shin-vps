#!/usr/bin/env python3
"""
==============================================================================
SHIN CORE LINX

LAVIE Formatter

Formatter Runtime

AcquisitionDocument (Observation)
        │
        ▼
Formatter Runtime
        │
        ▼
AcquisitionDocument (Formatter)

Reality First
Normalization First

Responsibilities

- Normalize Observation
- Normalize Runtime
- Preserve Reality
- Runtime Safety

Not Responsibilities

- HTML Parsing
- Observation
- Semantic Mapping
- AI
- Product Integration

==============================================================================
"""

from __future__ import annotations

import json

from api.models.acquisition_document import AcquisitionDocument

from acquisition.common.trace.reality_trace import (
    trace_pipeline,
)

from .settings import (
    SITE_NAME,
)

# ==============================================================================
# Formatter Contract
# ==============================================================================

DOCUMENT_INPUT = "observation"

DOCUMENT_OUTPUT = "formatter"

CARD_FIELDS = (

    "category",

    "raw_title",

    "product_id",

    "product_code",

    "price",

    "image_url",

    "detail_url",

    "specs",

    "release",

    "labels",

)

# ==============================================================================
# Text Normalizer
# ==============================================================================

def normalize_text(
    value: str,
) -> str:
    """
    Normalize text.

    Preserve Reality.
    Never generate meaning.
    """

    if not value:
        return ""

    #
    # New Line
    #

    value = value.replace(
        "\r\n",
        "\n",
    ).replace(
        "\r",
        "\n",
    )

    #
    # Full-width Space
    #

    value = value.replace(
        "\u3000",
        " ",
    )

    #
    # Consecutive Spaces
    #

    value = " ".join(
        value.split(),
    )

    return value.strip()

# ==============================================================================
# List Normalizer
# ==============================================================================

def normalize_list(
    values: list[str],
) -> list[str]:
    """
    Normalize list.

    - Normalize text
    - Remove empty values
    - Remove duplicates

    Preserve Reality.
    """

    results = []

    seen = set()

    for value in values:

        value = normalize_text(
            value,
        )

        if not value:
            continue

        if value in seen:
            continue

        seen.add(
            value,
        )

        results.append(
            value,
        )

    return results


# ==============================================================================
# Card Formatter
# ==============================================================================

def normalize_card(
    card: dict,
) -> dict:
    """
    Normalize card.

    Preserve Reality.
    Never generate meaning.
    """

    return {

        "category": normalize_text(
            card.get(
                "category",
                "",
            )
        ),

        "raw_title": normalize_text(
            card.get(
                "raw_title",
                "",
            )
        ),

        "product_id": normalize_text(
            card.get(
                "product_id",
                "",
            )
        ),

        "product_code": normalize_text(
            card.get(
                "product_code",
                "",
            )
        ),

        "price": normalize_text(
            card.get(
                "price",
                "",
            )
        ),

        "image_url": normalize_text(
            card.get(
                "image_url",
                "",
            )
        ),

        "detail_url": normalize_text(
            card.get(
                "detail_url",
                "",
            )
        ),

        "specs": normalize_list(
            card.get(
                "specs",
                [],
            )
        ),

        "release": normalize_text(
            card.get(
                "release",
                "",
            )
        ),

        "labels": normalize_list(
            card.get(
                "labels",
                [],
            )
        ),

    }

# ==============================================================================
# Observation Formatter
# ==============================================================================

def format_observation(
    observation: list[dict],
) -> list[dict]:
    """
    Format Observation Runtime.

    Preserve Reality.
    Never generate meaning.
    """

    formatter = []

    for card in observation:

        formatter.append(

            normalize_card(
                card,
            )

        )

    return formatter

# ==============================================================================
# Persistence Runtime
# ==============================================================================

def save_formatter(
    formatter: list[dict],
) -> None:

    print("=" * 70)
    print("SAVE FORMATTER")
    print("=" * 70)

    document, created = AcquisitionDocument.objects.update_or_create(

        source_type="scraping",

        source_name=SITE_NAME.lower(),

        document_type=DOCUMENT_OUTPUT,

        document_key="catalog",

        defaults={

            "content_type": "application/json",

            "content": json.dumps(

                formatter,

                ensure_ascii=False,

                indent=2,

            ),

        },

    )

    print(

        "Formatter :",

        "CREATED" if created else "UPDATED",

    )

    print("=" * 70)
    
# ==============================================================================
# Runtime
# ==============================================================================

def run() -> None:

    trace_pipeline(
        "FORMATTER",
    )

    print("=" * 70)
    print(f"{SITE_NAME} FORMATTER")
    print("=" * 70)

    document = AcquisitionDocument.objects.get(

        source_type="scraping",

        source_name=SITE_NAME.lower(),

        document_type=DOCUMENT_INPUT,

        document_key="catalog",

    )

    observation = json.loads(

        document.content,

    )

    formatter = format_observation(

        observation,

    )

    print(f"Cards : {len(formatter)}")

    print()

    save_formatter(

        formatter,

    )


# ==============================================================================
# Entry Point
# ==============================================================================

def main() -> None:

    run()


if __name__ == "__main__":

    main()