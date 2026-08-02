#!/usr/bin/env python3
"""
==============================================================================
SHIN CORE LINX

LAVIE Product Formatter

Observation Runtime

AcquisitionDocument (observation)
        │
        ▼
Formatter Runtime
        │
        ▼
AcquisitionDocument (formatter)

Reality First
Observation First

Responsibilities

- Normalize Observation
- Normalize Text
- Normalize Runtime
- Preserve Reality
- Runtime Safety

Not Responsibilities

- HTML Parsing
- HTML Observation
- Semantic Mapping
- Product Classification
- AI Processing

==============================================================================
"""

from __future__ import annotations

import json
import re

from api.models.acquisition_document import AcquisitionDocument

from acquisition.common.trace.reality_trace import (
    trace_pipeline,
)

from .settings import (
    SITE_NAME,
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

    value = re.sub(
        r"[ \t]+",
        " ",
        value,
    )

    #
    # Consecutive New Lines
    #

    value = re.sub(
        r"\n+",
        "\n",
        value,
    )

    return value.strip()

# ==============================================================================
# Dictionary Normalizer
# ==============================================================================

def normalize_dict(
    data: dict,
) -> dict:
    """
    Normalize dictionary.

    - Normalize keys
    - Normalize values
    - Preserve Reality
    """

    result = {}

    for key, value in data.items():

        key = normalize_text(
            str(key),
        )

        #
        # String
        #

        if isinstance(
            value,
            str,
        ):

            value = normalize_text(
                value,
            )

        #
        # List
        #

        elif isinstance(
            value,
            list,
        ):

            value = normalize_list(
                value,
            )

        #
        # Dict
        #

        elif isinstance(
            value,
            dict,
        ):

            value = normalize_dict(
                value,
            )

        result[key] = value

    return result

# ==============================================================================
# List Normalizer
# ==============================================================================

def normalize_list(
    items: list,
) -> list:
    """
    Normalize list.

    - Remove empty values
    - Remove duplicates
    - Normalize recursively
    """

    results = []
    seen = set()

    for item in items:

        #
        # String
        #

        if isinstance(
            item,
            str,
        ):

            item = normalize_text(
                item,
            )

            if not item:
                continue

            if item in seen:
                continue

            seen.add(item)

            results.append(item)

        #
        # Dictionary
        #

        elif isinstance(
            item,
            dict,
        ):

            results.append(
                normalize_dict(
                    item,
                )
            )

        #
        # Nested List
        #

        elif isinstance(
            item,
            list,
        ):

            results.append(
                normalize_list(
                    item,
                )
            )

        #
        # Other
        #

        else:

            results.append(item)

    return results

# ==============================================================================
# Observation Normalizer
# ==============================================================================

def normalize_observation(
    observation: dict,
) -> dict:
    """
    Normalize Observation.

    Preserve Reality.
    Never generate semantic meaning.
    """

    return {

        #
        # Metadata
        #

        "html_title": normalize_text(
            observation.get(
                "html_title",
                "",
            )
        ),

        "canonical_url": normalize_text(
            observation.get(
                "canonical_url",
                "",
            )
        ),

        "meta_description": normalize_text(
            observation.get(
                "meta_description",
                "",
            )
        ),

        #
        # Product
        #

        "product_name": normalize_text(
            observation.get(
                "product_name",
                "",
            )
        ),

        "series_name": normalize_text(
            observation.get(
                "series_name",
                "",
            )
        ),

        #
        # Images
        #

        "main_image": normalize_text(
            observation.get(
                "main_image",
                "",
            )
        ),

        "images": normalize_list(
            observation.get(
                "images",
                [],
            )
        ),

        #
        # Observation
        #

        "specs": normalize_dict(
            observation.get(
                "specs",
                {},
            )
        ),

        "tables": normalize_list(
            observation.get(
                "tables",
                [],
            )
        ),

        "jsonld_scripts": normalize_list(
            observation.get(
                "jsonld_scripts",
                [],
            )
        ),

    }
    
# ==============================================================================
# Save Formatter Document
# ==============================================================================

def save_formatter_document(
    *,
    slug: str,
    observation: dict,
):

    document, created = AcquisitionDocument.objects.update_or_create(

        source_type="scraping",

        source_name=SITE_NAME.lower(),

        document_type="formatter",

        document_key=slug,

        defaults={

            "content_type": "application/json",

            "content": json.dumps(

                observation,

                ensure_ascii=False,

                indent=2,

            ),

        },

    )

    return document, created

# ==============================================================================
# Runtime
# ==============================================================================

def run():

    trace_pipeline(
        "FORMATTER",
    )

    print("=" * 70)
    print(f"🧹 {SITE_NAME} PRODUCT FORMATTER")
    print("=" * 70)

    documents = (
        AcquisitionDocument.objects
        .filter(
            source_type="scraping",
            source_name=SITE_NAME.lower(),
            document_type="observation",
        )
        .order_by(
            "document_key",
        )
    )

    success = []
    failed = []

    for document in documents:

        slug = document.document_key

        print(slug)

        try:

            observation = json.loads(
                document.content,
            )

            formatter = normalize_observation(
                observation,
            )

            _, created = save_formatter_document(

                slug=slug,

                observation=formatter,

            )

            success.append(
                slug,
            )

            print(
                f"  Specs  : {len(formatter.get('specs', {}))}"
            )

            print(
                f"  Tables : {len(formatter.get('tables', []))}"
            )

            print(
                f"  Images : {len(formatter.get('images', []))}"
            )

            print(
                f"  Saved  : {'CREATED' if created else 'UPDATED'}"
            )

        except Exception as e:

            failed.append(
                (
                    slug,
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

def main():

    run()


if __name__ == "__main__":

    main()