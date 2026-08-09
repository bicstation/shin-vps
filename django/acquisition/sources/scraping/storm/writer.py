#!/usr/bin/env python3
"""
==============================================================================
FILE:
    acquisition/sources/scraping/storm/writer.py

SHIN CORE LINX

STORM ImportDocument Writer

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
- Reality Observation
- Formatter
- Mapping
- Product Import
- Semantic Processing

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
    """

    identity = contract["identity"]

    _, created = (

        ImportDocument.objects

        .update_or_create(

            source_name=SITE_NAME.lower(),

            document_type="product",

            document_key=identity["unique_id"],

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
):
    """
    Execute ImportDocument Writer Runtime.
    """

    trace_pipeline(
        "WRITER",
    )

    print("=" * 70)
    print(f"{SITE_NAME} IMPORT DOCUMENT WRITER")
    print("=" * 70)

    created = 0
    updated = 0

    for contract in contracts:
        
        print("=" * 70)
        print(contract["affiliate"])
        print("=" * 70)

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

            f"{contract['identity']['product_name']}"

        )

    print()

    print("=" * 70)
    print("RESULT")
    print("=" * 70)
    print(f"Created : {created}")
    print(f"Updated : {updated}")
    print(f"Written : {created + updated}")
    print("=" * 70)


# ==============================================================================
# Entry Point
# ==============================================================================

def main(
    contracts: list[dict],
):
    """
    Runtime Entry Point.
    """

    writer(

        contracts,

    )


if __name__ == "__main__":

    raise RuntimeError(

        "writer.py must be executed from the Runtime Pipeline."

    )