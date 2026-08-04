#!/usr/bin/env python3
"""
==============================================================================
SHIN CORE LINX

TSUKUMO Mapper

Mapper Runtime

AcquisitionDocument (formatter)
        │
        ▼
Import Contract Builder
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
# Runtime
# ==============================================================================

DOCUMENT_INPUT = "formatter"

DOCUMENT_OUTPUT = "product"

SOURCE_PREFIX = SITE_NAME.upper()

BASE_URL = "https://shop.tsukumo.co.jp"

# ==============================================================================
# Contract
# ==============================================================================

CONTRACT_FIELDS = (

    "identity",

    "commerce",

    "media",

    "affiliate",

    "observation_runtime",

)
# ==============================================================================
# URL Helper
# ==============================================================================

def absolute_url(
    url: str,
) -> str:
    """
    Normalize URL.

    Translation only.
    """

    if not url:
        return ""

    if url.startswith("http"):
        return url

    if url.startswith("/"):
        return BASE_URL + url

    return url


# ==============================================================================
# Price Helper
# ==============================================================================

def normalize_price(
    value: str,
) -> int:
    """
    Normalize Price.

    Translation only.
    """

    if not value:
        return 0

    digits = "".join(

        ch

        for ch in value

        if ch.isdigit()

    )

    if not digits:
        return 0

    return int(digits)


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

    Reality First.

    Use published SKU when available.
    """

    sku = formatter.get(

        "raw_sku",

        "",

    )

    if sku:

        return (

            f"{SOURCE_PREFIX}_"

            f"{normalize_identifier(sku)}"

        )

    return (

        f"{SOURCE_PREFIX}_UNKNOWN"

    )


def build_identity(
    formatter: dict,
) -> dict:
    """
    Formatter
            │
            ▼
    Import Identity
    """

    detail_url = absolute_url(

        formatter.get(

            "raw_detail_url",

            "",

        )

    )
    
    return {

        "unique_id": build_unique_id(
            formatter,
        ),

        "maker": SITE_NAME,

        "brand": "",

        "series": "",

        "collaboration": "",

        "model": "",

        "product_no": "",

        #
        # Framework Contract
        #

        "sku": formatter.get(

            "raw_sku",

            "",

        ),

        "product_name": formatter.get(

            "raw_title",

            "",

        ),

        "product_url": detail_url,

    }


# ==============================================================================
# Commerce Builder
# ==============================================================================

def build_commerce(
    formatter: dict,
) -> dict:
    """
    Translate Commerce Runtime.

    Preserve Reality.
    """

    return {

        "price": formatter.get(

            "raw_price",

            "",

        ),

        "currency": "JPY",

        "stock_status": formatter.get(

            "raw_stock",

            "",

        ),

    }


# ==============================================================================
# Media Builder
# ==============================================================================

def build_media(
    formatter: dict,
) -> dict:
    """
    Translate Media Runtime.

    Preserve Reality.
    """

    image = formatter.get(

        "raw_image",

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

    Preserve Reality.
    """

    return AffiliateBuilder.build(

        product_url=absolute_url(

            formatter.get(

                "raw_detail_url",

                "",

            )

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

    Formatter Runtime
            │
            ▼
    Import Contract

    Translation Only.
    Preserve Reality.
    """

    #
    # Observation Runtime
    #

    observation_runtime = {

        #
        # Category
        #

        "category": formatter.get(

            "category",

            "",

        ),

        #
        # Product
        #

        "raw_title": formatter.get(

            "raw_title",

            "",

        ),

        "raw_description": formatter.get(

            "raw_description",

            "",

        ),

        "raw_maker": formatter.get(

            "raw_maker",

            "",

        ),

        "raw_sku": formatter.get(

            "raw_sku",

            "",

        ),

        #
        # Commerce
        #

        "raw_price": formatter.get(

            "raw_price",

            "",

        ),

        "raw_stock": formatter.get(

            "raw_stock",

            "",

        ),

        "raw_availability": formatter.get(

            "raw_availability",

            "",

        ),

        "raw_shipping": formatter.get(

            "raw_shipping",

            "",

        ),

        #
        # Media
        #

        "raw_image": formatter.get(

            "raw_image",

            "",

        ),

        "raw_detail_url": formatter.get(

            "raw_detail_url",

            "",

        ),

        #
        # Observation
        #

        "raw_specs": list(

            formatter.get(

                "raw_specs",

                [],

            )

        ),

        "raw_labels": list(

            formatter.get(

                "raw_labels",

                [],

            )

        ),

        #
        # Reality
        #

        "raw_html": formatter.get(

            "raw_html",

            "",

        ),

    }
    
    #
    # Import Contract
    #

    return {

        # ==================================================
        # Identity
        # ==================================================

        "identity": build_identity(

            formatter,

        ),

        # ==================================================
        # Commerce
        # ==================================================

        "commerce": build_commerce(

            formatter,

        ),

        # ==================================================
        # Media
        # ==================================================

        "media": build_media(

            formatter,

        ),

        # ==================================================
        # Affiliate
        # ==================================================

        "affiliate": build_affiliate(

            formatter,

        ),

        # ==================================================
        # Observation Runtime
        # ==================================================

        "observation_runtime": observation_runtime,

    }

# ==============================================================================
# Persistence Runtime
# ==============================================================================

def save_contract(
    contract: dict,
) -> None:
    """
    Persist Import Contract.

    Import Contract
            │
            ▼
    ImportDocument
    """

    identity = contract.get(
        "identity",
        {},
    )
    
    document_key = identity.get(
        "sku",
        "",
    )
    

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
    print(f"🗺️ {SITE_NAME} MAPPER")
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

    success = 0

    failed: list[tuple[str, str]] = []

    for document in documents:

        document_key = document.document_key

        print(document_key)

        try:

            formatter_runtime = json.loads(

                document.content,

            )

            cards = formatter_runtime.get(

                "cards",

                [],

            )

            print(
                f"  Cards : {len(cards)}"
            )

            for card in cards:

                contract = build_contract(

                    card,

                )

                save_contract(

                    contract,

                )

                success += 1

            print()

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

    print(f"SUCCESS : {success}")
    print(f"FAILED  : {len(failed)}")

    print("=" * 70)


# ==============================================================================
# Entry Point
# ==============================================================================

def main() -> None:

    run()


if __name__ == "__main__":

    main()