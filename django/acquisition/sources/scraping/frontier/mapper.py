#!/usr/bin/env python3
"""
==============================================================================
FRONTIER Import Contract Mapper

ObservationDocument
        │
        ▼
Import Contract Mapper
        │
        ▼
ImportDocument

Reality First
Observation First
Identity First

Responsibilities

- Build Import Contract
- Build Identity
- Build Commerce
- Build Affiliate
- Build Media

Not Responsibilities

- HTML Parsing
- Reality Observation
- Product Import
==============================================================================
"""

from __future__ import annotations

import csv

from api.models import (
    ObservationDocument,
    ImportDocument,
)

from acquisition.common.trace.reality_trace import (
    trace_pipeline,
    trace_model,
)

from imports.common.affiliate import (
    generate_affiliate_url,
)

from .settings import (
    PRODUCT_LIST_TSV,
    SITE_NAME,
    AFFILIATE,
)


# ==============================================================================
# Runtime
# ==============================================================================

SOURCE_PREFIX = SITE_NAME.upper()


# ==============================================================================
# Runtime TSV
# ==============================================================================

def load_price_map() -> dict:
    """
    Load Runtime price information.

    Returns

        {
            model_slug: price
        }
    """

    with PRODUCT_LIST_TSV.open(
        "r",
        encoding="utf-8",
        newline="",
    ) as f:

        return {
            row["model_slug"]: row.get(
                "price",
                "",
            )
            for row in csv.DictReader(
                f,
                delimiter="\t",
            )
        }


# ==============================================================================
# Identifier
# ==============================================================================

def normalize_identifier(
    value: str,
) -> str:
    """
    Normalize identifier for Runtime.
    """

    return (
        value.strip()
        .replace(" ", "_")
        .replace("/", "_")
    )


# ==============================================================================
# Unique ID
# ==============================================================================

def build_unique_id(
    observation: dict,
    document_key: str,
) -> str:
    """
    Runtime Identity

    Priority

        Product Code
            ↓
        Model Slug
            ↓
        Document Key
    """

    product_code = (
        observation.get(
            "product_code",
            "",
        ).strip()
    )

    if product_code:

        return (
            f"{SOURCE_PREFIX}_"
            f"{normalize_identifier(product_code)}"
        )

    model_slug = (
        observation.get(
            "model_slug",
            "",
        ).strip()
    )

    if model_slug:

        return (
            f"{SOURCE_PREFIX}_"
            f"{normalize_identifier(model_slug)}"
        )

    return (
        f"{SOURCE_PREFIX}_"
        f"{normalize_identifier(document_key)}"
    )

# ==============================================================================
# Identity Builder
# ==============================================================================

def build_identity(
    observation: dict,
    *,
    document_key: str,
) -> dict:
    """
    Build Identity Contract.
    """

    return {

        "unique_id": build_unique_id(
            observation,
            document_key,
        ),

        "maker": observation.get(
            "maker",
            "",
        ),

        "brand": observation.get(
            "brand",
            "",
        ),

        "category": observation.get(
            "category",
            "",
        ),

        "series": observation.get(
            "series",
            "",
        ),

        "model_slug": observation.get(
            "model_slug",
            "",
        ),

        "product_code": observation.get(
            "product_code",
            "",
        ),

        "product_name": observation.get(
            "product_name",
            "",
        ),

        "product_url": observation.get(
            "product_url",
            "",
        ),
    }


# ==============================================================================
# Affiliate Builder
# ==============================================================================

def build_affiliate(
    product_url: str,
) -> dict:
    """
    Build Affiliate Contract.
    """

    return {

        "url": generate_affiliate_url(
            product_url,
            AFFILIATE,
        ),

    }


# ==============================================================================
# Commerce Builder
# ==============================================================================

def build_commerce(
    *,
    price: str,
) -> dict:
    """
    Build Commerce Contract.
    """

    return {

        "price": price,

    }


# ==============================================================================
# Media Builder
# ==============================================================================

def build_media(
    observation: dict,
) -> dict:
    """
    Build Media Contract.
    """

    return {

        "image_url": observation.get(
            "main_image",
            "",
        ),

        "images": observation.get(
            "images",
            [],
        ),

    }

# ==============================================================================
# Import Contract
# ==============================================================================

def create_import_contract(
    observation: dict,
    *,
    document_key: str,
    price: str,
) -> dict:
    """
    Build Import Contract from Observation.
    """

    product_url = observation.get(
        "product_url",
        "",
    )

    return {

        "identity": build_identity(
            observation,
            document_key=document_key,
        ),

        "affiliate": build_affiliate(
            product_url,
        ),

        "commerce": build_commerce(
            price=price,
        ),

        "media": build_media(
            observation,
        ),

        "specifications": observation.get(
            "specifications",
            {},
        ),
    }


# ==============================================================================
# Mapper
# ==============================================================================

def map_observation(
    observation: dict,
    *,
    document_key: str,
    price: str,
) -> dict:
    """
    Translate Observation into Import Contract.
    """

    return create_import_contract(
        observation,
        document_key=document_key,
        price=price,
    )

# ==============================================================================
# Runtime
# ==============================================================================

def run():

    print("=" * 70)
    print(f"📦 {SITE_NAME} IMPORT CONTRACT")
    print("=" * 70)

    trace_pipeline(
        "Mapper",
    )

    price_map = load_price_map()

    documents = (
        ObservationDocument.objects
        .filter(
            source_name=SITE_NAME.lower(),
            document_type="product",
        )
        .order_by(
            "document_key",
        )
        .iterator()
    )

    success = 0

    for document in documents:

        document_key = document.document_key

        observation = (
            document.observation
            or {}
        )

        price = price_map.get(
            document_key,
            "",
        )

        contract = map_observation(
            observation,
            document_key=document_key,
            price=price,
        )

        obj, _ = (
            ImportDocument.objects
            .update_or_create(
                source_name=document.source_name,
                document_type=document.document_type,
                document_key=document.document_key,
                defaults={
                    "contract": contract,
                },
            )
        )

        trace_model(
            "ImportDocument",
            obj,
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

def main():

    run()


if __name__ == "__main__":
    main()

