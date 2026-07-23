# /home/maya/shin-vps/django/imports/integration/normalizer.py

"""
SHIN CORE LINX
Import Normalizer

Responsibility
--------------
Import Contract
        ↓
Normalize
        ↓
Normalized Contract

This layer never knows:

    - PCProduct
    - Builder
    - Semantic
    - Repository
"""

from __future__ import annotations

import copy
import re
from typing import Any


class ImportNormalizer:
    """
    Normalize Import Contract.

    Every importer (ARK, Amazon, Rakuten, ...)
    should produce the same normalized contract.
    """

    # =========================================================
    # Public
    # =========================================================

    def normalize(
        self,
        contract: dict[str, Any],
    ) -> dict[str, Any]:
        """
        Normalize Import Contract.
        """

        contract = copy.deepcopy(contract)

        identity = contract.setdefault("identity", {})
        commerce = contract.setdefault("commerce", {})
        affiliate = contract.setdefault("affiliate", {})
        media = contract.setdefault("media", {})
        observation = contract.setdefault("observation", {})
        specifications = contract.setdefault("specifications", {})

        # =====================================================
        # Identity
        # =====================================================

        identity["maker"] = self.clean_text(
            identity.get("maker")
        )

        identity["brand"] = self.clean_text(
            identity.get("brand")
        )

        identity["product_name"] = self.clean_text(
            identity.get("product_name")
        )

        identity["model"] = self.clean_text(
            identity.get("model")
        )

        identity["product_no"] = self.clean_text(
            identity.get("product_no")
        )

        identity["sku"] = self.clean_text(
            identity.get("sku")
        )

        identity["jan"] = self.clean_text(
            identity.get("jan")
        )

        identity["pc_id"] = self.clean_text(
            identity.get("pc_id")
        )

        identity["product_url"] = self.clean_url(
            identity.get("product_url")
        )

        # =====================================================
        # Commerce
        # =====================================================

        commerce["price"] = self.normalize_price(
            commerce.get("price")
        )

        commerce["availability"] = self.clean_text(
            commerce.get("availability")
        )

        commerce["release_date"] = self.clean_text(
            commerce.get("release_date")
        )

        # =====================================================
        # Affiliate
        # =====================================================

        affiliate["url"] = self.clean_url(
            affiliate.get("url")
        )

        # =====================================================
        # Media
        # =====================================================

        media["image_url"] = self.clean_url(
            media.get("image_url")
        )

        # =====================================================
        # Observation
        # =====================================================

        observation["raw_title"] = self.clean_text(
            observation.get("raw_title")
        )

        observation["feature"] = self.clean_text(
            observation.get("feature")
        )

        observation_specs = observation.setdefault(
            "specifications",
            {}
        )

        if not isinstance(observation_specs, dict):
            observation["specifications"] = {}

        # =====================================================
        # Specifications
        # =====================================================

        if not isinstance(specifications, dict):
            contract["specifications"] = {}

        return contract

    # =========================================================
    # Helpers
    # =========================================================

    def clean_text(
        self,
        value: Any,
    ) -> str:

        if value is None:
            return ""

        return str(value).strip()

    def clean_url(
        self,
        value: Any,
    ) -> str:

        if value is None:
            return ""

        return str(value).strip()

    def normalize_price(
        self,
        value: Any,
    ) -> int:

        if value is None:
            return 0

        if isinstance(value, int):
            return value

        if isinstance(value, float):
            return int(value)

        text = str(value)

        #
        # 1,128,000 円
        # ￥1,128,000
        # 1128000
        #

        text = re.sub(r"[^\d]", "", text)

        if not text:
            return 0

        return int(text)