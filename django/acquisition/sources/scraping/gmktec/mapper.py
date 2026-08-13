#!/usr/bin/env python3
"""
FILE:
acquisition/sources/scraping/minisforum/mapper.py

SHIN CORE LINX

Minisforum Mapper Runtime

ObservationDocument
│
▼
Import Contract
│
▼
ImportDocument

Responsibilities

- Translate Runtime Contracts
- Preserve complete Observation Reality
- Provide Observation Runtime for downstream AI analysis
- Copy observable values into existing Contract fields
- Preserve Reality without semantic classification

NOT

- Parse HTML
- Parse Specifications
- Classify Observation Content
- Generate Semantic Meaning
- Infer
- Guess
- Calculate
- Load external TSV
- Re-acquire Reality

Reality First
Observation First
Translation Authority
Meaning Later
AI Analysis Later
"""

from __future__ import annotations

from api.models import (
    ObservationDocument,
    ImportDocument,
)

from acquisition.common.affiliate.builder import (
    AffiliateBuilder,
)

from acquisition.common.trace.reality_trace import (
    trace,
    trace_model,
    trace_pipeline,
)

from .settings import (
    SITE_NAME,
    AFFILIATE,
)


# ==========================================================
# Mapper
# ==========================================================

def map_observation(
    observation: dict,
    *,
    document_key: str,
) -> dict:
    """
    Translate Observation Reality into Import Contract.

    The complete Observation is preserved as
    observation_runtime.

    Existing Contract fields receive observable values
    directly from Observation.

    This Runtime does NOT:

    - interpret values
    - classify values
    - identify specifications
    - identify CPU/GPU/Memory/Storage
    - calculate values
    - convert prices
    - infer missing values
    - generate semantic meaning
    - decide product categories

    Downstream AI Runtime is responsible for
    interpreting Observation Reality.
    """

    # ------------------------------------------------------
    # Defensive Reality Boundary
    # ------------------------------------------------------

    if not isinstance(
        observation,
        dict,
    ):
        observation = {}

    # ------------------------------------------------------
    # Affiliate
    #
    # Affiliate generation is contract infrastructure.
    # It does not interpret product Reality.
    # ------------------------------------------------------

    affiliate = AffiliateBuilder.build(
        product_url=observation.get(
            "url",
            "",
        ),
        config=AFFILIATE,
    )

    # ------------------------------------------------------
    # Import Contract
    #
    # IMPORTANT:
    #
    # Existing Contract fields receive observable values
    # directly from Observation.
    #
    # No semantic interpretation is performed here.
    #
    # The complete Observation is preserved separately in
    # observation_runtime.
    # ------------------------------------------------------

    contract = {

        # --------------------------------------------------
        # Source
        # --------------------------------------------------

        "site": SITE_NAME,

        # --------------------------------------------------
        # Identity
        #
        # Direct Observation transfer only.
        # --------------------------------------------------

        "identity": {

            "maker": SITE_NAME,

            "brand": "",

            "product_name": observation.get(
                "title",
                "",
            ),

            "model": "",

            "product_no": "",

            "sku": "",

            "jan": "",

            "pc_id": document_key,

            "product_url": observation.get(
                "url",
                "",
            ),

        },

        # --------------------------------------------------
        # Commerce
        #
        # Direct Observation transfer only.
        #
        # Price is preserved exactly as observed.
        # No numeric conversion is performed.
        # --------------------------------------------------

        "commerce": {

            "price": observation.get(
                "price",
                "",
            ),

            "stock": observation.get(
                "stock",
                "",
            ),

            "delivery": "",

        },

        # --------------------------------------------------
        # Affiliate
        # --------------------------------------------------

        "affiliate": affiliate,

        # --------------------------------------------------
        # Media
        #
        # Direct Observation transfer only.
        # --------------------------------------------------

        "media": {

            "image_url": observation.get(
                "main_image",
                "",
            ),

        },

        # --------------------------------------------------
        # Description
        #
        # Direct Observation transfer only.
        # --------------------------------------------------

        "description": observation.get(
            "description",
            "",
        ),

        # --------------------------------------------------
        # Observation Runtime
        #
        # ==================================================
        # CORE REALITY
        # ==================================================
        #
        # Preserve the COMPLETE Observation exactly as
        # produced by the Observation Runtime.
        #
        # No:
        #
        # - specification extraction
        # - classification
        # - semantic labeling
        # - interpretation
        # - inference
        #
        # is performed here.
        #
        # This becomes the material consumed by the
        # downstream AI Analysis Runtime.
        # --------------------------------------------------

        "observation_runtime": observation,

    }

    # ------------------------------------------------------
    # Trace
    # ------------------------------------------------------

    trace(
        "Import Contract",
        contract,
    )

    return contract


# ==========================================================
# Runtime
# ==========================================================

def run() -> None:
    """
    Execute Minisforum Mapper Runtime.

    ObservationDocument
            ↓
    Complete Observation Reality
            ↓
    Direct Contract Transfer
            ↓
    observation_runtime
            ↓
    ImportDocument
            ↓
    AI Analysis
            ↓
    Semantic Meaning
    """

    print(
        "=" * 60
    )

    print(
        "🗺️ MINISFORUM MAPPER"
    )

    print(
        "=" * 60
    )

    trace_pipeline(
        "Mapper"
    )

    # ------------------------------------------------------
    # Observation Documents
    # ------------------------------------------------------

    documents = (
        ObservationDocument.objects
        .filter(
            source_name=SITE_NAME,
            document_type="product",
        )
        .iterator()
    )

    success = 0

    # ------------------------------------------------------
    # Product Loop
    # ------------------------------------------------------

    for document in documents:

        # --------------------------------------------------
        # Observation Reality
        # --------------------------------------------------

        observation = (
            document.observation
            or {}
        )

        # --------------------------------------------------
        # Import Contract
        # --------------------------------------------------

        contract = map_observation(
            observation,
            document_key=document.document_key,
        )

        # --------------------------------------------------
        # ImportDocument
        # --------------------------------------------------

        obj, _ = (
            ImportDocument.objects
            .update_or_create(
                source_name=document.source_name,
                document_type=document.document_type,
                document_key=document.document_key,
                defaults={
                    "contract": contract,
                },
            )
        )

        # --------------------------------------------------
        # Trace
        # --------------------------------------------------

        trace_model(
            "ImportDocument",
            obj,
        )

        success += 1

    # ------------------------------------------------------
    # Result
    # ------------------------------------------------------

    print(
        "=" * 60
    )

    print(
        f"SUCCESS : {success}"
    )

    print(
        "=" * 60
    )


# ==========================================================
# Main
# ==========================================================

def main() -> None:
    """
    Execute Mapper Runtime.
    """

    run()


# ==========================================================
# Standalone Execution
# ==========================================================

if __name__ == "__main__":
    main()