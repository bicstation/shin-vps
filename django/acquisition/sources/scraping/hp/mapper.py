#!/usr/bin/env python3

# ============================================================================
#
# FILE:
# acquisition/sources/scraping/hp/mapper.py
#
# SHIN CORE LINX
#
# HP Import Contract Mapper
#
# Reality First
# Observation First
# Translation Authority
#
# Formatter Runtime
#        │
#        ▼
# Import Contract
#        │
#        ▼
# Writer
#        │
#        ▼
# ImportDocument
#
# ============================================================================
#
# RESPONSIBILITIES
#
# - Receive HP Formatter Runtime
# - Translate Formatter Runtime into Import Contract
# - Preserve SHIN Reality Identity
# - Preserve HP API Identity
# - Preserve HP specification combinations
# - Build Commerce Contract
# - Build Media Contract
# - Build Affiliate Contract
# - Build Category Contract
# - Build Observation Runtime
# - Preserve Raw Reality
# - Validate Import Contract
#
# NOT RESPONSIBILITIES
#
# - HTTP Acquisition
# - HawkSearch Parsing
# - Reality Observation
# - Formatter
# - Specification inference
# - Specification combination
# - Semantic processing
# - PCProduct construction
# - ImportDocument persistence
#
# ============================================================================
#
# IDENTITY
#
# SHIN Reality ID
#
#     unique_id_1
#     unique_id_2
#     unique_id_3
#     ...
#
# HP API Identity
#
#     8373-50668
#     8403-50084
#     ...
#
# Therefore:
#
#     identity.unique_id
#         = internal_reality_id
#
#     identity.source_unique_id
#         = HP API unique_id
#
#     identity.product_code
#         = HP API unique_id
#
#     identity.sku
#         = HP SKU
#
# These are separate concepts.
#
# ============================================================================
#
# SPECIFICATION RULE
#
# One HP API unique_id represents one complete Product Reality.
#
# Example:
#
#     8373-50668
#
#     CPU      = AMD Athlon
#     GPU      = AMD Radeon
#     Memory   = 8GB
#     Storage  = 256GB
#     Display  = 14インチ
#
# These values belong to the SAME Reality.
#
# Mapper MUST preserve them together.
#
# Mapper MUST NOT:
#
#     CPU from A
#       +
#     GPU from B
#
# ============================================================================
#
# AFFILIATE RULE
#
# HP Reality:
#
#     product_url
#     purchase_url
#
# Generated:
#
#     affiliate_url
#
# Therefore:
#
#     product_url
#          │
#          ▼
# generate_affiliate_url()
#          │
#          ▼
# affiliate_url
#
# Contract:
#
#     affiliate.url
#         = generated affiliate URL
#
#     affiliate.original_url
#         = original HP product URL
#
#     affiliate.affiliate_url
#         = generated affiliate URL
#
#     affiliate.purchase_url
#         = original HP purchase URL
#
# purchase_url is preserved independently.
#
# Mapper MUST NOT replace:
#
#     purchase_url
#
# with:
#
#     affiliate_url
#
# ============================================================================
#

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

SOURCE_PREFIX = SITE_NAME.upper()


# ============================================================================
# Generic Utilities
# ============================================================================

def normalize_text(
    value: Any,
) -> str:
    """
    Structural text normalization only.

    No semantic interpretation.
    """

    if value is None:
        return ""

    if isinstance(
        value,
        str,
    ):
        return value.strip()

    return str(
        value
    ).strip()


def normalize_list(
    value: Any,
) -> list[Any]:
    """
    Normalize Runtime value into list.

    No semantic transformation.
    """

    if value is None:
        return []

    if isinstance(
        value,
        list,
    ):
        return value

    if isinstance(
        value,
        tuple,
    ):
        return list(
            value
        )

    return [
        value
    ]


def normalize_dict(
    value: Any,
) -> dict[str, Any]:
    """
    Normalize Runtime value into dict.

    No semantic transformation.
    """

    if isinstance(
        value,
        dict,
    ):
        return value

    return {}


# ============================================================================
# Published Runtime
# ============================================================================

def get_published(
    runtime: dict[str, Any],
) -> dict[str, Any]:
    """
    Get Formatter Published Runtime.
    """

    published = runtime.get(
        "published",
        {},
    )

    if not isinstance(
        published,
        dict,
    ):
        raise TypeError(
            "Formatter Runtime "
            "'published' must be dict."
        )

    return published


