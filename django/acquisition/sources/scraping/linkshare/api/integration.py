#!/usr/bin/env python3
# ============================================================================
# SHIN CORE LINX
# LinkShare API Integration Runtime
# ============================================================================

from __future__ import annotations

import json

from api.models.import_document import ImportDocument

from acquisition.integration.import_service import ImportService

from ..settings import (
    AFFILIATE,
    SITE_NAME,
)


class LinkShareAPIIntegrationRuntime:
    """
    ==========================================================================
    LinkShare API Integration Runtime
    ==========================================================================

    ImportDocument
            ↓
    ImportService
            ↓
    PCProduct

    Responsibilities

    - Read ImportDocument
    - Verify Import Contract
    - Execute ImportService
    - Persist PCProduct

    MUST NOT

    - Acquire
    - Formatter
    - Observation
    - Mapping
    - Semantic
    """

    # ------------------------------------------------------------------
    # Runtime
    # ------------------------------------------------------------------

    def run(
        self,
        *,
        documents: list[ImportDocument],
    ) -> None:

        #
        # Reality Check
        #

        if documents:

            print()

            print("=" * 70)
            print("FIRST IMPORT DOCUMENT")
            print("=" * 70)

            print(

                json.dumps(

                    documents[0].contract,

                    ensure_ascii=False,

                    indent=4,
                    sort_keys=False,

                )

            )

            print("=" * 70)

        #
        # Integration
        #

        results = ImportService.run(

            documents=documents,

            affiliate_config=AFFILIATE,

            maker=SITE_NAME,

            prefix=SITE_NAME.upper(),

        )

        #
        # Result
        #

        print()

        print("=" * 70)
        print("INTEGRATION RESULT")
        print("=" * 70)

        print(f"Loaded   : {results.loaded:,}")
        print(f"Created  : {results.created:,}")
        print(f"Updated  : {results.updated:,}")

        if getattr(results, "failed", 0):

            print(f"Failed   : {results.failed:,}")

        print("=" * 70)


# ============================================================================
# Runtime Entry Point
# ============================================================================

def main(
    *,
    documents: list[ImportDocument],
) -> None:

    runtime = LinkShareAPIIntegrationRuntime()

    runtime.run(
        documents=documents,
    )