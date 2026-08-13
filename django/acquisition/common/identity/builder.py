#!/usr/bin/env python3
"""
==============================================================================
FILE:
    acquisition/common/identity/builder.py

SHIN CORE LINX
Acquisition Identity Runtime
==============================================================================

Identity Contract
        ↓
Identity Builder
        ↓
Identity Classifier
        ↓
Observation Runtime
        ↓
Brand / Series / Collaboration
==============================================================================

Responsibilities

- Build Product Identity
- Build Unique ID
- Pass complete Observation Reality to Identity Runtime
- Receive Identity Authority results

NOT

- Parse HTML
- Parse Specifications
- Generate Semantic Meaning
- Infer
- Guess
- Acquire external Reality
==============================================================================
"""

from __future__ import annotations

from urllib.parse import (
    unquote,
    urlparse,
)

from acquisition.sources.runtime.identity.identity_classifier import (
    classify_identity,
)


class IdentityBuilder:

    # ======================================================================
    # Identifier Normalization
    # ======================================================================

    @staticmethod
    def normalize_identifier(
        value: str,
    ) -> str:

        return (
            str(value)
            .strip()
            .replace(
                " ",
                "_",
            )
            .replace(
                "/",
                "_",
            )
        )

    # ======================================================================
    # Product Handle
    # ======================================================================

    @staticmethod
    def extract_handle(
        url: str,
    ) -> str:

        if not url:

            return ""

        path = (
            urlparse(
                url,
            )
            .path
            .rstrip("/")
        )

        if path.startswith(
            "/products/"
        ):

            return unquote(
                path.split(
                    "/"
                )[-1]
            )

        return ""

    # ======================================================================
    # Unique ID
    # ======================================================================

    @classmethod
    def build_unique_id(
        cls,
        maker: str,
        sku: str,
        product_url: str,
        product_name: str,
        product_no: str,
    ) -> str:

        # --------------------------------------------------------------
        # SKU
        # Highest Priority
        # --------------------------------------------------------------

        if sku:

            return (
                f"{maker.lower()}_"
                f"{cls.normalize_identifier(sku)}"
            )

        # --------------------------------------------------------------
        # Product URL
        # --------------------------------------------------------------

        handle = cls.extract_handle(
            product_url,
        )

        if handle:

            return (
                f"{maker.lower()}_"
                f"{cls.normalize_identifier(handle)}"
            )

        # --------------------------------------------------------------
        # Product Number
        # --------------------------------------------------------------

        if product_no:

            return (
                f"{maker.lower()}_"
                f"{cls.normalize_identifier(product_name)}_"
                f"{cls.normalize_identifier(product_no)}"
            )

        # --------------------------------------------------------------
        # Product Name
        # --------------------------------------------------------------

        if product_name:

            return (
                f"{maker.lower()}_"
                f"{cls.normalize_identifier(product_name)}"
            )

        return maker.lower()

    # ======================================================================
    # Build
    # ======================================================================

    @classmethod
    def build(
        cls,
        contract: dict,
    ) -> dict:

        # ==============================================================
        # Identity Contract
        # ==============================================================

        identity_contract = contract.get(
            "identity",
            {},
        )

        # ==============================================================
        # Identity
        # ==============================================================

        maker = (
            identity_contract.get(
                "maker",
            )
            or contract.get(
                "maker",
            )
            or contract.get(
                "site",
                "",
            )
        )

        sku = identity_contract.get(
            "sku",
            "",
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

        # ==============================================================
        # Observation Reality
        #
        # The complete Observation produced by
        # the Observation Runtime is already preserved
        # in the Import Contract.
        #
        # Identity Builder does not interpret it.
        #
        # It only passes it to the Identity Runtime.
        # ==============================================================

        observation_runtime = contract.get(
            "observation_runtime",
            {},
        )

        # ==============================================================
        # TSV Classification
        #
        # Identity Runtime receives:
        #
        # - maker
        # - product_name
        # - description
        # - complete observation_runtime
        #
        # No semantic interpretation occurs here.
        # ==============================================================

        identity = classify_identity(

            maker=maker,

            product_name=product_name,

            description=contract.get(
                "description",
                "",
            ),

            observation_runtime=observation_runtime,

        )

        # ==============================================================
        # Runtime Result
        # ==============================================================

        return {

            "unique_id": cls.build_unique_id(

                maker=maker,

                sku=sku,

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