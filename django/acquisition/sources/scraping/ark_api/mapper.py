#!/usr/bin/env python3

# ============================================================================
#
# FILE:
# acquisition/sources/scraping/ark/mapper.py
#
# SHIN CORE LINX
#
# ARK Import Contract Mapper
#
# Reality First
# Observation First
# Translation Authority
#
# Formatter Runtime
#        ↓
# Import Contract
#
# ============================================================================

from __future__ import annotations

from typing import Any

from acquisition.common.affiliate.affiliate import (
    generate_affiliate_url,
)

from acquisition.common.trace.reality_trace import (
    trace_pipeline,
)

from .settings import (
    AFFILIATE,
    SITE_NAME,
)


# ============================================================================
# Runtime Constants
# ============================================================================

SOURCE_NAME = SITE_NAME.lower()
DOCUMENT_TYPE = "product"


# ============================================================================
# Identity
# ============================================================================

def build_identity(
    runtime: dict[str, Any],
) -> dict[str, Any]:
    """
    Translate ARK Formatter Identity
    into Import Contract Identity.

    No new identity is generated.

    ARK Identity Authority:
        pc_id
            ↓
        sku
            ↓
        Common Identity Runtime
    """

    return {

        "unique_id":
            runtime.get(
                "internal_reality_id",
                "",
            ),

        "source_unique_id":
            runtime.get(
                "source_product_id",
                "",
            ),

        # --------------------------------------------------------------------
        # ARK Source Identity
        #
        # pc_id is the ARK product identity observed from Reality.
        #
        # Pass it to the common Identity Runtime as SKU so that the
        # common IdentityBuilder can construct:
        #
        #     ark + pc_id
        #
        # Example:
        #
        #     pc_id = 3746
        #         ↓
        #     sku = 3746
        #         ↓
        #     unique_id = ark_3746
        #
        # Do NOT use product_name as the primary Identity.
        # --------------------------------------------------------------------

        "sku":
            runtime.get(
                "pc_id",
                "",
            ),

        "product_code":
            runtime.get(
                "source_product_id",
                "",
            ),

        "pc_id":
            runtime.get(
                "pc_id",
                "",
            ),

        "product_number":
            runtime.get(
                "product_number",
                "",
            ),

        "model_number":
            runtime.get(
                "model_number",
                "",
            ),

        "maker":
            runtime.get(
                "maker",
                "",
            ),

        "series":
            runtime.get(
                "series",
                "",
            ),

        "product_name":
            runtime.get(
                "published",
                {},
            ).get(
                "product_name",
                "",
            ),

        "model_name":
            runtime.get(
                "published",
                {},
            ).get(
                "model_name",
                "",
            ),

        "product_url":
            runtime.get(
                "published",
                {},
            ).get(
                "url",
                "",
            ),

    }


# ============================================================================
# Description
# ============================================================================

def build_description(
    runtime: dict[str, Any],
) -> str:
    """
    Preserve published description.
    """

    return runtime.get(
        "published",
        {},
    ).get(
        "description",
        "",
    )


# ============================================================================
# Commerce
# ============================================================================

def build_commerce(
    runtime: dict[str, Any],
) -> dict[str, Any]:
    """
    Translate published commerce fields.

    No price interpretation.
    """

    published = runtime.get(
        "published",
        {},
    )

    return {

        "price":
            published.get(
                "web_price",
            ),

        "purchase_url":
            published.get(
                "url",
                "",
            ),

    }


# ============================================================================
# Media
# ============================================================================

def build_media(
    runtime: dict[str, Any],
) -> dict[str, Any]:
    """
    Translate published media fields.
    """

    published = runtime.get(
        "published",
        {},
    )

    return {

        "image_url":
            published.get(
                "image_url",
                "",
            ),

        "image_urls":
            published.get(
                "image_urls",
                [],
            ),

    }


# ============================================================================
# Affiliate
# ============================================================================

