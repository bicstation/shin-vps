#!/usr/bin/env python3
"""
GEEKOM Mapper

Payload
    ↓
Import Contract

Reality First
Observation First
Identity First
"""

from pathlib import Path
from urllib.parse import urlparse
import json
import sys

# ==========================================================
# Project Root
# ==========================================================

ROOT_DIR = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(ROOT_DIR))

from imports.common.tsv.identity_classifier import classify_identity
from imports.common.affiliate import generate_affiliate_url
from imports.geekom.scripts.settings import AFFILIATE

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

SOURCE_PREFIX = "GEEKOM"


def normalize_identifier(value: str) -> str:
    return value.strip().replace(" ", "_").replace("/", "_")


def extract_handle(url: str) -> str:

    if not url:
        return ""

    path = urlparse(url).path.rstrip("/")

    if path.startswith("/products/"):
        return path.split("/")[-1]

    return ""


def build_unique_id(item: dict) -> str:

    product_url = item.get("product_url", "").strip()

    handle = extract_handle(product_url)

    if handle:
        return f"{SOURCE_PREFIX}_{normalize_identifier(handle)}"

    product_name = item.get("product_name", "").strip()

    if product_name:
        return f"{SOURCE_PREFIX}_{normalize_identifier(product_name)}"

    return SOURCE_PREFIX


# ==========================================================
# Mapper
# ==========================================================

def map_item(item: dict) -> dict:

    identity = classify_identity(
        maker=item.get("maker", ""),
        product_name=item.get("product_name", ""),
        description=item.get("description", ""),
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

            "product_name": item.get("product_name", ""),

            "model": item.get("model", ""),

            "product_no": item.get("product_no", ""),

            "pc_id": item.get("pc_id", ""),

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

            "stock": item.get("stock", ""),

            "delivery": item.get("delivery", ""),

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

        "observation": item.get("observation", {}),

        # ==================================================
        # Reality
        # ==================================================

        "specifications": item.get("tables", []),

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
    print("GEEKOM IMPORT CONTRACT")
    print("=" * 60)
    print(f"Items : {len(contracts)}")
    print(f"Saved : {OUTPUT_FILE}")
    print("=" * 60)


if __name__ == "__main__":
    main()