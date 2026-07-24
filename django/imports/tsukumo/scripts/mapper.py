#!/usr/bin/env python3
"""
ARK Mapper

Payload(JSON) → Import Contract(JSON)

役割
    - Payload を Import Contract へ変換
    - Affiliate URL を生成
    - Identity を完成させる
    - Reality を Import Contract へ統合

設計思想
    Reality First
    Observation First
    Identity First

依存
    - Backendなし
    - Djangoなし
"""

from pathlib import Path
import json

from imports.common.affiliate import generate_affiliate_url
from imports.ark.scripts.settings import AFFILIATE
from imports.common.tsv.identity_classifier import classify_identity


# ==========================================================
# Paths
# ==========================================================

BASE_DIR = Path(__file__).resolve().parent.parent

INPUT_FILE = BASE_DIR / "output" / "payload" / "products.json"

OUTPUT_DIR = BASE_DIR / "output" / "import_contract"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

OUTPUT_FILE = OUTPUT_DIR / "products.json"


# ==========================================================
# Identity Resolver
# ==========================================================

SOURCE_PREFIX = "ARK"


def build_unique_id(item: dict) -> str:
    """
    Build stable unique_id.

    Priority
    --------
    1. model
    2. product_no
    3. pc_id
    4. product_url
    """

    if model := item.get("model", "").strip():
        normalized = normalize_identifier(model)
        return f"{SOURCE_PREFIX}_{normalized}"

    if product_no := item.get("product_no", "").strip():
        return f"{SOURCE_PREFIX}_{product_no}"

    if pc_id := item.get("pc_id", "").strip():
        return f"{SOURCE_PREFIX}_{pc_id}"

    if product_url := item.get("product_url", "").strip():
        return f"{SOURCE_PREFIX}_{product_url}"

    return SOURCE_PREFIX

def normalize_identifier(value: str) -> str:
    
    return value.strip().replace(" ", "_")

# ==========================================================
# Mapper
# ==========================================================

def map_item(item: dict) -> dict:
    """Payload → Import Contract"""
    
    identity = classify_identity(
        maker=item.get("maker", ""),
        product_name=item.get("product_name", ""),
        description=item.get("observation", {}).get("feature", ""),
    )

    product_url = item.get("product_url", "")

    affiliate_url = generate_affiliate_url(
        product_url,
        AFFILIATE,
    )

    unique_id = build_unique_id(item)

    return {

        # ==================================================
        # Identity
        # ==================================================

        "identity": {

            "unique_id": unique_id,

            "maker": item.get("maker", ""),
            
            "brand": identity["brand"],

            "series": identity["series"],

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

            "url": affiliate_url,

        },

        # ==================================================
        # Commerce
        # ==================================================

        "commerce": {

            "price": item.get("price", ""),

            "release_date": item.get("release_date", ""),

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

        "observation": item.get(
            "observation",
            {
                "raw_title": "",
                "feature": "",
                "specifications": {},
            },
        ),

        # ==================================================
        # Specifications
        # ==================================================

        "specifications": item.get("specs", {}),

    }


# ==========================================================
# Main
# ==========================================================

def main():

    payload = json.loads(
        INPUT_FILE.read_text(encoding="utf-8")
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

    print(f"Items : {len(contracts)}")
    print(f"Saved : {OUTPUT_FILE}")


if __name__ == "__main__":
    main()