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

from playwright.sync_api import sync_playwright

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

def fetch_catalog_html(
    catalogs: list[dict],
) -> list[dict]:

    results: list[dict] = []

    with sync_playwright() as p:

        browser = p.chromium.launch(

            headless=True,

        )

        context = browser.new_context(

            user_agent=USER_AGENT,

            locale="ja-JP",

        )

        page = context.new_page()

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

            print(

                f"  URL   : {url}"

            )

            page.goto(

                url,

                wait_until="domcontentloaded",

                timeout=TIMEOUT * 1000,

            )

            page.wait_for_timeout(

                3000,

            )

            print(

                f"  Title : {page.title()}"

            )

            html = page.content()

            print(

                f"  HTML  : {len(html):,} chars"

            )

            if "Cloudflare" in page.title():

                print(

                    "  ⚠ Cloudflare Detected"

                )

            results.append(

                {

                    "slug": slug,

                    "url": url,

                    "html": html,

                }

            )

        context.close()

        browser.close()

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

        print("Reality Mode : IMPORT")

        print("Fetch Runtime Skipped")

        print("=" * 70)

        return

    # --------------------------------------------------------------------------
    # Fetch Runtime
    # --------------------------------------------------------------------------

    print("Reality Mode : EXPORT")

    print()

    catalogs = load_catalogs()

    print(

        f"Catalogs : {len(catalogs)}"

    )

    print()

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