# /home/maya/shin-dev/shin-vps/django/acquisition/common/commerce/builder.py
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

from acquisition.common.commerce.repository import CommerceRepository


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

        repository = CommerceRepository()

        commerce = repository.find(
            contract,
        )

        if commerce is None:

            return {

                "price": "",

                "stock": "",

                "delivery": "",

                "currency": "JPY",

            }

        return {

            "price": commerce.get(
                "price",
                "",
            ),

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