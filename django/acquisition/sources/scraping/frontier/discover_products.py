#!/usr/bin/env python3
"""
FRONTIER Product Discovery

Mission:
    Parse FRONTIER Product HTML
    Generate product_list.tsv
"""

from __future__ import annotations

from urllib.parse import urljoin
import csv
import re

from bs4 import BeautifulSoup

from api.models.acquisition_document import AcquisitionDocument

from acquisition.common.trace.reality_trace import (
    trace_pipeline,
)

from .settings import (
    PRODUCT_LIST_TSV,
)

BASE_URL = "https://www.frontier-direct.jp"

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

        if (
            not cpu
            and re.search(
                r"(Ryzen|Core|Xeon|Pentium|Celeron)",
                s,
                re.I,
            )
        ):
            cpu = s
            continue

        if (
            not gpu
            and re.search(
                r"(RTX|GTX|GeForce|Radeon|Arc)",
                s,
                re.I,
            )
        ):
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

        if (
            not storage
            and re.search(
                r"(SSD|NVMe|HDD)",
                s,
                re.I,
            )
        ):
            storage = s
            continue

    return cpu, gpu, memory, storage


def discover():

    trace_pipeline("DISCOVER")

    products = []

    documents = (
        AcquisitionDocument.objects
        .filter(
            source_name="frontier",
            document_type="product",
        )
        .order_by("document_key")
    )

    print("=" * 60)
    print("DISCOVER PRODUCTS")
    print("=" * 60)
    print(f"Documents : {documents.count()}")
    print()

    for document in documents:

        model_slug = document.document_key

        print(f"Reading : {model_slug}")

        soup = BeautifulSoup(
            document.content,
            "html.parser",
        )

        cards = soup.select(".iw-goods")

        print(f"Products : {len(cards)}")

        for card in cards:

            try:

                product_name = text(
                    card.select_one("h3.uk-card-title")
                )

                href = ""
                a = card.select_one("a[href]")

                if a:
                    href = a.get("href", "")

                product_url = abs_url(href)

                product_code = product_code_from_url(
                    product_url
                )

                image_url = ""

                img = card.select_one("img")

                if img:
                    image_url = (
                        img.get("data-src")
                        or img.get("src")
                        or ""
                    )

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

    with PRODUCT_LIST_TSV.open(
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
    print(f"Saved    : {PRODUCT_LIST_TSV}")
    print("DONE")
    print("=" * 60)


def main():
    discover()


if __name__ == "__main__":
    main()