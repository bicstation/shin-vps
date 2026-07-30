#!/usr/bin/env python3
"""
==============================================================================
FILE:
    acquisition/common/identity/builder.py

SHIN CORE LINX
Acquisition Identity Runtime
==============================================================================
"""

from __future__ import annotations

from urllib.parse import unquote, urlparse

from acquisition.common.tsv.identity_classifier import classify_identity


class IdentityBuilder:

    @staticmethod
    def normalize_identifier(value: str) -> str:
        return (
            str(value)
            .strip()
            .replace(" ", "_")
            .replace("/", "_")
        )

    @staticmethod
    def extract_handle(url: str) -> str:

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
        product_no: str,
    ) -> str:

        prefix = maker.upper()

        handle = cls.extract_handle(product_url)

        if handle:
            return f"{prefix}_{cls.normalize_identifier(handle)}"

        if product_no:
            return (
                f"{prefix}_"
                f"{cls.normalize_identifier(product_name)}_"
                f"{cls.normalize_identifier(product_no)}"
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

        # ==========================================================
        # Identity Contract
        # ==========================================================

        identity_contract = contract.get("identity", {})

        # ==========================================================
        # Identity
        # Priority:
        # 1. Identity Contract
        # 2. Top Level Contract
        # 3. Site
        # ==========================================================

        maker = (
            identity_contract.get("maker")
            or contract.get("maker")
            or contract.get("site", "")
        )

        product_name = identity_contract.get(
            "product_name",
            "",
        )

        product_no = identity_contract.get(
            "product_no",
            "",
        )

        product_url = identity_contract.get(
            "product_url",
            "",
        )

        # ==========================================================
        # TSV Classification
        # ==========================================================

        identity = classify_identity(
            maker=maker,
            product_name=product_name,
            description=contract.get(
                "description",
                "",
            ),
        )

        # ==========================================================
        # Runtime
        # ==========================================================

        return {

            "unique_id": cls.build_unique_id(
                maker=maker,
                product_url=product_url,
                product_name=product_name,
                product_no=product_no,
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