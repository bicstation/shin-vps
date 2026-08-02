#!/usr/bin/env python3
"""
==============================================================================
SHIN CORE LINX

LAVIE Reality Seed Fetch

Acquire Runtime V2

Seed TSV
    ↓
Playwright
    ↓
Reality HTML
    ↓
AcquisitionDocument

Reality First
==============================================================================
"""

from __future__ import annotations

import csv
import time

from playwright.sync_api import sync_playwright

from api.models.acquisition_document import AcquisitionDocument

from .settings import (
    SEED_TSV,
    SITE_NAME,
)


# ==============================================================================
# Seed
# ==============================================================================

def load_seeds() -> list[dict]:

    with SEED_TSV.open(
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
# Cache
# ==============================================================================

def exists(
    slug: str,
) -> bool:

    return AcquisitionDocument.objects.filter(

        source_type="scraping",

        source_name=SITE_NAME.lower(),

        document_type="seed",

        document_key=slug,

    ).exists()


# ==============================================================================
# Acquisition
# ==============================================================================

def save_document(
    *,
    slug: str,
    url: str,
    html: str,
):

    document, created = AcquisitionDocument.objects.update_or_create(

        source_type="scraping",

        source_name=SITE_NAME.lower(),

        document_type="seed",

        document_key=slug,

        defaults={

            "source_url": url,

            "content_type": "text/html",

            "content": html,

        },

    )

    return document, created


# ==============================================================================
# Runtime
# ==============================================================================

def fetch_seed(
    *,
    force: bool = False,
) -> None:

    started = time.perf_counter()

    seeds = load_seeds()

    print("=" * 70)
    print(f"🌐 {SITE_NAME} REALITY SEED FETCH")
    print("=" * 70)
    print(f"Target : {len(seeds)}")
    print("=" * 70)

    success: list[str] = []
    failed: list[tuple[str, str]] = []

    # --------------------------------------------------------------------------
    # Cache Runtime
    # --------------------------------------------------------------------------

    targets: list[dict] = []

    for row in seeds:

        slug = row["slug"]

        if not force and exists(slug):

            success.append(slug)

            print(f"[CACHE] {slug}")

            continue

        targets.append(row)

    # --------------------------------------------------------------------------
    # Acquire Runtime
    # --------------------------------------------------------------------------

    results: list[dict] = []

    with sync_playwright() as p:

        browser = p.chromium.launch(
            headless=True,
        )

        page = browser.new_page()

        for index, row in enumerate(
            targets,
            start=1,
        ):

            slug = row["slug"]
            category = row["category"]
            url = row["url"]

            print(f"[{index}/{len(targets)}] {category}")

            try:

                page.goto(
                    url,
                    wait_until="domcontentloaded",
                    timeout=60000,
                )

                page.wait_for_load_state(
                    "networkidle",
                )

                html = page.content()

                results.append(
                    {
                        "slug": slug,
                        "url": url,
                        "html": html,
                    }
                )

                success.append(slug)

                print(f"  HTML     : {len(html):,} chars")

                print(
                    f"  Products : {'YES' if 'dlp-products-card' in html else 'NO'}"
                )

            except Exception as e:

                failed.append(
                    (
                        slug,
                        str(e),
                    )
                )

                print("  Status : ERROR")
                print(f"  Reason : {e}")

            print()

        browser.close()

    # --------------------------------------------------------------------------
    # Persist Runtime
    # --------------------------------------------------------------------------

    print("=" * 70)
    print("SAVE DOCUMENT")
    print("=" * 70)

    for item in results:

        _, created = save_document(

            slug=item["slug"],

            url=item["url"],

            html=item["html"],

        )

        print(
            f"{item['slug']} : {'CREATED' if created else 'UPDATED'}"
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

    fetch_seed(

        force=force,

    )


if __name__ == "__main__":

    main()