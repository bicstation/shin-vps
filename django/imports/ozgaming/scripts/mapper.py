#!/usr/bin/env python3
"""
OZ GAMING Mapper

Payload(JSON)
        ↓
Import Contract(JSON)

Reality First
Observation First
Identity First
"""

from pathlib import Path
import json

from imports.common.affiliate import generate_affiliate_url
from imports.common.tsv.identity_classifier import classify_identity
from imports.ozgaming.scripts.settings import AFFILIATE


# ==========================================================
# Paths
# ==========================================================

BASE_DIR = Path(__file__).resolve().parent.parent

INPUT_FILE = BASE_DIR / "output" / "payload" / "products.json"

OUTPUT_DIR = BASE_DIR / "output" / "import_contract"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

OUTPUT_FILE = OUTPUT_DIR / "products.json"


# ==========================================================
# Identity
# ==========================================================

SOURCE_PREFIX = "OZ"


def build_unique_id(item: dict) -> str:
    return f"{SOURCE_PREFIX}_{item.get('unique_id', '')}"


# ==========================================================
# Mapper
# ==========================================================

def map_item(item: dict) -> dict:

    observation = item.get("observation", {})

    specifications = item.get(
        "specifications",
        {},
    )

    identity = classify_identity(
        maker=item.get("maker", ""),
        product_name=item.get("product_name", ""),
        description="",
    )

    product_url = item.get("product_url", "")

    return {

        # ==================================================
        # Identity
        # ==================================================

        "identity": {

            "unique_id": build_unique_id(item),

            "maker": item.get("maker", ""),

            "brand": (
                item.get("brand")
                or identity["brand"]
            ),

            "series": (
                item.get("series")
                or identity["series"]
            ),

            "collaboration": identity["collaboration"],

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

            "pc_id": item.get(
                "pc_id",
                "",
            ),

            "product_url": product_url,

        },

        # ==================================================
        # Affiliate
        # ==================================================

        "affiliate": {

            "url": generate_affiliate_url(
                product_url,
                AFFILIATE,
            ),

        },

        # ==================================================
        # Commerce
        # ==================================================

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

        # ==================================================
        # Media
        # ==================================================

        "media": {

            "image_url": item.get(
                "image_url",
                "",
            ),

        },

        # ==================================================
        # Observation
        # ==================================================

        "observation": {

            "raw_spec": observation.get(
                "raw_spec",
                "",
            ),

            "specifications": specifications,

        },

        # ==================================================
        # Reality
        # ==================================================

        "specifications": specifications,

    }


# ==========================================================
# Main
# ==========================================================

def main():

    payload = json.loads(

        INPUT_FILE.read_text(
            encoding="utf-8",
        )

    )

    contracts = [

        map_item(item)

        for item in payload

    ]

    OUTPUT_FILE.write_text(

        json.dumps(
            contracts,
            ensure_ascii=False,
            indent=2,
        ),

        encoding="utf-8",

    )

    print("=" * 60)
    print("OZ GAMING IMPORT CONTRACT")
    print("=" * 60)
    print(f"Items : {len(contracts)}")
    print(f"Saved : {OUTPUT_FILE}")
    print("=" * 60)


if __name__ == "__main__":
    main()