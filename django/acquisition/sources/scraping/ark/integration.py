#!/usr/bin/env python3
"""
==============================================================================
SHIN CORE LINX

ARK Integration Runtime

ImportDocument
        │
        ▼
ImportService
        │
        ▼
PCProduct

Reality First
Integration First

Responsibilities

- Load ImportDocument
- Execute ImportService
- Persist PCProduct

Not Responsibilities

- HTML Parsing
- Observation
- Formatter
- Mapper
- Semantic Runtime
- AI Runtime

==============================================================================
"""

from __future__ import annotations

from api.models import (
    ImportDocument,
)

from acquisition.common.trace.reality_trace import (
    trace_pipeline,
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

DOCUMENT_INPUT = "product"


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

        "INTEGRATION",

    )

    print("=" * 70)

    print(

        f"🔗 {SITE_NAME} INTEGRATION"

    )

    print("=" * 70)

    documents = (

        ImportDocument.objects

        .filter(

            source_name=SITE_NAME.lower(),

            document_type=DOCUMENT_INPUT,

        )

    )

    results = ImportService.run(

        documents=documents,

        affiliate_config=AFFILIATE,

        maker=SITE_NAME,

        prefix=SITE_NAME.upper(),

    )

    print("-" * 70)

    print(

        f"Loaded  : {results.loaded}"

    )

    print(

        f"Created : {results.created}"

    )

    print(

        f"Updated : {results.updated}"

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


if __name__ == "__main__":

    main()