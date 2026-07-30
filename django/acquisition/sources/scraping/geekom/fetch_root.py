#!/usr/bin/env python3
"""
GEEKOM Reality Fetch

Fetch Root Reality HTML
→ Save AcquisitionDocument

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

from api.models.acquisition_document import AcquisitionDocument

from .settings import (
    ROOT_TSV,
    TIMEOUT,
    USER_AGENT,
)


def fetch(force: bool = False) -> None:

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
    print("GEEKOM REALITY FETCH")
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

    for index, row in enumerate(rows, start=1):

        slug = row["slug"]
        url = row["url"]

        print(f"[{index}/{len(rows)}] {slug}")

        #
        # Cache
        #

        if not force:

            exists = AcquisitionDocument.objects.filter(
                source_name="geekom",
                document_type="root",
                document_key=slug,
            ).exists()

            if exists:

                print("  Cache  : HIT")
                print()

                continue

        response = None

        try:

            #
            # Retry
            #

            for attempt in range(3):

                response = session.get(
                    url,
                    timeout=TIMEOUT,
                    allow_redirects=True,
                )

                print(f"  Status : {response.status_code}")
                print(
                    f"  Type   : {response.headers.get('Content-Type')}"
                )

                if response.status_code != 429:
                    break

                wait = 5 * (attempt + 1)

                print(
                    f"  Retry  : {attempt + 1}/3"
                )
                print(
                    f"  Sleep  : {wait}s"
                )

                time.sleep(wait)

            response.raise_for_status()

            AcquisitionDocument.objects.update_or_create(
                source_type="scraping",
                source_name="geekom",
                document_type="root",
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

            print("  Cache  : MISS")
            print(f"  Status : {response.status_code}")
            print(
                f"  Size   : {len(response.content):,} bytes"
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

        except Exception as e:

            print(f"  ERROR : {e}")

        #
        # Gentle Delay
        #

        time.sleep(
            random.uniform(
                1.5,
                3.5,
            )
        )

        print()

    print("=" * 60)
    print("COMPLETE")
    print("=" * 60)


def main(force: bool = False) -> None:

    fetch(force=force)


if __name__ == "__main__":

    main()