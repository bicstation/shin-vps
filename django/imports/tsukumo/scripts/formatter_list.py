#!/usr/bin/env python3
"""
TSUKUMO Spec Formatter

保存した Reality HTML を解析し、
商品Payloadを生成する。

Reality First
Observation First
"""

from pathlib import Path
from urllib.parse import urljoin
import csv
import json

from bs4 import BeautifulSoup

BASE_DIR = Path(__file__).resolve().parent.parent

LIST_FILE = BASE_DIR / "scripts" / "list.tsv"

RAW_DIR = BASE_DIR / "output" / "raw"

PAYLOAD_DIR = BASE_DIR / "output" / "payload"
PAYLOAD_DIR.mkdir(parents=True, exist_ok=True)

OUTPUT_FILE = PAYLOAD_DIR / "products.json"


def text(node):
    return "" if node is None else node.get_text(" ", strip=True)


def normalize_maker():
    return "TSUKUMO"


def build_description(specs):
    return "\n".join(
        f"{k}: {v}"
        for k, v in specs.items()
        if v
    )


def parse():

    results = []

    with open(LIST_FILE, encoding="utf-8") as f:
        entries = list(csv.DictReader(f, delimiter="\t"))

    print("=" * 60)
    print("TSUKUMO SPEC FORMATTER")
    print("=" * 60)

    for index, entry in enumerate(entries, start=1):

        slug = entry["slug"]
        series_url = entry["url"]

        html_file = RAW_DIR / f"{slug}.html"

        if not html_file.exists():
            print(f"[{index}/{len(entries)}] Skip : {slug}.html")
            continue

        print(f"[{index}/{len(entries)}] Parsing : {slug}.html")

        try:
            html = html_file.read_text(encoding="cp932")
        except UnicodeDecodeError:
            html = html_file.read_text(
                encoding="shift_jis",
                errors="replace",
            )

        soup = BeautifulSoup(html, "html.parser")

        table = soup.select_one("#Spec_List_Detail")

        if table is None:
            print("Spec_List_Detail not found.")
            continue

        rows = table.find_all("tr")

        if not rows:
            continue

        ########################################################
        # Products
        ########################################################

        products = []

        for td in rows[0].find_all("td"):

            container = td.find("div")

            if container is None:
                continue

            detail = container.find("a", href=True)

            product_url = ""

            if detail:
                product_url = urljoin(
                    series_url,
                    detail["href"],
                )

            products.append({

                "maker": normalize_maker(),
                "brand": entry["brand"],
                "series": entry["series"],

                "product_name": text(container.find("p")),
                "model": container.get("id", ""),
                "product_no": "",

                "price": text(container.select_one(".price")),
                "release_date": "",

                "product_url": product_url,
                "image_url": "",

                "specs": {},

            })

        ########################################################
        # Specifications
        ########################################################

        for row in rows[1:]:

            headers = row.find_all("th")

            if not headers:
                continue

            key = " ".join(
                text(th)
                for th in headers
            ).strip()

            for i, td in enumerate(row.find_all("td")):

                if i >= len(products):
                    break

                products[i]["specs"][key] = text(td)

        ########################################################
        # Observation
        ########################################################

        for product in products:

            product["observation"] = {

                "raw_title": product["product_name"],

                "feature": "",

                "description": build_description(
                    product["specs"]
                ),

                "specifications": product["specs"],

            }

        results.extend(products)

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


if __name__ == "__main__":
    parse()