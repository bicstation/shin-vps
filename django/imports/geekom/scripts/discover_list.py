#!/usr/bin/env python3
"""
discover_list.py

GEEKOM Product Discovery Runtime

保存済み Collection HTML を解析し、
Product URL と Price を抽出して
product_list.tsv を生成する。
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

    products = {}

    for card in soup.find_all("product-card"):

        link = card.select_one(
            ".product-card__title a[href]"
        )

        if not link:
            continue

        href = link["href"].split("?")[0].rstrip("/")

        if not href.startswith("/products/"):
            continue

        slug = href.split("/")[-1]

        price = ""

        sale = card.select_one("sale-price")

        if sale:
            price = re.sub(
                r"\D",
                "",
                sale.get_text(),
            )

        products.setdefault(
            slug,
            {
                "slug": slug,
                "url": f"https://geekom.jp{href}",
                "price": price,
            },
        )

    return list(products.values())



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
                "price",
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

        collection = row["slug"]

        html_file = RAW_DIR / f"{collection}.html"

        if not html_file.exists():
            continue

        html = html_file.read_text(
            encoding="utf-8",
            errors="ignore",
        )

        discovered = discover_products(html)

        print(f"{collection:20} {len(discovered):3} products")

        for item in discovered:

            products.setdefault(
                item["slug"],
                {
                    "maker": "GEEKOM",
                    "collection": collection,
                    "slug": item["slug"],
                    "url": item["url"],
                    "price": item["price"],
                    "enabled": "true",
                },
            )

    save_products(products)

    print("-" * 60)
    print(f"TOTAL : {len(products)} products")
    print(PRODUCTS_TSV)


if __name__ == "__main__":
    main()