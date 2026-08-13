#!/usr/bin/env python3
"""
==============================================================================
SHIN CORE LINX

ARK Formatter Runtime

Formatter Runtime

AcquisitionDocument (observation)
        │
        ▼
Observation Runtime
        │
        ▼
Formatter Runtime
        │
        ▼
AcquisitionDocument (formatter)

Reality First
Normalization First

Responsibilities

- Normalize Observation Runtime
- Produce Formatter Runtime

Not Responsibilities

- Observation
- Mapping
- Integration

==============================================================================
"""

from __future__ import annotations

import json

from api.models.acquisition_document import (
    AcquisitionDocument,
)

from acquisition.common.trace.reality_trace import (
    trace_pipeline,
)

from .settings import (
    SITE_NAME,
)


# ==============================================================================
# Runtime
# ==============================================================================

DOCUMENT_INPUT = "observation"

DOCUMENT_OUTPUT = "formatter"

# ==============================================================================
# Identity Normalization
# ==============================================================================

def normalize_identity(
    observation: dict,
) -> dict:
    """
    Normalize product identity.
    """

    return {

        # ---------------------------------------------------------------------
        # Maker
        # ---------------------------------------------------------------------

        "maker": SITE_NAME.upper(),

        # ---------------------------------------------------------------------
        # Brand
        # ---------------------------------------------------------------------

        "brand": "",

        # ---------------------------------------------------------------------
        # Series
        # ---------------------------------------------------------------------

        "series": "",

        # ---------------------------------------------------------------------
        # Product
        # ---------------------------------------------------------------------

        "product_name": observation.get(

            "raw_product_name",

            "",

        ),

        "model": observation.get(

            "raw_model",

            "",

        ),

        "product_no": observation.get(

            "raw_product_no",

            "",

        ),

        "pc_id": observation.get(

            "raw_pc_id",

            "",

        ),

    }

# ==============================================================================
# Commerce Normalization
# ==============================================================================

def normalize_commerce(
    observation: dict,
) -> dict:
    """
    Normalize commerce information.
    """

    return {

        # ---------------------------------------------------------------------
        # Price
        # ---------------------------------------------------------------------

        "price": observation.get(

            "raw_price",

            "",

        ),

        # ---------------------------------------------------------------------
        # Release Date
        # ---------------------------------------------------------------------

        "release_date": observation.get(

            "raw_release_date",

            "",

        ),

    }

# ==============================================================================
# Media Normalization
# ==============================================================================

def normalize_media(
    observation: dict,
) -> dict:
    """
    Normalize media information.
    """

    return {

        # ---------------------------------------------------------------------
        # Image
        # ---------------------------------------------------------------------

        "image_url": observation.get(

            "raw_image",

            "",

        ),

        "image_alt": observation.get(

            "raw_image_alt",

            "",

        ),

        # ---------------------------------------------------------------------
        # Detail
        # ---------------------------------------------------------------------

        "detail_url": observation.get(

            "raw_detail_url",

            "",

        ),

    }

# ==============================================================================
# Specification Normalization
# ==============================================================================

def normalize_specifications(
    observation: dict,
) -> dict:
    """
    Normalize specification information.
    """

    specs = observation.get(

        "raw_specs",

        {},

    )

    return {

        # ---------------------------------------------------------------------
        # Platform
        # ---------------------------------------------------------------------

        "os": specs.get(

            "OS",

            "",

        ),

        # ---------------------------------------------------------------------
        # CPU
        # ---------------------------------------------------------------------

        "cpu": specs.get(

            "CPU",

            "",

        ),

        # ---------------------------------------------------------------------
        # Memory
        # ---------------------------------------------------------------------

        "memory": specs.get(

            "Memory",

            "",

        ),

        # ---------------------------------------------------------------------
        # Storage
        # ---------------------------------------------------------------------

        "storage": specs.get(

            "Storage",

            "",

        ),

        # ---------------------------------------------------------------------
        # Graphics
        # ---------------------------------------------------------------------

        "graphics": specs.get(

            "Graphics",

            "",

        ),

        # ---------------------------------------------------------------------
        # Power
        # ---------------------------------------------------------------------

        "power": specs.get(

            "Power",

            "",

        ),

    }

