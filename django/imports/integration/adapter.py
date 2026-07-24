# /home/maya/shin-vps/django/imports/integration/adapter.py

"""
SHIN CORE LINX
Import Integration Adapter

Pipeline

Import Contract(JSON)
        │
        ▼
ImportNormalizer
        │
        ▼
Normalized Import Contract
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from imports.integration.normalizer import ImportNormalizer


class ImportAdapter:
    """
    Import Adapter

    Responsibility
    --------------
    JSON Import Contract を読み込み、
    ImportNormalizer を通して
    正規化済み Import Contract を返す。

    Feed形式への変換は行わない。
    """

    def __init__(self) -> None:

        self.total = 0
        self.import_normalizer = ImportNormalizer()

    # =========================================================
    # Load
    # =========================================================

    def load(
        self,
        json_path: str | Path,
    ) -> list[dict[str, Any]]:

        json_path = Path(json_path)

        with json_path.open(
            "r",
            encoding="utf-8",
        ) as fp:

            contracts = json.load(fp)

        if not isinstance(contracts, list):
            raise ValueError(
                "Import Contract must be a list."
            )

        self.total = len(contracts)

        print(
            f"[ImportAdapter] Loaded {self.total} contracts."
        )

        return contracts

    # =========================================================
    # Normalize
    # =========================================================

    def process(
        self,
        contract: dict[str, Any],
    ) -> dict[str, Any]:

        return self.import_normalizer.normalize(
            contract
        )

    # =========================================================
    # Run
    # =========================================================

    def run(
        self,
        json_path: str | Path,
    ) -> list[dict[str, Any]]:

        contracts = self.load(json_path)

        normalized = [
            self.process(contract)
            for contract in contracts
        ]

        print("========================================")
        print(f"Processed : {len(normalized)}")
        print("========================================")

        return normalized