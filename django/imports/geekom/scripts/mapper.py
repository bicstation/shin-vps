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
import json
import sys
from urllib.parse import urlparse

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
    return (
        value.strip()
        .replace(" ", "_")
        .replace("/", "_")
    )


def extract_handle(url: str) -> str:
    """
    https://geekom.jp/products/geekom-a5-pro-mini-pc-2026-edition
        ↓
    geekom-a5-pro-mini-pc-2026-edition
    """

    if not url:
        return ""

    path = urlparse(url).path.rstrip("/")

    if path.startswith("/products/"):
        return path.split("/")[-1]

    return ""


def build_unique_id(identity: dict) -> str:

    url = identity.get("url", "").strip()

    handle = extract_handle(url)

    if handle:
        return f"{SOURCE_PREFIX}_{normalize_identifier(handle)}"

    title = identity.get("title", "").strip()

    if title:
        return f"{SOURCE_PREFIX}_{normalize_identifier(title)}"

    return SOURCE_PREFIX


# ==========================================================
# Mapper
# ==========================================================

def map_item(item: dict) -> dict:

    identity = item.get("identity", {})
    content = item.get("content", {})
    media = item.get("media", {})
    observation = item.get("observation", {})

    product_url = identity.get("url", "").strip()

    affiliate_url = generate_affiliate_url(
        product_url,
        AFFILIATE,
    )

    classified = classify_identity(
        maker=item.get("maker", ""),
        product_name=identity.get("title", ""),
        description=content.get("description", ""),
    )

    return {
        
        "identity": {
            "unique_id": build_unique_id(identity),
            "maker": item.get("maker", ""),
            "brand": (
                identity.get("brand")
                or classified["brand"]
            ),
            "series": (
                identity.get("series")
                or classified["series"]
            ),
            "collaboration": classified["collaboration"],
            "product_name": identity.get("title", ""),
            "product_url": product_url,
            "affiliate_url": affiliate_url,
        },

        "commerce": {
            "price": observation.get("price", ""),
            "currency": observation.get("currency", ""),
        },

        "media": {
            "images": media.get("images", []),
        },
        "observation": observation,
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