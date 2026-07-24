# /home/maya/shin-vps/django/imports/integration/orchestrator.py

"""
SHIN CORE LINX
Import Integration Orchestrator
"""

from __future__ import annotations

from pathlib import Path

from imports.integration.adapter import ImportAdapter
from imports.integration.model_mapper import PCProductModelMapper
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
    PCProduct Model Mapper
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

        # -------------------------------------------------
        # Adapter
        # -------------------------------------------------

        contracts = self.adapter.run(json_path)

        results.loaded = len(contracts)
        results.normalized = len(contracts)

        # -------------------------------------------------
        # Model Mapper
        # -------------------------------------------------

        payloads = []

        for index, contract in enumerate(contracts, start=1):

            # =============================================
            # Contract Validation
            # =============================================

            identity = contract.get("identity", {})

            if not identity.get("unique_id"):
                print()
                print("========================================")
                print("INVALID CONTRACT")
                print(f"Index : {index}")
                print(contract)
                print("========================================")
                raise ValueError("Import Contract missing unique_id.")

            payload = self.mapper.build(contract)

            # =============================================
            # Payload Validation
            # =============================================

            required_fields = [
                "unique_id",
                "maker",
                "name",
            ]

            missing = [
                field
                for field in required_fields
                if not payload.get(field)
            ]

            if missing:

                print()
                print("========================================")
                print("INVALID PAYLOAD")
                print(f"Index   : {index}")
                print(f"Missing : {missing}")
                print()
                print("Contract")
                print(contract)
                print()
                print("Payload")
                print(payload)
                print("========================================")

                raise ValueError(
                    f"Payload validation failed : {missing}"
                )

            payloads.append(payload)

        results.payloads = payloads
        results.built = len(payloads)

        # -------------------------------------------------
        # Semantic
        # -------------------------------------------------

        semantic_payloads = []

        for index, payload in enumerate(payloads, start=1):

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