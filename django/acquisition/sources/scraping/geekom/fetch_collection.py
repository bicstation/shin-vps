#!/usr/bin/env python3
"""
FILE:
acquisition/sources/scraping/geekom/fetch_collection.py

SHIN CORE LINX

Geekom Collection Fetch Runtime

Reality Source
    ↓
Collection HTTP Acquisition
    ↓
AcquisitionDocument

Responsibilities

- Load Collection Reality Source
- Follow Collection Pagination
- Fetch Collection HTML
- Preserve Raw HTML
- Save AcquisitionDocument

NOT

- Parse Product Data
- Discover Products
- Extract Product Data
- Observe Product Reality
- Generate Meaning
- Mapping
- Integration
- Persistence to PCProduct

Reality First
Document First
"""

from __future__ import annotations

import csv
import random
import re
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

    root.tsv contains the Collection Root URL.

    Pagination is handled by this Runtime.

    No Product Discovery is performed here.
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
                row.get(
                    "enabled",
                    "",
                )
                .lower()
                == "true"
            )
        ]


# ==========================================================
# Pagination URL
# ==========================================================

def build_page_url(
    root_url: str,
    page: int,
) -> str:
    """
    Build Collection pagination URL.

    Page 1 is explicitly represented as:

        ?page=1

    Page 2:

        ?page=2

    etc.
    """

    separator = (
        "&"
        if "?" in root_url
        else "?"
    )

    return (
        f"{root_url}"
        f"{separator}"
        f"page={page}"
    )


# ==========================================================
# Pagination Detection
# ==========================================================

def has_next_page(
    html: str,
    *,
    current_page: int,
) -> bool:
    """
    Detect whether the fetched Collection HTML
    exposes the next pagination page.

    This checks navigation Reality only.

    It does NOT inspect:

    - Product names
    - Prices
    - Images
    - Specifications
    - Product meaning
    """

    next_page = current_page + 1

    patterns = (
        rf"page={next_page}(?:&|['\"&?#])",
        rf"page%3D{next_page}(?:%26|['\"&?#])",
    )

    return any(
        re.search(
            pattern,
            html,
            flags=re.IGNORECASE,
        )
        for pattern in patterns
    )


# ==========================================================
# Page Document Key
# ==========================================================

def build_document_key(
    root_slug: str,
    page: int,
) -> str:
    """
    Build a unique AcquisitionDocument key
    for each Collection page.
    """

    return (
        f"{SITE_NAME.lower()}"
        f"-{root_slug}"
        f"-page-{page}"
    )


# ==========================================================
# HTTP Acquisition
# ==========================================================

def fetch(
    force: bool = False,
) -> None:
    """
    Fetch all paginated Collection Reality.

    Root
        ↓
    page=1
        ↓
    page=2
        ↓
    page=3
        ↓
    ...
        ↓
    Last Collection Page

    Each page is preserved as its own
    AcquisitionDocument.
    """

    rows = load_sources()

    print(
        "=" * 60
    )

    print(
        "GEEKOM COLLECTION FETCH"
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
            "Referer": (
                "https://geekom.jp/"
            ),
        }
    )

    success: list[str] = []

    skipped: list[str] = []

    failed: list[
        tuple[str, str]
    ] = []

    # ======================================================
    # Collection Loop
    # ======================================================

    for source_index, row in enumerate(
        rows,
        start=1,
    ):

        root_slug = (
            row.get(
                "slug",
                "",
            )
            .strip()
        )

        root_url = (
            row.get(
                "url",
                "",
            )
            .strip()
        )

        print(
            f"[{source_index}/{len(rows)}]"
            f" {root_slug}"
        )

        print(
            f"Root : {root_url}"
        )

        if not root_url:

            print(
                "  ❌ URL is empty"
            )

            failed.append(
                (
                    root_slug,
                    "URL is empty",
                )
            )

            print()

            continue

        # ==================================================
        # Pagination
        # ==================================================

        page = 1

        while True:

            document_key = (
                build_document_key(
                    root_slug,
                    page,
                )
            )

            page_url = build_page_url(
                root_url,
                page,
            )

            print()
            print(
                "-" * 60
            )

            print(
                f"PAGE : {page}"
            )

            print(
                f"URL  : {page_url}"
            )

            # ==================================================
            # Cache Check
            # ==================================================

            document = (
                AcquisitionDocument.objects
                .filter(
                    source_type="scraping",
                    source_name=SITE_NAME,
                    document_type="collection",
                    document_key=document_key,
                )
                .first()
            )

            if (
                not force
                and document is not None
                and document.content
            ):

                print(
                    "Cache  : HIT"
                )

                print(
                    "⏭️ SKIP : Collection HTML already acquired"
                )

                skipped.append(
                    document_key
                )

                success.append(
                    document_key
                )

                html = document.content

                if not has_next_page(
                    html,
                    current_page=page,
                ):

                    print(
                        "Pagination : END"
                    )

                    break

                print(
                    f"Pagination : NEXT → page={page + 1}"
                )

                page += 1

                continue

            # ==================================================
            # Gentle Delay
            # ==================================================

            if page > 1:

                wait = random.uniform(
                    3.0,
                    6.0,
                )

                print(
                    f"😴 Sleep {wait:.1f}s"
                )

                time.sleep(
                    wait
                )

            response = None

            # ==================================================
            # HTTP Acquisition
            # ==================================================

            try:

                # ==================================================
                # Retry
                # ==================================================

                for attempt in range(3):

                    response = session.get(
                        page_url,
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

                    if (
                        response.status_code
                        == 200
                    ):

                        break

                    if (
                        response.status_code
                        == 429
                    ):

                        wait = 10 * (
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
                # Preserve Raw Reality
                # ==================================================

                AcquisitionDocument.objects.update_or_create(
                    source_type="scraping",
                    source_name=SITE_NAME,
                    document_type="collection",
                    document_key=document_key,
                    defaults={
                        "source_url": page_url,
                        "content_type": response.headers.get(
                            "Content-Type",
                            "text/html",
                        ),
                        "content": response.text,
                    },
                )

                success.append(
                    document_key
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

                # ==================================================
                # Pagination Reality
                # ==================================================

                if not has_next_page(
                    response.text,
                    current_page=page,
                ):

                    print(
                        "Pagination : END"
                    )

                    break

                print(
                    f"Pagination : NEXT → page={page + 1}"
                )

                page += 1

            except requests.HTTPError as e:

                response = e.response

                if response is not None:

                    print(
                        f"Status : "
                        f"{response.status_code}"
                    )

                    print(
                        f"URL    : "
                        f"{page_url}"
                    )

                print(
                    f"ERROR  : {e}"
                )

                failed.append(
                    (
                        document_key,
                        str(e),
                    )
                )

                break

            except Exception as e:

                print(
                    f"ERROR  : {e}"
                )

                failed.append(
                    (
                        document_key,
                        str(e),
                    )
                )

                break

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
    Execute Geekom Collection Fetch Runtime.
    """

    fetch(
        force=force
    )


# ==========================================================
# Standalone Execution
# ==========================================================

if __name__ == "__main__":
    main()