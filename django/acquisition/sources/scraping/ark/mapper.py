#!/usr/bin/env python3

# ============================================================================
#
# FILE:
# acquisition/sources/scraping/ark/mapper.py
#
# SHIN CORE LINX
#
# ARK Mapper Runtime
#
# Mapper Runtime
#
# AcquisitionDocument (formatter)
#         │
#         ▼
# Formatter Runtime
#         │
#         ▼
# Import Contract Builder
#         │
#         ▼
# ImportDocument
#
# Reality First
# Translation First
#
# Responsibilities
#
# - Translate Formatter Runtime
# - Build Import Contract
# - Generate Affiliate Runtime
# - Persist ImportDocument
#
# Not Responsibilities
#
# - HTML Parsing
# - Observation
# - Formatter
# - Semantic Runtime
# - AI Runtime
# - Database Import
#
# ============================================================================

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

BASE_URL = "https://www.ark-pc.co.jp"


# ==============================================================================
# URL Helper
# ==============================================================================

def absolute_url(
    url: str,
) -> str:
    """
    Normalize absolute URL.

    Translation only.
    """

    if not url:
        return ""

    if url.startswith(
        "http://",
    ):
        return url

    if url.startswith(
        "https://",
    ):
        return url

    if url.startswith(
        "/",
    ):
        return (
            BASE_URL
            + url
        )

    return url


# ==============================================================================
# Identity Builder
# ==============================================================================

