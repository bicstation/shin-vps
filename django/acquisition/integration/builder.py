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


class ImportBuilder:
    """
    Build BuilderResult from ImportDocument.

    This builder is responsible only for constructing
    the intermediate runtime payload.

    It does NOT build PCProduct.
    """

    def __init__(self) -> None:

        self.identity_builder = IdentityBuilder()
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

        #
        # Identity Runtime
        #

        identity = self.identity_builder.build(contract)

        #
        # Affiliate Runtime
        #

        affiliate = self.affiliate_builder.build(
            product_url=contract.get("product_url", ""),
            config=affiliate_config,
        )

        #
        # Commerce Runtime
        #

        commerce = self.commerce_builder.build(contract)

        #
        # Builder Result
        #

        return {

            #
            # Original Contract
            #

            **contract,

            #
            # Identity
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

            "name": contract.get(
                "name",
                contract.get(
                    "product_name",
                    "",
                ),
            ),

            "description": contract.get("description", ""),
            "model": contract.get("model", ""),
            "product_no": contract.get("product_no", ""),
            "release_date": contract.get("release_date"),

            #
            # Commerce
            #

            "commerce": commerce,

            "price": commerce.get(
                "price",
                contract.get("price", 0),
            ),

            "url": contract.get(
                "url",
                contract.get("product_url", ""),
            ),

            #
            # Affiliate
            #

            "affiliate": affiliate,

            "affiliate_url": affiliate.get(
                "affiliate_url",
                contract.get("product_url", ""),
            ),

            #
            # Media
            #

            "image_url": contract.get("image_url", ""),
            "images": contract.get("images", []),
            "tables": contract.get("tables", []),

            #
            # Runtime Metadata
            #

            "prefix": prefix,
        }