def build_affiliate(
    runtime: dict[str, Any],
) -> dict[str, Any]:
    """
    Generate Affiliate URL from the observed
    ARK Product URL.

    Provider-specific logic remains inside
    the common Affiliate Runtime.
    """

    product_url = (
        runtime.get(
            "published",
            {},
        ).get(
            "url",
            "",
        )
    )

    affiliate_url = (
        generate_affiliate_url(
            product_url,
            AFFILIATE,
        )
    )

    return {

        "url":
            affiliate_url,

        "original_url":
            product_url,

        "affiliate_url":
            affiliate_url,

        "purchase_url":
            product_url,

    }


# ============================================================================
# Specifications
# ============================================================================

def build_specifications(
    runtime: dict[str, Any],
) -> dict[str, Any]:
    """
    Preserve Formatter specification set.

    No specification inference.
    No specification combination.
    """

    return {

        "specifications":
            runtime.get(
                "published",
                {},
            ).get(
                "specifications",
                {},
            ),

    }


# ============================================================================
# Features
# ============================================================================

def build_features(
    runtime: dict[str, Any],
) -> dict[str, Any]:
    """
    Preserve published descriptive fields.
    """

    published = runtime.get(
        "published",
        {},
    )

    return {

        "description":
            published.get(
                "description",
                "",
            ),

        "release_date":
            published.get(
                "release_date",
                "",
            ),

    }


# ============================================================================
# Category
# ============================================================================

def build_category(
    runtime: dict[str, Any],
) -> dict[str, Any]:
    """
    Preserve Seed category context.

    Mapper does not create category meaning.
    """

    return {

        "entry_name":
            runtime.get(
                "entry_name",
                "",
            ),

        "maker":
            runtime.get(
                "maker",
                "",
            ),

        "series":
            runtime.get(
                "series",
                "",
            ),

        "slug":
            runtime.get(
                "slug",
                "",
            ),

    }


# ============================================================================
# Observation Runtime
# ============================================================================

def build_observation_runtime(
    runtime: dict[str, Any],
) -> dict[str, Any]:
    """
    Preserve the Formatter Runtime's original
    Product Reality.

    Mapper does not re-observe or re-parse it.
    """

    return {

        "internal_reality_id":
            runtime.get(
                "internal_reality_id",
                "",
            ),

        "source_product_id":
            runtime.get(
                "source_product_id",
                "",
            ),

        "pc_id":
            runtime.get(
                "pc_id",
                "",
            ),

        "product_number":
            runtime.get(
                "product_number",
                "",
            ),

        "model_number":
            runtime.get(
                "model_number",
                "",
            ),

        "url":
            runtime.get(
                "published",
                {},
            ).get(
                "url",
                "",
            ),

        "request_url":
            runtime.get(
                "request_url",
                "",
            ),

        "observation":
            runtime.get(
                "observation",
                {},
            ),

    }


# ============================================================================
# Import Contract
# ============================================================================

def build_contract(
    runtime: dict[str, Any],
) -> dict[str, Any]:
    """
    Translate exactly one ARK Formatter Runtime
    into exactly one Import Contract.

    One input
        ↓
    One output

    No grouping.
    No merging.
    """

    return {

        "source_name":
            SOURCE_NAME,

        "site_name":
            SITE_NAME,

        "document_type":
            DOCUMENT_TYPE,

        "identity":
            build_identity(
                runtime,
            ),

        "description":
            build_description(
                runtime,
            ),

        "commerce":
            build_commerce(
                runtime,
            ),

        "media":
            build_media(
                runtime,
            ),

        "affiliate":
            build_affiliate(
                runtime,
            ),

        "specifications":
            build_specifications(
                runtime,
            ),

        "features":
            build_features(
                runtime,
            ),

        "category":
            build_category(
                runtime,
            ),

        "observation_runtime":
            build_observation_runtime(
                runtime,
            ),

    }