def get_raw(
    published: dict[str, Any],
) -> dict[str, Any]:
    """
    Get original HP Reality.

    Raw Reality must survive the Mapper boundary.
    """

    raw = published.get(
        "raw",
        {},
    )

    if not isinstance(
        raw,
        dict,
    ):
        raise TypeError(
            "Formatter Runtime "
            "'published.raw' must be dict."
        )

    return raw


# ============================================================================
# Identity
# ============================================================================

def get_internal_reality_id(
    published: dict[str, Any],
) -> str:
    """
    Resolve SHIN internal Reality ID.

    Example:

        unique_id_1
        unique_id_2
        unique_id_3
    """

    return normalize_text(
        published.get(
            "internal_reality_id",
        )
    )


def get_source_unique_id(
    published: dict[str, Any],
) -> str:
    """
    Resolve authoritative HP API unique_id.

    Example:

        8373-50668
    """

    return normalize_text(
        published.get(
            "source_unique_id",
        )
    )


def get_product_code(
    published: dict[str, Any],
) -> str:
    """
    Resolve HP product code.

    HP HawkSearch does not expose a separate
    normalized product_code in the Formatter.

    Therefore the authoritative HP API unique_id
    is used as product_code.

    Example:

        source_unique_id = 8373-50668
        product_code     = 8373-50668
    """

    source_unique_id = (
        get_source_unique_id(
            published,
        )
    )

    return source_unique_id


def get_sku(
    published: dict[str, Any],
) -> str:
    """
    Resolve HP SKU.

    SKU remains separate from source_unique_id.
    """

    return normalize_text(
        published.get(
            "sku",
        )
    )


def get_product_name(
    published: dict[str, Any],
) -> str:
    """
    Resolve HP product name.
    """

    return normalize_text(
        published.get(
            "product_name",
        )
    )


# ============================================================================
# URL
# ============================================================================

def get_product_url(
    published: dict[str, Any],
) -> str:
    """
    Resolve normalized HP product URL.

    Formatter owns URL normalization.
    """

    return normalize_text(
        published.get(
            "url",
        )
    )


def get_source_url(
    published: dict[str, Any],
) -> str:
    """
    Resolve source URL.
    """

    return normalize_text(
        published.get(
            "source_url",
        )
    )


def get_purchase_url(
    published: dict[str, Any],
) -> str:
    """
    Resolve HP purchase URL.

    This is source Reality.

    It is NOT the generated affiliate URL.
    """

    return normalize_text(
        published.get(
            "purchase_url",
        )
    )


# ============================================================================
# Identity Contract
# ============================================================================

def build_identity(
    runtime: dict[str, Any],
) -> dict[str, Any]:
    """
    Build HP Identity Contract.
    """

    published = get_published(
        runtime,
    )

    internal_reality_id = (
        get_internal_reality_id(
            published,
        )
    )

    source_unique_id = (
        get_source_unique_id(
            published,
        )
    )

    product_code = (
        get_product_code(
            published,
        )
    )

    sku = get_sku(
        published,
    )

    product_name = get_product_name(
        published,
    )

    product_url = get_product_url(
        published,
    )

    if not internal_reality_id:
        raise ValueError(
            "HP Formatter Runtime has empty "
            "internal_reality_id."
        )

    if not source_unique_id:
        raise ValueError(
            "HP Formatter Runtime has empty "
            "source_unique_id."
        )

    if not product_code:
        raise ValueError(
            "HP Formatter Runtime has empty "
            "product_code."
        )

    if not product_name:
        raise ValueError(
            "HP Formatter Runtime has empty "
            "product_name."
        )

    if not product_url:
        raise ValueError(
            "HP Formatter Runtime has empty "
            "product URL."
        )

    return {

        # ------------------------------------------------------------------
        # SHIN Reality Identity
        # ------------------------------------------------------------------

        "unique_id":
            internal_reality_id,

        # ------------------------------------------------------------------
        # HP API Identity
        # ------------------------------------------------------------------

        "source_unique_id":
            source_unique_id,

        "product_code":
            product_code,

        "sku":
            sku,

        # ------------------------------------------------------------------
        # Source
        # ------------------------------------------------------------------

        "maker":
            SITE_NAME,

        "brand":
            normalize_text(
                published.get(
                    "brand",
                )
            ),

        "series":
            normalize_text(
                published.get(
                    "series",
                )
            ),

        "collaboration":
            normalize_text(
                published.get(
                    "collaboration",
                )
            ),

        # ------------------------------------------------------------------
        # Product
        # ------------------------------------------------------------------

        "product_name":
            product_name,

        "product_type":
            normalize_text(
                published.get(
                    "product_type",
                )
            ),

        "category_name":
            normalize_text(
                published.get(
                    "category_name",
                )
            ),

        # ------------------------------------------------------------------
        # URLs
        # ------------------------------------------------------------------

        "product_url":
            product_url,

        "source_url":
            get_source_url(
                published,
            ),

    }


