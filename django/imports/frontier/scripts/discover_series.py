#!/usr/bin/env python3
"""
discover_series.py

Mission:
    Discover FRONTIER Series
    Generate series.tsv
"""

from pathlib import Path
import csv
import re

from bs4 import BeautifulSoup

BASE_DIR = Path(__file__).resolve().parent.parent

OUTPUT_DIR = BASE_DIR / "output"
PRODUCT_DIR = OUTPUT_DIR / "products"

OUTPUT_FILE = OUTPUT_DIR / "series.tsv"

HEADERS = [
    "model_slug",
    "brand",
    "category",
    "series",
]


def detect_series(model_slug):

    slug = model_slug.lower()

    if "asus" in slug:
        return "ASUS Collaboration"

    if "msi" in slug:
        return "MSI Collaboration"

    if "ghl" in slug:
        return "GHL"

    if "gpl" in slug:
        return "GPL"

    if "gbl" in slug:
        return "GBL"

    if "gam" in slug:
        return "GAM"

    if "gk" in slug:
        return "GK"

    if "za" in slug:
        return "ZA"

    if "xa" in slug:
        return "XA"

    if re.search(r"^ejgb", slug):
        return "GB"

    if "cr" in slug:
        return "Creator"

    if "cs" in slug:
        return "Slim"

    return ""


def detect_category(series):

    if series == "Creator":
        return "Creator Desktop"

    if series == "Slim":
        return "Desktop"

    return "Gaming Desktop"


def main():

    rows = []
    seen = set()

    html_files = sorted(PRODUCT_DIR.glob("*.html"))

    print("=" * 60)
    print("DISCOVER SERIES")
    print("=" * 60)

    for html_file in html_files:

        model_slug = html_file.stem

        if re.fullmatch(r"g\d+", model_slug):
            continue

        if model_slug in seen:
            continue

        seen.add(model_slug)

        html = html_file.read_text(
            encoding="utf-8",
            errors="ignore",
        )

        BeautifulSoup(html, "html.parser")

        series = detect_series(model_slug)

        rows.append({
            "model_slug": model_slug,
            "brand": "FRONTIER",
            "category": detect_category(series),
            "series": series,
        })

        print(f"{model_slug:20} -> {series}")

    rows.sort(key=lambda x: x["model_slug"])

    OUTPUT_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )

    with open(
        OUTPUT_FILE,
        "w",
        newline="",
        encoding="utf-8",
    ) as f:

        writer = csv.DictWriter(
            f,
            fieldnames=HEADERS,
            delimiter="\t",
        )

        writer.writeheader()
        writer.writerows(rows)

    print()
    print("=" * 60)
    print(f"Series : {len(rows)}")
    print(f"Saved   : {OUTPUT_FILE}")
    print("DONE")
    print("=" * 60)


if __name__ == "__main__":
    main()