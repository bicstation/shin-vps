#!/usr/bin/env python3
"""
==============================================================================
SHIN CORE LINX

ARK Fetch Catalog Runtime

Responsibilities

- Load Reality Catalog
- Discover Pagination
- Fetch All Catalog Pages
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
import re

import requests
from bs4 import BeautifulSoup

from api.models import AcquisitionDocument

from .settings import (
    SITE_NAME,
    SOURCE_TYPE,
    USER_AGENT,
    TIMEOUT,
    CATALOG_FILE,
    REALITY_MODE,
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
# Fetch
# ==============================================================================

def fetch_html(
    session: requests.Session,
    url: str,
) -> tuple[str, BeautifulSoup]:

    response = session.get(

        url,

        timeout=TIMEOUT,

    )

    html = response.text

    soup = BeautifulSoup(

        html,

        "html.parser",

    )

    return html, soup


# ==============================================================================
# Pagination
# ==============================================================================

def discover_pages(
    soup: BeautifulSoup,
) -> int:

    pages = {1}

    for link in soup.select(

        "a[href]",

    ):

        href = link.get(

            "href",

            "",

        )

        match = re.search(

            r"[?&]page=(\d+)",

            href,

        )

        if match:

            pages.add(

                int(

                    match.group(1)

                )

            )

    return max(pages)


# ==============================================================================
# Fetch Runtime
# ==============================================================================

def fetch_catalog_html(
    catalogs: list[dict],
) -> list[dict]:

    results: list[dict] = []

    session = requests.Session()

    session.headers.update(

        {

            "User-Agent": USER_AGENT,

        }

    )

    for catalog in catalogs:

        category = catalog["category"]

        url = catalog["url"]

        print(

            f"Category : {category}"

        )

        print(

            f"Entry URL: {url}"

        )

        print()

        # ----------------------------------------------------------------------
        # First Page
        # ----------------------------------------------------------------------

        html, soup = fetch_html(

            session,

            url,

        )

        title = (

            soup.title.get_text(

                strip=True,

            )

            if soup.title

            else "(No Title)"

        )

        page_count = discover_pages(

            soup,

        )

        print(

            f"Title : {title}"

        )

        print(

            f"Pages : {page_count}"

        )

        print()

        # ----------------------------------------------------------------------
        # Fetch All Pages
        # ----------------------------------------------------------------------

        for page in range(

            1,

            page_count + 1,

        ):

            if page == 1:

                page_url = url

            else:

                separator = "&" if "?" in url else "?"

                page_url = (

                    f"{url}{separator}page={page}"

                )

            html, soup = fetch_html(

                session,

                page_url,

            )

            title = (

                soup.title.get_text(

                    strip=True,

                )

                if soup.title

                else "(No Title)"

            )

            print(

                f"[{page}/{page_count}]"

            )

            print(

                f"  URL    : {page_url}"

            )

            print(

                f"  Title  : {title}"

            )

            print(

                f"  HTML   : {len(html):,} chars"

            )

            if (

                "Cloudflare" in title

                or "Attention Required" in title

            ):

                print(

                    "  ⚠ Cloudflare Detected"

                )

            results.append(

                {

                    "slug": f"page{page}",

                    "url": page_url,

                    "html": html,

                }

            )

            print()

    return results


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

    # --------------------------------------------------------------------------
    # Reality Mode
    # --------------------------------------------------------------------------

    if REALITY_MODE == "import":

        print(

            "Reality Mode : IMPORT"

        )

        print(

            "Fetch Runtime Skipped"

        )

        print("=" * 70)

        return

    print(

        "Reality Mode : EXPORT"

    )

    print()

    catalogs = load_catalogs()

    results = fetch_catalog_html(

        catalogs,

    )

    for result in results:

        AcquisitionDocument.objects.update_or_create(

            source_type=SOURCE_TYPE,

            source_name=SITE_NAME,

            document_type=DOCUMENT_TYPE,

            document_key=result["slug"],

            defaults={

                "source_url": result["url"],

                "content_type": "text/html",

                "content": result["html"],

            },

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