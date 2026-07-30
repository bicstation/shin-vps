#!/usr/bin/env python3
"""
GEEKOM Collection Fetch Runtime

Fetch Collection HTML
→ Save AcquisitionDocument
"""

from __future__ import annotations

import csv
import random
import time

from curl_cffi import requests

from api.models.acquisition_document import AcquisitionDocument

from .settings import (
    COLLECTIONS_TSV,
    USER_AGENT,
    TIMEOUT,
)


def fetch(force: bool = False):

    with COLLECTIONS_TSV.open(
        "r",
        encoding="utf-8",
        newline="",
    ) as f:

        rows = [
            row
            for row in csv.DictReader(
                f,
                delimiter="\t",
            )
            if row["enabled"].lower() == "true"
        ]

    print("=" * 60)
    print("🌐 GEEKOM COLLECTION FETCH")
    print("=" * 60)
    print(f"Target : {len(rows)} Collections")
    print("=" * 60)

    #
    # Chrome Session
    #

    session = requests.Session(
        impersonate="chrome",
    )

    session.headers.update(
        {
            "User-Agent": USER_AGENT,
            "Referer": "https://geekom.jp/",
        }
    )

    success = []
    failed = []

    for index, row in enumerate(rows, start=1):

        slug = row["slug"]

        print(f"[{index}/{len(rows)}] {slug}")

        #
        # Cache Check
        #

        if not force:

            exists = AcquisitionDocument.objects.filter(
                source_name="geekom",
                document_type="collection",
                document_key=slug,
            ).exists()

            if exists:

                success.append(slug)

                print("  Cache  : HIT")
                print()

                continue

        try:

            #
            # Gentle Delay
            #

            if index > 1:

                wait = random.uniform(
                    8.0,
                    15.0,
                )

                print(f"  😴 Sleep {wait:.1f}s")

                time.sleep(wait)

            response = None

            #
            # Retry
            #

            for attempt in range(3):

                response = session.get(
                    row["url"],
                    timeout=TIMEOUT,
                    allow_redirects=True,
                )

                print(f"  Status : {response.status_code}")
                print(
                    f"  Type   : {response.headers.get('Content-Type')}"
                )

                if response.status_code == 200:
                    break

                if response.status_code == 429:

                    wait = 10 * (attempt + 1)

                    print(f"  ⏳ 429 Retry ({wait}s)")

                    time.sleep(wait)

                    continue

                response.raise_for_status()

            response.raise_for_status()

            AcquisitionDocument.objects.update_or_create(
                source_type="scraping",
                source_name="geekom",
                document_type="collection",
                document_key=slug,
                defaults={
                    "source_url": row["url"],
                    "content_type": response.headers.get(
                        "Content-Type",
                        "text/html",
                    ),
                    "content": response.text,
                },
            )

            success.append(slug)

            print("  Cache  : MISS")
            print(f"  ✓ {response.status_code}")
            print(
                f"  {len(response.content):,} bytes"
            )

        except requests.HTTPError as e:

            response = e.response

            if response is not None:

                print(f"  Status : {response.status_code}")

                print("  Headers")

                for key, value in response.headers.items():

                    print(f"    {key}: {value}")

                print()
                print(response.text[:1000])

            else:

                print(f"  ERROR : {e}")

            failed.append(
                (
                    slug,
                    str(e),
                )
            )

        except Exception as e:

            failed.append(
                (
                    slug,
                    str(e),
                )
            )

            print(f"  ERROR : {e}")

        print()

    print("=" * 60)
    print(f"SUCCESS : {len(success)}")
    print(f"FAILED  : {len(failed)}")
    print("=" * 60)


def main(force: bool = False):

    fetch(force=force)


if __name__ == "__main__":

    main()