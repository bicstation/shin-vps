# =========================================================
# FILE:
# research/rakuten_reality/scripts/importer.py
# =========================================================

"""
Rakuten Reality Research

Importer

Responsibility
--------------
Transfer Import Contracts to the Product Import pipeline.

Pipeline

Import Contract
      ↓
RakutenImportService
      ↓
PC Import Pipeline

This module MUST NOT:

- Read JSON files
- Fetch APIs
- Generate Observations
- Build Payloads
- Build Import Contracts
- Perform Validation
"""

from __future__ import annotations

from typing import Iterable

from api.services.feed.services.rakuten_import_service import (
    RakutenImportService,
)


# =========================================================
# IMPORT CONTRACTS
# =========================================================

def import_contracts(
    contracts: Iterable[dict],
) -> None:
    """
    Import contracts into the Product pipeline.
    """

    print()
    print("----------------------------------------")
    print("Import")
    print("----------------------------------------")

    service = RakutenImportService()

    imported = 0
    failed = 0

    for contract in contracts:

        try:

            service.import_contract(
                contract,
            )

            imported += 1

        except Exception as exc:

            failed += 1

            print(f"[ERROR] {exc}")

    print()
    print(f"Imported : {imported}")
    print(f"Failed   : {failed}")
    print("----------------------------------------")