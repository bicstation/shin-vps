#!/usr/bin/env python3
"""
GEEKOM Product Discovery Runtime

Discover Products from Collection Documents.
"""

from __future__ import annotations

import csv
import re

from bs4 import BeautifulSoup

from api.models import AcquisitionDocument

from .settings import (
    BASE_URL,
    SITE_NAME,
    COLLECTIONS_TSV,
    PRODUCT_LIST_TSV,
)


def load_collections():

    with COLLECTIONS_TSV.open(
        "r",
        encoding="utf-8",
        newline="",
    ) as f:

        return [
            row
            for row in csv.DictReader(f, delimiter="\t")
            if row["enabled"].lower() == "true"
        ]


def load_collection_html(
    collection: str,
) -> str | None:

    document = (
        AcquisitionDocument.objects.filter(
            source_name=SITE_NAME,
            document_type="collection",
            document_key=collection,
        )
        .first()
    )

    if document is None:
        return None

    return document.content


def discover_products(html: str):

    soup = BeautifulSoup(
        html,
        "html.parser",
    )

    products = {}

    for card in soup.find_all(
        "product-card",
    ):

        link = card.select_one(
            ".product-card__title a[href]"
        )

        if not link:
            continue

        href = (
            link["href"]
            .split("?")[0]
            .rstrip("/")
        )

        if not href.startswith("/products/"):
            continue

        slug = href.split("/")[-1]

        sale = card.select_one(
            "sale-price"
        )

        products.setdefault(
            slug,
            {
                "slug": slug,
                "url": f"{BASE_URL}{href}",
                "price": (
                    re.sub(
                        r"\D",
                        "",
                        sale.get_text(),
                    )
                    if sale
                    else ""
                ),
            },
        )

    return products


def save_products(products):

    PRODUCT_LIST_TSV.parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    with PRODUCT_LIST_TSV.open(
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
            key=lambda row: row["slug"],
        ):

            writer.writerow(product)


def main():

    print("=" * 60)
    print("🔎 GEEKOM PRODUCT DISCOVERY")
    print("=" * 60)

    products = {}

    for row in load_collections():

        collection = row["slug"]

        html = load_collection_html(
            collection,
        )

        if not html:
            print(
                f"{collection:20} not found"
            )
            continue

        discovered = discover_products(
            html,
        )

        print(
            f"{collection:20} {len(discovered):3} products"
        )

        for item in discovered.values():

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

    save_products(
        products,
    )

    print("-" * 60)
    print(
        f"TOTAL : {len(products)} products"
    )
    print(PRODUCT_LIST_TSV)


if __name__ == "__main__":
    main()