# ============================================================================
# Commerce Contract
# ============================================================================

def build_commerce(
    runtime: dict[str, Any],
) -> dict[str, Any]:
    """
    Build Commerce Contract.

    Preserve HP published commerce Reality.
    """

    published = get_published(
        runtime,
    )

    return {

        "price":
            published.get(
                "web_price",
            ),

        "web_price":
            published.get(
                "web_price",
            ),

        "final_price":
            published.get(
                "final_price",
            ),

        "suggested_retail_price":
            published.get(
                "suggested_retail_price",
            ),

        "price_range":
            normalize_text(
                published.get(
                    "price_range",
                )
            ),

        # HP source Reality
        "purchase_url":
            get_purchase_url(
                published,
            ),

    }


# ============================================================================
# Media Contract
# ============================================================================

def build_media(
    runtime: dict[str, Any],
) -> dict[str, Any]:
    """
    Build Media Contract.

    Formatter already normalized media.
    """

    published = get_published(
        runtime,
    )

    return {

        "image_url":
            normalize_text(
                published.get(
                    "image_url",
                )
            ),

        "image_urls":
            normalize_list(
                published.get(
                    "image_urls",
                    [],
                )
            ),

        "media":
            normalize_dict(
                published.get(
                    "media",
                    {},
                )
            ),

    }


# ============================================================================
# Affiliate Contract
# ============================================================================

def build_affiliate(
    runtime: dict[str, Any],
) -> dict[str, Any]:
    """
    Build Affiliate Contract.

    Source Reality:

        product_url
        purchase_url

    Generated:

        affiliate_url

    Contract:

        url
            = generated affiliate URL

        original_url
            = original HP product URL

        affiliate_url
            = generated affiliate URL

        purchase_url
            = original HP purchase URL

    The source purchase URL is never overwritten.
    """

    published = get_published(
        runtime,
    )

    product_url = get_product_url(
        published,
    )

    purchase_url = get_purchase_url(
        published,
    )

    if not product_url:
        raise ValueError(
            "HP product URL is empty."
        )

    affiliate_url = (
        generate_affiliate_url(
            product_url,
            AFFILIATE,
        )
    )

    affiliate_url = normalize_text(
        affiliate_url
    )

    if not affiliate_url:
        raise ValueError(
            "Affiliate URL generation "
            "returned empty URL."
        )

    return {

        # ------------------------------------------------------------------
        # Generated Affiliate URL
        #
        # Integration consumes this field.
        # ------------------------------------------------------------------

        "url":
            affiliate_url,

        # ------------------------------------------------------------------
        # Original HP product URL
        # ------------------------------------------------------------------

        "original_url":
            product_url,

        # ------------------------------------------------------------------
        # Generated Affiliate URL
        #
        # Preserve explicit generated field
        # for existing Runtime consumers.
        # ------------------------------------------------------------------

        "affiliate_url":
            affiliate_url,

        # ------------------------------------------------------------------
        # Original HP purchase Reality
        # ------------------------------------------------------------------

        "purchase_url":
            purchase_url,

    }


# ============================================================================
# Specification Contract
# ============================================================================

