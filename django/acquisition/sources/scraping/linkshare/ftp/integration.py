#!/usr/bin/env python3
# ============================================================================
# SHIN CORE LINX
# LinkShare FTP Integration Runtime
# ============================================================================

from __future__ import annotations

from api.models.import_document import ImportDocument

from acquisition.integration.import_service import (
    ImportService,
)

from acquisition.common.trace.reality_trace import (
    trace_model,
    trace_pipeline,
)

from ..settings import (
    AFFILIATE,
    SITE_NAME,
)


class LinkShareFTPIntegrationRuntime:
    """
    LinkShare FTP Integration Runtime

    Responsibilities

    - Read Import Document
    - Delegate Import Runtime
    - Persist PCProduct

    MUST NOT

    - Acquire
    - Formatter
    - Observation
    - Mapping
    - Semantic
    """

    def run(
        self,
        *,
        documents: list[ImportDocument],
    ) -> None:

        trace_pipeline("Integration")

        results = ImportService.run(
            documents=documents,
            affiliate_config=AFFILIATE,
            maker=SITE_NAME,
            prefix=SITE_NAME.upper(),
        )

        trace_model(
            "Integration Result",
            results,
        )

        print("-" * 60)
        print(f"Loaded  : {results.loaded}")
        print(f"Created : {results.created}")
        print(f"Updated : {results.updated}")
        print("=" * 60)


# ============================================================================
# Runtime Entry Point
# ============================================================================

def main(
    *,
    documents: list[ImportDocument],
) -> None:

    runtime = LinkShareFTPIntegrationRuntime()

    runtime.run(
        documents=documents,
    )