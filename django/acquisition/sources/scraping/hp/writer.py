#!/usr/bin/env python3

# ============================================================================
#
# FILE:
# acquisition/sources/scraping/hp/writer.py
#
# SHIN CORE LINX
#
# HP ImportDocument Writer
#
# Reality First
# Observation First
# Persistence Authority
#
# ============================================================================
#
# Pipeline
#
# Formatter
#     │
#     ▼
# Runtime Contract
#     │
#     ▼
# Mapper
#     │
#     ▼
# Import Contract
#     │
#     ▼
# Writer
#     │
#     ▼
# ImportDocument
#     │
#     ▼
# Integration
#
# ============================================================================
#
# Responsibilities
#
# - Receive Import Contract
# - Validate Import Contract structure
# - Persist Import Contract
# - Create ImportDocument
# - Update ImportDocument
# - Preserve Import Reality
# - Preserve Affiliate Contract
# - Preserve Specification Contract
# - Preserve Feature Contract
# - Preserve Raw Observation
#
# NOT Responsibilities
#
# - HTTP Acquisition
# - HawkSearch Parsing
# - Reality Observation
# - Formatter
# - Mapping
# - Specification inference
# - Specification combination
# - Semantic Processing
# - PCProduct Construction
#
# ============================================================================

from __future__ import annotations


from typing import Any


from api.models import (
    ImportDocument,
)


from acquisition.common.trace.reality_trace import (
    trace_pipeline,
)


from .settings import (
    SITE_NAME,
)


# ============================================================================
# Runtime Constants
# ============================================================================

SOURCE_NAME = SITE_NAME.lower()

DOCUMENT_TYPE = "product"


# ============================================================================
# Utility
# ============================================================================

def normalize_dict(
    value: Any,
) -> dict:
    """
    Normalize Runtime value into dict.

    Writer does not perform semantic conversion.
    """

    if isinstance(
        value,
        dict,
    ):
        return value

    return {}


def normalize_text(
    value: Any,
) -> str:
    """
    Normalize Runtime value into text.
    """

    if value is None:
        return ""

    if isinstance(
        value,
        str,
    ):
        return value.strip()

    return str(value).strip()


# ============================================================================
# Contract Access
# ============================================================================

def get_identity(
    contract: dict,
) -> dict:
    """
    Get Identity Contract.
    """

    identity = contract.get(
        "identity",
        {},
    )

    if not isinstance(
        identity,
        dict,
    ):
        raise TypeError(
            "Import Contract identity "
            "must be dict."
        )

    return identity


def get_document_key(
    contract: dict,
) -> str:
    """
    Resolve ImportDocument document_key.

    IMPORTANT

    document_key uses the SHIN internal Reality ID.

        unique_id_1
        unique_id_2
        ...

    HP API source_unique_id remains inside
    the Import Contract and is NOT used as
    document_key.
    """

    identity = get_identity(
        contract,
    )

    document_key = normalize_text(
        identity.get(
            "unique_id",
        )
    )

    if not document_key:
        raise ValueError(
            "Import Contract has no "
            "unique_id."
        )

    return document_key


# ============================================================================
# Contract Identity Validation
# ============================================================================

def validate_identity(
    contract: dict,
) -> None:
    """
    Validate Identity Contract.

    Structural validation only.
    """

    identity = get_identity(
        contract,
    )

    required = (
        "unique_id",
        "source_unique_id",
        "product_code",
        "product_name",
        "product_url",
    )

    missing = [
        field
        for field in required
        if not normalize_text(
            identity.get(
                field,
            )
        )
    ]

    if missing:
        raise ValueError(
            "Import Contract identity "
            "missing fields: "
            + ", ".join(
                missing
            )
        )


# ============================================================================
# Commerce Validation
# ============================================================================

def validate_commerce(
    contract: dict,
) -> None:
    """
    Validate Commerce Contract.

    Writer does not invent price values.

    None is allowed when the source does
    not publish a price.
    """

    commerce = normalize_dict(
        contract.get(
            "commerce",
        )
    )

    if "price" not in commerce:
        raise ValueError(
            "Import Contract commerce "
            "missing price."
        )

    if "web_price" not in commerce:
        raise ValueError(
            "Import Contract commerce "
            "missing web_price."
        )

    if "final_price" not in commerce:
        raise ValueError(
            "Import Contract commerce "
            "missing final_price."
        )

    if "suggested_retail_price" not in commerce:
        raise ValueError(
            "Import Contract commerce "
            "missing suggested_retail_price."
        )


