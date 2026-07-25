# /home/maya/shin-dev/shin-vps/django/imports/frontier/scripts/fetch_products.py

#!/usr/bin/env python3
"""
FRONTIER Product Fetch

models.tsv を読み込み、
各モデルページを取得して保存する。

Phase 3

models.tsv
    ↓
Fetch
    ↓
output/products/

Reality First
"""

from pathlib import Path
import csv

import requests

# ==========================================================
# Paths
# ==========================================================

BASE_DIR = Path(__file__).resolve().parent.parent

INPUT_FILE = BASE_DIR / "output" / "models.tsv"

OUTPUT_DIR = BASE_DIR / "output" / "products"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# ==========================================================
# Session
# ==========================================================

session = requests.Session()

session.headers.update(
    {
        "User-Agent": (
            "Mozilla/5.0 "
            "(X11; Linux x86_64) "
            "AppleWebKit/537.36 "
            "(KHTML, like Gecko) "
            "Chrome/138.0 Safari/537.36"
        )
    }
)

# ==========================================================
# Fetch
# ==========================================================

with open(
    INPUT_FILE,
    encoding="utf-8",
) as f:

    reader = csv.DictReader(
        f,
        delimiter="\t",
    )

    count = 0

    for row in reader:

        slug = row["slug"]
        url = row["url"]

        output_file = OUTPUT_DIR / f"{slug}.html"

        print("=" * 60)
        print(slug)
        print(url)

        try:

            response = session.get(
                url,
                timeout=30,
            )

            print(f"Status : {response.status_code}")

            response.raise_for_status()

            output_file.write_text(
                response.text,
                encoding="utf-8",
            )

            print(f"Saved  : {output_file}")

            count += 1

        except Exception as e:

            print(f"ERROR : {e}")

# ==========================================================
# Complete
# ==========================================================

print()
print("=" * 60)
print("FETCH COMPLETE")
print(f"Pages : {count}")
print(f"Saved : {OUTPUT_DIR}")
print("=" * 60)