#!/usr/bin/env python3
"""
FILE:
acquisition/sources/scraping/gmktec/fetch_collection.py

SHIN CORE LINX

GMKtec Collection Fetch Runtime

Reality Source
    ↓
Collection HTTP Acquisition
    ↓
AcquisitionDocument

Responsibilities

- Load Collection Reality Source
- Fetch Collection HTML
- Preserve Raw HTML
- Save AcquisitionDocument

NOT

- Parse HTML
- Discover Collections
- Discover Products
- Extract Product Data
- Observe Reality
- Generate Meaning
- Mapping
- Integration
- Persistence to PCProduct

Reality First
"""

from __future__ import annotations

import csv
import random
import time

from curl_cffi import requests

from api.models.acquisition_document import (
    AcquisitionDocument,
)

from .settings import (
    ROOT_TSV,
    SITE_NAME,
    TIMEOUT,
    USER_AGENT,
)


# ==========================================================
# Root / Collection Seeds
# ==========================================================

def load_sources() -> list[dict[str, str]]:
    """
    Load enabled Collection Reality Sources.

    The configured ROOT_TSV contains the actual
    Collection URL to acquire.

    No Collection Discovery is performed here.
    """

    with ROOT_TSV.open(
        "r",
        encoding="utf-8",
        newline="",
    ) as f:

        reader = csv.DictReader(
            f,
            delimiter="\t",
        )

        return [
            row
            for row in reader
            if (
                row.get("enabled", "")
                .lower()
                == "true"
            )
        ]


# ==========================================================
# HTTP Acquisition
# ==========================================================

def fetch(
    force: bool = False,
) -> None:
    """
    Fetch configured Collection Reality.

    Web
        ↓
    HTTP Response
        ↓
    AcquisitionDocument
    """

    rows = load_sources()

    print(
        "=" * 60
    )

    print(
        "GMKTEC COLLECTION FETCH"
    )

    print(
        "=" * 60
    )

    print(
        f"Target : {len(rows)} Collections"
    )

    print(
        "=" * 60
    )

    if not rows:

        print(
            "⚠️ No enabled Collection Sources"
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

    # ======================================================
    # Collection Loop
    # ======================================================

    for index, row in enumerate(
        rows,
        start=1,
    ):

        slug = (
            row.get(
                "slug",
                "",
            )
            .strip()
        )

        url = (
            row.get(
                "url",
                "",
            )
            .strip()
        )

        print(
            f"[{index}/{len(rows)}] {slug}"
        )

        if not url:

            print(
                "  ❌ URL is empty"
            )

            failed.append(
                (
                    slug,
                    "URL is empty",
                )
            )

            print()

            continue

        # ==================================================
        # Cache
        # ==================================================

        if not force:

            exists = (
                AcquisitionDocument.objects.filter(
                    source_type="scraping",
                    source_name=SITE_NAME,
                    document_type="collection",
                    document_key=slug,
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

        # ==================================================
        # Gentle Delay
        # ==================================================

        if index > 1:

            wait = random.uniform(
                3.0,
                6.0,
            )

            print(
                f"  😴 Sleep {wait:.1f}s"
            )

            time.sleep(
                wait
            )

        response = None

        try:

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
                    f"{response.headers.get('Content-Type')}"
                )

                if response.status_code == 200:
                    break

                if response.status_code == 429:

                    wait = 10 * (
                        attempt + 1
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
            # Preserve Raw Reality
            # ==================================================

            AcquisitionDocument.objects.update_or_create(
                source_type="scraping",
                source_name=SITE_NAME,
                document_type="collection",
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
                "  Cache  : MISS"
            )

            print(
                f"  ✓ {response.status_code}"
            )

            print(
                f"  Size   : "
                f"{len(response.content):,} bytes"
            )

        except requests.HTTPError as e:

            response = e.response

            if response is not None:

                print(
                    f"  Status : "
                    f"{response.status_code}"
                )

                print(
                    f"  URL    : "
                    f"{url}"
                )

            print(
                f"  ERROR  : {e}"
            )

            failed.append(
                (
                    slug,
                    str(e),
                )
            )

        except Exception as e:

            print(
                f"  ERROR  : {e}"
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
    Execute GMKtec Collection Fetch Runtime.
    """

    fetch(
        force=force
    )


# ==========================================================
# Standalone Execution
# ==========================================================

if __name__ == "__main__":
    main()