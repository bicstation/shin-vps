#!/usr/bin/env python3
"""
==============================================================================
SHIN CORE LINX

ARK Fetch Catalog Runtime

Responsibilities

- Load Reality Catalog
- Fetch Catalog HTML
- Persist Catalog AcquisitionDocument

Not Responsibilities

- Catalog Discovery
- Card Discovery
- Observation
- Formatter
- Mapper
- Integration

==============================================================================
"""

from __future__ import annotations

import csv

import requests

from api.models import AcquisitionDocument

from .settings import (
    SITE_NAME,
    SOURCE_TYPE,
    USER_AGENT,
    TIMEOUT,
    CATALOG_FILE,
)


# ==============================================================================
# Runtime
# ==============================================================================

DOCUMENT_TYPE = "catalog"


# ==============================================================================
# Catalog
# ==============================================================================

def load_catalogs() -> list[dict]:

    with open(
        CATALOG_FILE,
        encoding="utf-8",
        newline="",
    ) as fp:

        reader = csv.DictReader(
            fp,
            delimiter="\t",
        )

        return list(reader)


# ==============================================================================
# Runtime
# ==============================================================================

def main(
    *,
    method: str = "default",
    mid: str | None = None,
    list_only: bool = False,
    force: bool = False,
) -> None:

    print()

    print("=" * 70)

    print("🌐 ARK CATALOG FETCH")

    print("=" * 70)

    catalogs = load_catalogs()

    print(f"Catalogs : {len(catalogs)}")

    print()

    headers = {

        "User-Agent": USER_AGENT,

    }

    for index, catalog in enumerate(

        catalogs,

        start=1,

    ):

        category = catalog["category"]

        slug = catalog["slug"]

        url = catalog["url"]

        print(

            f"[{index}/{len(catalogs)}] "

            f"{category}"

        )

        response = requests.get(

            url,

            headers=headers,

            timeout=TIMEOUT,

        )

        response.raise_for_status()

        html = response.text

        AcquisitionDocument.objects.update_or_create(

            source_type=SOURCE_TYPE,

            source_name=SITE_NAME,

            document_type=DOCUMENT_TYPE,

            document_key=slug,

            defaults={

                "source_url": url,

                "content_type": "text/html",

                "content": html,

            },

        )

        print(

            f"  HTML : {len(html):,} chars"

        )

    print()

    print("=" * 70)

    print("✅ CATALOG FETCH COMPLETE")

    print("=" * 70)


# ==============================================================================
# Entry Point
# ==============================================================================

if __name__ == "__main__":

    main()