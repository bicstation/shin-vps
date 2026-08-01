#!/usr/bin/env python3
"""
==============================================================================
FILE:
    acquisition/integration/builder.py

SHIN CORE LINX
Acquisition Integration Builder

Pipeline

ImportDocument
        │
        ├──────────────┐
        │              │
        ▼              ▼
 Identity Runtime   Affiliate Runtime
        │
        ▼
 Commerce Runtime
        │
        ▼
 Normalize Runtime
        │
        ▼
 BuilderResult

Responsibilities

- Build Integration Runtime Data
- Execute Identity Runtime
- Execute Affiliate Runtime
- Execute Commerce Runtime
- Normalize Import Contract

NOT

- Semantic Runtime
- PCProduct Mapping
- Database
- Persistence
==============================================================================
"""

from __future__ import annotations

from typing import Any

from acquisition.common.affiliate.builder import AffiliateBuilder
from acquisition.common.commerce.builder import CommerceBuilder
from acquisition.common.identity.builder import IdentityBuilder
from acquisition.common.genre.builder import GenreBuilder


class ImportBuilder:
    """
    Build BuilderResult from ImportDocument.

    This builder is responsible only for constructing
    the intermediate runtime payload.

    It does NOT build PCProduct.
    """

    def __init__(self) -> None:

        self.identity_builder = IdentityBuilder()
        self.genre_builder = GenreBuilder()
        self.affiliate_builder = AffiliateBuilder()
        self.commerce_builder = CommerceBuilder()

    # =========================================================
    # Build
    # =========================================================

    def build(
        self,
        contract: dict[str, Any],
        *,
        affiliate_config: dict[str, Any],
        maker: str,
        prefix: str,
    ) -> dict[str, Any]:

        identity_contract = contract.get("identity", {})
        commerce_contract = contract.get("commerce", {})
        affiliate_contract = contract.get("affiliate", {})
        media_contract = contract.get("media", {})

        #
        # Runtime Builders
        #

        identity = self.identity_builder.build(contract)

        affiliate = self.affiliate_builder.build(
            product_url=affiliate_contract.get("url", ""),
            config=affiliate_config,
        )

        commerce = self.commerce_builder.build(contract)

        #
        # Genre Runtime
        #
        genre = self.genre_builder.build(
            contract,
        )

        #
        # Builder Result
        #
        
        

        return {

            **contract,

            #
            # Identity Runtime
            #

            "identity": identity,

            "unique_id": identity["unique_id"],
            "maker": identity["maker"],
            "brand": identity.get("brand", ""),
            "series": identity.get("series", ""),
            "collaboration": identity.get("collaboration", ""),

            #
            # Product
            #

            "name": identity_contract.get("product_name", ""),
            "description": contract.get("description", ""),
            "model": identity_contract.get("model", ""),
            "product_no": identity_contract.get("product_no", ""),
            "release_date": commerce_contract.get(
                "release_date",
                "",
            ),

            #
            # Commerce
            #

            "commerce": commerce,
            "price": commerce.get("price", 0),

            #
            # Genre Runtime
            #

            "raw_genre": genre.get(
                "raw_genre",
                "",
            ),

            "unified_genre": genre.get(
                "unified_genre",
                "",
            ),

            #
            # URLs
            #

            "url": identity_contract.get("product_url", ""),

            #
            # Affiliate
            #

            "affiliate": affiliate,

            "affiliate_url": affiliate.get(
                "affiliate_url",
                affiliate_contract.get("url", ""),
            ),

            #
            # Media
            #

            "image_url": media_contract.get("image_url", ""),
            "images": media_contract.get("images", []),
            "tables": media_contract.get("tables", []),

            #
            # Runtime
            #

            "prefix": prefix,
        }


# =========================================================
# FILE:
# =========================================================
class PCProductBuilder:
    """
    Build PCProduct Payload.

    Normalized Runtime
            ↓
    PCProduct Payload

    This builder is responsible only for constructing
    the PCProduct payload.

    It does NOT perform persistence.
    """

    def build(
        self,
        normalized: dict[str, Any],
        maker: str,
        prefix: str,
    ) -> dict[str, Any]:

        identity = normalized.get(
            "identity",
            {},
        )

        return {

            # =====================================================
            # Identity
            # =====================================================

            "unique_id": (
                identity.get("unique_id")
            ),

            "site_prefix": prefix,

            "maker": (
                identity.get("maker")
                or maker
            ),

            "brand": (
                identity.get("brand")
                or normalized.get("brand", "")
            ),

            "series": (
                identity.get("series")
                or normalized.get("series", "")
            ),

            "collaboration": (
                identity.get("collaboration")
                or normalized.get("collaboration", "")
            ),

            "model": normalized.get(
                "model",
                "",
            ),

            "product_no": normalized.get(
                "product_no",
                "",
            ),

            "release_date": normalized.get(
                "release_date",
            ),

            # =====================================================
            # Product
            # =====================================================

            "name": normalized["name"],

            "description": normalized["description"],

            # =====================================================
            # Commerce
            # =====================================================

            "price": normalized["price"],

            "url": normalized["url"],

            "affiliate_url": normalized.get(
                "affiliate_url",
                normalized["url"],
            ),

            # =====================================================
            # Media
            # =====================================================

            "image_url": normalized["image_url"],

            # =====================================================
            # Genre Runtime
            # =====================================================

            "raw_genre": normalized.get(
                "raw_genre",
                "",
            ),

            "unified_genre": normalized.get(
                "unified_genre",
                "",
            ),

            # =====================================================
            # Runtime Defaults
            # =====================================================

            "stock_status": "在庫あり",

            "is_active": True,

        }

