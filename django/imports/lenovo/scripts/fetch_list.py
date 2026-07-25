#!/usr/bin/env python3
"""
LENOVO Reality Fetch

Reality HTML を取得し、
生データをそのまま保存する。

Reality First
Observation First
"""

from pathlib import Path
import csv
import sys

import requests

# ==========================================================
# Django Root
# ==========================================================

ROOT_DIR = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(ROOT_DIR))

# ==========================================================
# Lenovo Settings
# ==========================================================

from imports.lenovo.scripts.settings import (
    USER_AGENT,
    TIMEOUT,
)

# ==========================================================
# Paths
# ==========================================================

BASE_DIR = Path(__file__).resolve().parent.parent

LIST_FILE = BASE_DIR / "scripts" / "list.tsv"

RAW_DIR = BASE_DIR / "output" / "raw"
RAW_DIR.mkdir(parents=True, exist_ok=True)

# ==========================================================
# Fetch
# ==========================================================

def fetch():

    with LIST_FILE.open(
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
    print("LENOVO REALITY FETCH")
    print("=" * 60)
    print(f"Target : {len(rows)} Pages")
    print("=" * 60)

    session = requests.Session()

    session.headers.update({
        "User-Agent": USER_AGENT,
    })

    for index, row in enumerate(rows, start=1):

        slug = row["slug"].strip()
        url = row["url"].strip()

        print(f"[{index}/{len(rows)}] {slug}")
        print(f"  URL    : {url}")

        try:

            response = session.get(
                url,
                timeout=TIMEOUT,
                allow_redirects=True,
            )

            response.raise_for_status()

            output_file = RAW_DIR / f"{slug}.html"

            output_file.write_bytes(
                response.content
            )

            print(f"  Status : {response.status_code}")
            print(f"  Size   : {len(response.content):,} bytes")
            print(f"  Saved  : {output_file}")

        except requests.RequestException as e:

            print(f"  ERROR  : {e}")

        print()

    print("=" * 60)
    print("FETCH COMPLETE")
    print("=" * 60)


if __name__ == "__main__":
    fetch()