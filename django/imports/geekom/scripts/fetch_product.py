#!/usr/bin/env python3
"""
fetch_product.py

GEEKOM Product Fetch Runtime

product_list.tsv に登録された Product を巡回し、
商品HTMLをそのまま保存する。

Reality First
Observation First
"""

from pathlib import Path
import sys
import csv

import requests

# ==========================================================
# Django Root
# ==========================================================

ROOT_DIR = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(ROOT_DIR))

from imports.geekom.scripts.settings import (
    USER_AGENT,
    TIMEOUT,
)

# ==========================================================
# Paths
# ==========================================================

ROOT = Path(__file__).resolve().parent.parent

INPUT_TSV = ROOT / "product_list.tsv"

RAW_DIR = ROOT / "output" / "raw" / "products"
RAW_DIR.mkdir(
    parents=True,
    exist_ok=True,
)

# ==========================================================
# Load Products
# ==========================================================

def load_products() -> list[dict]:

    with INPUT_TSV.open(
        encoding="utf-8",
        newline="",
    ) as f:

        return [
            row
            for row in csv.DictReader(
                f,
                delimiter="\t",
            )
            if row["enabled"].lower() == "true"
        ]


# ==========================================================
# Fetch
# ==========================================================

def fetch() -> None:

    products = load_products()

    print("=" * 60)
    print("GEEKOM PRODUCT FETCH")
    print("=" * 60)
    print(f"Target : {len(products)} Products")
    print("=" * 60)

    session = requests.Session()
    session.headers.update({
        "User-Agent": USER_AGENT,
    })

    success = []
    failed = []

    for index, row in enumerate(products, start=1):

        slug = row["slug"]
        url = row["url"]

        print(f"[{index}/{len(products)}] {slug}")

        try:

            response = session.get(
                url,
                timeout=TIMEOUT,
                allow_redirects=True,
            )

            response.raise_for_status()

            output = RAW_DIR / f"{slug}.html"
            output.write_bytes(response.content)

            success.append(slug)

            print(f"  Status : {response.status_code}")
            print(f"  Size   : {len(response.content):,} bytes")
            print(f"  Saved  : {output}")

        except requests.HTTPError:

            status = response.status_code if "response" in locals() else 0

            failed.append((slug, status))

            print(f"  ERROR  : HTTP {status}")

        except Exception as e:

            failed.append((slug, "ERROR"))

            print(f"  ERROR  : {e}")

        print()

    print("=" * 60)
    print("SUMMARY")
    print("=" * 60)
    print(f"SUCCESS : {len(success)}")
    print(f"FAILED  : {len(failed)}")
    print("=" * 60)
    print("COMPLETE")
    print("=" * 60)


# ==========================================================
# Entry Point
# ==========================================================

def main() -> None:
    """Execute Product Fetch."""
    fetch()


if __name__ == "__main__":
    main()