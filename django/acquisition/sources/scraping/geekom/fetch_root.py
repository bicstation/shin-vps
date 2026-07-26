#!/usr/bin/env python3
"""
GEEKOM Reality Fetch

Fetch Root Reality HTML
→ Save AcquisitionDocument
"""

from __future__ import annotations

import csv

import requests

from api.models.acquisition_document import AcquisitionDocument

from .settings import (
    USER_AGENT,
    TIMEOUT,
    ROOT_TSV,
)


def fetch() -> None:

    with ROOT_TSV.open(
        "r",
        encoding="utf-8",
        newline="",
    ) as f:

        rows = list(
            csv.DictReader(
                f,
                delimiter="\t",
            )
        )

    print("=" * 60)
    print("GEEKOM REALITY FETCH")
    print("=" * 60)
    print(f"Target : {len(rows)} Collections")
    print("=" * 60)

    session = requests.Session()
    session.headers.update({
        "User-Agent": USER_AGENT,
    })

    for index, row in enumerate(rows, start=1):

        slug = row["slug"]
        url = row["url"]

        print(f"[{index}/{len(rows)}] {slug}")

        try:

            response = session.get(
                url,
                timeout=TIMEOUT,
                allow_redirects=True,
            )

            response.raise_for_status()

            AcquisitionDocument.objects.update_or_create(
                source_type="scraping",
                source_name="geekom",
                document_type="root",
                document_key=slug,
                defaults={
                    "source_url": url,
                    "content_type": response.headers.get(
                        "Content-Type",
                        "text/html",
                    ),
                    "content": response.text,
                },
            )

            print(f"  Status : {response.status_code}")
            print(f"  Size   : {len(response.content):,} bytes")

        except Exception as e:

            print(f"  ERROR  : {e}")

        print()

    print("=" * 60)
    print("COMPLETE")
    print("=" * 60)


def main() -> None:
    fetch()


if __name__ == "__main__":
    main()