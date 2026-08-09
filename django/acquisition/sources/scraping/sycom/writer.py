#!/usr/bin/env python3

"""
==============================================================================
FILE:
    acquisition/sources/scraping/sycom/writer.py

SHIN CORE LINX

SYCOM ImportDocument Writer

Reality First Pipeline

Import Contract
        │
        ▼
ImportDocument


Reality First
Observation First
Translation Authority
Persistence Authority


Responsibilities

- Persist Import Contract
- Build ImportDocument
- Preserve Import Reality


NOT Responsibilities

- HTML Parsing
- HTTP Acquisition
- Reality Observation
- Formatter
- Mapping
- Product Import
- Semantic Processing


IMPORTANT

Writer does NOT modify the Import Contract.

The Mapper is the Translation Authority.

The Writer is the Persistence Authority.

The contract received here is persisted as-is.


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
# ImportDocument Persistence
# ==============================================================================

def save_contract(
    contract: dict,
) -> bool:
    """
    Persist Import Contract.

    The Import Contract is stored without
    semantic modification or product processing.

    Returns:

        True
            ImportDocument created.

        False
            Existing ImportDocument updated.
    """

    identity = contract.get(
        "identity",
        {},
    )

    unique_id = identity.get(
        "unique_id",
        "",
    )

    if not unique_id:
        raise ValueError(
            "Import Contract is missing identity.unique_id"
        )

    _, created = (

        ImportDocument.objects

        .update_or_create(

            source_name=SITE_NAME.lower(),

            document_type="product",

            document_key=unique_id,

            defaults={

                "contract": contract,

            },

        )

    )

    return created


# ==============================================================================
# Writer Runtime
# ==============================================================================

def writer(
    contracts: list[dict],
) -> None:
    """
    Execute SYCOM ImportDocument Writer Runtime.

    Input:

        Import Contract

    Output:

        ImportDocument persistence

    Writer does not build products.

    Writer does not perform semantic processing.
    """

    trace_pipeline(
        "WRITER",
    )

    print()

    print(
        "=" * 70
    )

    print(
        f"{SITE_NAME} IMPORT DOCUMENT WRITER"
    )

    print(
        "=" * 70
    )

    created = 0

    updated = 0

    for contract in contracts:

        identity = contract.get(
            "identity",
            {},
        )

        product_name = identity.get(
            "product_name",
            "",
        )

        unique_id = identity.get(
            "unique_id",
            "",
        )

        affiliate = contract.get(
            "affiliate",
            {},
        )

        print()

        print(
            "-" * 70
        )

        print(
            f"PRODUCT : {product_name}"
        )

        print(
            f"KEY     : {unique_id}"
        )

        print(
            "AFFILIATE"
        )

        print(
            f"  ORIGINAL : "
            f"{affiliate.get('original_url', '')}"
        )

        print(
            f"  URL      : "
            f"{affiliate.get('url', '')}"
        )

        print(
            "-" * 70
        )

        is_created = save_contract(
            contract,
        )

        if is_created:

            created += 1

            status = "CREATE"

        else:

            updated += 1

            status = "UPDATE"

        print(
            f"{status:7} : "
            f"{product_name}"
        )

    print()

    print(
        "=" * 70
    )

    print(
        "RESULT"
    )

    print(
        "=" * 70
    )

    print(
        f"Created : {created}"
    )

    print(
        f"Updated : {updated}"
    )

    print(
        f"Written : "
        f"{created + updated}"
    )

    print(
        "=" * 70
    )


# ==============================================================================
# Entry Point
# ==============================================================================

def main(
    contracts: list[dict],
):
    """
    Runtime Entry Point.

    Writer is executed from the Runtime Pipeline.
    """

    return writer(
        contracts,
    )


if __name__ == "__main__":

    raise RuntimeError(
        "writer.py must be executed from the Runtime Pipeline."
    )