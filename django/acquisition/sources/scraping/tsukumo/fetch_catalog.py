#!/usr/bin/env python3
"""
==============================================================================
SHIN CORE LINX

TSUKUMO Catalog Fetch
==============================================================================
"""

from __future__ import annotations

import csv
import math
import time

from playwright.sync_api import sync_playwright

from api.models.acquisition_document import AcquisitionDocument

from .settings import (
    CATALOG_TSV,
    SITE_NAME,
    USER_AGENT,
    TIMEOUT,
)


# ==============================================================================
# Catalog
# ==============================================================================

def load_catalog() -> list[dict]:

    with CATALOG_TSV.open(
        "r",
        encoding="utf-8",
        newline="",
    ) as fp:

        return list(
            csv.DictReader(
                fp,
                delimiter="\t",
            )
        )


# ==============================================================================
# Document Key
# ==============================================================================

def build_document_key(
    category: str,
    maker: str,
) -> str:

    return (
        f"{category}_{maker}"
        .lower()
        .replace(" ", "_")
    )


# ==============================================================================
# Cache
# ==============================================================================

def exists(
    category: str,
    maker: str,
) -> bool:

    return AcquisitionDocument.objects.filter(

        source_type="scraping",

        source_name=SITE_NAME.lower(),

        document_type="catalog",

        document_key=build_document_key(

            category,
            maker,

        ),

    ).exists()


# ==============================================================================
# Save
# ==============================================================================

def save_catalog(
    *,
    category: str,
    maker: str,
    url: str,
    html: str,
) -> tuple[AcquisitionDocument, bool]:

    document, created = AcquisitionDocument.objects.update_or_create(

        source_type="scraping",

        source_name=SITE_NAME.lower(),

        document_type="catalog",

        document_key=build_document_key(

            category,
            maker,

        ),

        defaults={

            "source_url": url,

            "content_type": "text/html",

            "content": html,

        },

    )

    return document, created


# ==============================================================================
# Page Count
# ==============================================================================

def detect_total_pages(
    page,
) -> int:

    #
    # 例
    #
    # 103件中 1 - 24件
    #

    body = page.locator(
        "body",
    ).inner_text()

    import re

    m = re.search(

        r"(\d+)\s*件中.*?(\d+)\s*-\s*(\d+)",

        body,

    )

    if not m:

        return 1

    total = int(
        m.group(1),
    )

    per_page = int(
        m.group(3),
    )

    if per_page <= 0:

        return 1

    return math.ceil(

        total / per_page,

    )
# ==============================================================================
# Page URL
# ==============================================================================

def build_page_url(
    url: str,
    page_no: int,
) -> str:

    if page_no <= 1:
        return url

    #
    # Reality
    #
    # Page 1
    # https://shop.tsukumo.co.jp/search/c10/?maker_id[]=7274...
    #
    # Page 2
    # https://shop.tsukumo.co.jp/search/c10/p2/?maker_id[]=7274...
    #

    head, _, query = url.partition("?")

    page_url = f"{head.rstrip('/')}/p{page_no}/"

    if query:
        page_url += f"?{query}"

    return page_url

# ==============================================================================
# Runtime
# ==============================================================================

def fetch_catalog(
    *,
    force: bool = False,
) -> None:

    started = time.perf_counter()

    catalog = load_catalog()

    print("=" * 70)
    print(f"🌐 {SITE_NAME} CATALOG FETCH")
    print("=" * 70)
    print(f"Target : {len(catalog)}")
    print("=" * 70)

    success: list[str] = []
    failed: list[tuple[str, str]] = []
    results: list[dict] = []

    #
    # Target Selection
    #

    targets: list[dict] = []

    for row in catalog:

        category = row["category"]
        maker = row["maker"]

        document_key = build_document_key(
            category,
            maker,
        )

        if (
            not force
            and exists(
                category,
                maker,
            )
        ):

            success.append(
                document_key,
            )

            print(
                f"[CACHE] {document_key}"
            )

            continue

        targets.append(
            row,
        )

    #
    # Browser Runtime
    #

    with sync_playwright() as p:

        browser = p.chromium.launch(
            headless=True,
        )

        try:

            page = browser.new_page(

                user_agent=USER_AGENT,

            )

            page.set_default_timeout(
                TIMEOUT * 1000,
            )

            for index, row in enumerate(

                targets,

                start=1,

            ):
                category = row["category"]
                maker = row["maker"]
                maker_id = row["maker_id"]
                url = row["url"]

                document_key = build_document_key(

                    category,

                    maker,

                )

                print(

                    f"[{index}/{len(targets)}] "

                    f"{category} : {maker}"

                )

                try:

                    #
                    # First Page
                    #

                    page.goto(

                        url,

                        wait_until="domcontentloaded",

                    )

                    page.wait_for_load_state(

                        "networkidle",

                    )

                    total_pages = detect_total_pages(

                        page,

                    )

                    print(

                        f"  Pages : {total_pages}"

                    )

                    html_parts: list[str] = []

                    #
                    # All Pages
                    #

                    for page_no in range(

                        1,

                        total_pages + 1,

                    ):

                        page_url = build_page_url(

                            url,

                            page_no,

                        )

                        print(

                            f"    Page {page_no}/{total_pages}"

                        )

                        page.goto(

                            page_url,

                            wait_until="domcontentloaded",

                        )

                        page.wait_for_load_state(

                            "networkidle",

                        )

                        html_parts.append(

                            page.content(),

                        )
                        
                    html = "\n".join(

                        html_parts,

                    )

                    results.append(

                        {

                            "category": category,

                            "maker": maker,

                            "maker_id": maker_id,

                            "url": url,

                            "html": html,

                        }

                    )

                    success.append(

                        document_key,

                    )

                    print(

                        f"  HTML : {len(html):,} chars"

                    )

                except Exception as e:

                    failed.append(

                        (

                            document_key,

                            str(e),

                        )

                    )

                    print(
                        "  Status : ERROR"
                    )

                    print(
                        f"  Reason : {e}"
                    )

                print()

        finally:

            browser.close()

    # --------------------------------------------------------------------------
    # Save AcquisitionDocument
    # --------------------------------------------------------------------------

    print("=" * 70)
    print("SAVE DOCUMENT")
    print("=" * 70)

    for item in results:

        _, created = save_catalog(

            category=item["category"],

            maker=item["maker"],

            url=item["url"],

            html=item["html"],

        )

        print(

            f"{build_document_key(item['category'], item['maker'])} : "

            f"{'CREATED' if created else 'UPDATED'}"

        )

    elapsed = time.perf_counter() - started

    print("=" * 70)
    print("RESULT")
    print("=" * 70)

    print(f"SUCCESS : {len(success)}")
    print(f"FAILED  : {len(failed)}")
    print(f"ELAPSED : {elapsed:.2f} sec")

    print("=" * 70)

# ==============================================================================
# Entry Point
# ==============================================================================

def main(
    *,
    force: bool = False,
) -> None:

    fetch_catalog(
        force=force,
    )


if __name__ == "__main__":

    main()