#!/usr/bin/env python3

"""
==============================================================================
FILE:
    acquisition/sources/scraping/dell/verify.py

SHIN CORE LINX

DELL PCProduct Verification Runtime

Responsibilities

- Read saved DELL PCProducts
- Display ALL PCProduct columns
- Verify actual database state
- Report DELL PCProduct count

NOT Responsibilities

- HTTP Acquisition
- HTML Parsing
- Observation Extraction
- Formatting
- Mapping
- Saving
- Semantic Processing

Reality First
Database Reality First
============================================================================== 
"""

from __future__ import annotations


from api.models import (
    PCProduct,
)


# ==============================================================================
# Runtime
# ==============================================================================

SOURCE_PREFIX = (
    "dell_"
)


# ==============================================================================
# Product Query
# ==============================================================================

def get_dell_products():
    """
    Return existing DELL PCProducts.

    Verification reads the database only.
    """

    return (
        PCProduct.objects
        .filter(
            unique_id__startswith=SOURCE_PREFIX,
        )
        .order_by(
            "unique_id",
        )
    )


# ==============================================================================
# Field Display
# ==============================================================================

def display_field(
    field_name: str,
    value,
) -> None:
    """
    Display one PCProduct field.
    """

    print(
        f"{field_name:<30}: {value}"
    )


# ==============================================================================
# Product Display
# ==============================================================================

def display_product(
    product: PCProduct,
    index: int,
) -> None:
    """
    Display ALL concrete PCProduct fields.

    Fields are obtained dynamically from
    Django Model Metadata.

    No PCProduct field names are hard-coded.
    """

    print()

    print(
        "=" * 80
    )

    print(
        f"[{index:03}] PCProduct"
    )

    print(
        "=" * 80
    )

    for field in product._meta.concrete_fields:

        field_name = field.name

        value = getattr(
            product,
            field_name,
            None,
        )

        display_field(
            field_name,
            value,
        )

    print(
        "=" * 80
    )


# ==============================================================================
# Verification
# ==============================================================================

def verify():
    """
    Verify actual DELL PCProduct database state.

    The database is queried directly.

    This Runtime does NOT assume that a field named
    "observation" exists.

    Every concrete PCProduct field is displayed.
    """

    print()

    print(
        "=" * 80
    )

    print(
        "DELL PCPRODUCT VERIFICATION"
    )

    print(
        "=" * 80
    )

    products = get_dell_products()

    total = products.count()

    print(
        "DELL PRODUCTS :",
        total,
    )

    # --------------------------------------------------------------------------
    # Display all products
    # --------------------------------------------------------------------------

    for index, product in enumerate(
        products,
        start=1,
    ):

        display_product(
            product,
            index,
        )

    # --------------------------------------------------------------------------
    # Result
    # --------------------------------------------------------------------------

    print()

    print(
        "=" * 80
    )

    print(
        "VERIFICATION RESULT"
    )

    print(
        "=" * 80
    )

    print(
        "PCProducts :",
        total,
    )

    print(
        "Fields     :",
        len(
            PCProduct._meta.concrete_fields,
        ),
    )

    print(
        "=" * 80
    )

    return {
        "total": total,
        "fields": len(
            PCProduct._meta.concrete_fields,
        ),
    }


# ==============================================================================
# Entry Point
# ==============================================================================

def main():
    """
    Runtime Entry Point.
    """

    return verify()


# ==============================================================================
# Direct Execution
# ==============================================================================

if __name__ == "__main__":

    main()