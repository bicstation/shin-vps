#!/usr/bin/env python3
"""
fetch_list.py

GEEKOM Collection Fetch Runtime

collections.tsv に登録された Collection を巡回し、
HTMLをそのまま保存する。

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

INPUT_TSV = ROOT / "collections.tsv"

RAW_DIR = ROOT / "output" / "raw"
RAW_DIR.mkdir(parents=True, exist_ok=True)

# ==========================================================
# Fetch
# ==========================================================

def fetch() -> None:

    with INPUT_TSV.open(
        "r",
        encoding="utf-8",
        newline="",
    ) as f:

        rows = list(csv.DictReader(f, delimiter="\t"))

    print("=" * 60)
    print("GEEKOM COLLECTION FETCH")
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

        if row["enabled"].lower() != "true":
            continue

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
    for slug in success:
        print(f"  ✓ {slug}")

    print()

    print(f"FAILED  : {len(failed)}")
    for slug, status in failed:
        print(f"  ✗ [{status}] {slug}")

    print()
    print("=" * 60)
    print("COMPLETE")
    print("=" * 60)


# ==========================================================
# Entry Point
# ==========================================================

def main() -> None:
    """Execute Collection Fetch."""
    fetch()


if __name__ == "__main__":
    main()