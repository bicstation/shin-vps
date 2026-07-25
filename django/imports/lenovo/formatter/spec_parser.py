# /home/maya/shin-vps/django/imports/lenovo/formatter/spec_parser.py
"""
Lenovo Specification Parser

BeautifulSoupからSpecificationsを抽出し、
Productへ付与する。
"""

from typing import Dict, List

from bs4 import BeautifulSoup


def text(node) -> str:
    """
    Nodeから文字列を取得する。
    """

    return "" if node is None else node.get_text(" ", strip=True)


def attach(
    soup: BeautifulSoup,
    products: List[Dict],
) -> List[Dict]:
    """
    ProductへSpecificationsを追加する。
    """

    table = soup.select_one("#Spec_List_Detail")

    if table is None:
        return products

    rows = table.find_all("tr")

    if len(rows) <= 1:
        return products

    for row in rows[1:]:

        headers = row.find_all("th")

        if not headers:
            continue

        key = " ".join(
            text(th)
            for th in headers
        ).strip()

        if not key:
            continue

        for index, td in enumerate(row.find_all("td")):

            if index >= len(products):
                break

            value = text(td)

            if not value:
                continue

            products[index]["specs"][key] = value

    return products


if __name__ == "__main__":

    from pathlib import Path

    from parser import parse
    from product_builder import build

    BASE_DIR = Path(__file__).resolve().parent.parent

    RAW_DIR = BASE_DIR / "output" / "raw"

    html_files = sorted(
        RAW_DIR.glob("*.html")
    )

    if not html_files:
        print("No HTML files found.")
        raise SystemExit(1)

    soup = parse(html_files[0])

    entry = {
        "maker": "LENOVO",
        "brand": "ThinkPad",
        "series": "T Series",
        "url": "https://www.lenovo.com/",
    }

    products = build(
        soup,
        entry,
    )

    attach(
        soup,
        products,
    )

    print("=" * 60)
    print("LENOVO SPEC PARSER")
    print("=" * 60)
    print(f"Products : {len(products)}")

    if products:

        first = products[0]

        print(f"Product : {first['product_name']}")
        print()
        print("Specifications")

        for key, value in first["specs"].items():
            print(f"- {key}: {value}")

    print("=" * 60)
    print("Spec Parser OK")
    print("=" * 60)