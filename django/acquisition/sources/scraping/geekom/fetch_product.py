#!/usr/bin/env python3
"""
GEEKOM Product Fetch Runtime

Fetch Product HTML.
"""

from __future__ import annotations

import csv

import requests

from settings import (
    PRODUCT_LIST_TSV,
    PRODUCT_RAW_DIR,
    USER_AGENT,
    TIMEOUT,
)


def load_products():

    with PRODUCT_LIST_TSV.open(
        "r",
        encoding="utf-8",
        newline="",
    ) as f:

        return [
            row
            for row in csv.DictReader(f, delimiter="\t")
            if row["enabled"].lower() == "true"
        ]


def fetch():

    products = load_products()

    print("=" * 60)
    print("🌐 GEEKOM PRODUCT FETCH")
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

        print(f"[{index}/{len(products)}] {slug}")

        try:

            response = session.get(
                row["url"],
                timeout=TIMEOUT,
            )
            response.raise_for_status()

            output = PRODUCT_RAW_DIR / f"{slug}.html"
            output.write_bytes(response.content)

            success.append(slug)

            print(f"  ✓ {response.status_code}")
            print(f"  {len(response.content):,} bytes")

        except Exception as e:

            failed.append((slug, str(e)))
            print(f"  ✗ {e}")

        print()

    print("=" * 60)
    print(f"SUCCESS : {len(success)}")
    print(f"FAILED  : {len(failed)}")
    print("=" * 60)


def main():
    fetch()


if __name__ == "__main__":
    main()