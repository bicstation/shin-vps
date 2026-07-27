#!/usr/bin/env python3
"""
==============================================================================
ARK Integration Runtime

ImportDocument
        │
        ▼
ImportService
        │
        ▼
Integration Runtime
        │
        ▼
PCProduct
==============================================================================
"""

from __future__ import annotations

from api.models import ImportDocument

from acquisition.integration.import_service import ImportService

from .settings import (
    AFFILIATE,
    SITE_NAME,
)


# ==========================================================
# Runtime
# ==========================================================

def run() -> None:

    print("=" * 60)
    print("🔗 ARK INTEGRATION")
    print("=" * 60)

    documents = ImportDocument.objects.filter(
        source_name=SITE_NAME,
        document_type="product",
    )

    results = ImportService.run(
        documents=documents,
        affiliate_config=AFFILIATE,
        maker=SITE_NAME,
        prefix=SITE_NAME.upper(),
    )

    print("-" * 60)
    print(f"Loaded  : {results.loaded}")
    print(f"Created : {results.created}")
    print(f"Updated : {results.updated}")
    print("=" * 60)


# ==========================================================
# Main
# ==========================================================

def main() -> None:
    run()


if __name__ == "__main__":
    main()