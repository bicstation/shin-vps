#!/usr/bin/env python3
"""
ARK Mapper Runtime

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
from acquisition.common.trace.reality_trace import trace

# ==========================================================
# Mapper
# ==========================================================

def map_item(item: dict) -> dict:

    observation = item.get(
        "observation",
        {},
    )
    
    contract = {

        "site": "ARK",

        "identity": {
            "maker": item.get("maker", ""),
            "brand": "",
            "product_name": item.get("product_name", ""),
            "model": item.get("model", ""),
            "product_no": item.get("product_no", ""),
            "sku": "",
            "jan": "",
            "pc_id": item.get("pc_id", ""),
            "product_url": item.get("product_url", ""),
        },

        "commerce": {
            "price": item.get("price", ""),
            "availability": "",
            "release_date": item.get("release_date", ""),
        },

        "affiliate": {
            "url": item.get("product_url", ""),
        },

        "media": {
            "image_url": item.get("image_url", ""),
        },

        "description": observation.get("feature", ""),

        "specifications": item.get("specs", {}),

        "observation": observation,
    }
    

    trace(
        stage="MAPPER",
        data=contract,
    )

    return contract

# ==========================================================
# Runtime
# ==========================================================

def run():

    print("=" * 60)
    print("🗺️ ARK MAPPER")
    print("=" * 60)

    success = 0

    documents = AcquisitionDocument.objects.filter(
        source_name=SITE_NAME,
        document_type="list",
    ).order_by(
        "document_key",
    )

    print(f"Documents : {documents.count()}")

    for document in documents:

        payload = normalize(
            document.content,
        )

        print(
            f"{document.document_key} : {len(payload)} products"
        )

        for item in payload:

            contract = map_item(
                item,
            )

            ImportDocument.objects.update_or_create(

                source_name=SITE_NAME,

                document_type="product",

                document_key=item.get(
                    "pc_id",
                    "",
                ),

                defaults={
                    "contract": contract,
                },

            )

            success += 1

            print(
                f"✓ {item.get('pc_id', '')}"
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