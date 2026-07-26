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
 PCProductBuilder
        │
        ▼
 PCProduct Payload

Responsibilities

- Orchestrate Common Runtimes
- Build Final PCProduct Payload

NOT

- HTML Parsing
- TSV Access
- Observation
- Semantic
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
    """
    Acquisition Integration Builder

    Responsibility
    --------------
    Import Contract
            │
            ├── Identity Runtime
            ├── Affiliate Runtime
            ├── Commerce Runtime
            ▼
    PCProductBuilder
            ▼
    PCProduct Payload
    """

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
        """
        Build PCProduct payload.
        """

        #
        # Identity Runtime
        #

        identity = self.identity_builder.build(
            contract,
        )

        #
        # Affiliate Runtime
        #

        affiliate = self.affiliate_builder.build(
            product_url=contract.get(
                "product_url",
                "",
            ),
            config=affiliate_config,
        )

        #
        # Commerce Runtime
        #

        commerce = self.commerce_builder.build(
            contract,
        )

        #
        # Merge Runtime Results
        #

        normalized = {

            **contract,

            "identity": identity,

            "affiliate": affiliate,

            "commerce": commerce,

        }

        #
        # Build Final Payload
        #

        return self.pc_builder.build(
            normalized=normalized,
            maker=maker,
            prefix=prefix,
        )