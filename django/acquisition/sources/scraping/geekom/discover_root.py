#!/usr/bin/env python3
"""
GEEKOM Collection Discovery Runtime

Discover valid Collection URLs from Root Reality.
"""

from __future__ import annotations

import csv
import re

import requests
from bs4 import BeautifulSoup

from .settings import (
    BASE_URL,
    TIMEOUT,
    USER_AGENT,
    ROOT_TSV,
    COLLECTIONS_TSV,
)

HEADERS = {
    "User-Agent": USER_AGENT,
}


def load_roots() -> list[dict[str, str]]:
    """Load enabled root sources."""

    with ROOT_TSV.open(
        "r",
        encoding="utf-8",
        newline="",
    ) as f:

        return [
            row
            for row in csv.DictReader(f, delimiter="\t")
            if (
                row["source_type"] == "root"
                and row["enabled"].lower() == "true"
            )
        ]


def fetch_html(url: str) -> str:
    """Fetch HTML."""

    response = requests.get(
        url,
        headers=HEADERS,
        timeout=TIMEOUT,
    )

    response.raise_for_status()

    return response.text


def extract_collections(html: str) -> list[str]:
    """Extract collection paths from HTML."""

    soup = BeautifulSoup(html, "html.parser")

    paths = {
        href
        for a in soup.find_all("a", href=True)
        if (
            (href := a["href"].split("?")[0].rstrip("/")).startswith("/collections/")
            and href not in {
                "/collections",
                "/collections/all",
            }
        )
    }

    paths.update(
        f"/collections/{slug}"
        for slug in re.findall(
            r"/collections/([A-Za-z0-9_-]+)",
            html,
        )
        if slug != "all"
    )

    return sorted(paths)


def validate_collections(paths: list[str]) -> list[str]:
    """Keep only valid collections."""

    valid = []

    for path in paths:

        url = f"{BASE_URL}{path}"

        try:

            response = requests.get(
                url,
                headers=HEADERS,
                timeout=TIMEOUT,
                allow_redirects=True,
            )

            if response.status_code != 200:
                continue

            final_path = response.url.replace(BASE_URL, "").rstrip("/")

            if not final_path.startswith("/collections/"):
                continue

            if final_path in {
                "/collections",
                "/collections/all",
            }:
                continue

            valid.append(final_path)

        except Exception:

            continue

    return sorted(set(valid))


def slug_to_name(slug: str) -> str:
    """Convert slug into display name."""

    return slug.replace("-", " ").title()


def save(rows: list[dict[str, str]]) -> None:
    """Save collections."""

    with COLLECTIONS_TSV.open(
        "w",
        encoding="utf-8",
        newline="",
    ) as f:

        writer = csv.writer(
            f,
            delimiter="\t",
        )

        writer.writerow([
            "maker",
            "source_type",
            "slug",
            "name",
            "url",
            "enabled",
            "priority",
        ])

        for priority, row in enumerate(
            rows,
            start=10,
        ):

            writer.writerow([
                "GEEKOM",
                "collection",
                row["slug"],
                row["name"],
                row["url"],
                "true",
                priority * 10,
            ])


def main() -> None:

    print("=" * 60)
    print("🔎 GEEKOM ROOT DISCOVERY")
    print("=" * 60)

    discovered: dict[str, dict[str, str]] = {}

    for root in load_roots():

        print(f"🌐 {root['url']}")

        html = fetch_html(
            root["url"].rstrip("/")
        )

        candidates = extract_collections(html)

        print(f"Candidates : {len(candidates)}")

        collections = validate_collections(
            candidates
        )

        print(f"Valid      : {len(collections)}")
        print()

        for path in collections:

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

    print("=" * 60)
    print(f"✅ {len(rows)} collections discovered")
    print(f"📄 {COLLECTIONS_TSV}")
    print("=" * 60)


if __name__ == "__main__":
    main()