#!/usr/bin/env python3
"""
==============================================================================
FILE:
    acquisition/common/commerce/builder.py

SHIN CORE LINX
Acquisition Commerce Runtime

Responsibilities

- Build Commerce Contract

NOT

- TSV Access
- File IO
- HTML Parsing
- Observation
- Affiliate
- Identity
==============================================================================
"""

from __future__ import annotations


class CommerceBuilder:
    """
    Acquisition Commerce Builder.
    """

    @classmethod
    def build(
        cls,
        contract: dict,
    ) -> dict:
        """
        Build Commerce Contract.
        """

        commerce = contract.get("commerce", {})

        return {

            "price": commerce.get(
                "price",
                0,
            ) or 0,

            "stock": commerce.get(
                "stock",
                "",
            ),

            "delivery": commerce.get(
                "delivery",
                "",
            ),

            "currency": commerce.get(
                "currency",
                "JPY",
            ),

        }