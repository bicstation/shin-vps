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
Translation Authority

Overview

Translate ObservationDocument into the SHIN CORE LINX
Import Contract.

This Runtime transforms observable Reality into a
standardized import contract without generating
semantic meaning.

Responsibilities

- Build Import Contract
- Build Identity Contract
- Build Commerce Contract
- Build Media Contract
- Build Affiliate Contract
- Preserve Observation Runtime

Not Responsibilities

- HTML Parsing
- Reality Observation
- Semantic Classification
- Product Import
- Database Processing
==============================================================================
"""

from __future__ import annotations

import csv
import json

from api.models import (
    ObservationDocument,
    ImportDocument,
)

from acquisition.common.trace.reality_trace import (
    trace_model,
    trace_pipeline,
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
# Runtime Utility
# ==============================================================================

def normalize_identifier(
    value: str,
) -> str:
    """
    Normalize Runtime identifier.
    """

    return (
        value.strip()
        .replace(" ", "_")
        .replace("/", "_")
    )


# ==============================================================================
# Runtime Identity
# ==============================================================================

def build_unique_id(
    observation: dict,
    *,
    document_key: str,
) -> str:
    """
    Build Runtime Unique ID.

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

    Identity represents the published identity
    of the product.

    No semantic classification is performed.
    """

    return {

        #
        # Runtime Identity
        #

        "unique_id": build_unique_id(
            observation,
            document_key=document_key,
        ),

        #
        # Source Identity
        #

        "maker": SITE_NAME,

        "brand": observation.get(
            "brand",
            "",
        ),

        "series": observation.get(
            "series",
            "",
        ),

        "category": observation.get(
            "category",
            "",
        ),

        #
        # Product Identity
        #

        "model_slug": observation.get(
            "model_slug",
            "",
        ),

        "product_code": observation.get(
            "product_code",
            "",
        ),

        #
        # Published Identity
        #

        "product_name": observation.get(
            "html_title",
            "",
        ),

        "product_url": observation.get(
            "canonical_url",
            "",
        ),

    }
# ==============================================================================
# JSON-LD Translator
# ==============================================================================

def parse_product_jsonld(
    observation: dict,
) -> dict:
    """
    Extract Product JSON-LD.

    Returns the first Product object found in the
    observed JSON-LD collection.

    No translation beyond extraction is performed.
    """

    for script in observation.get(
        "jsonld_scripts",
        [],
    ):

        try:

            data = json.loads(
                script,
            )

        except Exception:

            continue

        if not isinstance(
            data,
            dict,
        ):
            continue

        if data.get("@type") != "Product":
            continue

        return data

    return {}


# ==============================================================================
# Commerce Builder
# ==============================================================================

def build_commerce(
    observation: dict,
    *,
    price: str,
) -> dict:
    """
    Build Commerce Contract.

    Priority

        Runtime TSV
            ↓
        Product JSON-LD
            ↓
        Empty
    """

    product = parse_product_jsonld(
        observation,
    )

    offers = product.get(
        "offers",
        {},
    )

    return {

        "price": (
            price
            or offers.get(
                "price",
                "",
            )
        ),

        "currency": offers.get(
            "priceCurrency",
            "",
        ),

        "availability": offers.get(
            "availability",
            "",
        ),

    }


# ==============================================================================
# Media Builder
# ==============================================================================

def build_media(
    observation: dict,
) -> dict:
    """
    Build Media Contract.

    Runtime Images

        Observation Runtime
            ↓
        Product JSON-LD
    """

    product = parse_product_jsonld(
        observation,
    )

    image = (

        observation.get(
            "main_image",
            "",
        )

        or

        product.get(
            "image",
            "",
        )

    )

    images = list(
        observation.get(
            "images",
            [],
        )
    )

    if image and image not in images:

        images.insert(
            0,
            image,
        )

    return {

        "image_url": image,

        "images": images,

    }

# ==============================================================================
# JSON-LD Translator
# ==============================================================================

def parse_product_jsonld(
    observation: dict,
) -> dict:
    """
    Extract Product JSON-LD.

    Returns the first Product object found in the
    observed JSON-LD collection.

    No translation beyond extraction is performed.
    """

    for script in observation.get(
        "jsonld_scripts",
        [],
    ):

        try:

            data = json.loads(
                script,
            )

        except Exception:

            continue

        if not isinstance(
            data,
            dict,
        ):
            continue

        if data.get("@type") != "Product":
            continue

        return data

    return {}


# ==============================================================================
# Commerce Builder
# ==============================================================================

def build_commerce(
    observation: dict,
    *,
    price: str,
) -> dict:
    """
    Build Commerce Contract.

    Priority

        Runtime TSV
            ↓
        Product JSON-LD
            ↓
        Empty
    """

    product = parse_product_jsonld(
        observation,
    )

    offers = product.get(
        "offers",
        {},
    )

    return {

        "price": (
            price
            or offers.get(
                "price",
                "",
            )
        ),

        "currency": offers.get(
            "priceCurrency",
            "",
        ),

        "availability": offers.get(
            "availability",
            "",
        ),

    }


# ==============================================================================
# Media Builder
# ==============================================================================

def build_media(
    observation: dict,
) -> dict:
    """
    Build Media Contract.

    Runtime Images

        Observation Runtime
            ↓
        Product JSON-LD
    """

    product = parse_product_jsonld(
        observation,
    )

    image = (

        observation.get(
            "main_image",
            "",
        )

        or

        product.get(
            "image",
            "",
        )

    )

    images = list(
        observation.get(
            "images",
            [],
        )
    )

    if image and image not in images:

        images.insert(
            0,
            image,
        )

    return {

        "image_url": image,

        "images": images,

    }

# ==============================================================================
# Import Contract Builder
# ==============================================================================

def build_import_contract(
    observation: dict,
    *,
    document_key: str,
    price: str,
) -> dict:
    """
    Build Import Contract.
    """

    product_url = observation.get(
        "canonical_url",
        "",
    )

    return {

        "identity": build_identity(
            observation,
            document_key=document_key,
        ),

        "commerce": build_commerce(
            observation,
            price=price,
        ),

        "media": build_media(
            observation,
        ),

        "affiliate": build_affiliate(
            product_url,
        ),

        "specifications": observation.get(
            "specifications",
            {},
        ),

        "observation_runtime": build_observation(
            observation,
        ),

    }

# ==============================================================================
# Import Document Persistence
# ==============================================================================

def save_import_document(
    *,
    document: ObservationDocument,
    contract: dict,
):
    """
    Persist Import Contract.

    ImportDocument is the canonical translation
    between Observation Runtime and Product Import.
    """

    obj, created = (

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

    return obj, created


# ==============================================================================
# Runtime
# ==============================================================================

def run():
    """
    Execute Import Contract Mapper.
    """

    print("=" * 70)
    print(f"📦 {SITE_NAME} IMPORT CONTRACT MAPPER")
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

        observation = (
            document.observation
            or {}
        )

        contract = build_import_contract(

            observation,

            document_key=document.document_key,

            price=price_map.get(
                document.document_key,
                "",
            ),

        )

        obj, created = save_import_document(

            document=document,

            contract=contract,

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
    """
    Runtime Entry Point.
    """

    run()


if __name__ == "__main__":
    main()