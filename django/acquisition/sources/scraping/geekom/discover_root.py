#!/usr/bin/env python3
"""
GEEKOM Collection Discovery Runtime

Discover valid Collection URLs from Root Reality.
"""

from __future__ import annotations

import csv

from bs4 import BeautifulSoup

from .settings import (
    BASE_URL,
    ROOT_TSV,
    COLLECTIONS_TSV,
)
from api.models import AcquisitionDocument


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


def load_root_html(slug: str) -> str | None:
    """Load cached Root HTML."""

    document = (
        AcquisitionDocument.objects.filter(
            source_name="geekom",
            document_type="root",
            document_key=slug,
        ).first()
    )

    if document is None:
        return None

    return document.content


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

    return sorted(paths)


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

        html = load_root_html(root["slug"])

        if not html:
            print(f"❌ Root HTML not found : {root['slug']}")
            continue

        collections = extract_collections(html)

        print(f"Candidates : {len(collections)}")
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