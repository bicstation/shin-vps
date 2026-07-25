#!/usr/bin/env python3
"""
OZ GAMING List Formatter

Reality HTML → JSON Payload

Reality First
Observation First
"""

from pathlib import Path
from urllib.parse import urljoin
import json
import re

from bs4 import BeautifulSoup

# ==========================================================
# Paths
# ==========================================================

BASE_DIR = Path(__file__).resolve().parent.parent

RAW_DIR = BASE_DIR / "output" / "raw"

PAYLOAD_DIR = BASE_DIR / "output" / "payload"
PAYLOAD_DIR.mkdir(parents=True, exist_ok=True)

OUTPUT_FILE = PAYLOAD_DIR / "products.json"

BASE_URL = "https://ozgaming-pcshop.com"


# ==========================================================
# Helpers
# ==========================================================

def text(node):
    return node.get_text(" ", strip=True) if node else ""


def extract_unique_id(url):
    m = re.search(r"/view/item/(\d+)", url)
    return m.group(1) if m else ""


def parse_spec(raw):

    specs = {}

    for item in raw.split(","):

        item = item.strip()

        if ":" not in item:
            continue

        key, value = item.split(":", 1)

        specs[key.strip()] = value.strip()

    return specs


# ==========================================================
# Parse
# ==========================================================

def parse():

    results = []

    html_files = sorted(RAW_DIR.glob("*_p*.html"))

    print("=" * 60)
    print("OZ GAMING LIST FORMATTER")
    print("=" * 60)
    print(f"HTML : {len(html_files)}")
    print("=" * 60)

    for html_file in html_files:

        category_id, page = html_file.stem.rsplit("_p", 1)

        print(html_file.name)

        soup = BeautifulSoup(
            html_file.read_text(
                encoding="utf-8",
                errors="replace",
            ),
            "html.parser",
        )

        cards = soup.select("li.item-list")

        print(f"  Cards : {len(cards)}")

        for card in cards:

            link = card.select_one("a[href]")

            if not link:
                continue

            product_url = urljoin(BASE_URL, link["href"])

            image = card.select_one("img")

            spec_node = card.select_one(".item-spec-source")

            raw_spec = (
                spec_node.get("data-spec", "")
                if spec_node
                else ""
            )

            results.append({

                "maker": "OZ GAMING",

                "category_id": category_id,

                "page": int(page),

                "unique_id": extract_unique_id(product_url),

                "product_url": product_url,

                "image_url": (
                    urljoin(BASE_URL, image.get("src", ""))
                    if image else ""
                ),

                "product_name": text(
                    card.select_one(".item-list-name")
                ),

                "price": text(
                    card.select_one(".item-list-price")
                ),

                "stock": text(
                    card.select_one(".item-list-stock")
                ),

                "delivery": text(
                    card.select_one(".item-list-delivery")
                ),

                "specifications": parse_spec(raw_spec),

                "observation": {
                    "raw_spec": raw_spec,
                },

            })

    OUTPUT_FILE.write_text(

        json.dumps(
            results,
            ensure_ascii=False,
            indent=2,
        ),

        encoding="utf-8",

    )

    print()
    print("=" * 60)
    print(f"Products : {len(results)}")
    print(f"Saved    : {OUTPUT_FILE}")
    print("=" * 60)


# ==========================================================
# Main
# ==========================================================

if __name__ == "__main__":
    parse()