#!/usr/bin/env python3
"""
==============================================================================
SHIN CORE LINX

LAVIE Mapper

Mapper Runtime

AcquisitionDocument (Formatter)
        │
        ▼
Mapper Runtime
        │
        ▼
ImportDocument

Reality First
Translation First

Responsibilities

- Translate Formatter Runtime
- Build Import Contract
- Preserve Reality
- Generate Affiliate URL
- Generate Runtime Identity

Not Responsibilities

- HTML Parsing
- Observation
- Formatter
- Semantic Mapping
- AI
- Database Import

==============================================================================
"""

from __future__ import annotations

import json

from api.models import (
    ImportDocument,
)

from api.models.acquisition_document import (
    AcquisitionDocument,
)

from acquisition.common.trace.reality_trace import (
    trace_pipeline,
)

from acquisition.common.affiliate.builder import (
    AffiliateBuilder,
)

from .settings import (
    SITE_NAME,
    AFFILIATE,
)

# ==============================================================================
# Mapper Contract
# ==============================================================================

DOCUMENT_INPUT = "formatter"

DOCUMENT_OUTPUT = "product"

DOCUMENT_KEY = "catalog"

SOURCE_PREFIX = SITE_NAME.upper()

CONTRACT_FIELDS = (

    "identity",

    "commerce",

    "media",

    "affiliate",

    "observation_runtime",

)

# ==============================================================================
# Identity Builder
# ==============================================================================

def normalize_identifier(
    value: str,
) -> str:
    """
    Normalize Runtime Identifier.

    Translation only.
    """

    if not value:
        return ""

    return (

        value

        .strip()

        .replace(" ", "_")

        .replace("/", "_")

    )


def build_unique_id(
    formatter: dict,
) -> str:
    """
    Build Runtime Unique ID.
    """

    product_id = formatter.get(
        "product_id",
        "",
    )

    if product_id:

        return (

            f"{SOURCE_PREFIX}_"

            f"{normalize_identifier(product_id)}"

        )

    product_code = formatter.get(
        "product_code",
        "",
    )

    if product_code:

        return (

            f"{SOURCE_PREFIX}_"

            f"{normalize_identifier(product_code)}"

        )

    return (

        f"{SOURCE_PREFIX}_UNKNOWN"

    )


def build_identity(
    formatter: dict,
) -> dict:
    """
    Translate Identity Runtime.

    Formatter
        ↓
    Import Identity
    """

    return {

        "unique_id": build_unique_id(
            formatter,
        ),

        "maker": SITE_NAME,

        "brand": "",

        "series": "",

        "collaboration": "",

        "model": formatter.get(
            "product_id",
            "",
        ),

        "product_no": formatter.get(
            "product_code",
            "",
        ),

        "product_identifier": formatter.get(
            "product_id",
            "",
        ),

        "product_name": formatter.get(
            "raw_title",
            "",
        ),

        "url": formatter.get(
            "detail_url",
            "",
        ),

    }

# ==============================================================================
# Commerce Builder
# ==============================================================================

def build_commerce(
    formatter: dict,
) -> dict:
    """
    Translate Commerce Runtime.
    """

    return {

        "price": formatter.get(
            "price",
            "",
        ),

        "currency": "JPY",

        "stock_status": "",

    }


# ==============================================================================
# Media Builder
# ==============================================================================

def build_media(
    formatter: dict,
) -> dict:
    """
    Translate Media Runtime.
    """

    image = formatter.get(
        "image_url",
        "",
    )

    return {

        "image_url": image,

        "images": [

            image,

        ] if image else [],

    }


# ==============================================================================
# Affiliate Builder
# ==============================================================================

def build_affiliate(
    formatter: dict,
) -> dict:
    """
    Translate Affiliate Runtime.
    """

    return AffiliateBuilder.build(

        product_url=formatter.get(
            "detail_url",
            "",
        ),

        config=AFFILIATE,

    )

# ==============================================================================
# Import Contract Builder
# ==============================================================================

def build_contract(
    formatter: dict,
) -> dict:
    """
    Build Import Contract.

    Translation Only.
    Preserve Reality.
    """

    return {

        #
        # Identity
        #

        "identity": build_identity(
            formatter,
        ),

        #
        # Commerce
        #

        "commerce": build_commerce(
            formatter,
        ),

        #
        # Media
        #

        "media": build_media(
            formatter,
        ),

        #
        # Affiliate
        #

        "affiliate": build_affiliate(
            formatter,
        ),

        #
        # Preserve Observation Runtime
        #

        "observation_runtime": formatter,

    }

# ==============================================================================
# Persistence Runtime
# ==============================================================================

def save_contract(
    contract: dict,
) -> None:

    identity = contract.get(
        "identity",
        {},
    )

    document_key = identity.get(
        "product_identifier",
        "",
    )

    print("=" * 70)
    print("SAVE CONTRACT")
    print("=" * 70)

    document, created = ImportDocument.objects.update_or_create(

        source_name=SITE_NAME.lower(),

        document_type=DOCUMENT_OUTPUT,

        document_key=document_key,

        defaults={

            "contract": contract,

        },

    )

    print(

        f"{document_key} :",

        "CREATED" if created else "UPDATED",

    )
    
# ==============================================================================
# Runtime
# ==============================================================================

def run() -> None:

    trace_pipeline(
        "MAPPER",
    )

    print("=" * 70)
    print(f"{SITE_NAME} MAPPER")
    print("=" * 70)

    document = AcquisitionDocument.objects.get(

        source_type="scraping",

        source_name=SITE_NAME.lower(),

        document_type=DOCUMENT_INPUT,

        document_key=DOCUMENT_KEY,

    )

    formatter = json.loads(

        document.content,

    )

    print(
        f"Cards : {len(formatter)}"
    )

    print()

    success = 0

    for card in formatter:

        contract = build_contract(

            card,

        )

        save_contract(

            contract,

        )

        success += 1

    print()

    print("=" * 70)
    print("RESULT")
    print("=" * 70)
    print(f"SUCCESS : {success}")
    print("=" * 70)


# ==============================================================================
# Entry Point
# ==============================================================================

def main() -> None:

    run()


if __name__ == "__main__":

    main()