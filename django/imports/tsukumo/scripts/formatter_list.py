#!/usr/bin/env python3
"""
ARK List Formatter

保存した一覧HTMLを解析し、
全ページ分の商品Payloadを生成する。

Reality First
Observation First
"""

from pathlib import Path
import json
from urllib.parse import parse_qs, urlparse

from bs4 import BeautifulSoup

from imports.ark.scripts.settings import BASE_URL


BASE_DIR = Path(__file__).resolve().parent.parent

RAW_DIR = BASE_DIR / "output" / "raw"

PAYLOAD_DIR = BASE_DIR / "output" / "payload"
PAYLOAD_DIR.mkdir(parents=True, exist_ok=True)

OUTPUT_FILE = PAYLOAD_DIR / "products.json"


def text(node):
    return "" if node is None else node.get_text(" ", strip=True)


def attr(node, name):
    return "" if node is None else node.get(name, "")


def absolute_url(url):
    if not url:
        return ""

    if url.startswith(("http://", "https://")):
        return url

    return f"{BASE_URL}{url}"


def normalize_maker(_maker):

    return "ARK"


def extract_pc_id(url):

    if not url:
        return ""

    query = parse_qs(urlparse(url).query)

    return query.get("pc_id", [""])[0]


def parse():

    results = []

    html_files = sorted(RAW_DIR.glob("list_page*.html"))

    for html_file in html_files:

        print(f"Parsing : {html_file.name}")

        soup = BeautifulSoup(
            html_file.read_text(encoding="utf-8"),
            "html.parser",
        )

        for card in soup.select(".mdl-card"):

            ##################################################
            # Basic
            ##################################################

            a = card.select_one('.parent_img a[href*="/bto/customizer/"]')

            img = card.select_one(".parent_img img")

            href = attr(a, "href")

            product_url = absolute_url(href)

            image_url = absolute_url(
                attr(img, "data-src") or attr(img, "src")
            )

            pc_id = extract_pc_id(product_url)

            ##################################################
            # Title
            ##################################################

            title = card.select(".mdl_title p")

            maker = normalize_maker(text(title[0])) if len(title) >= 1 else ""

            product_name = text(title[1]) if len(title) >= 2 else ""

            model = text(title[2]) if len(title) >= 3 else ""

            raw_title = " ".join(
                t.get_text(" ", strip=True)
                for t in title
            )

            ##################################################
            # Specs
            ##################################################

            specs = {}

            for row in card.select(".mdl_spec_list tr"):

                cols = row.find_all("td")

                if len(cols) != 2:
                    continue

                key = text(cols[0])

                value = text(cols[1])

                specs[key] = value

            ##################################################
            # Feature
            ##################################################

            feature = ""

            feature_block = card.select_one(".mdl_desc")

            if feature_block:

                p = feature_block.select_one("p")

                if p:
                    feature = text(p)

            ##################################################
            # Identity
            ##################################################

            product_no = ""

            if feature_block:

                for small in feature_block.select("small"):

                    value = text(small)

                    if value.startswith("商品番号:"):

                        product_no = (
                            value.replace("商品番号:", "")
                            .strip()
                        )

                    elif value.startswith("型番:"):

                        if not model:

                            model = (
                                value.replace("型番:", "")
                                .strip()
                            )

            ##################################################
            # Release
            ##################################################

            release_date = ""

            for small in card.select(".mdl_spec_list small"):

                value = text(small)

                if value.startswith("リリース:"):

                    release_date = (
                        value.replace("リリース:", "")
                        .strip()
                    )

            ##################################################
            # Price
            ##################################################

            price = text(
                card.select_one('[itemprop="price"]')
            )

            ##################################################
            # Payload
            ##################################################

            results.append({

                #
                # Identity
                #

                "maker": maker,

                "product_name": product_name,

                "model": model,

                "product_no": product_no,

                "pc_id": pc_id,

                #
                # Commerce
                #

                "price": price,

                "release_date": release_date,

                "product_url": product_url,

                "image_url": image_url,

                #
                # Observation
                #

                "observation": {

                    "raw_title": raw_title,

                    "feature": feature,

                    "specifications": specs,

                },

                #
                # Legacy
                #

                "specs": specs,

            })

    OUTPUT_FILE.write_text(
        json.dumps(
            results,
            ensure_ascii=False,
            indent=2,
        ),
        encoding="utf-8",
    )

    print(f"Pages    : {len(html_files)}")
    print(f"Products : {len(results)}")
    print(f"Saved    : {OUTPUT_FILE}")


if __name__ == "__main__":
    parse()