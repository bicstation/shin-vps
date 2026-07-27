# /home/maya/shin-dev/shin-vps/django/acquisition/sources/scraping/ark/formatter_list.py

#!/usr/bin/env python3
"""
ARK List Formatter

Normalize AcquisitionDocument(list)
into runtime payload.
"""

from __future__ import annotations

from urllib.parse import parse_qs, urlparse

from bs4 import BeautifulSoup

from .settings import BASE_URL


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


def extract_pc_id(url):

    if not url:
        return ""

    query = parse_qs(urlparse(url).query)

    return query.get("pc_id", [""])[0]


def normalize(html: str):

    soup = BeautifulSoup(
        html,
        "html.parser",
    )

    results = []

    for card in soup.select(".mdl-card"):

        #
        # Basic
        #

        a = card.select_one('.parent_img a[href*="/bto/customizer/"]')
        img = card.select_one(".parent_img img")

        product_url = absolute_url(
            attr(a, "href"),
        )

        image_url = absolute_url(
            attr(img, "data-src")
            or attr(img, "src"),
        )

        pc_id = extract_pc_id(product_url)

        #
        # Title
        #

        title = card.select(".mdl_title p")

        maker = "ARK"

        product_name = (
            text(title[1])
            if len(title) >= 2
            else ""
        )

        model = (
            text(title[2])
            if len(title) >= 3
            else ""
        )

        raw_title = " ".join(
            t.get_text(" ", strip=True)
            for t in title
        )

        #
        # Specs
        #

        specs = {}

        for row in card.select(".mdl_spec_list tr"):

            cols = row.find_all("td")

            if len(cols) != 2:
                continue

            specs[text(cols[0])] = text(cols[1])

        #
        # Feature
        #

        feature = ""

        product_no = ""

        feature_block = card.select_one(".mdl_desc")

        if feature_block:

            p = feature_block.select_one("p")

            if p:
                feature = text(p)

            for small in feature_block.select("small"):

                value = text(small)

                if value.startswith("商品番号:"):
                    product_no = value.replace(
                        "商品番号:",
                        "",
                    ).strip()

                elif (
                    value.startswith("型番:")
                    and not model
                ):
                    model = value.replace(
                        "型番:",
                        "",
                    ).strip()

        #
        # Release
        #

        release_date = ""

        for small in card.select(".mdl_spec_list small"):

            value = text(small)

            if value.startswith("リリース:"):
                release_date = value.replace(
                    "リリース:",
                    "",
                ).strip()

        #
        # Price
        #

        price = text(
            card.select_one(
                '[itemprop="price"]'
            )
        )

        results.append({

            "maker": maker,
            "product_name": product_name,
            "model": model,
            "product_no": product_no,
            "pc_id": pc_id,

            "price": price,
            "release_date": release_date,
            "product_url": product_url,
            "image_url": image_url,

            "observation": {

                "raw_title": raw_title,
                "feature": feature,
                "specifications": specs,

            },

            "specs": specs,

        })

    return results