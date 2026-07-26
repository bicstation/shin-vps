#!/usr/bin/env python3
"""
GEEKOM Collection Fetch Runtime

Fetch Collection HTML.
"""

from __future__ import annotations

import csv

import requests

from settings import (
    COLLECTIONS_TSV,
    RAW_DIR,
    USER_AGENT,
    TIMEOUT,
)


def fetch():

    with COLLECTIONS_TSV.open(
        "r",
        encoding="utf-8",
        newline="",
    ) as f:

        rows = [
            row
            for row in csv.DictReader(f, delimiter="\t")
            if row["enabled"].lower() == "true"
        ]

    print("=" * 60)
    print("🌐 GEEKOM COLLECTION FETCH")
    print("=" * 60)
    print(f"Target : {len(rows)} Collections")
    print("=" * 60)

    session = requests.Session()
    session.headers.update({
        "User-Agent": USER_AGENT,
    })

    success = []
    failed = []

    for index, row in enumerate(rows, start=1):

        slug = row["slug"]

        print(f"[{index}/{len(rows)}] {slug}")

        try:

            response = session.get(
                row["url"],
                timeout=TIMEOUT,
            )
            response.raise_for_status()

            output = RAW_DIR / f"{slug}.html"
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