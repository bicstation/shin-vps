#!/usr/bin/env python3
"""
TSUKUMO Reality Fetch

Reality HTML を取得し、
生データをそのまま保存する。

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

from imports.tsukumo.scripts.settings import (
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

    with open(LIST_FILE, encoding="utf-8") as f:
        rows = list(csv.DictReader(f, delimiter="\t"))

    print("=" * 60)
    print("TSUKUMO REALITY FETCH")
    print("=" * 60)
    print(f"Target : {len(rows)} Series")
    print("=" * 60)

    for index, row in enumerate(rows, start=1):

        url = row["url"]
        slug = row["slug"]

        print(f"[{index}/{len(rows)}] {row['series']}")

        response = requests.get(
            url,
            headers={
                "User-Agent": USER_AGENT,
            },
            timeout=TIMEOUT,
        )

        response.raise_for_status()

        output_file = RAW_DIR / f"{slug}.html"

        #
        # Realityは一切加工しない
        #

        output_file.write_bytes(
            response.content
        )

        print(f"  URL    : {url}")
        print(f"  Status : {response.status_code}")
        print(f"  Saved  : {output_file}")
        print()

    print("=" * 60)
    print("COMPLETE")
    print("=" * 60)


if __name__ == "__main__":
    fetch()