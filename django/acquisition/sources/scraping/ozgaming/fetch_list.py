# /home/maya/shin-vps/django/acquisition/sources/scraping/ozgaming/fetch_list.py

#!/usr/bin/env python3
"""
==============================================================================
OZ GAMING Reality Fetch Runtime

Category List
        │
        ▼
Fetch HTML
        │
        ▼
AcquisitionDocument

Responsibilities
----------------
- Read list.tsv
- Fetch category HTML
- Discover pagination
- Save HTML to AcquisitionDocument

No product parsing.
Reality First.
Observation First.
==============================================================================
"""

from __future__ import annotations

import csv
from pathlib import Path

import requests
from bs4 import BeautifulSoup

from api.models import AcquisitionDocument

from .settings import (
    SITE_NAME,
    USER_AGENT,
    TIMEOUT,
)

# ==========================================================
# Runtime
# ==========================================================

LIST_FILE = (
    Path(__file__).resolve().parent
    / "list.tsv"
)


# ==========================================================
# Pager
# ==========================================================

def discover_total_pages(
    html: bytes,
) -> int:
    """
    Discover total pages.

    Product parsing is NOT allowed.
    """

    soup = BeautifulSoup(
        html,
        "html.parser",
    )

    pager = soup.select(
        "nav.pager a.pager-num",
    )

    pages = []

    for a in pager:

        text = a.get_text(
            strip=True,
        )

        if text.isdigit():

            pages.append(
                int(text),
            )

    if not pages:
        return 1

    return max(
        pages,
    )


# ==========================================================
# Fetch
# ==========================================================

def fetch():

    with open(
        LIST_FILE,
        encoding="utf-8",
    ) as f:

        rows = list(
            csv.DictReader(
                f,
                delimiter="\t",
            )
        )

    print("=" * 60)
    print("🌐 OZ GAMING REALITY FETCH")
    print("=" * 60)
    print(f"Categories : {len(rows)}")
    print(f"Timeout    : {TIMEOUT} sec")
    print("=" * 60)

    success = 0
    failed = 0

    with requests.Session() as session:

        session.headers.update(
            {
                "User-Agent": USER_AGENT,
                "Accept": "text/html",
            }
        )

        for index, row in enumerate(
            rows,
            start=1,
        ):

            category_id = row["category_id"]
            category_name = row["category_name"]
            base_url = row["url"]

            print()
            print("=" * 60)
            print(
                f"[{index}/{len(rows)}] "
                f"{category_name}"
            )
            print("=" * 60)

            try:

                #
                # First Page
                #

                response = session.get(
                    base_url,
                    timeout=TIMEOUT,
                )

                response.raise_for_status()

                total_pages = discover_total_pages(
                    response.content,
                )

                print(
                    f"Pages : {total_pages}"
                )

                #
                # Fetch All Pages
                #

                for page in range(
                    1,
                    total_pages + 1,
                ):

                    if page == 1:

                        page_response = response
                        page_url = base_url

                    else:

                        page_url = (
                            f"{base_url}?page={page}"
                        )

                        page_response = session.get(
                            page_url,
                            timeout=TIMEOUT,
                        )

                        page_response.raise_for_status()

                    #
                    # Store Reality
                    #

                    AcquisitionDocument.objects.update_or_create(

                        source_name=SITE_NAME,

                        document_type="list",

                        document_key=f"{category_id}_p{page}",

                        defaults={

                            "source_url": page_url,

                            "content_type": "text/html",

                            "content": page_response.text,

                        },

                    )

                    print(
                        f"  Page {page:>2} "
                        f"-> {category_id}_p{page}"
                    )

                success += 1

            except Exception as e:

                failed += 1

                print(
                    f"Category : {category_id}"
                )

                print(
                    f"URL      : {base_url}"
                )

                print(
                    f"ERROR    : {e}"
                )

    print()
    print("=" * 60)
    print("✅ FETCH COMPLETE")
    print("=" * 60)
    print(f"Success : {success}")
    print(f"Failed  : {failed}")
    print("=" * 60)


# ==========================================================
# Main
# ==========================================================

def main():

    fetch()


if __name__ == "__main__":

    main()