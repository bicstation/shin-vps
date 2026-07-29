#!/usr/bin/env python3
"""
OZ GAMING List Acquisition Runtime

Fetch all category pages and store them into AcquisitionDocument.
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

LIST_FILE = Path(__file__).resolve().parent / "list.tsv"

#
# DEBUG
#
# None : All Categories
# 1    : First Category
# 3    : First 3 Categories
#
MAX_CATEGORIES = None


# ==========================================================
# Pager
# ==========================================================

def discover_total_pages(html: bytes) -> int:

    soup = BeautifulSoup(
        html,
        "html.parser",
    )

    pages = []

    for a in soup.select(
        "nav.pager a.pager-num",
    ):

        value = a.get_text(
            strip=True,
        )

        if value.isdigit():
            pages.append(
                int(value),
            )

    return max(pages) if pages else 1


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
    print("🌐 OZ GAMING LIST FETCH")
    print("=" * 60)

    headers = {
        "User-Agent": USER_AGENT,
        "Accept": "text/html",
    }

    success = 0
    failed = 0
    total_pages = 0

    with requests.Session() as session:

        session.headers.update(
            headers,
        )

        for index, row in enumerate(
            rows,
            start=1,
        ):

            if (
                MAX_CATEGORIES is not None
                and index > MAX_CATEGORIES
            ):
                break

            category_id = row["category_id"]
            category_name = row["category_name"]
            base_url = row["url"]

            print(
                f"[{index}/{len(rows)}] {category_name}"
            )

            try:

                response = session.get(
                    base_url,
                    timeout=TIMEOUT,
                )

                response.raise_for_status()

                pages = discover_total_pages(
                    response.content,
                )

                print(
                    f"Pages : {pages}"
                )

                for page in range(
                    1,
                    pages + 1,
                ):

                    if page == 1:

                        page_url = base_url
                        page_response = response

                    else:

                        page_url = (
                            f"{base_url}?page={page}"
                        )

                        page_response = session.get(
                            page_url,
                            timeout=TIMEOUT,
                        )

                        page_response.raise_for_status()

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

                    total_pages += 1

                    print(
                        f"  ✓ {category_id}_p{page}"
                    )

                success += 1

            except Exception as e:

                failed += 1

                print(
                    f"ERROR : {category_id}"
                )

                print(e)

    print("-" * 60)
    print(f"Categories : {success}")
    print(f"Pages      : {total_pages}")
    print(f"Failed     : {failed}")
    print("=" * 60)


# ==========================================================
# Main
# ==========================================================

def main():

    fetch()


if __name__ == "__main__":

    main()