#!/usr/bin/env python3
"""
==============================================================================
FILE:
    acquisition/sources/scraping/lenovo/writer.py

SHIN CORE LINX

LENOVO OpenAPI ImportDocument Writer

Import Contract
        │
        ▼
ImportDocument

Reality First
Observation First
Persistence Authority

Responsibilities

- Receive Import Contract
- Persist Import Contract
- Create ImportDocument
- Update ImportDocument
- Preserve Import Reality

NOT Responsibilities

- HTTP Acquisition
- HTML Parsing
- Reality Observation
- Formatter
- Mapping
- Semantic Processing
- PCProduct Construction

==============================================================================

Pipeline

Formatter
    │
    ▼
Runtime Contract
    │
    ▼
Mapper
    │
    ▼
Import Contract
    │
    ▼
Writer
    │
    ▼
ImportDocument
    │
    ▼
Integration

==============================================================================
"""

from __future__ import annotations

from api.models import (
    ImportDocument,
)

from acquisition.common.trace.reality_trace import (
    trace_pipeline,
)

from .settings import (
    SITE_NAME,
)


# ==============================================================================
# Runtime Constants
# ==============================================================================

SOURCE_NAME = SITE_NAME.lower()

DOCUMENT_TYPE = "product"


# ==============================================================================
# Contract Access
# ==============================================================================

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
    Resolve ImportDocument document_key
    from Import Contract identity.
    """

    identity = get_identity(
        contract,
    )

    document_key = identity.get(
        "unique_id",
        "",
    )

    if not document_key:

        raise ValueError(
            "Import Contract has no "
            "unique_id."
        )

    return str(
        document_key
    )


# ==============================================================================
# ImportDocument Persistence
# ==============================================================================

def save_contract(
    contract: dict,
) -> bool:
    """
    Persist one Lenovo Import Contract.

    Returns
    -------
    bool
        True  : created
        False : updated
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


# ==============================================================================
# Contract Validation
# ==============================================================================

def validate_contract(
    contract: dict,
) -> None:
    """
    Validate Import Contract before persistence.

    Structural validation only.

    Writer does not modify the contract.
    """

    required = (

        "identity",

        "commerce",

        "media",

        "affiliate",

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

    identity = get_identity(
        contract,
    )

    if not identity.get(
        "unique_id"
    ):

        raise ValueError(
            "Import Contract has empty "
            "unique_id."
        )


# ==============================================================================
# Single Contract Writer
# ==============================================================================

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


# ==============================================================================
# Writer Runtime
# ==============================================================================

def writer(
    contracts: list[dict],
) -> dict:
    """
    Execute Lenovo ImportDocument Writer Runtime.

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
        f"{SITE_NAME} IMPORT DOCUMENT WRITER"
    )

    print("=" * 70)

    created = 0

    updated = 0

    failed = 0

    for contract in contracts:

        try:

            is_created = write_contract(
                contract,
            )

        except Exception as exc:

            failed += 1

            identity = contract.get(
                "identity",
                {},
            )

            print(
                "FAILED : "
                f"{identity.get('unique_id', '')}"
            )

            print(
                f"  ERROR : {exc}"
            )

            continue

        identity = get_identity(
            contract,
        )

        unique_id = identity.get(
            "unique_id",
            "",
        )

        product_name = identity.get(
            "product_name",
            "",
        )

        if is_created:

            created += 1

            status = "CREATE"

        else:

            updated += 1

            status = "UPDATE"

        print(
            f"{status:7} : "
            f"{unique_id} "
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
        f"Contracts : {len(contracts)}"
    )

    print(
        f"Created   : {created}"
    )

    print(
        f"Updated   : {updated}"
    )

    print(
        f"Written   : {written}"
    )

    print(
        f"Failed    : {failed}"
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


# ==============================================================================
# Entry Point
# ==============================================================================

def main(
    contracts: list[dict],
) -> dict:
    """
    Runtime Entry Point.
    """

    return writer(
        contracts,
    )


# ==============================================================================
# Standalone Execution
# ==============================================================================

if __name__ == "__main__":

    raise RuntimeError(
        "writer.py must be executed "
        "from the Runtime Pipeline."
    )