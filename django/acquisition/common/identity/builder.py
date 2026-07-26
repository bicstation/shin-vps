# /home/maya/shin-dev/shin-vps/django/acquisition/common/identity/builder.py

#!/usr/bin/env python3
"""
==============================================================================
FILE:
    acquisition/common/identity/builder.py

SHIN CORE LINX
Acquisition Identity Runtime

Responsibilities

- Build Identity Runtime
- Generate Unique ID
- Build Identity Contract

NOT

- TSV Loading
- Affiliate
- Commerce
- Semantic
==============================================================================
"""

from __future__ import annotations
from urllib.parse import urlparse, unquote
from acquisition.common.tsv.identity_classifier import classify_identity

class IdentityBuilder:

    @staticmethod
    def normalize_identifier(value: str) -> str:
        """
        Normalize identifier.
        """

        return (
            value.strip()
            .replace(" ", "_")
            .replace("/", "_")
        )

    @staticmethod
    def extract_handle(url: str) -> str:
        """
        Extract Shopify Handle.
        """

        if not url:
            return ""

        path = urlparse(url).path.rstrip("/")

        if path.startswith("/products/"):
            return unquote(path.split("/")[-1])

        return ""

    @classmethod
    def build_unique_id(
        cls,
        maker: str,
        product_url: str,
        product_name: str,
    ) -> str:
        """
        Build Unique ID.
        """

        prefix = maker.upper()

        handle = cls.extract_handle(product_url)

        if handle:
            return (
                f"{prefix}_"
                f"{cls.normalize_identifier(handle)}"
            )

        if product_name:
            return (
                f"{prefix}_"
                f"{cls.normalize_identifier(product_name)}"
            )

        return prefix

    @classmethod
    def build(
        cls,
        contract: dict,
    ) -> dict:
        """
        Build Identity Runtime.
        """

        maker = contract.get(
            "maker",
            "",
        )

        if not maker:
            maker = contract.get(
                "site",
                "",
            )

        identity = classify_identity(
            maker=maker,
            product_name=contract.get(
                "product_name",
                "",
            ),
            description=contract.get(
                "description",
                "",
            ),
        )

        return {

            "unique_id": cls.build_unique_id(
                maker=maker,
                product_url=contract.get(
                    "product_url",
                    "",
                ),
                product_name=contract.get(
                    "product_name",
                    "",
                ),
            ),

            "maker": maker,

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

        }