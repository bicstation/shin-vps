#!/usr/bin/env python3
"""
discover_products.py

Mission:
    Parse FRONTIER product list HTML files
    Generate products.tsv
"""

from pathlib import Path
from urllib.parse import urljoin
import csv
import re

from bs4 import BeautifulSoup

BASE_URL = "https://www.frontier-direct.jp"

BASE_DIR = Path(__file__).resolve().parent.parent
OUTPUT_DIR = BASE_DIR / "output"

PRODUCT_LIST_DIR = OUTPUT_DIR / "products"
OUTPUT_FILE = OUTPUT_DIR / "products.tsv"

HEADERS = [
    "model_slug",
    "product_code",
    "product_name",
    "product_url",
    "image_url",
    "price",
    "cpu",
    "gpu",
    "memory",
    "storage",
    "stock",
]


def text(node):
    if node is None:
        return ""
    return " ".join(node.get_text(" ", strip=True).split())


def abs_url(url):
    if not url:
        return ""
    return urljoin(BASE_URL, url)


def product_code_from_url(url):
    if not url:
        return ""
    return url.rstrip("/").split("/")[-1]


def detect_specs(specs):

    cpu = ""
    gpu = ""
    memory = ""
    storage = ""

    for spec in specs:

        s = spec.strip()

        if not cpu and re.search(r"(Ryzen|Core|Xeon|Pentium|Celeron)", s, re.I):
            cpu = s
            continue

        if not gpu and re.search(r"(RTX|GTX|GeForce|Radeon|Arc)", s, re.I):
            gpu = s
            continue

        if (
            not memory
            and "メモリ" in s
            and "ケース" not in s
            and "クーラー" not in s
        ):
            memory = s
            continue

        if not storage and re.search(r"(SSD|NVMe|HDD)", s, re.I):
            storage = s
            continue

    return cpu, gpu, memory, storage


def main():

    products = []

    html_files = sorted(PRODUCT_LIST_DIR.glob("*.html"))

    print("=" * 60)
    print("DISCOVER PRODUCTS")
    print("=" * 60)
    print(f"HTML Files : {len(html_files)}")
    print()

    for html_file in html_files:

        model_slug = html_file.stem

        print(f"Reading : {html_file.name}")

        html = html_file.read_text(
            encoding="utf-8",
            errors="ignore",
        )

        soup = BeautifulSoup(html, "html.parser")

        cards = soup.select(".iw-goods")

        print(f"Products : {len(cards)}")

        for card in cards:

            try:

                product_name = text(card.select_one("h3.uk-card-title"))

                href = ""
                a = card.select_one("a[href]")
                if a:
                    href = a.get("href", "")

                product_url = abs_url(href)
                product_code = product_code_from_url(product_url)

                image_url = ""
                img = card.select_one("img")
                if img:
                    image_url = img.get("data-src") or img.get("src") or ""

                image_url = abs_url(image_url)

                price = text(card.select_one(".iw-price"))
                stock = text(card.select_one(".iw-stock"))

                specs = [
                    text(li)
                    for li in card.select("li")
                    if text(li)
                ]

                cpu, gpu, memory, storage = detect_specs(specs)

                products.append({
                    "model_slug": model_slug,
                    "product_code": product_code,
                    "product_name": product_name,
                    "product_url": product_url,
                    "image_url": image_url,
                    "price": price,
                    "cpu": cpu,
                    "gpu": gpu,
                    "memory": memory,
                    "storage": storage,
                    "stock": stock,
                })

                print(f"  ✓ {product_name}")

            except Exception as e:

                print(f"  ERROR : {e}")

        print()

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

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
        writer.writerows(products)

    print("=" * 60)
    print(f"Products : {len(products)}")
    print(f"Saved    : {OUTPUT_FILE}")
    print("DONE")
    print("=" * 60)


if __name__ == "__main__":
    main()