#!/usr/bin/env python3
"""
==============================================================================
FILE:
    acquisition/sources/scraping/lenovo/observe_listing_api.py

SHIN CORE LINX

LENOVO OpenAPI Listing Observation Runtime

Reality JSON
        │
        ▼
Observe Product URL
        │
        ▼
AcquisitionDocument(product)

Reality First
Observation First

Responsibilities

- Observe Product URL
- Preserve Published URL
- Produce Product AcquisitionDocument

NOT Responsibilities

- Product Observation
- Semantic Classification
- Runtime Contract
- Formatter

==============================================================================
"""

from __future__ import annotations

import json

from urllib.parse import (
    urlparse,
)

from api.models import (
    AcquisitionDocument,
)

from acquisition.common.trace.reality_trace import (
    trace_pipeline,
)

from .settings import (
    BASE_URL,
    SITE_NAME,
    SOURCE_NAME,
)
# ==============================================================================
# Helpers
# ==============================================================================

def absolute_url(
    href: str,
) -> str:
    """
    Convert relative URL into absolute URL.
    """

    if href.startswith("/"):

        return BASE_URL + href

    return href


def document_key(
    url: str,
) -> str:
    """
    Create document key from URL.
    """

    path = urlparse(

        url,

    ).path

    return path.rstrip("/").split("/")[-1]

# ==============================================================================
# Observation Runtime
# ==============================================================================

def observe_openapi(
    runtime: dict,
) -> None:
    """
    Observe Product URLs from Reality Runtime.
    """

    trace_pipeline(

        "OPENAPI OBSERVATION",

    )

    print()

    print("=" * 70)

    print(f"{SITE_NAME} OPENAPI OBSERVATION")

    print("=" * 70)

    #
    # Save Seed Runtime
    #
    AcquisitionDocument.objects.update_or_create(

        source_type="scraping",

        source_name=SOURCE_NAME,

        document_type="seed",

        document_key=runtime["slug"],

        defaults={

            "source_url": RESULT_URL,

            "content_type": "application/json",

            "content": json.dumps(

                runtime,

                ensure_ascii=False,

                indent=2,

            ),

        },

    )

    created_count = 0

    updated_count = 0

    seen: set[str] = set()

    products = runtime.get(

        "products",

        [],

    )

    print(

        f"Products : {len(products)}"

    )

    for product in products:

        href = product.get(

            "url",

            "",

        ).strip()

        if not href:

            continue

        url = absolute_url(

            href,

        )

        if url in seen:

            continue

        seen.add(

            url,

        )

        key = document_key(

            url,

        )

        _, created = (

            AcquisitionDocument.objects.update_or_create(

                source_type="scraping",

                source_name=SOURCE_NAME,

                document_type="product",

                document_key=key,
                
                defaults={

                    "source_url": url,

                    "content_type": "application/json",

                    "content": json.dumps(

                        product,

                        ensure_ascii=False,

                        indent=2,

                    ),

                }


            )

        )

        if created:

            created_count += 1

            print(

                f"CREATE : {key}"

            )

        else:

            updated_count += 1

            print(

                f"UPDATE : {key}"

            )

    print()

    print("=" * 70)

    print("RESULT")

    print("=" * 70)

    print(

        f"Created : {created_count}"

    )

    print(

        f"Updated : {updated_count}"

    )

    print(

        f"Observed: {created_count + updated_count}"

    )

    print("=" * 70)

# ==============================================================================
# Entry Point
# ==============================================================================

def main(
    *,
    force: bool = False,
) -> None:
    """
    Runtime Entry Point.
    """

    observe_listing()


if __name__ == "__main__":

    main()
                
                