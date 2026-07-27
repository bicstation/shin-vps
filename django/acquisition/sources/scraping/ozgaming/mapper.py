#!/usr/bin/env python3
"""
OZ GAMING Mapper Runtime

AcquisitionDocument(list)
        │
        ▼
Formatter
        │
        ▼
Import Contract
        │
        ▼
ImportDocument
"""

from __future__ import annotations

from api.models import (
    AcquisitionDocument,
    ImportDocument,
)

from .formatter_list import normalize
from .settings import SITE_NAME


# ==========================================================
# Mapper
# ==========================================================

def map_item(item: dict) -> dict:

    observation = item.get(
        "observation",
        {},
    )

    return {

        #
        # Source
        #

        "site": "OZ GAMING",

        #
        # Product
        #

        "maker": item.get(
            "maker",
            "",
        ),

        "product_name": item.get(
            "product_name",
            "",
        ),

        "description": observation.get(
            "raw_spec",
            "",
        ),

        "model": item.get(
            "model",
            "",
        ),

        "product_no": item.get(
            "product_no",
            "",
        ),

        "pc_id": item.get(
            "unique_id",
            "",
        ),

        "product_url": item.get(
            "product_url",
            "",
        ),

        #
        # Commerce
        #

        "price": item.get(
            "price",
            "",
        ),

        "stock": item.get(
            "stock",
            "",
        ),

        "delivery": item.get(
            "delivery",
            "",
        ),

        #
        # Media
        #

        "image_url": item.get(
            "image_url",
            "",
        ),

        #
        # Specifications
        #

        "specifications": item.get(
            "specifications",
            {},
        ),

        #
        # Observation
        #

        "observation": observation,

    }


# ==========================================================
# Runtime
# ==========================================================

def run():

    print("=" * 60)
    print("🗺️ OZ GAMING MAPPER")
    print("=" * 60)

    success = 0

    documents = AcquisitionDocument.objects.filter(
        source_name=SITE_NAME,
        document_type="list",
    ).order_by(
        "document_key",
    )

    for document in documents:

        payload = normalize(
            document.content,
        )

        for item in payload:

            contract = map_item(
                item,
            )

            ImportDocument.objects.update_or_create(

                source_name=SITE_NAME,

                document_type="product",

                document_key=item.get(
                    "unique_id",
                    "",
                ),

                defaults={

                    "contract": contract,

                },

            )

            success += 1

            print(
                f"✓ {item.get('unique_id', '')}"
            )

    print("=" * 60)
    print(f"SUCCESS : {success}")
    print("=" * 60)


# ==========================================================
# Main
# ==========================================================

def main():

    run()


if __name__ == "__main__":

    main()