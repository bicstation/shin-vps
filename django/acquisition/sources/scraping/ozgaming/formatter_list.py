#!/usr/bin/env python3
"""
OZ GAMING List Formatter

Normalize AcquisitionDocument(list)
into runtime payload.
"""

from __future__ import annotations

import re
from urllib.parse import urljoin

from bs4 import BeautifulSoup

from acquisition.common.trace.reality_trace import (
    trace,
)

from .settings import BASE_URL


# ==========================================================
# Helpers
# ==========================================================

def text(node):

    return (
        ""
        if node is None
        else node.get_text(
            " ",
            strip=True,
        )
    )


def extract_unique_id(
    url: str,
) -> str:

    match = re.search(
        r"/view/item/(\d+)",
        url,
    )

    return (
        match.group(1)
        if match
        else ""
    )


def parse_spec(
    raw: str,
) -> dict:

    specs = {}

    for item in raw.split(","):

        item = item.strip()

        if ":" not in item:
            continue

        key, value = item.split(
            ":",
            1,
        )

        specs[
            key.strip()
        ] = value.strip()

    return specs


# ==========================================================
# Normalize
# ==========================================================

def normalize(
    html: str,
) -> list[dict]:

    soup = BeautifulSoup(
        html,
        "html.parser",
    )

    results = []

    for card in soup.select(
        "li.item-list",
    ):

        link = card.select_one(
            "a[href]",
        )

        if link is None:
            continue

        product_url = urljoin(
            BASE_URL,
            link["href"],
        )

        image = card.select_one(
            "img",
        )

        spec_node = card.select_one(
            ".item-spec-source",
        )

        raw_spec = (
            spec_node.get(
                "data-spec",
                "",
            )
            if spec_node
            else ""
        )

        specs = parse_spec(
            raw_spec,
        )

        payload = {

            "maker": "OZ GAMING",

            "unique_id": extract_unique_id(
                product_url,
            ),

            "product_url": product_url,

            "image_url": (
                urljoin(
                    BASE_URL,
                    image.get(
                        "src",
                        "",
                    ),
                )
                if image
                else ""
            ),

            "product_name": text(
                card.select_one(
                    ".item-list-name",
                )
            ),

            "price": text(
                card.select_one(
                    ".item-list-price",
                )
            ),

            "stock": text(
                card.select_one(
                    ".item-list-stock",
                )
            ),

            "delivery": text(
                card.select_one(
                    ".item-list-delivery",
                )
            ),

            "specifications": specs,

            "observation": {

                "raw_spec": raw_spec,

            },

        }

        trace(
            stage="FORMATTER",
            data=payload,
        )

        results.append(
            payload,
        )

    return results