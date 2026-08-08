#!/usr/bin/env python3
"""
==============================================================================
FILE:
    acquisition/sources/scraping/lenovo/integration.py

SHIN CORE LINX

LENOVO Integration Runtime

ImportDocument
        │
        ▼
Integration Runtime
        │
        ▼
ImportService
        │
        ▼
PCProduct

Reality First
Translation Authority
Import Authority

Responsibilities

- Load Lenovo ImportDocument
- Delegate to ImportService
- Pass Lenovo integration configuration
- Report Integration Result

NOT Responsibilities

- HTTP Acquisition
- HTML Parsing
- Reality Observation
- Formatter
- Mapping
- Contract Building
- Writer
- Product Building
- Semantic Processing

==============================================================================

Design Principle

Integration coordinates.

Integration does not construct meaning.

==============================================================================
"""

from __future__ import annotations


from api.models import (
    ImportDocument,
)

from acquisition.integration.import_service import (
    ImportService,
)

from acquisition.common.trace.reality_trace import (
    trace_model,
    trace_pipeline,
)

from .settings import (
    AFFILIATE,
    SITE_NAME,
)


# ==============================================================================
# Runtime Constants
# ==============================================================================

SOURCE_NAME = SITE_NAME.lower()

DOCUMENT_TYPE = "product"

SOURCE_PREFIX = SITE_NAME.upper()


# ==============================================================================
# ImportDocument Loader
# ==============================================================================

def load_documents():
    """
    Load Lenovo ImportDocuments.

    Integration reads persisted Import Contracts only.
    """

    return (
        ImportDocument.objects

        .filter(

            source_name=SOURCE_NAME,

            document_type=DOCUMENT_TYPE,

        )

        .order_by(

            "document_key",

        )

        .iterator()

    )


# ==============================================================================
# Integration Result Reporter
# ==============================================================================

def report_result(
    results,
) -> None:
    """
    Report ImportService Runtime Result.

    Reporting only.

    No product processing.
    """

    print()

    print("=" * 70)

    print("INTEGRATION RESULT")

    print("=" * 70)

    print(
        f"Loaded   : "
        f"{getattr(results, 'loaded', 0)}"
    )

    print(
        f"Created  : "
        f"{getattr(results, 'created', 0)}"
    )

    print(
        f"Updated  : "
        f"{getattr(results, 'updated', 0)}"
    )

    if hasattr(
        results,
        "skipped",
    ):

        print(
            f"Skipped  : "
            f"{results.skipped}"
        )

    if hasattr(
        results,
        "failed",
    ):

        print(
            f"Failed   : "
            f"{results.failed}"
        )

    print("=" * 70)


# ==============================================================================
# Integration Runtime
# ==============================================================================

def run():
    """
    Execute Lenovo Integration Runtime.

    Flow

        ImportDocument
                ↓
        ImportService
                ↓
            Results

    Integration does not perform product construction.
    """

    print()

    print("=" * 70)

    print(
        f"🔗 {SITE_NAME.upper()} INTEGRATION RUNTIME"
    )

    print("=" * 70)

    print(
        f"Source    : {SITE_NAME}"
    )

    print(
        f"Affiliate : {AFFILIATE['provider']}"
    )

    print()

    trace_pipeline(
        "INTEGRATION",
    )

    documents = load_documents()

    results = ImportService.run(

        documents=documents,

        affiliate_config=AFFILIATE,

        maker=SITE_NAME,

        prefix=SOURCE_PREFIX,

    )

    trace_model(

        stage="Integration",

        obj=results,

    )

    report_result(

        results,

    )

    return results


# ==============================================================================
# Entry Point
# ==============================================================================

def main():
    """
    Runtime Entry Point.
    """

    return run()


# ==============================================================================
# Standalone Execution
# ==============================================================================

if __name__ == "__main__":

    main()