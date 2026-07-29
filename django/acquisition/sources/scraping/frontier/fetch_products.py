# /home/maya/shin-vps/django/acquisition/sources/scraping/frontier/fetch_products.py
#!/usr/bin/env python3
"""
FRONTIER Product Fetch

Model List
    ↓
Fetch Reality
    ↓
AcquisitionDocument

Reality First
"""

from __future__ import annotations

import csv

import requests

from api.models.acquisition_document import AcquisitionDocument

from .settings import (
    MODEL_LIST_TSV,
    USER_AGENT,
    TIMEOUT,
)


def load_models():

    with MODEL_LIST_TSV.open(
        "r",
        encoding="utf-8",
        newline="",
    ) as f:

        return list(
            csv.DictReader(
                f,
                delimiter="\t",
            )
        )


def fetch(force: bool = False):

    models = load_models()

    print("=" * 60)
    print("🌐 FRONTIER PRODUCT FETCH")
    print("=" * 60)
    print(f"Target : {len(models)} Products")
    print("=" * 60)

    session = requests.Session()

    session.headers.update({
        "User-Agent": USER_AGENT,
    })

    success = []
    failed = []

    for index, row in enumerate(models, start=1):

        slug = row["slug"]

        print(f"[{index}/{len(models)}] {slug}")

        #
        # Cache
        #

        if not force:

            exists = AcquisitionDocument.objects.filter(
                source_name="frontier",
                document_type="product",
                document_key=slug,
            ).exists()

            if exists:

                success.append(slug)

                print("  Cache : HIT")
                print()

                continue

        try:

            response = session.get(
                row["url"],
                timeout=TIMEOUT,
            )

            response.raise_for_status()

            AcquisitionDocument.objects.update_or_create(
                source_type="scraping",
                source_name="frontier",
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

            print("  Cache : MISS")
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