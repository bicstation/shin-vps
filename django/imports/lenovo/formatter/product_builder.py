# /home/maya/shin-vps/django/imports/lenovo/formatter/product_builder.py

"""
Lenovo Product Builder
"""

import re
from typing import Dict, List
from urllib.parse import urljoin

from bs4 import BeautifulSoup


def text(node) -> str:
    return "" if node is None else node.get_text(" ", strip=True)


def split_identity(product_name: str, brand: str, series: str):
    if brand != "*" and series != "*":
        return brand, series
    parts = product_name.split(maxsplit=1)
    if len(parts) == 2:
        return parts[0], parts[1]
    return product_name, ""


def extract_price(card) -> str:
    aria = card.get("aria-label", "")
    match = re.search(r"¥[\d,]+", aria)
    return match.group(0) if match else ""


def build(soup: BeautifulSoup, entry: Dict) -> List[Dict]:
    base_url = entry["url"]
    products = []

    cards = soup.select(".jptp-popup__product.jptp-popup__product--hoverable")

    for card in cards:
        anchor = card.find("a", href=True)
        if anchor is None:
            continue

        product_url = urljoin(base_url, anchor["href"])

        image = card.select_one(".jptp-popup__product-img img")
        image_url = urljoin(base_url, image["src"]) if image and image.has_attr("src") else ""

        product_name = text(card.select_one(".jptp-popup__product-title"))
        description = text(card.select_one(".jptp-popup__tooltip"))
        price = extract_price(card)

        brand, series = split_identity(
            product_name,
            entry["brand"],
            entry["series"],
        )

        products.append({
            "maker": entry["maker"],
            "brand": brand,
            "series": series,
            "product_name": product_name,
            "model": "",
            "product_no": "",
            "price": price,
            "release_date": "",
            "product_url": product_url,
            "image_url": image_url,
            "description": description,
            "specs": {},
        })

    return products


if __name__ == "__main__":
    from pathlib import Path
    from pprint import pprint
    from parser import parse

    BASE_DIR = Path(__file__).resolve().parent.parent
    RAW_DIR = BASE_DIR / "output" / "raw"

    html_file = sorted(RAW_DIR.glob("*.html"))[0]
    soup = parse(html_file)

    entry = {
        "category": "Laptop",
        "maker": "LENOVO",
        "brand": "*",
        "series": "*",
        "file": "laptop",
        "url": "https://www.lenovo.com/jp/ja/laptops/",
    }

    products = build(soup, entry)

    print("=" * 60)
    print(f"Products : {len(products)}")
    if products:
        pprint(products[0])
    print("=" * 60)