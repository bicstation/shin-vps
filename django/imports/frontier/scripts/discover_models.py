#!/usr/bin/env python3
"""
FRONTIER Model Discovery

Reality First
Observation First
"""

from pathlib import Path
import csv

from bs4 import BeautifulSoup

# ==========================================================
# Paths
# ==========================================================

BASE_DIR = Path(__file__).resolve().parent.parent

RAW_DIR = BASE_DIR / "output" / "raw"

OUTPUT_DIR = BASE_DIR / "output"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

OUTPUT_FILE = OUTPUT_DIR / "models.tsv"

BASE_URL = "https://www.frontier-direct.jp"

DESKTOP = {
    "full",
    "middle",
    "mini",
    "slim",
}

rows = []

# ==========================================================
# Helpers
# ==========================================================

def absolute_url(href):

    if href.startswith("/"):
        return BASE_URL + href

    return href


def slugify(url):

    return url.rstrip("/").split("/")[-1]


def add_row(
    category,
    series,
    url,
    vendor="",
    chipset="",
):

    rows.append({
        "category": category,
        "series": series,
        "vendor": vendor,
        "chipset": chipset,
        "slug": slugify(url),
        "url": url,
    })


# ==========================================================
# Desktop
# ==========================================================

def discover_desktop(category, soup):

    cards = soup.select("div.uk-card")

    print(f"Series : {len(cards)}")

    for card in cards:

        title = card.select_one("h3")

        if title is None:
            continue

        series = title.get_text(strip=True)

        for link in card.select("a[href]"):

            text = link.get_text(" ", strip=True)

            url = absolute_url(link["href"])

            vendor = ""
            chipset = ""

            if "Intel" in text:
                vendor = "Intel"
            elif "AMD" in text:
                vendor = "AMD"

            if "（" in text and "）" in text:
                chipset = text.split("（")[1].split("）")[0]

            add_row(
                category,
                series,
                url,
                vendor,
                chipset,
            )

            print(f"  {series} | {vendor} | {chipset}")


# ==========================================================
# Notebook
# ==========================================================

def discover_notebook(category, soup):

    cards = soup.select("div.uk-card")

    print(f"Products : {len(cards)}")

    for card in cards:

        title = card.select_one("h3")
        link = card.select_one("a[href]")

        if title is None or link is None:
            continue

        product = title.get_text(strip=True)

        add_row(
            category,
            product,
            absolute_url(link["href"]),
        )

        print(f"  {product}")


# ==========================================================
# Discover
# ==========================================================

for html_file in sorted(RAW_DIR.glob("*.html")):

    category = html_file.stem

    print("=" * 60)
    print(category)
    print("=" * 60)

    soup = BeautifulSoup(
        html_file.read_text(encoding="utf-8"),
        "html.parser",
    )

    if category in DESKTOP:
        discover_desktop(category, soup)
    else:
        discover_notebook(category, soup)

# ==========================================================
# Save
# ==========================================================

with open(
    OUTPUT_FILE,
    "w",
    encoding="utf-8",
    newline="",
) as f:

    writer = csv.DictWriter(
        f,
        fieldnames=[
            "category",
            "series",
            "vendor",
            "chipset",
            "slug",
            "url",
        ],
        delimiter="\t",
    )

    writer.writeheader()
    writer.writerows(rows)

print()
print("=" * 60)
print("DISCOVERY COMPLETE")
print(f"Entries : {len(rows)}")
print(f"Saved   : {OUTPUT_FILE}")
print("=" * 60)