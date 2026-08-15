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

Reality First

- Preserve Observation Reality
- No semantic interpretation
- No AI analysis
- No normalization of meaning
"""

from __future__ import annotations

from api.models import (
    AcquisitionDocument,
    ImportDocument,
)

from acquisition.common.affiliate.builder import (
    AffiliateBuilder,
)

from acquisition.common.trace.reality_trace import (
    trace,
)

from .formatter_list import normalize

from .settings import (
    SITE_NAME,
    AFFILIATE,
)


# ==========================================================
# Mapper
# ==========================================================

def map_item(
    item: dict,
) -> dict:

    observation = item.get(
        "observation",
        {},
    )

    affiliate = AffiliateBuilder.build(
        product_url=item.get(
            "product_url",
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

            "maker": item.get(
                "maker",
                "",
            ),

            "brand": "",

            "product_name": item.get(
                "product_name",
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

            "sku": "",

            "jan": "",

            "pc_id": item.get(
                "unique_id",
                "",
            ),

            "product_url": item.get(
                "product_url",
                "",
            ),

        },

        #
        # Commerce
        #

        "commerce": {

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

        },

        #
        # Affiliate
        #

        "affiliate": affiliate,

        #
        # Media
        #

        "media": {

            "image_url": item.get(
                "image_url",
                "",
            ),

        },

        #
        # Description
        #

        "description": observation.get(
            "raw_spec",
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
        # Observation Runtime
        #
        # Preserve Reality as received.
        #
        # No semantic interpretation.
        # No AI analysis.
        # No normalization.
        #

        "observation_runtime": observation,

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

    print(
        "=" * 60
    )

    print(
        "🗺️ OZ GAMING MAPPER"
    )

    print(
        "=" * 60
    )

    success = 0

    documents = (
        AcquisitionDocument.objects
        .filter(
            source_name=SITE_NAME,
            document_type="list",
        )
        .order_by(
            "document_key",
        )
    )

    print(
        f"Documents : {documents.count()}"
    )

    for document in documents:

        payload = normalize(
            document.content,
        )

        print(
            f"{document.document_key} : "
            f"{len(payload)} products"
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

def main():

    run()


if __name__ == "__main__":

    main()