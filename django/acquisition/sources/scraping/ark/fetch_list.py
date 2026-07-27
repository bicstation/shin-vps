# /home/maya/shin-dev/shin-vps/django/acquisition/sources/scraping/ark/fetch_list.py

#!/usr/bin/env python3
"""
ARK List Acquisition Runtime

Fetch all list pages and store them into AcquisitionDocument.
"""

from __future__ import annotations

import re

import requests
from bs4 import BeautifulSoup

from api.models import AcquisitionDocument

from .settings import (
    SITE_NAME,
    BASE_URL,
    USER_AGENT,
    TIMEOUT,
)

LIST_URL = f"{BASE_URL}/bto/list/"


def get_total_pages(soup: BeautifulSoup) -> int:

    pages = []

    for a in soup.select("a[href*='page=']"):

        href = a.get("href", "")

        m = re.search(r"page=(\d+)", href)

        if m:
            pages.append(int(m.group(1)))

    return max(pages) if pages else 1


def fetch():

    print("=" * 60)
    print("🌐 ARK LIST FETCH")
    print("=" * 60)

    headers = {
        "User-Agent": USER_AGENT,
    }

    page = 1
    total_pages = None
    total_products = 0

    while True:

        url = LIST_URL if page == 1 else f"{LIST_URL}?page={page}"

        response = requests.get(
            url,
            headers=headers,
            timeout=TIMEOUT,
        )
        response.raise_for_status()

        html = response.text

        soup = BeautifulSoup(
            html,
            "html.parser",
        )

        if total_pages is None:
            total_pages = get_total_pages(soup)

        cards = soup.select(".mdl-card")

        if not cards:
            break

        AcquisitionDocument.objects.update_or_create(
            source_name=SITE_NAME,
            document_type="list",
            document_key=f"page{page}",
            defaults={
                "source_url": url,
                "content_type": "text/html",
                "content": html,
            },
        )

        total_products += len(cards)

        print(
            f"[{page}/{total_pages}] "
            f"Cards:{len(cards):2d} "
            f"Total:{total_products:4d}"
        )

        page += 1

        if page > total_pages:
            break

    print("-" * 60)
    print(f"Pages    : {page - 1}")
    print(f"Products : {total_products}")
    print("=" * 60)


if __name__ == "__main__":
    fetch()