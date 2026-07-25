#!/usr/bin/env python3
"""
discover_root.py

GEEKOM Collection Discovery Runtime

collections.tsv の root を巡回し、
Collection URL を自動検出する。
"""

from __future__ import annotations

import csv
import re
from pathlib import Path

import requests
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parent.parent

INPUT_TSV = ROOT / "root.tsv"
OUTPUT_TSV = ROOT / "collections.tsv"

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 "
        "(X11; Linux x86_64) "
        "AppleWebKit/537.36 "
        "(KHTML, like Gecko) "
        "Chrome/137.0 Safari/537.36"
    )
}


def load_roots():
    roots = []

    with INPUT_TSV.open(
        "r",
        encoding="utf-8",
        newline=""
    ) as f:

        reader = csv.DictReader(f, delimiter="\t")

        for row in reader:

            if (
                row["source_type"] == "root"
                and row["enabled"].lower() == "true"
            ):
                roots.append(row)

    return roots


def discover(url: str):

    print(f"🌐 {url}")

    r = requests.get(
        url,
        headers=HEADERS,
        timeout=30,
    )

    r.raise_for_status()

    soup = BeautifulSoup(r.text, "html.parser")

    urls = set()

    #
    # a href
    #
    for a in soup.find_all("a", href=True):

        href = a["href"]

        if href.startswith("/collections/"):

            href = href.split("?")[0]
            href = href.rstrip("/")

            if href == "/collections":
                continue

            if href == "/collections/all":
                continue

            urls.add(href)

    #
    # 念のためHTML全体も検索
    #
    pattern = re.findall(
        r"/collections/([a-zA-Z0-9\-_]+)",
        r.text,
    )

    for slug in pattern:

        if slug == "all":
            continue

        urls.add(f"/collections/{slug}")

    return sorted(urls)


def slug_to_name(slug):

    return slug.replace("-", " ").title()


def save(rows):

    OUTPUT_TSV.parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    with OUTPUT_TSV.open(
        "w",
        encoding="utf-8",
        newline=""
    ) as f:

        writer = csv.writer(
            f,
            delimiter="\t",
        )

        writer.writerow(
            [
                "maker",
                "source_type",
                "slug",
                "name",
                "url",
                "enabled",
                "priority",
            ]
        )

        priority = 10

        for row in rows:

            writer.writerow(
                [
                    "GEEKOM",
                    "collection",
                    row["slug"],
                    row["name"],
                    row["url"],
                    "true",
                    priority,
                ]
            )

            priority += 10


def main():

    print("=" * 60)
    print("🔎 GEEKOM ROOT DISCOVERY")
    print("=" * 60)

    discovered = {}

    roots = load_roots()

    for root in roots:

        base = root["url"].rstrip("/")

        collections = discover(base)

        for path in collections:

            slug = path.split("/")[-1]

            discovered[slug] = {
                "slug": slug,
                "name": slug_to_name(slug),
                "url": f"https://geekom.jp{path}",
            }

    rows = sorted(discovered.values(), key=lambda x: x["slug"])

    save(rows)

    print()
    print(f"✅ {len(rows)} collections discovered")
    print(f"📄 {OUTPUT_TSV}")


if __name__ == "__main__":
    main()