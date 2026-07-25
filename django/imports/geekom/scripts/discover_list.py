#!/usr/bin/env python3
"""
discover_list.py

GEEKOM Product Discovery Runtime

保存済み Collection HTML を解析し、
Product URL を抽出して product_list.tsv を生成する。
"""

from pathlib import Path
import csv
import re

from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parent.parent

COLLECTIONS_TSV = ROOT / "collections.tsv"
PRODUCTS_TSV = ROOT / "product_list.tsv"
RAW_DIR = ROOT / "output" / "raw"


def load_collections():

    with COLLECTIONS_TSV.open(
        encoding="utf-8",
        newline="",
    ) as f:

        return [
            row
            for row in csv.DictReader(f, delimiter="\t")
            if row["enabled"].lower() == "true"
        ]


def discover_products(html: str):

    soup = BeautifulSoup(html, "html.parser")

    urls = set()

    for a in soup.find_all("a", href=True):

        href = a["href"]

        if href.startswith("/products/"):

            urls.add(
                href.split("?")[0].rstrip("/")
            )

    for slug in re.findall(
        r"/products/([a-zA-Z0-9\-_]+)",
        html,
    ):

        urls.add(f"/products/{slug}")

    return sorted(urls)


def save_products(products):

    with PRODUCTS_TSV.open(
        "w",
        encoding="utf-8",
        newline="",
    ) as f:

        writer = csv.DictWriter(
            f,
            fieldnames=[
                "maker",
                "collection",
                "slug",
                "url",
                "enabled",
            ],
            delimiter="\t",
        )

        writer.writeheader()

        for product in sorted(
            products.values(),
            key=lambda x: x["slug"],
        ):
            writer.writerow(product)


def main():

    print("=" * 60)
    print("GEEKOM PRODUCT DISCOVERY")
    print("=" * 60)

    products = {}

    for row in load_collections():

        slug = row["slug"]

        html_file = RAW_DIR / f"{slug}.html"

        if not html_file.exists():
            continue

        html = html_file.read_text(
            encoding="utf-8",
            errors="ignore",
        )

        urls = discover_products(html)

        print(f"{slug:20} {len(urls):3} products")

        for url in urls:

            product_slug = url.split("/")[-1]

            products.setdefault(
                product_slug,
                {
                    "maker": "GEEKOM",
                    "collection": slug,
                    "slug": product_slug,
                    "url": f"https://geekom.jp{url}",
                    "enabled": "true",
                },
            )

    save_products(products)

    print("-" * 60)
    print(f"TOTAL : {len(products)} products")
    print(PRODUCTS_TSV)


if __name__ == "__main__":
    main()