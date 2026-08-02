#!/usr/bin/env python3
"""
==============================================================================
SHIN CORE LINX

LAVIE Browser Reality Fetch

Research Runtime

Seed TSV
    ↓
Playwright
    ↓
JavaScript Execution
    ↓
Reality HTML
    ↓
AcquisitionDocument

Purpose

Validate Browser Acquire Runtime.

This Runtime intentionally does NOT use requests.

Reality First
==============================================================================
"""

from __future__ import annotations

import csv
import os
import sys
from pathlib import Path

from dotenv import load_dotenv

# ==============================================================================
# Django Bootstrap
# ==============================================================================

#
# /usr/src/app
#

DJANGO_DIR = Path(__file__).resolve().parents[4]

sys.path.insert(
    0,
    str(DJANGO_DIR),
)

#
# Same as manage.py
#

load_dotenv(
    DJANGO_DIR / ".env",
)

os.environ.setdefault(
    "DJANGO_SETTINGS_MODULE",
    "tiper_api.settings",
)

import django

django.setup()

# ==============================================================================
# Imports
# ==============================================================================

from playwright.sync_api import sync_playwright

from api.models.acquisition_document import AcquisitionDocument

from acquisition.sources.scraping.lavie.settings import (
    SEED_TSV,
    SITE_NAME,
)

# ==============================================================================
# Seed
# ==============================================================================


def load_seeds():

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
# Save
# ==============================================================================


def save_document(
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

def fetch_browser():

    seeds = load_seeds()

    print("=" * 70)
    print(f"🌐 {SITE_NAME} PLAYWRIGHT REALITY FETCH")
    print("=" * 70)
    print(f"Target : {len(seeds)}")
    print("=" * 70)

    success = 0
    failed = 0

    #
    # Browser Results
    #

    results = []

    with sync_playwright() as p:

        browser = p.chromium.launch(
            headless=True,
        )

        page = browser.new_page()

        for index, row in enumerate(
            seeds,
            start=1,
        ):

            slug = row["slug"]
            category = row["category"]
            url = row["url"]

            print(f"[{index}/{len(seeds)}] {category}")

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

                #
                # Save Later
                #

                results.append(
                    {
                        "slug": slug,
                        "url": url,
                        "html": html,
                    }
                )

                print(f"  HTML     : {len(html):,} chars")

                print(
                    f"  Products : {'YES' if 'dlp-products-card' in html else 'NO'}"
                )

                success += 1

            except Exception as e:

                failed += 1

                print("  ERROR")
                print(f"  {e}")

            print()

        browser.close()

    #
    # Persist
    #

    print("=" * 70)
    print("SAVE DOCUMENT")
    print("=" * 70)

    for item in results:

        document, created = save_document(

            slug=item["slug"],
            url=item["url"],
            html=item["html"],
        )

        print(
            f"{item['slug']} : {'CREATED' if created else 'UPDATED'}"
        )

    print("=" * 70)
    print("RESULT")
    print("=" * 70)
    print(f"SUCCESS : {success}")
    print(f"FAILED  : {failed}")
    print("=" * 70)


# ==============================================================================
# Entry Point
# ==============================================================================


def main():

    fetch_browser()


if __name__ == "__main__":
    main()