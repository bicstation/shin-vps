#!/usr/bin/env python3
"""
FILE:
acquisition/sources/scraping/gmktec/fetch_product.py

SHIN CORE LINX

GMKtec Product Fetch Runtime

Product Discovery Reality
↓
Product URL
↓
HTTP Acquisition
↓
AcquisitionDocument
document_type = "product"

Responsibilities

- Load discovered Product Documents
- Fetch Product HTML
- Preserve Raw Product HTML
- Update AcquisitionDocument
- Skip already acquired Product Reality

NOT

- Product Parsing
- Product Observation
- Product Name Extraction
- Price Extraction
- Image Extraction
- Specification Extraction
- Mapping
- Integration
- Semantic Processing

Reality First
"""

from __future__ import annotations

import random
import time

from curl_cffi import requests

from api.models.acquisition_document import (
    AcquisitionDocument,
)

from .settings import (
    SITE_NAME,
    TIMEOUT,
    USER_AGENT,
)


# ==========================================================
# Product Reality
# ==========================================================

def load_products() -> list[dict[str, str]]:
    """
    Load Product Discovery Reality.

    Product URLs are stored in
    AcquisitionDocument.

    No TSV is used.
    """

    documents = (
        AcquisitionDocument.objects
        .filter(
            source_type="scraping",
            source_name=SITE_NAME,
            document_type="product",
        )
        .order_by(
            "document_key",
        )
    )

    return [
        {
            "slug": document.document_key,
            "url": document.source_url,
        }
        for document in documents
        if document.source_url
    ]


# ==========================================================
# HTTP Acquisition
# ==========================================================

def fetch(
    force: bool = False,
) -> None:
    """
    Fetch Product HTML.

    Product Discovery Reality
            ↓
        Product URL
            ↓
        HTTP Response
            ↓
    AcquisitionDocument

    Existing Product HTML is preserved
    and reused unless force=True.
    """

    products = load_products()

    print(
        "=" * 60
    )

    print(
        "🌐 GMKTEC PRODUCT FETCH"
    )

    print(
        "=" * 60
    )

    print(
        f"Target : {len(products)} Products"
    )

    print(
        "=" * 60
    )

    if not products:

        print(
            "⚠️ No Product Documents"
        )

        return

    # ======================================================
    # Chrome Session
    # ======================================================

    session = requests.Session(
        impersonate="chrome",
    )

    session.headers.update(
        {
            "User-Agent": USER_AGENT,
            "Referer": "https://jp.gmktec.com/",
        }
    )

    success: list[str] = []

    failed: list[
        tuple[str, str]
    ] = []

    skipped: list[str] = []

    # ======================================================
    # Product Loop
    # ======================================================

    for index, product in enumerate(
        products,
        start=1,
    ):

        slug = product["slug"]
        url = product["url"]

        print(
            f"[{index}/{len(products)}] {slug}"
        )

        print(
            f"URL    : {url}"
        )

        # ==================================================
        # Cache Check
        # ==================================================

        if not force:

            document = (
                AcquisitionDocument.objects
                .filter(
                    source_type="scraping",
                    source_name=SITE_NAME,
                    document_type="product",
                    document_key=slug,
                )
                .first()
            )

            if (
                document is not None
                and document.content
            ):

                skipped.append(
                    slug
                )

                success.append(
                    slug
                )

                print(
                    "Cache  : HIT"
                )

                print(
                    "⏭️ SKIP : Product HTML already acquired"
                )

                print()

                continue

        # ==================================================
        # HTTP Acquisition
        # ==================================================

        try:

            # ==================================================
            # Gentle Delay
            # ==================================================

            if index > 1:

                wait = random.uniform(
                    20.0,
                    30.0,
                )

                print(
                    f"😴 Sleep {wait:.1f}s"
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
                    f"Status : "
                    f"{response.status_code}"
                )

                print(
                    f"Type   : "
                    f"{response.headers.get('Content-Type')}"
                )

                if response.status_code == 200:

                    break

                if response.status_code == 429:

                    wait = 20 * (
                        attempt + 1
                    )

                    print(
                        f"⏳ 429 Retry "
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
            # Preserve Product Reality
            # ==================================================

            AcquisitionDocument.objects.update_or_create(
                source_type="scraping",
                source_name=SITE_NAME,
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

            success.append(
                slug
            )

            print(
                "Cache  : MISS"
            )

            print(
                f"✓ {response.status_code}"
            )

            print(
                f"Size   : "
                f"{len(response.content):,} bytes"
            )

        except requests.HTTPError as e:

            response = e.response

            if response is not None:

                print(
                    f"Status : "
                    f"{response.status_code}"
                )

                print(
                    f"URL    : "
                    f"{url}"
                )

            print(
                f"ERROR  : {e}"
            )

            failed.append(
                (
                    slug,
                    str(e),
                )
            )

        except Exception as e:

            print(
                f"ERROR  : {e}"
            )

            failed.append(
                (
                    slug,
                    str(e),
                )
            )

        print()

    # ======================================================
    # Result
    # ======================================================

    print(
        "=" * 60
    )

    print(
        f"SUCCESS : {len(success)}"
    )

    print(
        f"SKIPPED : {len(skipped)}"
    )

    print(
        f"FAILED  : {len(failed)}"
    )

    print(
        "=" * 60
    )


# ==========================================================
# Runtime Entry
# ==========================================================

def main(
    force: bool = False,
) -> None:
    """
    Execute GMKtec Product Fetch Runtime.
    """

    fetch(
        force=force
    )


# ==========================================================
# Standalone Execution
# ==========================================================

if __name__ == "__main__":
    main()