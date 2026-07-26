#!/usr/bin/env python3
"""
GEEKOM Reality Fetch

Fetch Root Reality HTML.
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

BASE_DIR = Path(__file__).resolve().parent.parent

LIST_FILE = BASE_DIR / "root.tsv"

RAW_DIR = BASE_DIR / "output" / "raw"
RAW_DIR.mkdir(parents=True, exist_ok=True)

# ==========================================================
# Fetch
# ==========================================================

def fetch() -> None:

    with open(LIST_FILE, encoding="utf-8") as f:
        rows = list(csv.DictReader(f, delimiter="\t"))

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

            output_file = RAW_DIR / f"{slug}.html"
            output_file.write_bytes(response.content)

            print(f"  Status : {response.status_code}")
            print(f"  Size   : {len(response.content):,} bytes")
            print(f"  Saved  : {output_file}")

        except Exception as e:
            print(f"  ERROR  : {e}")

        print()

    print("=" * 60)
    print("COMPLETE")
    print("=" * 60)


# ==========================================================
# Entry Point
# ==========================================================

def main() -> None:
    """Execute Root Fetch."""
    fetch()


if __name__ == "__main__":
    main()