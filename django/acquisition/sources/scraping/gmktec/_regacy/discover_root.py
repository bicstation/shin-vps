#!/usr/bin/env python3
"""
FILE:
acquisition/sources/scraping/gmktec/discover_root.py

SHIN CORE LINX

GMKtec Collection Discovery Runtime

Root Reality
    ↓
Collection Discovery
    ↓
AcquisitionDocument

Responsibilities

- Load Root Reality
- Discover Collection URLs
- Save Collection Discovery Reality
- Register discovered Collections as AcquisitionDocument

NOT

- HTTP Acquisition
- Product Observation
- Product Parsing
- Mapping
- Integration
- Semantic Processing

Reality First
Observation First
"""

from __future__ import annotations

import csv

from bs4 import BeautifulSoup

from api.models import AcquisitionDocument

from .settings import (
    BASE_URL,
    ROOT_TSV,
    SITE_NAME,
)


# ==========================================================
# Root Runtime
# ==========================================================

def load_roots() -> list[dict[str, str]]:
    """
    Load enabled Root Seeds.
    """

    with ROOT_TSV.open(
        "r",
        encoding="utf-8",
        newline="",
    ) as f:

        return [
            row
            for row in csv.DictReader(
                f,
                delimiter="\t",
            )
            if (
                row["source_type"] == "root"
                and row["enabled"].lower() == "true"
            )
        ]


# ==========================================================
# Root Reality
# ==========================================================

def load_root_html(
    slug: str,
) -> str | None:
    """
    Load cached Root HTML from AcquisitionDocument.
    """

    document = (
        AcquisitionDocument.objects.filter(
            source_name=SITE_NAME,
            document_type="root",
            document_key=slug,
        ).first()
    )

    if document is None:
        return None

    return document.content


# ==========================================================
# Collection Discovery
# ==========================================================

def extract_collections(
    html: str,
) -> list[str]:
    """
    Extract Collection paths from Root HTML.

    Only /collections/* paths are considered.

    Excluded:

        /collections
        /collections/all
    """

    soup = BeautifulSoup(
        html,
        "html.parser",
    )

    paths = {
        href
        for a in soup.find_all(
            "a",
            href=True,
        )
        if (
            (
                href := a["href"]
                .split("?")[0]
                .rstrip("/")
            ).startswith(
                "/collections/"
            )
            and href not in {
                "/collections",
                "/collections/all",
            }
        )
    }

    return sorted(
        paths,
    )


# ==========================================================
# Collection Name
# ==========================================================

def slug_to_name(
    slug: str,
) -> str:
    """
    Convert Collection slug
    into display name.
    """

    return (
        slug
        .replace(
            "-",
            " ",
        )
        .title()
    )


# ==========================================================
# Collection Document
# ==========================================================

def save_collection(
    *,
    slug: str,
    name: str,
    url: str,
) -> None:
    """
    Register one discovered Collection
    as AcquisitionDocument.

    Discovery does not fetch Collection HTML.

    Therefore:

        content = ""

    The actual Collection HTML is acquired
    by the next Fetch Runtime.
    """

    AcquisitionDocument.objects.update_or_create(
        source_type="scraping",
        source_name=SITE_NAME,
        document_type="collection",
        document_key=slug,
        defaults={
            "source_url": url,
            "content_type": "text/html",
            "content": "",
        },
    )

    print(
        f"  DISCOVERED : "
        f"{name}"
    )

    print(
        f"  URL        : "
        f"{url}"
    )


# ==========================================================
# Runtime
# ==========================================================

def main() -> None:
    """
    Execute GMKtec Root Discovery Runtime.

    Root AcquisitionDocument
            ↓
    Root HTML
            ↓
    Collection Discovery
            ↓
    Collection AcquisitionDocument
    """

    print(
        "=" * 60
    )

    print(
        "🔎 GMKTEC ROOT DISCOVERY"
    )

    print(
        "=" * 60
    )

    discovered: dict[
        str,
        dict[str, str],
    ] = {}

    # ======================================================
    # Root Seeds
    # ======================================================

    for root in load_roots():

        print(
            f"🌐 {root['url']}"
        )

        # --------------------------------------------------
        # Load Root Reality
        # --------------------------------------------------

        html = load_root_html(
            root["slug"],
        )

        if not html:

            print(
                f"❌ Root HTML not found : "
                f"{root['slug']}"
            )

            continue

        # --------------------------------------------------
        # Observe Collection Candidates
        # --------------------------------------------------

        collections = extract_collections(
            html,
        )

        print(
            f"Candidates : "
            f"{len(collections)}"
        )

        print(
            f"Valid      : "
            f"{len(collections)}"
        )

        print()

        # --------------------------------------------------
        # Build Discovery Runtime
        # --------------------------------------------------

        for path in collections:

            slug = path.split(
                "/"
            )[-1]

            discovered[slug] = {
                "slug": slug,
                "name": slug_to_name(
                    slug,
                ),
                "url": (
                    f"{BASE_URL}{path}"
                ),
            }

    # ======================================================
    # Sort
    # ======================================================

    rows = sorted(
        discovered.values(),
        key=lambda row: row["slug"],
    )

    # ======================================================
    # Save Discovery Reality
    # ======================================================

    for row in rows:

        save_collection(
            slug=row["slug"],
            name=row["name"],
            url=row["url"],
        )

    # ======================================================
    # Result
    # ======================================================

    print(
        "=" * 60
    )

    print(
        f"✅ {len(rows)} collections discovered"
    )

    print(
        "📦 Discovery Reality : "
        "AcquisitionDocument"
    )

    print(
        "=" * 60
    )


# ==========================================================
# Standalone Execution
# ==========================================================

if __name__ == "__main__":
    main()