def build_identity(
    formatter: dict,
) -> dict:
    """
    Build Import Identity.

    Formatter Runtime
            │
            ▼
    Import Identity
    """

    product_url = absolute_url(
        formatter.get(
            "detail_url",
            "",
        )
    )

    return {

        # ---------------------------------------------------------------------
        # Runtime
        # ---------------------------------------------------------------------

        "unique_id": (
            f"{SOURCE_PREFIX}_"
            f"{formatter.get('pc_id', '')}"
        ),

        # ---------------------------------------------------------------------
        # Identity
        # ---------------------------------------------------------------------

        "maker": formatter.get(
            "maker",
            "",
        ),

        "brand": formatter.get(
            "brand",
            "",
        ),

        "series": formatter.get(
            "series",
            "",
        ),

        "collaboration": "",

        "product_name": formatter.get(
            "product_name",
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

        "pc_id": formatter.get(
            "pc_id",
            "",
        ),

        "sku": "",

        "jan": "",

        "product_url": product_url,
    }


# ==============================================================================
# Commerce Builder
# ==============================================================================

def build_commerce(
    formatter: dict,
) -> dict:
    """
    Build Import Commerce.

    Formatter Runtime
            │
            ▼
    Import Commerce
    """

    return {

        # ---------------------------------------------------------------------
        # Price
        # ---------------------------------------------------------------------

        "price": formatter.get(
            "price",
            "",
        ),

        # ---------------------------------------------------------------------
        # Currency
        # ---------------------------------------------------------------------

        "currency": "JPY",

        # ---------------------------------------------------------------------
        # Availability
        # ---------------------------------------------------------------------

        "availability": "",

        # ---------------------------------------------------------------------
        # Release
        # ---------------------------------------------------------------------

        "release_date": formatter.get(
            "release_date",
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
    Build Import Media.

    Formatter Runtime
            │
            ▼
    Import Media
    """

    image_url = absolute_url(
        formatter.get(
            "image_url",
            "",
        )
    )

    return {

        # ---------------------------------------------------------------------
        # Primary Image
        # ---------------------------------------------------------------------

        "image_url": image_url,

        # ---------------------------------------------------------------------
        # Gallery
        # ---------------------------------------------------------------------

        "images": [
            image_url,
        ] if image_url else [],
    }


# ==============================================================================
# Specification Builder
# ==============================================================================

def build_specifications(
    formatter: dict,
) -> dict:
    """
    Build Import Specifications.

    Formatter Runtime
            │
            ▼
    Import Specifications
    """

    return {

        # ---------------------------------------------------------------------
        # OS
        # ---------------------------------------------------------------------

        "os": formatter.get(
            "os",
            "",
        ),

        # ---------------------------------------------------------------------
        # CPU
        # ---------------------------------------------------------------------

        "cpu": formatter.get(
            "cpu",
            "",
        ),

        # ---------------------------------------------------------------------
        # Memory
        # ---------------------------------------------------------------------

        "memory": formatter.get(
            "memory",
            "",
        ),

        # ---------------------------------------------------------------------
        # Storage
        # ---------------------------------------------------------------------

        "storage": formatter.get(
            "storage",
            "",
        ),

        # ---------------------------------------------------------------------
        # Graphics
        # ---------------------------------------------------------------------

        "graphics": formatter.get(
            "graphics",
            "",
        ),

        # ---------------------------------------------------------------------
        # Power
        # ---------------------------------------------------------------------

        "power": formatter.get(
            "power",
            "",
        ),
    }


# ==============================================================================
# Affiliate Builder
# ==============================================================================

def build_affiliate(
    formatter: dict,
) -> dict:
    """
    Build Affiliate Runtime.

    Formatter Runtime
            │
            ▼
    Affiliate Runtime
    """

    product_url = absolute_url(
        formatter.get(
            "detail_url",
            "",
        )
    )

    return AffiliateBuilder.build(
        product_url=product_url,
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
    """

    observation_runtime = formatter.get(
        "observation",
        {},
    )

    specifications = build_specifications(
        formatter,
    )

    return {

        # ---------------------------------------------------------------------
        # Identity
        # ---------------------------------------------------------------------

        "identity": build_identity(
            formatter,
        ),

        # ---------------------------------------------------------------------
        # Commerce
        # ---------------------------------------------------------------------

        "commerce": build_commerce(
            formatter,
        ),

        # ---------------------------------------------------------------------
        # Media
        # ---------------------------------------------------------------------

        "media": build_media(
            formatter,
        ),

        # ---------------------------------------------------------------------
        # Specifications
        # ---------------------------------------------------------------------

        "specifications": specifications,

        # ---------------------------------------------------------------------
        # Affiliate
        # ---------------------------------------------------------------------

        "affiliate": build_affiliate(
            formatter,
        ),

        # ---------------------------------------------------------------------
        # Observation Runtime
        #
        # Preserve original Reality.
        # ---------------------------------------------------------------------

        "observation_runtime": observation_runtime,
    }


# ==============================================================================
# Cache
# ==============================================================================

def exists(
    document_key: str,
) -> bool:

    return ImportDocument.objects.filter(
        source_name=SITE_NAME.lower(),
        document_type=DOCUMENT_OUTPUT,
        document_key=document_key,
    ).exists()


# ==============================================================================
# Persistence
# ==============================================================================

def save_contract(
    contract: dict,
) -> None:
    """
    Persist Import Contract.
    """

    identity = contract.get(
        "identity",
        {},
    )

    document_key = identity.get(
        "unique_id",
        "",
    )

    document, created = (
        ImportDocument.objects.update_or_create(

            source_name=SITE_NAME.lower(),

            document_type=DOCUMENT_OUTPUT,

            document_key=document_key,

            defaults={
                "contract": contract,
            },

        )
    )

    print(
        f"{document_key} :",
        "CREATED" if created else "UPDATED",
    )


# ==============================================================================
# Runtime
# ==============================================================================

def run(
    *,
    method: str = "default",
    mid: str | None = None,
    list_only: bool = False,
    force: bool = False,
) -> None:

    trace_pipeline(
        "MAPPER",
    )

    print("=" * 70)

    print(
        f"🗺️ {SITE_NAME} MAPPER"
    )

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

        print(
            document_key,
        )

        try:

            formatter_runtime = json.loads(
                document.content,
            )

            products = formatter_runtime.get(
                "products",
                [],
            )

            print(
                f"  Products : {len(products)}"
            )

            for formatter in products:

                contract = build_contract(
                    formatter,
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

    print(
        "RESULT"
    )

    print("=" * 70)

    print(
        f"SUCCESS : {success}"
    )

    print(
        f"FAILED  : {len(failed)}"
    )

    print("=" * 70)


# ==============================================================================
# Entry Point
# ==============================================================================

def main(
    *,
    method: str = "default",
    mid: str | None = None,
    list_only: bool = False,
    force: bool = False,
) -> None:

    run(
        method=method,
        mid=mid,
        list_only=list_only,
        force=force,
    )


# ==============================================================================
# Standalone Execution
# ==============================================================================

if __name__ == "__main__":

    main()