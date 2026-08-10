#!/usr/bin/env python3

# ==============================================================================
#
# FILE:
# acquisition/sources/scraping/fujitsu/verify.py
#
# SHIN CORE LINX
#
# FUJITSU PCProduct Verification Runtime
#
# Reality First
#
# Responsibilities
#
# - Read saved FUJITSU PCProducts
# - Verify FUJITSU PCProduct identity
# - Verify Observation Runtime persistence
# - Display ALL PCProduct columns
# - Verify actual database state
# - Report FUJITSU PCProduct count
#
# NOT Responsibilities
#
# - HTTP Acquisition
# - HTML Parsing
# - Observation Extraction
# - Formatting
# - Mapping
# - Saving
# - Semantic Processing
#
# ==============================================================================

from __future__ import annotations

from api.models import (
    PCProduct,
)


# ==============================================================================
# Runtime
# ==============================================================================

SOURCE_NAME = "fujitsu"

SOURCE_PREFIX = "fujitsu_"

OBSERVATION_FIELD = "observation_runtime"


# ==============================================================================
# Product Query
# ==============================================================================

def get_fujitsu_products():
    """
    Return existing FUJITSU PCProducts.

    Verification reads the database only.

    FUJITSU identity is verified by:

        maker == "fujitsu"

    AND

        unique_id starts with "fujitsu_"
    """

    return (
        PCProduct.objects
        .filter(
            maker=SOURCE_NAME,
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

    No PCProduct field names are hard-coded
    for display.
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
# Observation Verification
# ==============================================================================

def verify_observation_runtime(
    products,
) -> tuple[int, int]:
    """
    Verify PCProduct.observation_runtime.

    Returns
    -------

    saved:
        Products containing Observation Runtime.

    empty:
        Products without Observation Runtime.
    """

    # --------------------------------------------------------------------------
    # Field existence
    # --------------------------------------------------------------------------

    field_names = {
        field.name
        for field in PCProduct._meta.concrete_fields
    }

    if OBSERVATION_FIELD not in field_names:

        print()

        print(
            "WARNING : "
            f"{OBSERVATION_FIELD} field does not exist."
        )

        return 0, 0

    # --------------------------------------------------------------------------
    # Verification
    # --------------------------------------------------------------------------

    saved = 0
    empty = 0

    for product in products:

        observation = (
            getattr(
                product,
                OBSERVATION_FIELD,
                None,
            )
            or ""
        ).strip()

        if observation:

            saved += 1

        else:

            empty += 1

    return saved, empty


# ==============================================================================
# Verification
# ==============================================================================

def verify():
    """
    Verify actual FUJITSU PCProduct database state.

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
        "FUJITSU PCPRODUCT VERIFICATION"
    )

    print(
        "=" * 80
    )

    # --------------------------------------------------------------------------
    # Runtime Identity
    # --------------------------------------------------------------------------

    print(
        "SOURCE       :",
        SOURCE_NAME,
    )

    print(
        "PREFIX       :",
        SOURCE_PREFIX,
    )

    print(
        "MODULE       :",
        __file__,
    )

    print(
        "=" * 80
    )

    # --------------------------------------------------------------------------
    # Product Query
    # --------------------------------------------------------------------------

    products = get_fujitsu_products()

    total = products.count()

    print(
        "FUJITSU PRODUCTS :",
        total,
    )

    # --------------------------------------------------------------------------
    # Observation Verification
    # --------------------------------------------------------------------------

    saved, empty = (
        verify_observation_runtime(
            products,
        )
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
        "PCProducts        :",
        total,
    )

    print(
        "Observation Saved :",
        saved,
    )

    print(
        "Observation Empty :",
        empty,
    )

    print(
        "Fields            :",
        len(
            PCProduct._meta.concrete_fields,
        ),
    )

    print(
        "=" * 80
    )

    return {
        "total": total,
        "saved": saved,
        "empty": empty,
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