# ============================================================================
# Media Validation
# ============================================================================

def validate_media(
    contract: dict,
) -> None:
    """
    Validate Media Contract.

    Images are Reality-derived.
    """

    media = normalize_dict(
        contract.get(
            "media",
        )
    )

    if "image_url" not in media:
        raise ValueError(
            "Import Contract media "
            "missing image_url."
        )

    if "image_urls" not in media:
        raise ValueError(
            "Import Contract media "
            "missing image_urls."
        )


# ============================================================================
# Affiliate Validation
# ============================================================================

def validate_affiliate(
    contract: dict,
) -> None:
    """
    Validate Affiliate Contract.

    Affiliate URL is mandatory for HP
    Import Contract.

    IMPORTANT

    purchase_url and affiliate_url are
    different concepts.

        purchase_url
            = HP Reality

        affiliate_url
            = generated affiliate destination
    """

    affiliate = normalize_dict(
        contract.get(
            "affiliate",
        )
    )

    required = (
        "url",
        "original_url",
        "affiliate_url",
        "purchase_url",
    )

    missing = [
        field
        for field in required
        if field not in affiliate
    ]

    if missing:
        raise ValueError(
            "Import Contract affiliate "
            "missing fields: "
            + ", ".join(
                missing
            )
        )

    if not normalize_text(
        affiliate.get(
            "url",
        )
    ):
        raise ValueError(
            "Import Contract affiliate "
            "has empty url."
        )

    if not normalize_text(
        affiliate.get(
            "affiliate_url",
        )
    ):
        raise ValueError(
            "Import Contract affiliate "
            "has empty affiliate_url."
        )


# ============================================================================
# Specification Validation
# ============================================================================

def validate_specifications(
    contract: dict,
) -> None:
    """
    Validate Specification Contract.

    Writer does not inspect or interpret
    specification values.

    The specification combination belongs
    to one HP API Reality.
    """

    specifications = normalize_dict(
        contract.get(
            "specifications",
        )
    )

    if "specifications" not in specifications:
        raise ValueError(
            "Import Contract specifications "
            "missing specifications."
        )

    values = specifications.get(
        "specifications",
    )

    if not isinstance(
        values,
        dict,
    ):
        raise ValueError(
            "Import Contract "
            "specifications.specifications "
            "must be dict."
        )


# ============================================================================
# Feature Validation
# ============================================================================

def validate_features(
    contract: dict,
) -> None:
    """
    Validate Feature Contract.
    """

    features = normalize_dict(
        contract.get(
            "features",
        )
    )

    if "top_features" not in features:
        raise ValueError(
            "Import Contract features "
            "missing top_features."
        )

    if "description" not in features:
        raise ValueError(
            "Import Contract features "
            "missing description."
        )

    if "short_description" not in features:
        raise ValueError(
            "Import Contract features "
            "missing short_description."
        )


# ============================================================================
# Category Validation
# ============================================================================

def validate_category(
    contract: dict,
) -> None:
    """
    Validate Category Contract.
    """

    category = normalize_dict(
        contract.get(
            "category",
        )
    )

    if "category_name" not in category:
        raise ValueError(
            "Import Contract category "
            "missing category_name."
        )

    if "category_path" not in category:
        raise ValueError(
            "Import Contract category "
            "missing category_path."
        )


# ============================================================================
# Observation Validation
# ============================================================================

def validate_observation(
    contract: dict,
) -> None:
    """
    Validate Observation Runtime.

    Raw Reality must remain available.
    """

    observation = normalize_dict(
        contract.get(
            "observation_runtime",
        )
    )

    required = (
        "internal_reality_id",
        "source_unique_id",
        "product_code",
        "product_name",
        "raw",
    )

    missing = [
        field
        for field in required
        if field not in observation
    ]

    if missing:
        raise ValueError(
            "Import Contract observation_runtime "
            "missing fields: "
            + ", ".join(
                missing
            )
        )

    raw = observation.get(
        "raw",
    )

    if not isinstance(
        raw,
        dict,
    ):
        raise ValueError(
            "Import Contract "
            "observation_runtime.raw "
            "must be dict."
        )


