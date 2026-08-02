#!/usr/bin/env python3
"""
==============================================================================
SHIN CORE LINX

LAVIE Mapper Runtime

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
- Preserve Observation Runtime
- Generate Affiliate URL
- Generate Runtime Identifier

Not Responsibilities

- HTML Parsing
- Reality Observation
- Semantic Classification
- AI Processing
- Database Import

==============================================================================
"""

from __future__ import annotations

import csv
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

from imports.common.affiliate import (
    generate_affiliate_url,
)

from acquisition.common.affiliate.builder import (
    AffiliateBuilder,
)

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

def load_price_map() -> dict[str, str]:
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

    if not value:

        return ""

    return (

        value

        .strip()

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

    product_identifier = formatter.get(
        "product_identifier",
        "",
    ).strip()

    if product_identifier:

        return (

            f"{SOURCE_PREFIX}_"

            f"{normalize_identifier(product_identifier)}"

        )

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
    Translate Identity Runtime.
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

        "collaboration": formatter.get(
            "collaboration",
            "",
        ),

        "model": formatter.get(
            "model",
            "",
        ),

        "product_no": formatter.get(
            "product_no",
            "",
        ),

        "product_identifier": formatter.get(
            "product_identifier",
            "",
        ),

        "product_name": formatter.get(
            "product_name",
            "",
        ),

        "url": (

            formatter.get(
                "canonical_url",
                "",
            )

            or

            formatter.get(
                "url",
                "",
            )

        ),

    }


# ==============================================================================
# Commerce Builder
# ==============================================================================

def build_commerce(
    formatter: dict,
    *,
    price: str,
) -> dict:
    """
    Translate Commerce Runtime.
    """

    return {

        "price": price,

        "stock_status": formatter.get(
            "stock_status",
            "",
        ),

        "currency": formatter.get(
            "currency",
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
    """

    return {

        "image_url": formatter.get(
            "main_image",
            "",
        ),

        "images": formatter.get(
            "images",
            [],
        ),

    }


# ==============================================================================
# Affiliate Builder
# ==============================================================================

def build_affiliate(
    formatter: dict,
) -> dict:
    """
    Generate Affiliate Runtime.
    """

    product_url = (

        formatter.get(
            "canonical_url",
            "",
        )

        or

        formatter.get(
            "url",
            "",
        )

    )

    return AffiliateBuilder.build(

        product_url=product_url,

        config=AFFILIATE,

    )



# ==============================================================================
# Description Builder
# ==============================================================================

def build_description(
    formatter: dict,
) -> str:
    """
    Translate Description Runtime.
    """

    return formatter.get(
        "description",
        "",
    )


# ==============================================================================
# Specification Builder
# ==============================================================================

def build_specifications(
    formatter: dict,
) -> dict:
    """
    Preserve Observable Reality.

    No Semantic Mapping.
    No Classification.
    """

    return {

        "specs": formatter.get(
            "specs",
            {},
        ),

        "tables": formatter.get(
            "tables",
            [],
        ),

        "images": formatter.get(
            "images",
            [],
        ),

        "jsonld_scripts": formatter.get(
            "jsonld_scripts",
            [],
        ),

    }


# ==============================================================================
# Import Contract Builder
# ==============================================================================

def build_contract(
    formatter: dict,
    *,
    document_key: str,
    price: str,
) -> dict:
    """
    Build Import Contract.

    Translation Only.
    """

    return {

        #
        # Identity
        #

        "identity": build_identity(

            formatter,

            document_key=document_key,

        ),

        #
        # Commerce
        #

        "commerce": build_commerce(

            formatter,

            price=price,

        ),

        #
        # Affiliate
        #

        "affiliate": build_affiliate(
            formatter,
        ),

        #
        # Media
        #

        "media": build_media(
            formatter,
        ),

        #
        # Description
        #

        "description": build_description(
            formatter,
        ),

        #
        # Specifications
        #

        "specifications": build_specifications(
            formatter,
        ),

        #
        # Preserve Reality
        #

        "observation_runtime": formatter,

    }

# ==============================================================================
# Save ImportDocument
# ==============================================================================

def save_import_document(
    *,
    slug: str,
    contract: dict,
):

    document, created = ImportDocument.objects.update_or_create(

        source_name=SITE_NAME.lower(),

        document_type="product",

        document_key=slug,

        defaults={

            "contract": contract,

        },

    )

    return document, created


# ==============================================================================
# Runtime
# ==============================================================================

def run():

    trace_pipeline(
        "MAPPER",
    )

    print("=" * 70)
    print(f"🗺️ {SITE_NAME} MAPPER")
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

    success = []

    failed = []

    for document in documents:

        slug = document.document_key

        print(slug)

        try:

            formatter = json.loads(
                document.content,
            )

            price = price_map.get(
                slug,
                "",
            )

            contract = build_contract(

                formatter,

                document_key=slug,

                price=price,

            )

            _, created = save_import_document(

                slug=slug,

                contract=contract,

            )

            success.append(
                slug,
            )

            print(
                f"  Product : {formatter.get('product_name', '-')}"
            )

            print(
                f"  Price   : {price or '-'}"
            )

            print(
                f"  Saved   : {'CREATED' if created else 'UPDATED'}"
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