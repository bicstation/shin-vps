#!/usr/bin/env python3

# ==============================================================================
#
# FILE:
# acquisition/sources/scraping/fujitsu/observation_store.py
#
# SHIN CORE LINX
#
# FUJITSU Observation Store Runtime
#
# Reality First
#
# Responsibilities
#
# - Receive FUJITSU Product Observation
# - Locate existing PCProduct from document_key
# - Save Observation into PCProduct.observation_runtime
# - Preserve Observation Reality as JSON
#
# NOT Responsibilities
#
# - HTTP Acquisition
# - HTML Parsing
# - Observation Extraction
# - Formatting
# - Semantic Processing
# - Product Mapping
# - Product Reconstruction
#
# ==============================================================================

from __future__ import annotations

import json

from api.models import (
    PCProduct,
)


# ==============================================================================
# Constants
# ==============================================================================

DOCUMENT_KEY_PREFIX = "product__"


# ==============================================================================
# Observation Serialization
# ==============================================================================

def serialize_observation(
    observation: dict,
) -> str:
    """
    Serialize Observation for PCProduct.observation_runtime.

    Observation Reality is stored as JSON text.

    No semantic transformation is performed.
    """

    return json.dumps(
        observation,
        ensure_ascii=False,
        indent=2,
    )


# ==============================================================================
# Product Resolver
# ==============================================================================

def resolve_product(
    observation: dict,
) -> PCProduct:
    """
    Resolve existing PCProduct from Observation document_key.

    Runtime relationship:

        Observation
            │
            ▼
        document_key
            │
            ▼
        product__{unique_id}
            │
            ▼
        PCProduct.unique_id
    """

    document_key = (
        observation.get(
            "document_key",
            "",
        )
        or ""
    ).strip()

    if not document_key:
        raise ValueError(
            "FUJITSU Observation requires document_key."
        )

    if not document_key.startswith(
        DOCUMENT_KEY_PREFIX,
    ):
        raise ValueError(
            "Invalid FUJITSU Observation document_key: "
            f"{document_key}"
        )

    unique_id = document_key[
        len(DOCUMENT_KEY_PREFIX):
    ]

    if not unique_id:
        raise ValueError(
            "FUJITSU Observation document_key "
            "contains no unique_id."
        )

    try:
        return PCProduct.objects.get(
            unique_id=unique_id,
        )

    except PCProduct.DoesNotExist as exc:
        raise ValueError(
            "FUJITSU PCProduct not found for "
            f"unique_id: {unique_id}"
        ) from exc


# ==============================================================================
# Observation Store
# ==============================================================================

def store_observation(
    observation: dict,
) -> PCProduct:
    """
    Save Observation into PCProduct.observation_runtime.

    Existing PCProduct is updated.

    No other PCProduct column is modified.
    """

    product = resolve_product(
        observation,
    )

    product.observation_runtime = (
        serialize_observation(
            observation,
        )
    )

    product.save(
        update_fields=[
            "observation_runtime",
        ],
    )

    return product


# ==============================================================================
# Runtime
# ==============================================================================

def observation_store(
    observations: list[dict],
) -> list[PCProduct]:
    """
    Execute FUJITSU Observation Store Runtime.

    Input:

        Listing Observation Runtime output

    Output:

        Saved PCProduct objects

    Runtime:

        Observation
            ↓
        document_key
            ↓
        Existing PCProduct
            ↓
        PCProduct.observation_runtime
    """

    print()

    print(
        "=" * 70
    )

    print(
        "FUJITSU OBSERVATION STORE"
    )

    print(
        "=" * 70
    )

    print(
        "INPUT OBSERVATIONS : "
        f"{len(observations)}"
    )

    products: list[PCProduct] = []

    saved = 0
    failed = 0

    for index, observation in enumerate(
        observations,
        start=1,
    ):

        document_key = (
            observation.get(
                "document_key",
                "",
            )
            or ""
        ).strip()

        try:

            product = store_observation(
                observation,
            )

        except Exception as exc:

            failed += 1

            print()

            print(
                f"[{index:03}] "
                f"{document_key}"
            )

            print(
                "OBSERVATION : FAILED"
            )

            print(
                f"ERROR       : {exc}"
            )

            continue

        products.append(
            product,
        )

        saved += 1

        print()

        print(
            f"[{index:03}] "
            f"{product.unique_id}"
        )

        print(
            "OBSERVATION : SAVED"
        )

    # ==========================================================================
    # Result
    # ==========================================================================

    print()

    print(
        "=" * 70
    )

    print(
        "FUJITSU OBSERVATION STORE RESULT"
    )

    print(
        "=" * 70
    )

    print(
        "INPUT     : "
        f"{len(observations)}"
    )

    print(
        "SAVED     : "
        f"{saved}"
    )

    print(
        "FAILED    : "
        f"{failed}"
    )

    print(
        "=" * 70
    )

    return products


# ==============================================================================
# Entry Point
# ==============================================================================

def main(
    observations: list[dict] | None = None,
):
    """
    Runtime Entry Point.

    Observation Runtime output is required.
    """

    if observations is None:

        raise RuntimeError(
            "FUJITSU Observation Store requires "
            "Observation Runtime output."
        )

    return observation_store(
        observations=observations,
    )


# ==============================================================================
# Direct Execution
# ==============================================================================

if __name__ == "__main__":

    main()