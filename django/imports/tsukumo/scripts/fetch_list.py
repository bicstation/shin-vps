#!/usr/bin/env python3
"""
ARK BTO List Fetcher

一覧ページを取得し、
全ページのHTMLを保存する。
"""

from pathlib import Path
import re

import requests
from bs4 import BeautifulSoup

from imports.ark.scripts.settings import (
    BASE_URL,
    USER_AGENT,
    TIMEOUT,
)

LIST_URL = f"{BASE_URL}/bto/list/"

BASE_DIR = Path(__file__).resolve().parent.parent

RAW_DIR = BASE_DIR / "output" / "raw"
RAW_DIR.mkdir(parents=True, exist_ok=True)


def get_total_pages(soup: BeautifulSoup) -> int:
    """
    ページャーから総ページ数を取得する。
    """

    pages = []

    for a in soup.select("a[href*='page=']"):

        href = a.get("href", "")

        m = re.search(r"page=(\d+)", href)

        if m:
            pages.append(int(m.group(1)))

    return max(pages) if pages else 1


def fetch():

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

        soup = BeautifulSoup(
            response.text,
            "html.parser",
        )

        if total_pages is None:
            total_pages = get_total_pages(soup)

        cards = soup.select(".mdl-card")

        if not cards:
            print("Finished.")
            break

        output = RAW_DIR / f"list_page{page}.html"

        output.write_text(
            response.text,
            encoding="utf-8",
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

    print()
    print("=" * 50)
    print(f"Pages    : {page - 1}")
    print(f"Products : {total_products}")
    print(f"Saved    : {RAW_DIR}")
    print("=" * 50)


if __name__ == "__main__":
    fetch()