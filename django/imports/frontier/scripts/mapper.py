#!/usr/bin/env python3
"""
mapper.py

Mission:
    FRONTIER Payload
        ↓
    Import Contract

Reality First
Observation First
Identity First
"""

from pathlib import Path
import json

from imports.common.affiliate import generate_affiliate_url
from imports.frontier.scripts.settings import AFFILIATE


# --------------------------------------------------------
# Paths
# --------------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent.parent

INPUT_FILE = BASE_DIR / "output" / "payload" / "products.json"

OUTPUT_DIR = BASE_DIR / "output" / "import_contract"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

OUTPUT_FILE = OUTPUT_DIR / "products.json"


# --------------------------------------------------------
# Identity
# --------------------------------------------------------

SOURCE_PREFIX = "FRONTIER"


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

    product_url = item.get("product_url", "").strip()

    if product_url:
        return f"{SOURCE_PREFIX}_{normalize_identifier(product_url)}"

    return SOURCE_PREFIX


# --------------------------------------------------------
# Mapper
# --------------------------------------------------------

def map_item(item: dict) -> dict:

    observation = item.get("observation", {})

    specifications = (
        observation.get("specifications")
        or {}
    )

    product_url = item.get("product_url", "")

    return {

        # ==================================================
        # Identity
        # ==================================================

        "identity": {

            "unique_id": build_unique_id(item),

            "maker": item.get("maker", ""),
            "brand": item.get("brand", ""),
            "category": item.get("category", ""),
            "series": item.get("series", ""),

            "model_slug": item.get("model_slug", ""),
            "product_code": item.get("product_code", ""),
            "product_name": item.get("product_name", ""),

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

            "price": item.get("price", ""),

        },

        # ==================================================
        # Media
        # ==================================================

        "media": {

            "image_url": item.get("image_url", ""),

        },

        # ==================================================
        # Observation
        # ==================================================

        "observation": observation,

        # ==================================================
        # Reality
        # ==================================================

        "specifications": specifications,

    }


# --------------------------------------------------------
# Main
# --------------------------------------------------------

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
    print("FRONTIER IMPORT CONTRACT")
    print("=" * 60)
    print(f"Items : {len(contracts)}")
    print(f"Saved : {OUTPUT_FILE}")
    print("DONE")
    print("=" * 60)


if __name__ == "__main__":
    main()