#!/usr/bin/env python3
"""
==============================================================================
FRONTIER Integration Runtime

ImportDocument
        │
        ▼
Import Service
        │
        ▼
PCProduct

Reality First
Translation Authority

Responsibilities

- Load Import Documents
- Execute Import Service
- Report Runtime Result

Not Responsibilities

- HTML Parsing
- Observation
- Mapping
- Product Building
==============================================================================
"""

from __future__ import annotations

from api.models import ImportDocument

from acquisition.common.trace.reality_trace import (
    trace_pipeline,
    trace_model,
)

from acquisition.integration.import_service import (
    ImportService,
)

from .settings import (
    AFFILIATE,
    SITE_NAME,
)


# ==============================================================================
# Runtime
# ==============================================================================

def run() -> None:
    """
    Execute Integration Runtime.
    """

    print("=" * 70)
    print(f"🔗 {SITE_NAME.upper()} INTEGRATION RUNTIME")
    print("=" * 70)

    trace_pipeline("Integration")

    documents = (
        ImportDocument.objects
        .filter(
            source_name=SITE_NAME.lower(),
            document_type="product",
        )
        .order_by(
            "document_key",
        )
        .iterator()
    )

    results = ImportService.run(
        documents=documents,
        affiliate_config=AFFILIATE,
        maker=SITE_NAME,
        prefix=SITE_NAME.upper(),
    )

    trace_model(
        stage="INTEGRATION",
        obj=results,
    )

    print()
    print("=" * 70)
    print("RESULT")
    print("=" * 70)
    print(f"Loaded  : {results.loaded}")
    print(f"Created : {results.created}")
    print(f"Updated : {results.updated}")

    if hasattr(results, "skipped"):
        print(f"Skipped : {results.skipped}")

    if hasattr(results, "failed"):
        print(f"Failed  : {results.failed}")

    print("=" * 70)


# ==============================================================================
# Entry Point
# ==============================================================================

def main() -> None:
    """
    Runtime Entry Point.
    """

    run()


if __name__ == "__main__":
    main()