#!/usr/bin/env python3
"""
==============================================================================
FILE:
    acquisition/integration/builder.py

SHIN CORE LINX
Acquisition Integration Builder

Pipeline

Import Contract
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
 PCProductBuilder
        │
        ▼
 PCProduct Payload
==============================================================================
"""

from __future__ import annotations

from typing import Any

from acquisition.common.identity.builder import IdentityBuilder
from acquisition.common.affiliate.builder import AffiliateBuilder
from acquisition.common.commerce.builder import CommerceBuilder

from api.services.feed.builders.pc_product_builder import (
    PCProductBuilder,
)


class ImportBuilder:

    def __init__(self) -> None:

        self.identity_builder = IdentityBuilder()
        self.affiliate_builder = AffiliateBuilder()
        self.commerce_builder = CommerceBuilder()

        self.pc_builder = PCProductBuilder()

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

        # =====================================================
        # Identity Runtime
        # =====================================================

        identity = self.identity_builder.build(
            contract,
        )

        # =====================================================
        # Affiliate Runtime
        # =====================================================

        affiliate = self.affiliate_builder.build(
            product_url=contract.get(
                "product_url",
                "",
            ),
            config=affiliate_config,
        )

        # =====================================================
        # Commerce Runtime
        # =====================================================

        commerce = self.commerce_builder.build(
            contract,
        )

        # =====================================================
        # Normalize Runtime
        # =====================================================

        normalized = {

            # -------------------------------------------------
            # Keep Original Contract
            # -------------------------------------------------

            **contract,

            # -------------------------------------------------
            # Identity
            # -------------------------------------------------

            "identity": identity,

            "unique_id": identity.get(
                "unique_id",
                "",
            ),

            "maker": identity.get(
                "maker",
                maker,
            ),

            "brand": identity.get(
                "brand",
                "",
            ),

            "series": identity.get(
                "series",
                "",
            ),

            "collaboration": identity.get(
                "collaboration",
                "",
            ),

            # -------------------------------------------------
            # Product
            # -------------------------------------------------

            "name": contract.get(
                "name",
                contract.get(
                    "product_name",
                    "",
                ),
            ),

            "description": contract.get(
                "description",
                "",
            ),

            "model": contract.get(
                "model",
                "",
            ),

            "product_no": contract.get(
                "product_no",
                "",
            ),

            "release_date": contract.get(
                "release_date",
            ),

            # -------------------------------------------------
            # Commerce
            # -------------------------------------------------

            "commerce": commerce,

            "price": contract.get(
                "price",
                commerce.get(
                    "price",
                    0,
                ),
            ),

            "url": contract.get(
                "url",
                contract.get(
                    "product_url",
                    "",
                ),
            ),

            # -------------------------------------------------
            # Affiliate
            # -------------------------------------------------

            "affiliate": affiliate,

            "affiliate_url": affiliate.get(
                "affiliate_url",
                contract.get(
                    "product_url",
                    "",
                ),
            ),

            # -------------------------------------------------
            # Media
            # -------------------------------------------------

            "image_url": contract.get(
                "image_url",
                "",
            ),

            "images": contract.get(
                "images",
                [],
            ),

            "tables": contract.get(
                "tables",
                [],
            ),

        }

        # =====================================================
        # Build Final Payload
        # =====================================================

        return self.pc_builder.build(
            normalized=normalized,
            maker=maker,
            prefix=prefix,
        )