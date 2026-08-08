#!/usr/bin/env python3

"""
==============================================================================
FILE:
    acquisition/sources/scraping/lenovo/observe_openapi.py

SHIN CORE LINX

LENOVO OpenAPI Observation Runtime

OpenAPI Runtime Collection
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

- Receive OpenAPI Reality Runtime Collection
- Validate OpenAPI Reality Runtime Collection
- Persist Seed Reality
- Observe Product Reality
- Persist Product AcquisitionDocument
- Deduplicate Product Reality by URL

NOT Responsibilities

- Fetch OpenAPI
- HTML Parsing
- Formatter
- Mapper
- Builder
- Semantic Processing

IMPORTANT

Pipeline does NOT iterate over Reality Runtimes.

Observation Runtime owns iteration over
the OpenAPI Reality Runtime collection.

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


# ============================================================================
# Helpers
# ============================================================================

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


# ============================================================================
# Runtime Validation
# ============================================================================

def validate_runtime(
    runtime: dict,
) -> None:
    """
    Validate one OpenAPI Reality Runtime.
    """

    if not isinstance(
        runtime,
        dict,
    ):

        raise RuntimeError(
            "OpenAPI Runtime must be a dict."
        )

    required_fields = (
        "entry_name",
        "maker",
        "series",
        "slug",
        "runtime",
        "url",
        "products",
    )

    missing = [

        field

        for field in required_fields

        if field not in runtime

    ]

    if missing:

        raise RuntimeError(
            "OpenAPI Runtime missing fields: "
            + ", ".join(missing)
        )

    products = runtime.get(
        "products",
    )

    if not isinstance(
        products,
        list,
    ):

        raise RuntimeError(
            "OpenAPI Runtime products must be a list."
        )


def validate_runtimes(
    runtimes: list[dict],
) -> None:
    """
    Validate OpenAPI Reality Runtime Collection.
    """

    if not isinstance(
        runtimes,
        list,
    ):

        raise RuntimeError(
            "OpenAPI Runtimes must be a list."
        )

    if not runtimes:

        raise RuntimeError(
            "OpenAPI Runtime collection is empty."
        )

    for runtime in runtimes:

        validate_runtime(
            runtime,
        )


# ============================================================================
# Seed Persistence
# ============================================================================

def save_seed_document(
    runtime: dict,
) -> tuple[AcquisitionDocument, bool]:
    """
    Persist one OpenAPI Reality Runtime as Seed Document.
    """

    slug = runtime.get(
        "slug",
        "",
    )

    if not isinstance(
        slug,
        str,
    ):

        raise RuntimeError(
            "OpenAPI Runtime slug must be a string."
        )

    slug = slug.strip()

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

            # Fetch Runtime uses "url".
            #
            # Do not expect "source_url" here.
            "source_url": runtime.get(
                "url",
                "",
            ),

            "content_type":
                "application/json",

            "content":
                content,

        },

    )


# ============================================================================
# Product Persistence
# ============================================================================

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

    if not isinstance(
        href,
        str,
    ):

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

                "source_url":
                    url,

                "content_type":
                    "application/json",

                "content":
                    content,

            },

        )
    )

    return document, created


# ============================================================================
# Observation Runtime
# ============================================================================

def observe_openapi(
    runtimes: list[dict],
) -> None:
    """
    Observe and persist OpenAPI Reality Runtime Collection.

    Parameters
    ----------
    runtimes:
        OpenAPI Reality Runtime collection.

    IMPORTANT
    ---------
    This Runtime owns iteration over the collection.

    Pipeline does not iterate over individual Runtimes.
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

    # ========================================================================
    # Validate Collection
    # ========================================================================

    validate_runtimes(
        runtimes,
    )

    print()

    print(
        f"OpenAPI Runtimes : "
        f"{len(runtimes)}"
    )

    # ========================================================================
    # Counters
    # ========================================================================

    seed_created_count = 0

    seed_updated_count = 0

    product_created_count = 0

    product_updated_count = 0

    skipped_count = 0

    # ========================================================================
    # Global Product Reality Deduplication
    #
    # A product may appear in multiple Lenovo category Runtimes.
    #
    # AcquisitionDocument identity is based on Product URL.
    #
    # Therefore one Product Reality is observed once.
    # ========================================================================

    seen: set[str] = set()

    # ========================================================================
    # Observe Runtime Collection
    # ========================================================================

    for runtime_index, runtime in enumerate(

        runtimes,

        start=1,

    ):

        entry_name = runtime.get(
            "entry_name",
            "",
        )

        series = runtime.get(
            "series",
            "",
        )

        products = runtime.get(
            "products",
            [],
        )

        # --------------------------------------------------------------------
        # Runtime Header
        # --------------------------------------------------------------------

        print()

        print("=" * 70)

        print(
            f"LENOVO OBSERVATION "
            f"[{runtime_index}/{len(runtimes)}]"
        )

        print(
            f"Entry    : {entry_name}"
        )

        print(
            f"Series   : {series}"
        )

        print(
            f"Products : {len(products)}"
        )

        print("=" * 70)

        # --------------------------------------------------------------------
        # Persist Seed Reality
        # --------------------------------------------------------------------

        seed_document, seed_created = (
            save_seed_document(
                runtime,
            )
        )

        if seed_created:

            seed_created_count += 1

            print(
                f"CREATE SEED : "
                f"{seed_document.document_key}"
            )

        else:

            seed_updated_count += 1

            print(
                f"UPDATE SEED : "
                f"{seed_document.document_key}"
            )

        # --------------------------------------------------------------------
        # Observe Product Reality
        # --------------------------------------------------------------------

        for index, product in enumerate(

            products,

            start=1,

        ):

            # ----------------------------------------------------------------
            # Product Validation
            # ----------------------------------------------------------------

            if not isinstance(
                product,
                dict,
            ):

                skipped_count += 1

                print(
                    f"SKIP [{index:>3}] : "
                    "invalid product"
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
                    f"SKIP [{index:>3}] : "
                    "invalid URL"
                )

                continue

            href = href.strip()

            if not href:

                skipped_count += 1

                print(
                    f"SKIP [{index:>3}] : "
                    "empty URL"
                )

                continue

            url = absolute_url(
                href,
            )

            if not url:

                skipped_count += 1

                print(
                    f"SKIP [{index:>3}] : "
                    "absolute URL unavailable"
                )

                continue

            # ----------------------------------------------------------------
            # Cross-Runtime Deduplication
            # ----------------------------------------------------------------

            if url in seen:

                skipped_count += 1

                continue

            seen.add(
                url,
            )

            # ----------------------------------------------------------------
            # Persist Product Reality
            # ----------------------------------------------------------------

            document, created = (
                save_product_document(
                    product,
                )
            )

            if document is None:

                skipped_count += 1

                print(
                    f"SKIP [{index:>3}] : "
                    "document key unavailable"
                )

                continue

            if created:

                product_created_count += 1

                print(
                    f"CREATE [{index:>3}] : "
                    f"{document.document_key}"
                )

            else:

                product_updated_count += 1

                print(
                    f"UPDATE [{index:>3}] : "
                    f"{document.document_key}"
                )

    # ========================================================================
    # Result
    # ========================================================================

    observed_count = (
        product_created_count
        + product_updated_count
    )

    print()

    print("=" * 70)

    print(
        "LENOVO OPENAPI OBSERVATION RESULT"
    )

    print("=" * 70)

    print(
        f"RUNTIMES        : "
        f"{len(runtimes)}"
    )

    print(
        f"SEEDS CREATED   : "
        f"{seed_created_count}"
    )

    print(
        f"SEEDS UPDATED   : "
        f"{seed_updated_count}"
    )

    print(
        f"PRODUCT CREATED : "
        f"{product_created_count}"
    )

    print(
        f"PRODUCT UPDATED : "
        f"{product_updated_count}"
    )

    print(
        f"SKIPPED         : "
        f"{skipped_count}"
    )

    print(
        f"OBSERVED        : "
        f"{observed_count}"
    )

    print(
        f"UNIQUE PRODUCTS : "
        f"{len(seen)}"
    )

    print("=" * 70)


# ============================================================================
# Entry Point
# ============================================================================

def main(
    *,
    runtimes: list[dict],
) -> None:
    """
    Runtime Entry Point.

    Receives the complete OpenAPI Reality Runtime collection.
    """

    observe_openapi(
        runtimes=runtimes,
    )


# ============================================================================
# Standalone Execution
# ============================================================================

if __name__ == "__main__":

    raise SystemExit(
        "observe_openapi.py requires an OpenAPI runtime collection."
    )