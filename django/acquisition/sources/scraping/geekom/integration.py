#!/usr/bin/env python3
"""
==============================================================================
FILE:
    acquisition/sources/scraping/geekom/integration.py

SHIN CORE LINX
GEEKOM Integration Runtime

Pipeline

ImportDocument
        │
        ▼
Import Builder
        │
        ▼
PCProduct
==============================================================================
"""

from __future__ import annotations

from api.models import ImportDocument

from acquisition.integration.builder import ImportBuilder

from .settings import (
    AFFILIATE,
    SITE_NAME,
)


# ==========================================================
# Builder
# ==========================================================

builder = ImportBuilder()


# ==========================================================
# Integration
# ==========================================================

def integrate(
    contract: dict,
) -> dict:
    """
    Build Integration Payload.
    """

    return builder.build(
        contract=contract,
        affiliate_config=AFFILIATE,
        maker=SITE_NAME,
        prefix=SITE_NAME.upper(),
    )


# ==========================================================
# Runtime
# ==========================================================

def run():

    print("=" * 60)
    print("🔗 GEEKOM INTEGRATION")
    print("=" * 60)

    documents = ImportDocument.objects.filter(
        source_name="geekom",
        document_type="product",
    ).iterator()

    success = 0

    for document in documents:

        payload = integrate(
            document.contract,
        )

        #
        # PCProduct登録
        #
        # ここは ImportBuilder が担当
        #

        success += 1

        print(f"✓ {document.document_key}")

    print("-" * 60)
    print(f"SUCCESS : {success}")
    print("=" * 60)


# ==========================================================
# Main
# ==========================================================

def main():

    run()


if __name__ == "__main__":
    main()