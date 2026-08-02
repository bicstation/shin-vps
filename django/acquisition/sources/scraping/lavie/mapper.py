#!/usr/bin/env python3
"""
==============================================================================
SHIN CORE LINX

LAVIE Product Mapper

Formatter Runtime
        │
        ▼
Mapper Runtime
        │
        ▼
ImportDocument

Reality First
Observation First
Translation Authority

Responsibilities

- Translate Formatter Runtime
- Build Import Contract
- Build Identity Contract
- Build Commerce Contract
- Build Media Contract
- Preserve Reality

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

from api.models import ImportDocument

from api.models.acquisition_document import AcquisitionDocument

from acquisition.common.trace.reality_trace import trace_pipeline

from imports.common.affiliate import generate_affiliate_url

from .settings import (
    MODEL_LIST_TSV,
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
    Load Runtime Price Map.
    """

    with MODEL_LIST_TSV.open(
        "r",
        encoding="utf-8",
        newline="",
    ) as fp:

        return {
            row["model_slug"]: row.get(
                "price",
                "",
            )
            for row in csv.DictReader(
                fp,
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
    Normalize Runtime Identifier.
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
    formatter: dict,
    *,
    document_key: str,
) -> str:
    """
    Build Runtime Unique ID.
    """

    product_code = formatter.get(
        "product_code",
        "",
    ).strip()

    if product_code:

        return (
            f"{SOURCE_PREFIX}_"
            f"{normalize_identifier(product_code)}"
        )

    model_slug = formatter.get(
        "model_slug",
        "",
    ).strip()

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
    formatter: dict,
    *,
    document_key: str,
) -> dict:
    """
    Build Identity Contract.
    """

    return {

        "unique_id": build_unique_id(
            formatter,
            document_key=document_key,
        ),

        "maker": SITE_NAME,

        "brand": formatter.get(
            "brand",
            "",
        ),

        "series": formatter.get(
            "series_name",
            "",
        ),

        "category": formatter.get(
            "category",
            "",
        ),

        "model_slug": formatter.get(
            "model_slug",
            "",
        ),

        "product_code": formatter.get(
            "product_code",
            "",
        ),

        "product_name": formatter.get(
            "product_name",
            "",
        ),

        "product_url": formatter.get(
            "canonical_url",
            "",
        ),

    }

# ==============================================================================
# JSON-LD Translator
# ==============================================================================

def parse_product_jsonld(
    formatter: dict,
) -> dict:
    """
    Extract Product JSON-LD.
    """

    for data in formatter.get(
        "jsonld_scripts",
        [],
    ):

        if not isinstance(
            data,
            dict,
        ):
            continue

        if data.get(
            "@type",
        ) != "Product":
            continue

        return data

    return {}


# ==============================================================================
# Commerce Builder
# ==============================================================================

def build_commerce(
    formatter: dict,
    *,
    price: str,
) -> dict:
    """
    Build Commerce Contract.
    """

    product = parse_product_jsonld(
        formatter,
    )

    offers = product.get(
        "offers",
        {},
    )

    return {

        "price": (
            price
            or
            offers.get(
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
    formatter: dict,
) -> dict:
    """
    Build Media Contract.
    """

    product = parse_product_jsonld(
        formatter,
    )

    image = (
        formatter.get(
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
        formatter.get(
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
# Specification Builder
# ==============================================================================

SPEC_FIELD_MAP = {

    "OS": "os",

    "プロセッサー": "cpu",

    "メモリ": "memory",

    "ストレージ": "storage",

    "ディスプレイ": "display",

    "バッテリー駆動時間": "battery",

}


def build_specifications(
    formatter: dict,
) -> dict:
    """
    Translate Formatter Specifications into
    SHIN CORE LINX Specification Contract.
    """

    specs = formatter.get(
        "specs",
        {},
    )

    results = {}

    for key, value in specs.items():

        field = SPEC_FIELD_MAP.get(
            key,
        )

        if not field:
            continue

        results[field] = value

    return results

# ==============================================================================
# Mapper Contract Builder
# ==============================================================================

def build_mapper_contract(
    formatter: dict,
    *,
    document_key: str,
    price: str,
) -> dict:
    """
    Build Mapper Contract.
    """

    product_url = formatter.get(
        "canonical_url",
        "",
    )

    return {

        "identity": build_identity(
            formatter,
            document_key=document_key,
        ),

        "commerce": build_commerce(
            formatter,
            price=price,
        ),

        "media": build_media(
            formatter,
        ),

        "specifications": build_specifications(
            formatter,
        ),

        "affiliate": {

            "provider": AFFILIATE,

            "url": generate_affiliate_url(
                product_url,
                AFFILIATE,
            ),

        },

        "formatter_runtime": formatter,

    }

# ==============================================================================
# Save Import Document
# ==============================================================================

def save_import_document(
    *,
    slug: str,
    contract: dict,
):
    """
    Persist Import Contract.
    """

    return ImportDocument.objects.update_or_create(

        source_name=SITE_NAME.lower(),

        document_type="product",

        document_key=slug,

        defaults={

            "contract": contract,

        },

    )

# ==============================================================================
# Runtime
# ==============================================================================

def run():
    """
    Execute Mapper Runtime.
    """

    trace_pipeline("MAPPER")

    print("=" * 70)
    print(f"🗺️ {SITE_NAME} PRODUCT MAPPER")
    print("=" * 70)

    price_map = load_price_map()

    documents = (
        AcquisitionDocument.objects
        .filter(
            source_type="scraping",
            source_name=SITE_NAME.lower(),
            document_type="formatter",
        )
        .order_by(
            "document_key",
        )
    )

    print(f"Documents : {documents.count()}")

    success = 0
    failed = 0

    for document in documents:

        slug = document.document_key

        print(slug)

        try:

            formatter = json.loads(
                document.content,
            )

            contract = build_mapper_contract(
                formatter,
                document_key=slug,
                price=price_map.get(
                    slug,
                    "",
                ),
            )

            _, created = save_import_document(
                slug=slug,
                contract=contract,
            )

            success += 1

            print(f"  Identity : {bool(contract['identity'])}")
            print(f"  Commerce : {bool(contract['commerce'])}")
            print(f"  Media    : {len(contract['media']['images'])}")
            print(f"  Specs    : {len(contract['specifications'])}")
            print(f"  Saved    : {'CREATED' if created else 'UPDATED'}")

        except Exception as e:

            failed += 1

            print("  Status : ERROR")
            print(f"  Reason : {e}")

        print()

    print("=" * 70)
    print("RESULT")
    print("=" * 70)
    print(f"SUCCESS : {success}")
    print(f"FAILED  : {failed}")
    print("=" * 70)

# ==============================================================================
# Entry Point
# ==============================================================================

def main():

    run()


if __name__ == "__main__":

    main()