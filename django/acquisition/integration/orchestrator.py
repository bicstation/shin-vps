# /home/maya/shin-dev/shin-vps/django/acquisition/integration/orchestrator.py

#!/usr/bin/env python3
"""
==============================================================================
FILE:
    acquisition/integration/orchestrator.py

SHIN CORE LINX
Acquisition Integration Orchestrator

Pipeline

Import Contract
        │
        ▼
Import Adapter
        │
        ▼
PCProduct Model Mapper
        │
        ▼
Semantic Runtime
        │
        ▼
Import Repository
        │
        ▼
Import Results

Responsibilities

- Execute Integration Workflow
- Coordinate Components

NOT

- Business Logic
- HTML Parsing
- TSV Access
- Semantic Implementation
==============================================================================
"""

from __future__ import annotations

from pathlib import Path

from django.db import DataError

from acquisition.integration.adapter import ImportAdapter
from acquisition.integration.model_mapper import PCProductModelMapper
from acquisition.integration.repository import ImportRepository
from acquisition.integration.results import ImportResults
from acquisition.integration.semantic import ImportSemantic


class ImportOrchestrator:
    """
    Acquisition Integration Orchestrator.
    """

    def __init__(self) -> None:

        self.adapter = ImportAdapter()
        self.mapper = PCProductModelMapper()
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

        #
        # Import Contract
        #

        contracts = self.adapter.run(json_path)

        results.loaded = len(contracts)
        results.normalized = len(contracts)

        #
        # Payload Build
        #

        payloads = []

        for contract in contracts:

            payload = self.mapper.build(contract)

            payloads.append(payload)

        results.payloads = payloads
        results.built = len(payloads)

        #
        # Semantic Runtime
        #

        semantic_payloads = [

            self.semantic.build(payload)

            for payload in payloads

        ]

        results.semantic = len(semantic_payloads)

        #
        # Repository
        #

        for payload in semantic_payloads:

            try:

                product, created = self.repository.save(payload)

            except DataError:

                continue

            results.products.append(product)

            if created:
                results.created += 1
            else:
                results.updated += 1

        results.summary()

        return results