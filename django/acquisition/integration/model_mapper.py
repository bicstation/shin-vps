# ============================================================================
# FILE:
# acquisition/integration/model_mapper.py
#
# SHIN CORE LINX
# Acquisition Integration Model Mapper
# ============================================================================
#
# Pipeline
#
# Import Contract
#        │
#        ▼
# PCProduct Payload
#
# ============================================================================
#
# Import Contract Specification
#
# The Import Contract is the canonical interface between
# the Acquisition Runtime and the Integration Runtime.
#
# Every Reality Source (GEEKOM, Dell, HP, Lenovo, Amazon, Yahoo, ...)
# MUST generate the same Import Contract.
#
# The Integration Runtime MUST NOT depend on any source-specific
# implementation.
#
# Contract
#
# {
#
#   "identity": {
#       "unique_id": str,
#       "maker": str,
#       "brand": str,
#       "series": str,
#       "collaboration": str,
#       "product_name": str,
#       "product_url": str,
#       "model": str,
#       "product_no": str,
#       "pc_id": str,
#   },
#
#   "commerce": {
#       "price": int | float,
#       "release_date": str,
#       "stock": str,
#       "delivery": str,
#   },
#
#   "affiliate": {
#       "url": str,
#   },
#
#   "media": {
#       "image_url": str,
#       "images": list,
#   },
#
#   "observation": {
#       "description": str,
#       "tables": list,
#   }
#
# }
#
# ============================================================================
#
# Responsibilities
#
# - Map Import Contract
# - Build PCProduct Payload
#
# NOT
#
# - Semantic
# - AI
# - HTML Parsing
# - Observation
# - Runtime
# - Business Logic
# ============================================================================

from __future__ import annotations

from typing import Any


class PCProductModelMapper:
    """
    Import Contract -> PCProduct Payload
    """

    # =========================================================
    # Build
    # =========================================================

    def build(
        self,
        contract: dict[str, Any],
    ) -> dict[str, Any]:

        identity = contract.get("identity", {})
        commerce = contract.get("commerce", {})
        media = contract.get("media", {})
        affiliate = contract.get("affiliate", {})
        observation = contract.get("observation", {})

        return {

            # =================================================
            # Identity
            # =================================================

            "unique_id": identity.get("unique_id"),

            "site_prefix": self.extract_site_prefix(
                identity.get("unique_id")
            ),

            "maker": identity.get("maker"),

            "name": identity.get("product_name"),

            "model": identity.get("model"),

            "product_no": identity.get("product_no"),

            "pc_id": identity.get("pc_id"),

            # =================================================
            # Commerce
            # =================================================

            "price": commerce.get("price", 0),

            "release_date": commerce.get("release_date"),

            # =================================================
            # URL
            # =================================================

            "url": identity.get("product_url"),

            "affiliate_url": affiliate.get("url"),

            "image_url": media.get("image_url"),

            # =================================================
            # Reality
            # =================================================

            "description": observation.get(
                "description",
                "",
            ),

            # =================================================
            # Initial State
            # =================================================

            "raw_genre": "PC",

            "unified_genre": "PC",

            "stock_status": "在庫あり",

            "is_active": True,

        }

    # =========================================================
    # Site Prefix
    # =========================================================

    def extract_site_prefix(
        self,
        unique_id: str | None,
    ) -> str:

        if not unique_id:
            return ""

        return unique_id.split("_", 1)[0]