#!/usr/bin/env python3
"""
FRONTIER Import Contract Mapper

Payload
    ↓
Import Contract

Reality First
Observation First
Identity First
"""

from __future__ import annotations

import csv

from api.models import (
    ObservationDocument,
    ImportDocument,
)

from acquisition.common.trace.reality_trace import (
    trace,
    trace_model,
    trace_pipeline,
)

from imports.common.affiliate import (
    generate_affiliate_url,
)

from .settings import (
    AFFILIATE,
    SITE_NAME,
    PRODUCT_LIST_TSV,
)


SOURCE_PREFIX = "FRONTIER"


# ==========================================================
# Price Runtime
# ==========================================================

def load_price_map() -> dict[str, str]:
    """
    Load PRODUCT_LIST_TSV.
    """

    with PRODUCT_LIST_TSV.open(
        "r",
        encoding="utf-8",
        newline="",
    ) as f:

        return {

            row["slug"]: row.get(
                "price",
                "",
            )

            for row in csv.DictReader(
                f,
                delimiter="\t",
            )

        }


# ==========================================================
# Identity
# ==========================================================

def normalize_identifier(value: str) -> str:

    return (
        value.strip()
        .replace(" ", "_")
        .replace("/", "_")
    )


def build_unique_id(item: dict) -> str:

    product_code = item.get("product_code", "").strip()

    if product_code:
        return f"{SOURCE_PREFIX}_{normalize_identifier(product_code)}"

    model_slug = item.get("model_slug", "").strip()

    if model_slug:
        return f"{SOURCE_PREFIX}_{normalize_identifier(model_slug)}"

    product_url = observation.get(    "product_url",    "",)

    if product_url:
        return f"{SOURCE_PREFIX}_{normalize_identifier(product_url)}"

    return SOURCE_PREFIX


# ==========================================================
# Mapper
# ==========================================================
def map_observation(
    observation: dict,
    *,
    document_key: str,
    price: str,
) -> dict:

    specifications = (
        observation.get("specifications")
        or {}
    )

    product_url = item.get(
        "product_url",
        "",
    )

    return {

        # --------------------------------------------------
        # Identity
        # --------------------------------------------------

        "identity": {
            "unique_id":               build_unique_id(item),
            "maker":                item.get("maker", ""),
            "brand":                item.get("brand", ""),
            "category":                item.get("category", ""),
            "series":                item.get("series", ""),
            "model_slug":                item.get("model_slug", ""),
            "product_code":                item.get("product_code", ""),
            "product_name":                item.get("product_name", ""),
            "product_url":                product_url,
        },

        # --------------------------------------------------
        # Affiliate
        # --------------------------------------------------

        "affiliate": {

            "url": generate_affiliate_url(
                product_url,
                AFFILIATE,
            ),

        },

        # --------------------------------------------------
        # Commerce
        # --------------------------------------------------

        "commerce": {          "price": price,      },

        # --------------------------------------------------
        # Media
        # --------------------------------------------------

        "media": {
            "image_url":  item.get("image_url", ""),
        },

        # --------------------------------------------------
        # Observation
        # --------------------------------------------------

        "observation":    observation,

        # --------------------------------------------------
        # Reality
        # --------------------------------------------------

        "specifications":
            specifications,

    }



# ==========================================================
# Runtime
# ==========================================================

def run() -> None:

    print("=" * 60)
    print("🗺️ FRONTIER MAPPER")
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
