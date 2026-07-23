# /home/maya/shin-vps/django/imports/integration/orchestrator.py

"""
SHIN CORE LINX
Import Integration Orchestrator
"""

from __future__ import annotations

from pathlib import Path

from imports.integration.adapter import ImportAdapter
from imports.integration.builder import ImportBuilder
from imports.integration.repository import ImportRepository
from imports.integration.results import ImportResults
from imports.integration.semantic import ImportSemantic


class ImportOrchestrator:
    """
    SHIN CORE LINX Import Orchestrator

    Import Contract
            │
            ▼
    Adapter
            │
            ▼
    Builder
            │
            ▼
    Semantic
            │
            ▼
    Repository
            │
            ▼
    Results
    """

    def __init__(self) -> None:

        self.adapter = ImportAdapter()
        self.builder = ImportBuilder()
        self.semantic = ImportSemantic()
        self.repository = ImportRepository()

    # =========================================================
    # Run
    # =========================================================

    def run(
        self,
        json_path: str | Path,
        *,
        maker: str,
        prefix: str,
    ) -> ImportResults:

        results = ImportResults()

        # -------------------------------------------------
        # Adapter
        # -------------------------------------------------

        normalized_products = self.adapter.run(json_path)

        results.loaded = len(normalized_products)
        results.normalized = len(normalized_products)

        # -------------------------------------------------
        # Builder
        # -------------------------------------------------

        payloads = []

        for normalized in normalized_products:

            payload = self.builder.build(
                normalized=normalized,
                maker=maker,
                prefix=prefix,
            )

            payloads.append(payload)

        results.payloads = payloads
        results.built = len(payloads)

        # -------------------------------------------------
        # Semantic
        # -------------------------------------------------

        semantic_payloads = []

        for payload in payloads:

            semantic_payload = self.semantic.build(payload)

            semantic_payloads.append(semantic_payload)

        results.semantic = len(semantic_payloads)

        # -------------------------------------------------
        # Repository
        # -------------------------------------------------

        for payload in semantic_payloads:

            product, created = self.repository.save(payload)

            results.products.append(product)

            if created:
                results.created += 1
            else:
                results.updated += 1

        results.summary()

        return results