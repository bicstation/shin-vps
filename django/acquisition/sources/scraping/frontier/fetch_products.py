#!/usr/bin/env python3
"""
==============================================================================
FRONTIER Product Fetch

Acquire Runtime

Model List
    ↓
Fetch Product HTML
    ↓
Save AcquisitionDocument
==============================================================================
"""

from __future__ import annotations

import csv

import requests

from api.models.acquisition_document import AcquisitionDocument

from .settings import (
    MODEL_LIST_TSV,
    USER_AGENT,
    TIMEOUT,
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
    ) as f:

        return list(
            csv.DictReader(
                f,
                delimiter="\t",
            )
        )


# ==============================================================================
# Cache
# ==============================================================================

def exists(slug: str) -> bool:

    return (
        AcquisitionDocument.objects
        .filter(
            source_type="scraping",
            source_name=SITE_NAME.lower(),
            document_type="product",
            document_key=slug,
        )
        .exists()
    )


# ==============================================================================
# Acquisition
# ==============================================================================

def save_document(
    slug: str,
    url: str,
    response: requests.Response,
):

    document, created = AcquisitionDocument.objects.update_or_create(
        source_type="scraping",
        source_name=SITE_NAME.lower(),
        document_type="product",
        document_key=slug,
        defaults={
            "source_url": url,
            "content_type": response.headers.get(
                "Content-Type",
                "text/html",
            ),
            "content": response.text,
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

    print("=" * 70)
    print(f"🌐 {SITE_NAME} PRODUCT FETCH")
    print("=" * 70)
    print(f"Target : {len(models)}")
    print("=" * 70)

    success = []
    failed = []

    with requests.Session() as session:

        session.headers.update({
            "User-Agent": USER_AGENT,
        })

        for index, row in enumerate(
            models,
            start=1,
        ):

            slug = row["slug"]
            url = row["url"]

            print(f"[{index}/{len(models)}] {slug}")

            #
            # Cache
            #

            if not force and exists(slug):

                success.append(slug)

                print("  Status : CACHE")
                print()

                continue

            #
            # Fetch
            #

            try:

                response = session.get(
                    url,
                    timeout=TIMEOUT,
                )

                response.raise_for_status()

                document, created = save_document(
                    slug=slug,
                    url=url,
                    response=response,
                )

                success.append(slug)

                print(f"  HTTP   : {response.status_code}")
                print(f"  Size   : {len(response.content):,} bytes")
                print(f"  Saved  : {'CREATED' if created else 'UPDATED'}")

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