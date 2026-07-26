#!/usr/bin/env python3
"""
GEEKOM Collection Discovery Runtime

Discover Collection URLs from root.tsv.
"""

from __future__ import annotations

import csv
import re

import requests
from bs4 import BeautifulSoup

from settings import (
    BASE_URL,
    TIMEOUT,
    USER_AGENT,
    ROOT_TSV,
    COLLECTIONS_TSV,
)

HEADERS = {
    "User-Agent": USER_AGENT,
}


def load_roots():

    with ROOT_TSV.open("r", encoding="utf-8", newline="") as f:

        return [
            row
            for row in csv.DictReader(f, delimiter="\t")
            if row["source_type"] == "root"
            and row["enabled"].lower() == "true"
        ]


def discover(url: str):

    print(f"🌐 {url}")

    response = requests.get(
        url,
        headers=HEADERS,
        timeout=TIMEOUT,
    )
    response.raise_for_status()

    soup = BeautifulSoup(response.text, "html.parser")

    urls = {
        href
        for a in soup.find_all("a", href=True)
        if (
            (href := a["href"].split("?")[0].rstrip("/")).startswith("/collections/")
            and href not in {"/collections", "/collections/all"}
        )
    }

    urls.update(
        f"/collections/{slug}"
        for slug in re.findall(
            r"/collections/([a-zA-Z0-9_-]+)",
            response.text,
        )
        if slug != "all"
    )

    return sorted(urls)


def slug_to_name(slug: str) -> str:
    return slug.replace("-", " ").title()


def save(rows):

    COLLECTIONS_TSV.parent.mkdir(parents=True, exist_ok=True)

    with COLLECTIONS_TSV.open("w", encoding="utf-8", newline="") as f:

        writer = csv.writer(f, delimiter="\t")

        writer.writerow([
            "maker",
            "source_type",
            "slug",
            "name",
            "url",
            "enabled",
            "priority",
        ])

        for priority, row in enumerate(rows, start=10):

            writer.writerow([
                "GEEKOM",
                "collection",
                row["slug"],
                row["name"],
                row["url"],
                "true",
                priority * 10,
            ])


def main():

    print("=" * 60)
    print("🔎 GEEKOM ROOT DISCOVERY")
    print("=" * 60)

    discovered = {}

    for root in load_roots():

        for path in discover(root["url"].rstrip("/")):

            slug = path.split("/")[-1]

            discovered[slug] = {
                "slug": slug,
                "name": slug_to_name(slug),
                "url": f"{BASE_URL}{path}",
            }

    rows = sorted(
        discovered.values(),
        key=lambda row: row["slug"],
    )

    save(rows)

    print()
    print(f"✅ {len(rows)} collections discovered")
    print(f"📄 {COLLECTIONS_TSV}")


if __name__ == "__main__":
    main()