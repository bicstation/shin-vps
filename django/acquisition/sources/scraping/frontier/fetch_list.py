#!/usr/bin/env python3
"""
==============================================================================
FRONTIER Reality Seed Fetch

Acquire Runtime

Seed TSV
    ↓
Fetch HTML
    ↓
Save AcquisitionDocument
==============================================================================
"""

from __future__ import annotations

import csv

import requests

from api.models.acquisition_document import AcquisitionDocument

from .settings import (
    SEED_TSV,
    USER_AGENT,
    TIMEOUT,
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
    slug: str,
    url: str,
    response: requests.Response,
):

    AcquisitionDocument.objects.update_or_create(
        source_type="scraping",
        source_name=SITE_NAME.lower(),
        document_type="seed",
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


# ==============================================================================
# Runtime
# ==============================================================================

def fetch_seed(
    force: bool = False,
):

    seeds = load_seeds()

    print("=" * 70)
    print(f"🌐 {SITE_NAME} REALITY SEED FETCH")
    print("=" * 70)
    print(f"Target : {len(seeds)}")
    print("=" * 70)

    success = []
    failed = []

    with requests.Session() as session:

        session.headers.update({
            "User-Agent": USER_AGENT,
        })

        for index, row in enumerate(
            seeds,
            start=1,
        ):

            slug = row["slug"]
            category = row["category"]
            url = row["url"]

            print(
                f"[{index}/{len(seeds)}] {category}"
            )

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

                save_document(
                    slug=slug,
                    url=url,
                    response=response,
                )

                success.append(slug)

                print("  Status :", response.status_code)
                print(f"  Size   : {len(response.content):,} bytes")

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

    fetch_seed(
        force=force,
    )


if __name__ == "__main__":
    main()