# ============================================================================
# Runtime
# ============================================================================

def mapper(
    *,
    runtimes: list[dict[str, Any]],
    **kwargs,
) -> list[dict[str, Any]]:
    """
    Execute ARK Import Contract Mapper.

    Formatter Runtime
            ↓
        Adapter
            ↓
    Import Contract
    """

    trace_pipeline(
        "MAPPER",
    )

    print()
    print("=" * 70)
    print(
        f"{SITE_NAME} IMPORT CONTRACT MAPPER"
    )
    print("=" * 70)

    contracts: list[dict[str, Any]] = []

    failed = 0

    internal_ids: list[str] = []
    source_ids: list[str] = []

    with_specs = 0
    with_purchase = 0
    with_affiliate = 0

    for runtime in runtimes:

        try:

            contract = build_contract(
                runtime,
            )

            contracts.append(
                contract,
            )

            identity = contract[
                "identity"
            ]

            internal_id = identity.get(
                "unique_id",
                "",
            )

            source_id = identity.get(
                "source_unique_id",
                "",
            )

            internal_ids.append(
                internal_id
            )

            source_ids.append(
                source_id
            )

            specifications = (
                contract[
                    "specifications"
                ].get(
                    "specifications",
                    {},
                )
            )

            if specifications:
                with_specs += 1

            if contract[
                "commerce"
            ].get(
                "purchase_url",
            ):
                with_purchase += 1

            if contract[
                "affiliate"
            ].get(
                "affiliate_url",
            ):
                with_affiliate += 1

            print()
            print(
                f"MAP    : "
                f"{internal_id}"
                f" | SOURCE={source_id}"
                f" | PC_ID="
                f"{identity.get('pc_id', '')}"
                f" | SKU="
                f"{identity.get('sku', '')}"
            )

            print(
                f"         "
                f"{identity.get('product_name', '')}"
            )

            print(
                f"         "
                f"SPEC={len(specifications)} fields"
                f" | PURCHASE="
                f"{'YES' if contract['commerce'].get('purchase_url') else 'NO'}"
                f" | AFFILIATE="
                f"{'YES' if contract['affiliate'].get('affiliate_url') else 'NO'}"
            )

        except Exception as exc:

            failed += 1

            print()
            print(
                "MAP FAILED"
            )

            print(
                f"  ERROR : {exc}"
            )

    # =========================================================================
    # Result
    # =========================================================================

    print()
    print("=" * 70)
    print("MAPPER RESULT")
    print("=" * 70)

    print(
        f"Formatter Runtimes      : "
        f"{len(runtimes)}"
    )

    print(
        f"Import Contracts        : "
        f"{len(contracts)}"
    )

    print(
        f"Distinct Internal IDs   : "
        f"{len(set(internal_ids))}"
    )

    print(
        f"Distinct Source IDs     : "
        f"{len(set(source_ids))}"
    )

    print(
        f"Duplicate Internal IDs : "
        f"{len(internal_ids) - len(set(internal_ids))}"
    )

    print(
        f"Duplicate Source IDs   : "
        f"{len(source_ids) - len(set(source_ids))}"
    )

    print(
        f"With Specifications    : "
        f"{with_specs}"
    )

    print(
        f"With Purchase URL      : "
        f"{with_purchase}"
    )

    print(
        f"With Affiliate URL     : "
        f"{with_affiliate}"
    )

    print(
        f"Failed                 : "
        f"{failed}"
    )

    print("=" * 70)

    return contracts


# ============================================================================
# Entry Point
# ============================================================================

def main(
    *,
    runtimes: list[dict[str, Any]],
    **kwargs,
) -> list[dict[str, Any]]:

    return mapper(
        runtimes=runtimes,
        **kwargs,
    )


# ============================================================================
# Standalone Execution
# ============================================================================

if __name__ == "__main__":

    main(
        runtimes=[],
    )