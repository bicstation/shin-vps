#!/usr/bin/env python3
"""
==============================================================================
SHIN CORE LINX

TSUKUMO Formatter

Formatter Runtime

AcquisitionDocument (observation)
        │
        ▼
Formatter Runtime
        │
        ▼
AcquisitionDocument (formatter)

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

from api.models.acquisition_document import (
    AcquisitionDocument,
)

from acquisition.common.trace.reality_trace import (
    trace_pipeline,
)

from .settings import (
    SITE_NAME,
)

# ==============================================================================
# Runtime
# ==============================================================================

DOCUMENT_INPUT = "observation"

DOCUMENT_OUTPUT = "formatter"

# ==============================================================================
# Formatter Contract
# ==============================================================================

CARD_FIELDS = (

    "document_key",

    "category",

    "raw_title",

    "raw_price",

    "raw_image",

    "raw_detail_url",

    "raw_specs",

    "raw_labels",

    "raw_html",

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

    value = value.replace(
        "\r\n",
        "\n",
    ).replace(
        "\r",
        "\n",
    )

    value = value.replace(
        "\u3000",
        " ",
    )

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
    Normalize Card Runtime.

    Preserve Reality.
    Never generate meaning.
    """

    return {

        "document_key": normalize_text(

            card.get(
                "document_key",
                "",
            )

        ),

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

        "raw_price": normalize_text(

            card.get(
                "raw_price",
                "",
            )

        ),

        "raw_image": normalize_text(

            card.get(
                "raw_image",
                "",
            )

        ),

        "raw_detail_url": normalize_text(

            card.get(
                "raw_detail_url",
                "",
            )

        ),

        "raw_specs": normalize_list(

            card.get(
                "raw_specs",
                [],
            )

        ),

        "raw_labels": normalize_list(

            card.get(
                "raw_labels",
                [],
            )

        ),

        #
        # HTML Reality
        # Preserve As-Is
        #

        "raw_html": card.get(

            "raw_html",

            "",

        ),

    }


# ==============================================================================
# Observation Formatter
# ==============================================================================

def format_observation(
    cards: list[dict],
) -> list[dict]:
    """
    Normalize Observation Runtime.

    Preserve Reality.
    Never generate meaning.
    """

    formatter = []

    for card in cards:

        formatter.append(

            normalize_card(

                card,

            )

        )

    return formatter

# ==============================================================================
# Persistence
# ==============================================================================

def save_formatter(
    *,
    document_key: str,
    formatter: dict,
):

    document, created = AcquisitionDocument.objects.update_or_create(

        source_type="scraping",

        source_name=SITE_NAME.lower(),

        document_type=DOCUMENT_OUTPUT,

        document_key=document_key,

        defaults={

            "content_type": "application/json",

            "content": json.dumps(

                formatter,

                ensure_ascii=False,

                indent=2,

            ),

        },

    )

    return document, created


# ==============================================================================
# Runtime
# ==============================================================================

def run(
    *,
    force: bool = False,
) -> None:

    trace_pipeline(
        "FORMATTER",
    )

    print("=" * 70)
    print(f"🧹 {SITE_NAME} FORMATTER")
    print("=" * 70)

    documents = (

        AcquisitionDocument.objects

        .filter(

            source_type="scraping",

            source_name=SITE_NAME.lower(),

            document_type=DOCUMENT_INPUT,

        )

        .order_by(

            "document_key",

        )

    )

    success: list[str] = []

    failed: list[tuple[str, str]] = []

    for document in documents:

        document_key = document.document_key

        print(document_key)

        try:

            runtime = json.loads(

                document.content,

            )

            formatter = format_observation(

                runtime.get(

                    "cards",

                    [],

                )

            )

            _, created = save_formatter(

                document_key=document_key,

                formatter={

                    "document_key": document_key,

                    "cards": formatter,

                },

            )

            success.append(

                document_key,

            )

            print(

                f"  Cards : {len(formatter)}"

            )

            print(

                f"  Saved : {'CREATED' if created else 'UPDATED'}"

            )

        except Exception as e:

            failed.append(

                (

                    document_key,

                    str(e),

                )

            )

            print(

                "  Status : ERROR"

            )

            print(

                f"  Reason : {e}"

            )

        print()

    print("=" * 70)
    print("RESULT")
    print("=" * 70)
    print(f"SUCCESS : {len(success)}")
    print(f"FAILED  : {len(failed)}")
    print("=" * 70)


# ==============================================================================
# Entry Point
# ==============================================================================

def main(
    **kwargs,
) -> None:

    run(

        force=kwargs.get(

            "force",

            False,

        ),

    )


if __name__ == "__main__":

    main()