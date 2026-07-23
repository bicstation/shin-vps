# /home/maya/shin-vps/django/imports/integration/adapter.py

"""
SHIN CORE LINX
Import Integration Adapter

Pipeline

Import Contract
        │
        ▼
ImportNormalizer
        │
        ▼
Source(SimpleNamespace)
        │
        ▼
PCFeedNormalizer
"""

from __future__ import annotations

import json
from pathlib import Path
from types import SimpleNamespace
from typing import Any

from api.services.feed.normalizers.pc_feed_normalizer import (
    PCFeedNormalizer,
)

from imports.integration.normalizer import ImportNormalizer


class ImportAdapter:

    def __init__(self) -> None:
        self.total = 0
        self.import_normalizer = ImportNormalizer()
        self.feed_normalizer = PCFeedNormalizer()

    # =========================================================
    # Load
    # =========================================================

    def load(self, json_path: str | Path) -> list[dict[str, Any]]:

        json_path = Path(json_path)

        with json_path.open("r", encoding="utf-8") as fp:
            contracts = json.load(fp)

        if not isinstance(contracts, list):
            raise ValueError("Import Contract must be a list.")

        self.total = len(contracts)

        print(f"[ImportAdapter] Loaded {self.total} contracts.")

        return contracts

    # =========================================================
    # Adapt
    # =========================================================

    def adapt(
        self,
        contract: dict[str, Any],
    ) -> tuple[SimpleNamespace, dict[str, Any]]:

        identity = contract.get("identity", {})
        commerce = contract.get("commerce", {})
        affiliate = contract.get("affiliate", {})
        media = contract.get("media", {})
        observation = contract.get("observation", {})

        source = SimpleNamespace(

            # =====================================================
            # Identity
            # =====================================================

            unique_id=identity.get("unique_id", ""),

            sku=identity.get("sku", ""),
            jan=identity.get("jan", ""),

            maker=identity.get("maker", ""),
            brand=identity.get("brand", ""),

            product_name=identity.get("product_name", ""),
            model=identity.get("model", ""),

            product_no=identity.get("product_no", ""),
            pc_id=identity.get("pc_id", ""),

            product_url=identity.get("product_url", ""),

            # =====================================================
            # Commerce
            # =====================================================

            price=commerce.get("price", 0),
            currency="JPY",

            availability=commerce.get("availability", ""),
            release_date=commerce.get("release_date", ""),

            # =====================================================
            # Media
            # =====================================================

            image_url=media.get("image_url", ""),

            # =====================================================
            # Affiliate
            # =====================================================

            affiliate_url=affiliate.get("url", ""),

            # =====================================================
            # Observation
            # =====================================================

            raw_title=observation.get("raw_title", ""),
            feature=observation.get("feature", ""),
            specifications=observation.get("specifications", {}),

            # =====================================================
            # Legacy
            # =====================================================

            description=identity.get("description", ""),
            category=identity.get("category", ""),

            # =====================================================
            # Raw Contract
            # =====================================================

            raw_json=contract,
        )

        return source, contract

    # =========================================================
    # Process
    # =========================================================

    def process(
        self,
        contract: dict[str, Any],
    ) -> dict[str, Any]:

        contract = self.import_normalizer.normalize(contract)

        source, data = self.adapt(contract)

        return self.feed_normalizer.normalize(
            source,
            data,
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