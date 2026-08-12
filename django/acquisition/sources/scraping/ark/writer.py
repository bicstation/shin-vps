#!/usr/bin/env python3

# ============================================================================
#
# FILE:
# acquisition/sources/scraping/ark/writer.py
#
# SHIN CORE LINX
#
# ARK ImportDocument Writer
#
# Reality First
# Observation First
#
# ============================================================================
#
# Pipeline
#
# Seed
#   ↓
# Fetch
#   ↓
# Observation
#   ↓
# Formatter
#   ↓
# Mapper
#   ↓
# Import Contract
#   ↓
# Writer
#   ↓
# ImportDocument
#   ↓
# Integration
#
# ============================================================================
#
# Responsibilities
#
# - Receive ARK Import Contracts
# - Persist Import Contracts
# - Create ImportDocument
# - Update existing ImportDocument
# - Preserve the complete Mapper Contract
# - Report Writer Reality
#
# NOT Responsibilities
#
# - HTTP Acquisition
# - HTML Parsing
# - Product Observation
# - Formatting
# - Mapping
# - Semantic Processing
# - Product Building
# - Affiliate URL generation
# - Specification interpretation
# - Product meaning generation
#
# ============================================================================
#
# IMPORTANT
#
# Writer is a Persistence Boundary.
#
# Mapper has already completed the Translation:
#
#     Formatter Runtime
#           ↓
#     Import Contract
#
# Writer MUST NOT rebuild or reinterpret that Contract.
#
# The Contract is persisted as-is:
#
#     ImportDocument.contract = contract
#
# ============================================================================

from __future__ import annotations

from typing import Any

from api.models import ImportDocument

from acquisition.common.trace.reality_trace import (
    trace_pipeline,
)

from .settings import SITE_NAME


# ============================================================================
# Runtime Constants
# ============================================================================

SOURCE_NAME = SITE_NAME.lower()

DOCUMENT_TYPE = "product"


# ============================================================================
# Utility
# ============================================================================

def normalize_text(
    value: Any,
) -> str:
    """
    Structural text normalization only.

    Writer does not perform semantic conversion.
    """

    if value is None:

        return ""

    if isinstance(
        value,
        str,
    ):

        return value.strip()

    return str(
        value,
    ).strip()


# ============================================================================
# Contract Identity
# ============================================================================

def get_identity(
    contract: dict[str, Any],
) -> dict[str, Any]:
    """
    Return Import Contract Identity.

    Mapper is responsible for creating this structure.
    Writer only reads the document key from it.
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
            "ARK Import Contract "
            "'identity' must be dict."
        )

    return identity


def get_document_key(
    contract: dict[str, Any],
) -> str:
    """
    Resolve ImportDocument document_key.

    The canonical internal Reality ID is used.

    Example:

        ark_3478
        ark_3745
        ark_3729
    """

    identity = get_identity(
        contract,
    )

    document_key = normalize_text(
        identity.get(
            "unique_id",
            "",
        )
    )

    if not document_key:

        raise ValueError(
            "ARK Import Contract has empty "
            "identity.unique_id."
        )

    return document_key


# ============================================================================
# Minimal Contract Guard
# ============================================================================

def validate_contract(
    contract: dict[str, Any],
) -> None:
    """
    Perform only the minimum structural validation
    required before persistence.

    Writer does NOT validate semantic contents.

    Mapper owns Contract construction.
    """

    if not isinstance(
        contract,
        dict,
    ):

        raise TypeError(
            "ARK Import Contract "
            "must be dict."
        )

    identity = contract.get(
        "identity",
    )

    if not isinstance(
        identity,
        dict,
    ):

        raise ValueError(
            "ARK Import Contract has no "
            "identity."
        )

    document_key = normalize_text(
        identity.get(
            "unique_id",
            "",
        )
    )

    if not document_key:

        raise ValueError(
            "ARK Import Contract has empty "
            "identity.unique_id."
        )


# ============================================================================
# ImportDocument Persistence
# ============================================================================

def save_contract(
    contract: dict[str, Any],
) -> bool:
    """
    Persist one complete ARK Import Contract.

    Returns
    -------
    bool

        True
            ImportDocument created.

        False
            Existing ImportDocument updated.

    IMPORTANT

    The contract is stored unchanged.

        contract
            ↓
        ImportDocument.contract

    No fields are extracted or reconstructed here.
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
                "contract": contract,
            },
        )
    )

    return created