# ============================================================================
# Contract Validation
# ============================================================================

def validate_contract(
    contract: dict,
) -> None:
    """
    Validate complete HP Import Contract.

    Structural validation only.

    Writer MUST NOT modify the contract.
    """

    if not isinstance(
        contract,
        dict,
    ):
        raise TypeError(
            "HP Import Contract "
            "must be dict."
        )

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
            "Import Contract missing fields: "
            + ", ".join(
                missing
            )
        )

    validate_identity(
        contract,
    )

    validate_commerce(
        contract,
    )

    validate_media(
        contract,
    )

    validate_affiliate(
        contract,
    )

    validate_specifications(
        contract,
    )

    validate_features(
        contract,
    )

    validate_category(
        contract,
    )

    validate_observation(
        contract,
    )


# ============================================================================
# ImportDocument Persistence
# ============================================================================

def save_contract(
    contract: dict,
) -> bool:
    """
    Persist one HP Import Contract.

    Returns
    -------
    bool
        True  : created
        False : updated

    IMPORTANT

    The complete Mapper Contract is stored
    unchanged in ImportDocument.contract.
    """

    document_key = get_document_key(
        contract,
    )

    _, created = (
        ImportDocument.objects
        .update_or_create(

            source_name=SOURCE_NAME,

            document_type=DOCUMENT_TYPE,

            document_key=document_key,

            defaults={

                "contract":
                    contract,

            },

        )
    )

    return created


# ============================================================================
# Single Contract Writer
# ============================================================================

def write_contract(
    contract: dict,
) -> bool:
    """
    Validate and persist one Import Contract.
    """

    validate_contract(
        contract,
    )

    return save_contract(
        contract,
    )


# ============================================================================
# Writer Runtime
# ============================================================================

def writer(
    contracts: list[dict],
) -> dict:
    """
    Execute HP ImportDocument Writer Runtime.

    Parameters
    ----------
    contracts:
        Import Contracts produced by Mapper.

    Returns
    -------
    dict
        Writer result summary.
    """

    trace_pipeline(
        "WRITER",
    )

    print()

    print("=" * 70)

    print(
        f"{SITE_NAME.upper()} "
        "IMPORT DOCUMENT WRITER"
    )

    print("=" * 70)

    created = 0

    updated = 0

    failed = 0

    for contract in contracts:

        identity = normalize_dict(
            contract.get(
                "identity",
                {},
            )
        )

        unique_id = normalize_text(
            identity.get(
                "unique_id",
            )
        )

        source_unique_id = normalize_text(
            identity.get(
                "source_unique_id",
            )
        )

        product_name = normalize_text(
            identity.get(
                "product_name",
            )
        )

        try:

            is_created = write_contract(
                contract,
            )

        except Exception as exc:

            failed += 1

            print(
                f"FAILED : "
                f"{unique_id or '(unknown)'}"
            )

            print(
                f"  API ID : "
                f"{source_unique_id or '(unknown)'}"
            )

            print(
                f"  ERROR  : "
                f"{exc}"
            )

            continue

        if is_created:

            created += 1

            status = "CREATE"

        else:

            updated += 1

            status = "UPDATE"

        print(
            f"{status:7} : "
            f"{unique_id} "
            f"| API={source_unique_id}"
        )

        if product_name:

            print(
                f"          "
                f"{product_name}"
            )

    written = (
        created
        + updated
    )

    print()

    print("=" * 70)

    print("WRITER RESULT")

    print("=" * 70)

    print(
        f"Contracts : "
        f"{len(contracts)}"
    )

    print(
        f"Created   : "
        f"{created}"
    )

    print(
        f"Updated   : "
        f"{updated}"
    )

    print(
        f"Written   : "
        f"{written}"
    )

    print(
        f"Failed    : "
        f"{failed}"
    )

    print("=" * 70)

    return {

        "contracts":
            len(contracts),

        "created":
            created,

        "updated":
            updated,

        "written":
            written,

        "failed":
            failed,

    }


# ============================================================================
# Entry Point
# ============================================================================

def main(
    contracts: list[dict],
) -> dict:
    """
    Runtime Entry Point.
    """

    return writer(
        contracts,
    )


# ============================================================================
# Standalone Execution
# ============================================================================

if __name__ == "__main__":

    raise RuntimeError(
        "writer.py must be executed "
        "from the Runtime Pipeline."
    )