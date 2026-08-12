#!/usr/bin/env python3
"""
FILE:
acquisition/sources/scraping/gmktec/fetch_root.py

SHIN CORE LINX

GMKtec Reality Fetch Runtime

Fetch Root Reality HTML
        ↓
Save AcquisitionDocument

Responsibilities

- Acquire Reality
- Save AcquisitionDocument

NOT

- Parse HTML
- Generate Meaning
- Observe Reality

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
    BASE_URL,
    ROOT_TSV,
    SITE_NAME,
    TIMEOUT,
    USER_AGENT,
)


# ==========================================================
# Runtime
# ==========================================================

def fetch(
    force: bool = False,
) -> None:
    """
    Fetch Root Reality for every GMKtec Seed.

    Seed Reality
        ↓
    HTTP Acquisition
        ↓
    AcquisitionDocument
    """

    # ======================================================
    # Seed
    # ======================================================

    with ROOT_TSV.open(
        "r",
        encoding="utf-8",
        newline="",
    ) as f:

        rows = list(
            csv.DictReader(
                f,
                delimiter="\t",
            )
        )

    print("=" * 60)
    print("GMKTEC REALITY FETCH")
    print("=" * 60)

    print(
        f"Target : {len(rows)} Seeds"
    )

    print("=" * 60)

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

    # ======================================================
    # Fetch
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
            or ""
        ).strip()

        url = (
            row.get(
                "url",
                "",
            )
            or ""
        ).strip()

        print(
            f"[{index}/{len(rows)}] "
            f"{slug}"
        )

        # ==================================================
        # Seed Validation
        # ==================================================

        if not slug:

            print(
                "  ERROR : Seed slug is empty"
            )

            continue

        if not url:

            print(
                "  ERROR : Seed URL is empty"
            )

            continue

        # ==================================================
        # Cache
        # ==================================================

        if not force:

            exists = (
                AcquisitionDocument.objects.filter(
                    source_name=SITE_NAME,
                    document_type="root",
                    document_key=slug,
                ).exists()
            )

            if exists:

                print(
                    "  Cache  : HIT"
                )

                print()

                continue

        # ==================================================
        # HTTP
        # ==================================================

        response = None

        try:

            # ------------------------------------------------
            # Retry
            # ------------------------------------------------

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

                if response.status_code != 429:
                    break

                wait = (
                    5 * (attempt + 1)
                )

                print(
                    f"  Retry  : "
                    f"{attempt + 1}/3"
                )

                print(
                    f"  Sleep  : "
                    f"{wait}s"
                )

                time.sleep(
                    wait,
                )

            # ------------------------------------------------
            # HTTP Validation
            # ------------------------------------------------

            response.raise_for_status()

            # ------------------------------------------------
            # AcquisitionDocument
            # ------------------------------------------------

            AcquisitionDocument.objects.update_or_create(

                source_type="scraping",

                source_name=SITE_NAME,

                document_type="root",

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

            print(
                "  Cache  : MISS"
            )

            print(
                f"  Status : "
                f"{response.status_code}"
            )

            print(
                f"  Size   : "
                f"{len(response.content):,} bytes"
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

        # ==================================================
        # Runtime Error
        # ==================================================

        except Exception as e:

            print(
                f"  ERROR : "
                f"{e}"
            )

        # ==================================================
        # Gentle Delay
        # ==================================================

        time.sleep(
            random.uniform(
                1.5,
                3.5,
            )
        )

        print()

    # ======================================================
    # Complete
    # ======================================================

    print("=" * 60)
    print("GMKTEC REALITY FETCH COMPLETE")
    print("=" * 60)


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