def build_specifications(
    runtime: dict[str, Any],
) -> dict[str, Any]:
    """
    Build Specification Contract.

    IMPORTANT

    The Formatter has already established the
    exact specification combination belonging
    to this HP API unique_id.

    Mapper performs structural translation only.

    No inference.
    No merging.
    No cross-product combination.
    """

    published = get_published(
        runtime,
    )

    specifications = normalize_dict(
        published.get(
            "specifications",
            {},
        )
    )

    return {

        "specifications":
            dict(
                specifications
            ),

        "operating_system":
            normalize_text(
                published.get(
                    "operating_system",
                )
            ),

        "processor_type":
            normalize_text(
                published.get(
                    "processor_type",
                )
            ),

        "graphics":
            normalize_text(
                published.get(
                    "graphics",
                )
            ),

        "memory":
            normalize_text(
                published.get(
                    "memory",
                )
            ),

        "storage":
            normalize_text(
                published.get(
                    "storage",
                )
            ),

        "display_size":
            normalize_text(
                published.get(
                    "display_size",
                )
            ),

        "weight":
            normalize_text(
                published.get(
                    "weight",
                )
            ),

        "display_input_type":
            normalize_text(
                published.get(
                    "display_input_type",
                )
            ),

        "usage":
            normalize_text(
                published.get(
                    "usage",
                )
            ),

        "npu_aipc":
            normalize_list(
                published.get(
                    "npu_aipc",
                    [],
                )
            ),

    }


# ============================================================================
# Feature Contract
# ============================================================================

def build_features(
    runtime: dict[str, Any],
) -> dict[str, Any]:
    """
    Build Feature Contract.

    HP published features are preserved.
    """

    published = get_published(
        runtime,
    )

    return {

        "top_features":
            normalize_list(
                published.get(
                    "top_features",
                    [],
                )
            ),

        "short_description":
            normalize_text(
                published.get(
                    "short_description",
                )
            ),

        "description":
            normalize_text(
                published.get(
                    "description",
                )
            ),

    }


# ============================================================================
# Category Contract
# ============================================================================

def build_category(
    runtime: dict[str, Any],
) -> dict[str, Any]:
    """
    Build Category Contract.

    Preserve HP published category Reality.
    """

    published = get_published(
        runtime,
    )

    return {

        "category_name":
            normalize_text(
                published.get(
                    "category_name",
                )
            ),

        "category_path":
            normalize_list(
                published.get(
                    "category_path",
                    [],
                )
            ),

        "manual_subseries_code":
            normalize_text(
                published.get(
                    "manual_subseries_code",
                )
            ),

        "parent_subseries_id":
            normalize_text(
                published.get(
                    "parent_subseries_id",
                )
            ),

    }


# ============================================================================
# Observation Runtime
# ============================================================================

def build_observation_runtime(
    runtime: dict[str, Any],
) -> dict[str, Any]:
    """
    Preserve Formatter Reality inside the Import Contract.
    """

    published = get_published(
        runtime,
    )

    return {

        # ------------------------------------------------------------------
        # Identity
        # ------------------------------------------------------------------

        "internal_reality_id":
            get_internal_reality_id(
                published,
            ),

        "source_unique_id":
            get_source_unique_id(
                published,
            ),

        "product_code":
            get_product_code(
                published,
            ),

        "sku":
            get_sku(
                published,
            ),

        # ------------------------------------------------------------------
        # Product
        # ------------------------------------------------------------------

        "product_name":
            get_product_name(
                published,
            ),

        "product_type":
            normalize_text(
                published.get(
                    "product_type",
                )
            ),

        "category_name":
            normalize_text(
                published.get(
                    "category_name",
                )
            ),

        # ------------------------------------------------------------------
        # URLs
        # ------------------------------------------------------------------

        "url":
            get_product_url(
                published,
            ),

        "source_url":
            get_source_url(
                published,
            ),

        "purchase_url":
            get_purchase_url(
                published,
            ),

        # ------------------------------------------------------------------
        # Commerce
        # ------------------------------------------------------------------

        "web_price":
            published.get(
                "web_price",
            ),

        "final_price":
            published.get(
                "final_price",
            ),

        "suggested_retail_price":
            published.get(
                "suggested_retail_price",
            ),

        "price_range":
            normalize_text(
                published.get(
                    "price_range",
                )
            ),

        # ------------------------------------------------------------------
        # Media
        # ------------------------------------------------------------------

        "image_url":
            normalize_text(
                published.get(
                    "image_url",
                )
            ),

        "image_urls":
            normalize_list(
                published.get(
                    "image_urls",
                    [],
                )
            ),

        # ------------------------------------------------------------------
        # Specifications
        # ------------------------------------------------------------------

        "specifications":
            normalize_dict(
                published.get(
                    "specifications",
                    {},
                )
            ),

        # ------------------------------------------------------------------
        # Features
        # ------------------------------------------------------------------

        "top_features":
            normalize_list(
                published.get(
                    "top_features",
                    [],
                )
            ),

        "description":
            normalize_text(
                published.get(
                    "description",
                )
            ),

        "short_description":
            normalize_text(
                published.get(
                    "short_description",
                )
            ),

        # ------------------------------------------------------------------
        # Complete Raw Reality
        # ------------------------------------------------------------------

        "raw":
            get_raw(
                published,
            ),

    }


