#!/usr/bin/env python3
"""
FILE:
acquisition/sources/scraping/gmktec/fetch_list.py

SHIN CORE LINX

GMKtec Collection Fetch Runtime

AcquisitionDocument
    collection
        ↓
HTTP Acquisition
        ↓
AcquisitionDocument
    collection

Responsibilities

- Load discovered Collection Reality
- Fetch Collection HTML
- Save Collection HTML to AcquisitionDocument

NOT

- HTML Parsing
- Product Observation
- Product Mapping
- Product Building
- Integration
- Semantic Processing

Reality First
Observation First
"""

from __future__ import annotations

import random
import time

from curl_cffi import requests

from api.models.acquisition_document import (
    AcquisitionDocument,
)

from .settings import (
    BASE_URL,
    SITE_NAME,
    TIMEOUT,
    USER_AGENT,
)


# ==========================================================
# Collection Sources
# ==========================================================

def load_collections() -> list[dict[str, str]]:
    """
    Load discovered Collections
    from AcquisitionDocument.
    """

    documents = (
        AcquisitionDocument.objects.filter(
            source_type="scraping",
            source_name=SITE_NAME,
            document_type="collection",
        )
        .order_by("document_key")
    )

    rows = []

    for document in documents:

        rows.append(
            {
                "slug": document.document_key,
                "url": document.source_url,
            }
        )

    return rows


# ==========================================================
# Runtime
# ==========================================================

def fetch(
    force: bool = False,
) -> None:
    """
    Fetch Collection HTML.

    Discovery Reality
        ↓
    Collection HTTP Acquisition
        ↓
    AcquisitionDocument
    """

    rows = load_collections()

    print(
        "=" * 60
    )

    print(
        "🌐 GMKTEC COLLECTION FETCH"
    )

    print(
        "=" * 60
    )

    print(
        f"Target : "
        f"{len(rows)} Collections"
    )

    print(
        "=" * 60
    )

    # ======================================================
    # Chrome Session
    # ======================================================

    session = requests.Session(
        impersonate="chrome",
    )

    session.headers.update(
        {
            "User-Agent": USER_AGENT,
            "Referer": BASE_URL,
        }
    )

    success = []

    failed = []

    # ======================================================
    # Collection Fetch
    # ======================================================

    for index, row in enumerate(
        rows,
        start=1,
    ):

        slug = row["slug"]

        url = row["url"]

        print(
            f"[{index}/{len(rows)}] "
            f"{slug}"
        )

        # ==================================================
        # Cache Check
        # ==================================================

        if not force:

            exists = (
                AcquisitionDocument.objects.filter(
                    source_type="scraping",
                    source_name=SITE_NAME,
                    document_type="collection",
                    document_key=slug,
                )
                .exclude(
                    content="",
                )
                .exists()
            )

            if exists:

                success.append(
                    slug
                )

                print(
                    "  Cache  : HIT"
                )

                print()

                continue

        try:

            # ==================================================
            # Gentle Delay
            # ==================================================

            if index > 1:

                wait = random.uniform(
                    8.0,
                    15.0,
                )

                print(
                    f"  😴 Sleep "
                    f"{wait:.1f}s"
                )

                time.sleep(
                    wait
                )

            response = None

            # ==================================================
            # Retry
            # ==================================================

            for attempt in range(3):

                response = session.get(
                    url,
                    timeout=TIMEOUT,
                    allow_redirects=True,
                )

                print(
                    f"  Status : "
                    f"{response.status_code}"
                )

                print(
                    f"  Type   : "
                    f"{response.headers.get('Content-Type', '')}"
                )

                if response.status_code == 200:

                    break

                if response.status_code == 429:

                    wait = (
                        10 * (attempt + 1)
                    )

                    print(
                        f"  ⏳ 429 Retry "
                        f"({wait}s)"
                    )

                    time.sleep(
                        wait
                    )

                    continue

                response.raise_for_status()

            # ==================================================
            # HTTP Validation
            # ==================================================

            response.raise_for_status()

            # ==================================================
            # Save Collection Reality
            # ==================================================

            AcquisitionDocument.objects.update_or_create(

                source_type="scraping",

                source_name=SITE_NAME,

                document_type="collection",

                document_key=slug,

                defaults={

                    "source_url": url,

                    "content_type": (
                        response.headers.get(
                            "Content-Type",
                            "text/html",
                        )
                    ),

                    "content": response.text,

                },
            )

            success.append(
                slug
            )

            print(
                "  Cache  : MISS"
            )

            print(
                f"  ✓ {response.status_code}"
            )

            print(
                f"  {len(response.content):,} bytes"
            )

        # ==================================================
        # HTTP Error
        # ==================================================

        except requests.HTTPError as e:

            response = e.response

            if response is not None:

                print(
                    f"  Status : "
                    f"{response.status_code}"
                )

                print(
                    "  Headers"
                )

                for key, value in (
                    response.headers.items()
                ):

                    print(
                        f"    {key}: "
                        f"{value}"
                    )

                print()

                print(
                    response.text[:1000]
                )

            else:

                print(
                    f"  ERROR : "
                    f"{e}"
                )

            failed.append(
                (
                    slug,
                    str(e),
                )
            )

        # ==================================================
        # Runtime Error
        # ==================================================

        except Exception as e:

            failed.append(
                (
                    slug,
                    str(e),
                )
            )

            print(
                f"  ERROR : "
                f"{e}"
            )

        print()

    # ======================================================
    # Result
    # ======================================================

    print(
        "=" * 60
    )

    print(
        f"SUCCESS : "
        f"{len(success)}"
    )

    print(
        f"FAILED  : "
        f"{len(failed)}"
    )

    print(
        "=" * 60
    )


# ==========================================================
# Entry Point
# ==========================================================

def main(
    force: bool = False,
) -> None:

    fetch(
        force=force,
    )


# ==========================================================
# Standalone Execution
# ==========================================================

if __name__ == "__main__":
    main()