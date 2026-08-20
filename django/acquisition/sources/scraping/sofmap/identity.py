# /home/maya/shin-vps/django/acquisition/sources/scraping/sofmap/identity.py

#!/usr/bin/env python3
"""
==============================================================================
FILE:
    acquisition/sources/scraping/sofmap/identity.py

SHIN CORE LINX

sofmap Scraping → Common Identity Runtime Bridge

Reality First

Runtime Flow

    PCProduct
        │
        ├── maker
        ├── name
        ├── description
        └── observation_runtime
        │
        ▼
    Identity Contract
        │
        ▼
    Common IdentityBuilder
        │
        ▼
    Identity Classifier
        │
        ▼
    identity.tsv
        │
        ├── brand
        ├── series
        └── collaboration


Responsibilities

- Load sofmap PCProduct records
- Build Identity Contract
- Pass existing Observation Reality to Identity Runtime
- Execute Common IdentityBuilder
- Update PCProduct Identity fields

NOT Responsibilities

- HTML Parsing
- HTTP Acquisition
- Observation Extraction
- Semantic Classification
- TSV Classification
- Product Reconstruction
- Affiliate Generation
- Import Contract
- PCProduct Creation
- Database Discovery
============================================================================== 
"""

from __future__ import annotations

from api.models import PCProduct

from acquisition.common.identity.builder import (
    IdentityBuilder,
)


# ==============================================================================
# Identity Runtime
# ==============================================================================

def build_identity(
    product: PCProduct,
) -> dict:
    """
    Build Identity from an existing sofmap PCProduct.

    Existing Reality:

        PCProduct
            ├── name
            ├── description
            └── observation_runtime

    is passed directly to the Common Identity Runtime.

    Observation is additional Reality.

    It is NOT a condition for execution.
    """

    contract = {
        "identity": {
            "maker": product.maker or "",
            "product_name": product.name or "",
            "product_url": product.url or "",
            "sku": product.product_no or "",
            "product_no": product.product_no or "",
            "model": product.model or "",
        },

        "description": (
            product.description or ""
        ),

        "observation_runtime": (
            product.observation_runtime or {}
        ),
    }

    return IdentityBuilder.build(
        contract,
    )


# ==============================================================================
# Product Identity Update
# ==============================================================================

def apply_identity(
    product: PCProduct,
    identity: dict,
) -> PCProduct:
    """
    Apply Common Identity Runtime result to PCProduct.

    Only Identity fields are modified.
    """

    product.brand = (
        identity.get(
            "brand",
            "",
        )
        or ""
    )

    product.series = (
        identity.get(
            "series",
            "",
        )
        or ""
    )

    product.collaboration = (
        identity.get(
            "collaboration",
            "",
        )
        or ""
    )

    product.save(
        update_fields=[
            "brand",
            "series",
            "collaboration",
        ],
    )

    return product


# ==============================================================================
# Process Product
# ==============================================================================

def process_product(
    product: PCProduct,
) -> PCProduct:
    """
    Execute Common Identity Runtime for one sofmap PCProduct.
    """

    identity = build_identity(
        product,
    )

    product = apply_identity(
        product,
        identity,
    )

    return product


# ==============================================================================
# Runtime
# ==============================================================================

def identity(
    products: list[PCProduct] | None = None,
) -> list[PCProduct]:
    """
    Execute sofmap Identity Runtime.

    Input:

        Verified sofmap PCProducts.

    Reality passed to Identity Runtime:

        maker
        name
        description
        observation_runtime

    Output:

        Updated PCProducts with:

        brand
        series
        collaboration
    """

    print()
    print("=" * 70)
    print("sofmap IDENTITY RUNTIME")
    print("=" * 70)

    if products is None:

        products = list(
            PCProduct.objects.filter(
                maker__iexact="sofmap",
            )
        )

    print(
        "INPUT PRODUCTS : "
        f"{len(products)}"
    )

    processed = 0
    failed = 0

    results: list[PCProduct] = []

    for index, product in enumerate(
        products,
        start=1,
    ):

        try:

            result = process_product(
                product,
            )

            results.append(
                result,
            )

            processed += 1

            print()
            print(
                f"[{index:03}] "
                f"{product.unique_id}"
            )

            print(
                "BRAND  : "
                f"{result.brand}"
            )

            print(
                "SERIES : "
                f"{result.series}"
            )

            print(
                "COLLAB : "
                f"{result.collaboration}"
            )

        except Exception as exc:

            failed += 1

            print()
            print(
                f"[{index:03}] "
                f"{product.unique_id}"
            )

            print(
                "IDENTITY : FAILED"
            )

            print(
                f"ERROR    : {exc}"
            )

    # ==========================================================================
    # Result
    # ==========================================================================

    print()
    print("=" * 70)
    print("sofmap IDENTITY RUNTIME RESULT")
    print("=" * 70)

    print(
        "INPUT     : "
        f"{len(products)}"
    )

    print(
        "PROCESSED : "
        f"{processed}"
    )

    print(
        "FAILED    : "
        f"{failed}"
    )

    print("=" * 70)

    return results


# ==============================================================================
# Entry Point
# ==============================================================================

def main(
    products: list[PCProduct] | None = None,
):
    """
    Runtime Entry Point.
    """

    return identity(
        products=products,
    )


# ==============================================================================
# Direct Execution
# ==============================================================================

if __name__ == "__main__":

    main()