# ============================================================================
# Import Contract
# ============================================================================

def build_contract(
    runtime: dict[str, Any],
) -> dict[str, Any]:
    """
    Build complete HP Import Contract.

    Formatter Runtime
            │
            ├── Identity
            ├── Commerce
            ├── Media
            ├── Affiliate
            ├── Specifications
            ├── Features
            ├── Category
            └── Observation Runtime
                    │
                    ▼
              Import Contract
    """

    return {

        "identity":
            build_identity(
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
# Contract Validation
# ============================================================================

def validate_contract(
    contract: dict[str, Any],
) -> None:
    """
    Structural validation only.

    Mapper does not modify Reality.
    """

    required = (

        "identity",

        "commerce",

        "media",

        "affiliate",

        "specifications",

        "features",

        "category",

        "observation_runtime",

    )

    missing = [

        field

        for field in required

        if field not in contract

    ]

    if missing:

        raise ValueError(
            "HP Import Contract missing fields: "
            + ", ".join(
                missing
            )
        )

    # ----------------------------------------------------------------------
    # Identity
    # ----------------------------------------------------------------------

    identity = normalize_dict(
        contract.get(
            "identity",
        )
    )

    required_identity = (

        "unique_id",

        "source_unique_id",

        "product_code",

        "product_name",

        "product_url",

    )

    missing_identity = [

        field

        for field in required_identity

        if not identity.get(
            field
        )

    ]

    if missing_identity:

        raise ValueError(
            "HP Import Contract identity "
            "missing fields: "
            + ", ".join(
                missing_identity
            )
        )

    # ----------------------------------------------------------------------
    # Identity Consistency
    # ----------------------------------------------------------------------

    if (
        identity["source_unique_id"]
        != identity["product_code"]
    ):

        raise ValueError(
            "HP Import Contract identity "
            "mismatch: product_code must equal "
            "source_unique_id."
        )

    # ----------------------------------------------------------------------
    # Specifications
    # ----------------------------------------------------------------------

    specifications = normalize_dict(
        contract.get(
            "specifications",
        )
    )

    specification_values = (
        specifications.get(
            "specifications",
            {},
        )
    )

    if not isinstance(
        specification_values,
        dict,
    ):

        raise ValueError(
            "HP Import Contract "
            "specifications.specifications "
            "must be dict."
        )

    # ----------------------------------------------------------------------
    # Affiliate
    # ----------------------------------------------------------------------

    affiliate = normalize_dict(
        contract.get(
            "affiliate",
        )
    )

    if not affiliate.get(
        "url",
    ):

        raise ValueError(
            "HP Import Contract has empty "
            "affiliate URL."
        )

    if not affiliate.get(
        "affiliate_url",
    ):

        raise ValueError(
            "HP Import Contract has empty "
            "affiliate_url."
        )

    # ----------------------------------------------------------------------
    # Observation
    # ----------------------------------------------------------------------

    observation = normalize_dict(
        contract.get(
            "observation_runtime",
        )
    )

    if (
        observation.get(
            "internal_reality_id"
        )
        != identity.get(
            "unique_id"
        )
    ):

        raise ValueError(
            "HP Import Contract Reality ID "
            "mismatch."
        )

    if (
        observation.get(
            "source_unique_id"
        )
        != identity.get(
            "source_unique_id"
        )
    ):

        raise ValueError(
            "HP Import Contract source ID "
            "mismatch."
        )


# ============================================================================
# Single Runtime Mapper
# ============================================================================

def map_runtime(
    runtime: dict[str, Any],
) -> dict[str, Any]:
    """
    Translate exactly one Formatter Runtime
    into exactly one Import Contract.
    """

    contract = build_contract(
        runtime,
    )

    validate_contract(
        contract,
    )

    return contract


# ============================================================================
# Mapper Runtime
# ============================================================================

def mapper(
    runtimes: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    """
    Execute HP Import Contract Mapper.

    One Formatter Runtime
            ↓
    One Import Contract

    Therefore:

        481 Formatter Runtimes
                    ↓
        481 Import Contracts

    assuming all inputs are structurally valid.
    """

    trace_pipeline(
        "MAPPER",
    )

    print()

    print(
        "=" * 70
    )

    print(
        f"{SITE_NAME.upper()} "
        "IMPORT CONTRACT MAPPER"
    )

    print(
        "=" * 70
    )

    contracts: list[
        dict[str, Any]
    ] = []

    failed = 0

    affiliate_count = 0

    purchase_count = 0

    specification_count = 0

    # ==========================================================================
    # Identity tracking
    # ==========================================================================

    internal_ids: list[str] = []

    source_ids: list[str] = []

    # ==========================================================================
    # Runtime Mapping
    # ==========================================================================

    for runtime in runtimes:

        try:

            contract = map_runtime(
                runtime
            )

        except Exception as exc:

            failed += 1

            identity = (
                normalize_dict(
                    runtime.get(
                        "published",
                        {},
                    )
                )
            )

            print(
                "FAILED : "
                f"{identity.get('internal_reality_id', '')}"
            )

            print(
                f"  ERROR : {exc}"
            )

            continue

        contracts.append(
            contract
        )

        identity = contract[
            "identity"
        ]

        affiliate = contract[
            "affiliate"
        ]

        specifications = normalize_dict(
            contract[
                "specifications"
            ].get(
                "specifications",
                {}
            )
        )

        # ----------------------------------------------------------------------
        # Identity
        # ----------------------------------------------------------------------

        internal_ids.append(
            identity[
                "unique_id"
            ]
        )

        source_ids.append(
            identity[
                "source_unique_id"
            ]
        )

        # ----------------------------------------------------------------------
        # Affiliate
        # ----------------------------------------------------------------------

        if affiliate.get(
            "affiliate_url"
        ):

            affiliate_count += 1

        # ----------------------------------------------------------------------
        # Purchase
        # ----------------------------------------------------------------------

        if affiliate.get(
            "purchase_url"
        ):

            purchase_count += 1

        # ----------------------------------------------------------------------
        # Specifications
        # ----------------------------------------------------------------------

        if specifications:

            specification_count += 1

        # ----------------------------------------------------------------------
        # Trace
        # ----------------------------------------------------------------------

        print(
            f"MAP    : "
            f"{identity['unique_id']} "
            f"| API={identity['source_unique_id']} "
            f"| SKU={identity['sku']}"
        )

        print(
            f"         "
            f"{identity['product_name']}"
        )

        print(
            f"         "
            f"SPEC={len(specifications)} "
            f"fields "
            f"| PURCHASE="
            f"{'YES' if affiliate.get('purchase_url') else 'NO'} "
            f"| AFFILIATE="
            f"{'YES' if affiliate.get('affiliate_url') else 'NO'}"
        )

    # ==========================================================================
    # Identity Statistics
    # ==========================================================================

    distinct_internal_ids = len(
        set(
            internal_ids
        )
    )

    distinct_source_ids = len(
        set(
            source_ids
        )
    )

    duplicate_internal_ids = (
        len(
            internal_ids
        )
        - distinct_internal_ids
    )

    duplicate_source_ids = (
        len(
            source_ids
        )
        - distinct_source_ids
    )

    # ==========================================================================
    # Result
    # ==========================================================================

    print()

    print(
        "=" * 70
    )

    print(
        "MAPPER RESULT"
    )

    print(
        "=" * 70
    )

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
        f"{distinct_internal_ids}"
    )

    print(
        f"Distinct Source IDs     : "
        f"{distinct_source_ids}"
    )

    print(
        f"Duplicate Internal IDs : "
        f"{duplicate_internal_ids}"
    )

    print(
        f"Duplicate Source IDs   : "
        f"{duplicate_source_ids}"
    )

    print(
        f"With Specifications    : "
        f"{specification_count}"
    )

    print(
        f"With Purchase URL      : "
        f"{purchase_count}"
    )

    print(
        f"With Affiliate URL     : "
        f"{affiliate_count}"
    )

    print(
        f"Failed                 : "
        f"{failed}"
    )

    print(
        "=" * 70
    )

    return contracts


# ============================================================================
# Entry Point
# ============================================================================

def main(
    *,
    runtimes: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    """
    Runtime Entry Point.

    Receives Formatter Runtime from Pipeline.
    """

    return mapper(
        runtimes,
    )


# ============================================================================
# Standalone Execution
# ============================================================================

if __name__ == "__main__":

    raise RuntimeError(
        "mapper.py must be executed "
        "from the Runtime Pipeline."
    )