# ==============================================================================
# Cache
# ==============================================================================

def exists(
    document_key: str,
) -> bool:

    return AcquisitionDocument.objects.filter(

        source_type="scraping",

        source_name=SITE_NAME.lower(),

        document_type=DOCUMENT_OUTPUT,

        document_key=document_key,

    ).exists()


# ==============================================================================
# Persistence
# ==============================================================================

def save_formatter(
    *,
    document_key: str,
    runtime: dict,
):

    document, created = AcquisitionDocument.objects.update_or_create(

        source_type="scraping",

        source_name=SITE_NAME.lower(),

        document_type=DOCUMENT_OUTPUT,

        document_key=document_key,

        defaults={

            "content_type": "application/json",

            "content": json.dumps(

                runtime,

                ensure_ascii=False,

                indent=2,

            ),

        },

    )

    return document, created


# ==============================================================================
# Formatter Builder
# ==============================================================================

def build_formatter(
    *,
    document_key: str,
    observation: dict,
) -> dict:
    """
    Build formatter runtime.
    """

    identity = normalize_identity(

        observation,

    )

    commerce = normalize_commerce(

        observation,

    )

    media = normalize_media(

        observation,

    )

    specifications = normalize_specifications(

        observation,

    )

    # -------------------------------------------------------------------------
    # Runtime
    # -------------------------------------------------------------------------

    runtime = {

        #
        # Runtime
        #

        "document_key": document_key,

        #
        # Identity
        #

        **identity,

        #
        # Commerce
        #

        **commerce,

        #
        # Media
        #

        **media,

        #
        # Specifications
        #

        **specifications,

        #
        # Reality
        #

        "observation": observation,

    }

    return runtime

# ==============================================================================
# Runtime
# ==============================================================================

def format_runtime(
    *,
    method: str = "default",
    mid: str | None = None,
    list_only: bool = False,
    force: bool = False,
) -> None:

    trace_pipeline(

        "FORMATTER",

    )

    print("=" * 70)

    print(

        f"🧹 {SITE_NAME} FORMATTER"

    )

    print("=" * 70)

    documents = (

        AcquisitionDocument.objects

        .filter(

            source_type="scraping",

            source_name=SITE_NAME.lower(),

            document_type=DOCUMENT_INPUT,

        )

        .order_by(

            "document_key",

        )

    )

    success: list[str] = []

    failed: list[tuple[str, str]] = []

    for document in documents:

        document_key = document.document_key

        if (

            not force

            and

            exists(

                document_key,

            )

        ):

            success.append(

                document_key,

            )

            print(

                f"[CACHE] {document_key}"

            )

            continue

        print(

            document_key,

        )

        try:

            observation_runtime = json.loads(

                document.content,

            )

            formatter_products = []

            for observation in observation_runtime.get(

                "products",

                [],

            ):

                formatter_products.append(

                    build_formatter(

                        document_key=document_key,

                        observation=observation,

                    )

                )

            runtime = {

                "document_key": document_key,

                "products": formatter_products,

            }

            _, created = save_formatter(

                document_key=document_key,

                runtime=runtime,

            )

            success.append(

                document_key,

            )

            print(

                f"  Products : {len(formatter_products)}"

            )

            print(

                f"  Saved : {'CREATED' if created else 'UPDATED'}"

            )

        except Exception as e:

            failed.append(

                (

                    document_key,

                    str(e),

                )

            )

            print(

                "  Status : ERROR"

            )

            print(

                f"  Reason : {e}"

            )

        print()

    print("=" * 70)

    print(

        "RESULT"

    )

    print("=" * 70)

    print(

        f"SUCCESS : {len(success)}"

    )

    print(

        f"FAILED  : {len(failed)}"

    )

    print("=" * 70)
    
# ==============================================================================
# Entry Point
# ==============================================================================

def main(
    *,
    method: str = "default",
    mid: str | None = None,
    list_only: bool = False,
    force: bool = False,
) -> None:

    format_runtime(

        method=method,

        mid=mid,

        list_only=list_only,

        force=force,

    )


if __name__ == "__main__":

    main()
    