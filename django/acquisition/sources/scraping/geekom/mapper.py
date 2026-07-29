#!/usr/bin/env python3
"""
GEEKOM Mapper Runtime

ObservationDocument
        │
        ▼
Import Contract
        │
        ▼
ImportDocument
"""

from __future__ import annotations

import csv

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
    PRODUCT_LIST_TSV,
)


# ==========================================================
# Price Runtime
# ==========================================================

def load_price_map() -> dict[str, str]:
    """Load PRODUCT_LIST_TSV."""

    with PRODUCT_LIST_TSV.open(
        "r",
        encoding="utf-8",
        newline="",
    ) as f:

        return {
            row["slug"]: row.get("price", "")
            for row in csv.DictReader(
                f,
                delimiter="\t",
            )
        }


# ==========================================================
# Mapper
# ==========================================================

def map_observation(
    observation: dict,
    *,
    document_key: str,
    price: str,
) -> dict:

    affiliate = AffiliateBuilder.build(
        product_url=observation.get(
            "url",
            "",
        ),
        config=AFFILIATE,
    )

    contract = {

        #
        # Source
        #

        "site": SITE_NAME,

        #
        # Identity
        #

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

        #
        # Commerce
        #

        "commerce": {

            "price": price,

            "stock": observation.get(
                "stock",
                "",
            ),

            "delivery": "",

        },

        #
        # Affiliate
        #

        "affiliate": affiliate,

        #
        # Media
        #

        "media": {

            "image_url": observation.get(
                "main_image",
                "",
            ),

        },

        #
        # Description
        #

        "description": observation.get(
            "description",
            "",
        ),

        #
        # Specifications
        #

        "specifications": {

            "tables": observation.get(
                "tables",
                [],
            ),

            "images": observation.get(
                "images",
                [],
            ),

        },

        #
        # Observation
        #

        "observation": observation,

    }

    trace(
        "Import Contract",
        contract,
    )

    return contract


# ==========================================================
# Runtime
# ==========================================================

def run() -> None:

    print("=" * 60)
    print("🗺️ GEEKOM MAPPER")
    print("=" * 60)

    trace_pipeline("Mapper")

    price_map = load_price_map()

    success = 0

    documents = ObservationDocument.objects.filter(
        source_name=SITE_NAME,
        document_type="product",
    ).iterator()

    for document in documents:

        price = price_map.get(
            document.document_key,
            "",
        )

        contract = map_observation(
            document.observation,
            document_key=document.document_key,
            price=price,
        )

        obj, _ = ImportDocument.objects.update_or_create(
            source_name=document.source_name,
            document_type=document.document_type,
            document_key=document.document_key,
            defaults={
                "contract": contract,
            },
        )

        trace_model(
            "ImportDocument",
            obj,
        )

        success += 1

    print("=" * 60)
    print(f"SUCCESS : {success}")
    print("=" * 60)


def main() -> None:
    run()


if __name__ == "__main__":
    main()