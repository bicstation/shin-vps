#!/usr/bin/env python3
"""
==============================================================================
FILE:
    acquisition/sources/scraping/lenovo/observe_openapi.py

SHIN CORE LINX

LENOVO OpenAPI Observation Runtime

OpenAPI Runtime
        │
        ▼
Observe Reality
        │
        ├── AcquisitionDocument(seed)
        │
        └── AcquisitionDocument(product)

Reality First
Observation First

Responsibilities

- Receive OpenAPI Reality Runtime
- Persist Seed Reality
- Observe Product Reality
- Persist Product AcquisitionDocument

NOT Responsibilities

- Fetch OpenAPI
- HTML Parsing
- Formatter
- Mapper
- Builder
- Semantic Processing

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

    if not href:
        return ""

    if href.startswith("/"):
        return BASE_URL + href

    return href


def document_key(
    url: str,
) -> str:
    """
    Create document key from Product URL.
    """

    path = urlparse(
        url,
    ).path

    return path.rstrip("/").split("/")[-1]

# ==============================================================================
# Seed Persistence
# ==============================================================================

def save_seed_document(
    runtime: dict,
) -> tuple[AcquisitionDocument, bool]:
    """
    Persist OpenAPI Reality Runtime as Seed Document.
    """

    slug = runtime.get(
        "slug",
        "",
    ).strip()

    if not slug:
        raise RuntimeError(
            "OpenAPI Runtime slug is empty."
        )

    content = json.dumps(
        runtime,
        ensure_ascii=False,
        indent=2,
    )

    return AcquisitionDocument.objects.update_or_create(

        source_type="scraping",

        source_name=SOURCE_NAME,

        document_type="seed",

        document_key=slug,

        defaults={

            "source_url": runtime.get(
                "source_url",
                "",
            ),

            "content_type": "application/json",

            "content": content,

        },

    )

# ==============================================================================
# Product Persistence
# ==============================================================================

def save_product_document(
    product: dict,
) -> tuple[AcquisitionDocument | None, bool]:
    """
    Persist one Product Reality as AcquisitionDocument.
    """

    href = product.get(
        "url",
        "",
    )

    if not isinstance(href, str):
        return None, False

    href = href.strip()

    if not href:
        return None, False

    url = absolute_url(
        href,
    )

    if not url:
        return None, False

    key = document_key(
        url,
    )

    if not key:
        return None, False

    content = json.dumps(
        product,
        ensure_ascii=False,
        indent=2,
    )

    document, created = (
        AcquisitionDocument.objects.update_or_create(

            source_type="scraping",

            source_name=SOURCE_NAME,

            document_type="product",

            document_key=key,

            defaults={

                "source_url": url,

                "content_type": "application/json",

                "content": content,

            },

        )
    )

    return document, created

# ==============================================================================
# Observation Runtime
# ==============================================================================

def observe_openapi(
    runtime: dict,
) -> None:
    """
    Observe and persist OpenAPI Reality Runtime.
    """

    trace_pipeline(
        "OPENAPI OBSERVATION",
    )

    print()

    print("=" * 70)

    print(
        f"{SITE_NAME} OPENAPI OBSERVATION"
    )

    print("=" * 70)

    # --------------------------------------------------------------------------
    # Validate Runtime
    # --------------------------------------------------------------------------

    if not isinstance(
        runtime,
        dict,
    ):
        raise RuntimeError(
            "OpenAPI Runtime must be a dict."
        )

    products = runtime.get(
        "products",
        [],
    )

    if not isinstance(
        products,
        list,
    ):
        raise RuntimeError(
            "OpenAPI Runtime products must be a list."
        )

    # --------------------------------------------------------------------------
    # Persist Seed
    # --------------------------------------------------------------------------

    seed_document, seed_created = save_seed_document(
        runtime,
    )

    if seed_created:

        print(
            f"CREATE SEED : {seed_document.document_key}"
        )

    else:

        print(
            f"UPDATE SEED : {seed_document.document_key}"
        )

    # --------------------------------------------------------------------------
    # Observe Products
    # --------------------------------------------------------------------------

    created_count = 0

    updated_count = 0

    skipped_count = 0

    seen: set[str] = set()

    print()

    print(
        f"Products : {len(products)}"
    )

    for index, product in enumerate(
        products,
        start=1,
    ):

        if not isinstance(
            product,
            dict,
        ):

            skipped_count += 1

            print(
                f"SKIP [{index}] : invalid product"
            )

            continue

        href = product.get(
            "url",
            "",
        )

        if not isinstance(
            href,
            str,
        ):

            skipped_count += 1

            print(
                f"SKIP [{index}] : invalid URL"
            )

            continue

        href = href.strip()

        if not href:

            skipped_count += 1

            print(
                f"SKIP [{index}] : empty URL"
            )

            continue

        url = absolute_url(
            href,
        )

        if url in seen:

            skipped_count += 1

            continue

        seen.add(
            url,
        )

        document, created = save_product_document(
            product,
        )

        if document is None:

            skipped_count += 1

            print(
                f"SKIP [{index}] : document key unavailable"
            )

            continue

        if created:

            created_count += 1

            print(
                f"CREATE [{index:>3}] : "
                f"{document.document_key}"
            )

        else:

            updated_count += 1

            print(
                f"UPDATE [{index:>3}] : "
                f"{document.document_key}"
            )

    # --------------------------------------------------------------------------
    # Result
    # --------------------------------------------------------------------------

    print()

    print("=" * 70)

    print("RESULT")

    print("=" * 70)

    print(
        f"SEED    : 1"
    )

    print(
        f"CREATED : {created_count}"
    )

    print(
        f"UPDATED : {updated_count}"
    )

    print(
        f"SKIPPED : {skipped_count}"
    )

    print(
        f"OBSERVED: {created_count + updated_count}"
    )

    print("=" * 70)
    
# ==============================================================================
# Entry Point
# ==============================================================================

def main(
    *,
    runtime: dict,
) -> None:
    """
    Runtime Entry Point.
    """

    observe_openapi(
        runtime=runtime,
    )


if __name__ == "__main__":

    raise SystemExit(
        "observe_openapi.py requires an OpenAPI runtime."
    ) 