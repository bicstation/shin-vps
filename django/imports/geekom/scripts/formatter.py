#!/usr/bin/env python3
"""
GEEKOM Formatter

Acquire
+
Observation
    ↓
Payload

Reality First
Observation First
"""

from pathlib import Path
import csv
import json

BASE_DIR = Path(__file__).resolve().parent.parent

PRODUCT_LIST = BASE_DIR  / "product_list.tsv"

OBSERVATION_DIR = BASE_DIR / "output" / "observation"

PAYLOAD_DIR = BASE_DIR / "output" / "payload"
PAYLOAD_DIR.mkdir(parents=True, exist_ok=True)

OUTPUT_FILE = PAYLOAD_DIR / "products.json"


def load_product_list():

    products = {}

    with PRODUCT_LIST.open(
        encoding="utf-8",
        newline="",
    ) as f:

        reader = csv.DictReader(f, delimiter="\t")

        for row in reader:
            products[row["slug"]] = row

    return products


def load_observation(slug):

    path = OBSERVATION_DIR / f"{slug}.json"

    if not path.exists():
        return None

    return json.loads(path.read_text(encoding="utf-8"))


def build_payload(
    acquire: dict,
    observation: dict,
):

    return {

        #
        # Acquire Reality
        #

        "maker": acquire.get("maker", ""),
        "collection": acquire.get("collection", ""),
        "slug": acquire.get("slug", ""),
        "product_url": acquire.get("url", ""),
        "price": int(acquire.get("price") or 0),
        "enabled": acquire.get("enabled", "true") == "true",

        #
        # Observation Reality
        #

        "product_name": observation.get("title", ""),
        "brand": observation.get("brand", ""),
        "series": observation.get("series", ""),
        "description": observation.get("description", ""),
        "image_url": observation.get("main_image", ""),
        "images": observation.get("images", []),
        "tables": observation.get("tables", []),
        "scripts": observation.get("scripts", []),

        #
        # Raw Observation
        #

        "observation": observation,
    }


def main():

    print("=" * 60)
    print("GEEKOM FORMATTER")
    print("=" * 60)

    products = load_product_list()

    print(f"Acquire : {len(products)}")

    results = []

    for slug, acquire in products.items():

        observation = load_observation(slug)

        if observation is None:
            print(f"Missing Observation : {slug}")
            continue

        results.append(
            build_payload(
                acquire,
                observation,
            )
        )

        print(f"✓ {slug}")

    OUTPUT_FILE.write_text(
        json.dumps(
            results,
            ensure_ascii=False,
            indent=2,
        ),
        encoding="utf-8",
    )

    print("-" * 60)
    print(f"Products : {len(results)}")
    print(f"Saved    : {OUTPUT_FILE}")
    print("=" * 60)


if __name__ == "__main__":
    main()