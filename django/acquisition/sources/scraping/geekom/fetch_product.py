#!/usr/bin/env python3
"""
GEEKOM Product Fetch Runtime

Fetch Product HTML
→ Save AcquisitionDocument
"""

from __future__ import annotations

import csv
import random
import time

import requests

from api.models.acquisition_document import AcquisitionDocument

from .settings import (
    PRODUCT_LIST_TSV,
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


def fetch(force: bool = False):

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

        # --------------------------------------------------
        # Cache Check
        # --------------------------------------------------

        if not force:

            exists = AcquisitionDocument.objects.filter(
                source_name="geekom",
                document_type="product",
                document_key=slug,
            ).exists()

            if exists:

                success.append(slug)

                print("  Cache  : HIT")
                print()

                continue

        try:

            #
            # アクセス間隔
            #
            if index > 1:
                wait = random.uniform(20.0, 30.0)
                print(f"  😴 Sleep {wait:.1f}s")
                time.sleep(wait)

            response = None

            #
            # 最大3回リトライ
            #
            for attempt in range(3):

                response = session.get(
                    row["url"],
                    timeout=TIMEOUT,
                )

                if response.status_code == 200:
                    break

                if response.status_code == 429:

                    wait = 20 * (attempt + 1)

                    print(f"  ⏳ 429 Retry ({wait}s)")

                    time.sleep(wait)

                    continue

                response.raise_for_status()

            response.raise_for_status()

            AcquisitionDocument.objects.update_or_create(
                source_type="scraping",
                source_name="geekom",
                document_type="product",
                document_key=slug,
                defaults={
                    "source_url": row["url"],
                    "content_type": response.headers.get(
                        "Content-Type",
                        "text/html",
                    ),
                    "content": response.text,
                },
            )

            success.append(slug)

            print("  Cache  : MISS")
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


def main(force: bool = False):
    fetch(force=force)


if __name__ == "__main__":
    main()