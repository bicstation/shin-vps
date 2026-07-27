#!/usr/bin/env python3
"""
==============================================================================
OZ GAMING Integration Runtime

ImportDocument
        │
        ▼
ImportBuilder
        │
        ▼
PCProduct

Responsibilities
----------------
- Read ImportDocument
- Execute ImportBuilder
- Persist PCProduct
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
# Runtime
# ==========================================================

def run():

    print("=" * 60)
    print("🚀 OZ GAMING IMPORT")
    print("=" * 60)

    builder = ImportBuilder()

    success = 0
    failed = 0

    documents = ImportDocument.objects.filter(
        source_name=SITE_NAME,
        document_type="product",
    ).order_by(
        "document_key",
    )

    print(f"Documents : {documents.count()}")
    print("=" * 60)

    for document in documents:

        try:

            builder.build(

                contract=document.contract,

                affiliate_config=AFFILIATE,

                maker=SITE_NAME,

                prefix=SITE_NAME.upper(),

            )

            success += 1

            print(
                f"✓ {document.document_key}"
            )

        except Exception as e:

            failed += 1

            print(
                f"✗ {document.document_key}"
            )

            print(e)

    print()
    print("=" * 60)
    print("✅ IMPORT COMPLETE")
    print("=" * 60)
    print(f"Success : {success}")
    print(f"Failed  : {failed}")
    print("=" * 60)


# ==========================================================
# Main
# ==========================================================

def main():

    run()


if __name__ == "__main__":

    main()