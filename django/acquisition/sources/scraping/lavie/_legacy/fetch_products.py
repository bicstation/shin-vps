#!/usr/bin/env python3
"""
==============================================================================
SHIN CORE LINX

LAVIE Product Fetch

Acquire Runtime

model_list.tsv
        │
        ▼
Playwright
        │
        ▼
Reality Product HTML
        │
        ▼
AcquisitionDocument(product)

Reality First
==============================================================================
"""

from __future__ import annotations

import csv

from playwright.sync_api import sync_playwright

from api.models.acquisition_document import AcquisitionDocument

from .settings import (
    MODEL_LIST_TSV,
    SITE_NAME,
)

# ==============================================================================
# Model List
# ==============================================================================

def load_models():

    with MODEL_LIST_TSV.open(
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
    *,
    slug: str,
    url: str,
    html: str,
):

    document, created = AcquisitionDocument.objects.update_or_create(

        source_type="scraping",

        source_name=SITE_NAME.lower(),

        document_type="product",

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

def fetch_products(
    force: bool = False,
):

    models = load_models()
    
    cached = set(
        AcquisitionDocument.objects.filter(
            source_type="scraping",
            source_name=SITE_NAME.lower(),
            document_type="product",
        ).values_list(
            "document_key",
            flat=True,
        )
    )

    print("=" * 70)
    print(f"🌐 {SITE_NAME} PRODUCT FETCH")
    print("=" * 70)
    print(f"Target : {len(models)}")
    print("=" * 70)

    results = []
    success = []
    failed = []

    #
    # Playwright
    #

    with sync_playwright() as p:
        
        targets = [
            row for row in models
            if force or row["model_slug"] not in cached
        ]
        
        print(f"Target : {len(targets)}")

        browser = p.chromium.launch(
            headless=True,
        )

        page = browser.new_page()

        for index, row in enumerate(
            models,
            start=1,
        ):

            slug = row["model_slug"]
            url = row["url"]

            print(f"[{index}/{len(models)}] {slug}")
            
            if not force and slug in cached:

                success.append(slug)

                print("  Status : CACHE")
                print()

                continue

            try:
                page.goto(
                    url,
                    wait_until="load",
                    timeout=60000,
                )

                page.wait_for_timeout(
                    1000,
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

                print(
                    f"  HTML   : {len(html):,} chars"
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
    
    #
    # Persist
    #

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

    print("=" * 70)
    print("RESULT")
    print("=" * 70)
    print(f"SUCCESS : {len(success)}")
    print(f"FAILED  : {len(failed)}")
    print("=" * 70)


# ==============================================================================
# Entry Point
# ==============================================================================

def main(
    force: bool = False,
):

    fetch_products(
        force=force,
    )


if __name__ == "__main__":

    main()