# ============================================================================
# Single Contract Writer
# ============================================================================

def write_contract(
    contract: dict[str, Any],
) -> bool:
    """
    Write one Import Contract.
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
    contracts: list[dict[str, Any]],
    **kwargs: Any,
) -> dict[str, Any]:
    """
    Execute ARK ImportDocument Writer Runtime.

    Input:

        Mapper Import Contracts

    Output:

        Writer Result

    One Contract becomes one ImportDocument.
    """

    trace_pipeline(
        "WRITER",
    )

    print()

    print(
        "=" * 70
    )

    print(
        "📝 ARK IMPORT DOCUMENT WRITER"
    )

    print(
        "=" * 70
    )

    # ========================================================================
    # Counters
    # ========================================================================

    created = 0

    updated = 0

    failed = 0

    # ========================================================================
    # Contract Runtime
    # ========================================================================

    for contract in contracts:

        identity = {}

        if isinstance(
            contract,
            dict,
        ):

            identity = contract.get(
                "identity",
                {},
            )

        if not isinstance(
            identity,
            dict,
        ):

            identity = {}

        unique_id = normalize_text(
            identity.get(
                "unique_id",
                "",
            )
        )

        source_unique_id = normalize_text(
            identity.get(
                "source_unique_id",
                "",
            )
        )

        product_name = normalize_text(
            identity.get(
                "product_name",
                "",
            )
        )

        # --------------------------------------------------------------------
        # Write
        # --------------------------------------------------------------------

        try:

            is_created = write_contract(
                contract,
            )

        except Exception as exc:

            failed += 1

            print()

            print(
                "WRITER FAILED"
            )

            print(
                f"  ID     : "
                f"{unique_id or '(empty)'}"
            )

            print(
                f"  SOURCE : "
                f"{source_unique_id or '(empty)'}"
            )

            print(
                f"  PRODUCT: "
                f"{product_name or '(empty)'}"
            )

            print(
                f"  ERROR  : "
                f"{exc}"
            )

            continue

        # --------------------------------------------------------------------
        # Result
        # --------------------------------------------------------------------

        if is_created:

            created += 1

            status = "CREATE"

        else:

            updated += 1

            status = "UPDATE"

        print()

        print(
            f"{status:7} : "
            f"{unique_id}"
            f" | SOURCE={source_unique_id}"
        )

        if product_name:

            print(
                f"         "
                f"{product_name}"
            )

    # =========================================================================
    # Summary
    # =========================================================================

    written = (
        created
        + updated
    )

    print()

    print(
        "=" * 70
    )

    print(
        "WRITER RESULT"
    )

    print(
        "=" * 70
    )

    print(
        f"Import Contracts : "
        f"{len(contracts)}"
    )

    print(
        f"Created          : "
        f"{created}"
    )

    print(
        f"Updated          : "
        f"{updated}"
    )

    print(
        f"Written          : "
        f"{written}"
    )

    print(
        f"Failed           : "
        f"{failed}"
    )

    print(
        "=" * 70
    )

    return {
        "contracts": len(
            contracts,
        ),
        "created": created,
        "updated": updated,
        "written": written,
        "failed": failed,
    }


# ============================================================================
# Entry Point
# ============================================================================

def main(
    *,
    contracts: list[dict[str, Any]],
    **kwargs: Any,
) -> dict[str, Any]:
    """
    Runtime Entry Point.
    """

    return writer(
        contracts=contracts,
        **kwargs,
    )


# ============================================================================
# Standalone Execution
# ============================================================================

if __name__ == "__main__":

    raise RuntimeError(
        "ark/writer.py must be executed "
        "from the ARK Runtime Pipeline."
    )