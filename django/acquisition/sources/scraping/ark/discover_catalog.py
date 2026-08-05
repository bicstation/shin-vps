#!/usr/bin/env python3
"""
==============================================================================
SHIN CORE LINX

ARK Catalog Discovery Runtime

Catalog Runtime

AcquisitionDocument (catalog)
        │
        ▼
Catalog Discovery
        │
        ▼
AcquisitionDocument (catalog_runtime)

Reality First
Observation First

Responsibilities

- Discover Catalog Reality
- Discover Catalog Pages
- Preserve Catalog Runtime
- Produce Catalog AcquisitionDocument

Not Responsibilities

- Card Discovery
- Observation
- Formatter
- Mapper
- Integration

==============================================================================
"""

from __future__ import annotations

import json
import re

from bs4 import BeautifulSoup

from api.models.acquisition_document import AcquisitionDocument

from acquisition.common.trace.reality_trace import (
    trace_pipeline,
)

from .settings import (
    SITE_NAME,
)

# ==============================================================================
# Runtime
# ==============================================================================

DOCUMENT_INPUT = "catalog"

DOCUMENT_OUTPUT = "catalog_runtime"

SOURCE_TYPE = "scraping"


# ==============================================================================
# Cache
# ==============================================================================

def exists(
    document_key: str,
) -> bool:

    return AcquisitionDocument.objects.filter(

        source_type=SOURCE_TYPE,

        source_name=SITE_NAME,

        document_type=DOCUMENT_OUTPUT,

        document_key=document_key,

    ).exists()


# ==============================================================================
# Discovery
# ==============================================================================

def get_total_pages(
    soup: BeautifulSoup,
) -> int:

    pages: list[int] = []

    for a in soup.select("a[href*='page=']"):

        href = a.get("href", "")

        m = re.search(
            r"page=(\d+)",
            href,
        )

        if m:

            pages.append(
                int(
                    m.group(1),
                )
            )

    return max(pages) if pages else 1


def build_pages(
    *,
    source_url: str,
    total_pages: int,
) -> list[dict]:

    pages = []

    for page in range(
        1,
        total_pages + 1,
    ):

        if page == 1:

            url = source_url

        else:

            separator = "&" if "?" in source_url else "?"

            url = (
                f"{source_url}"
                f"{separator}"
                f"page={page}"
            )

        pages.append(

            {

                "page": page,

                "url": url,

            }

        )

    return pages


# ==============================================================================
# Persistence
# ==============================================================================

def save_catalog_runtime(
    *,
    document_key: str,
    runtime: dict,
):

    return AcquisitionDocument.objects.update_or_create(

        source_type=SOURCE_TYPE,

        source_name=SITE_NAME,

        document_type=DOCUMENT_OUTPUT,

        document_key=document_key,

        defaults={

            "content_type": "application/json",

            "content": json.dumps(

                runtime,

                ensure_ascii=False,

                indent=2,

            ),

        },

    )


# ==============================================================================
# Runtime
# ==============================================================================

def discover(
    *,
    force: bool = False,
) -> None:

    trace_pipeline(
        "CATALOG DISCOVERY",
    )

    print()
    print("=" * 70)
    print(f"📚 {SITE_NAME.upper()} CATALOG DISCOVERY")
    print("=" * 70)

    documents = (

        AcquisitionDocument.objects

        .filter(

            source_type=SOURCE_TYPE,

            source_name=SITE_NAME,

            document_type=DOCUMENT_INPUT,

        )

        .order_by(

            "document_key",

        )

    )

    success = []
    failed = []

    for document in documents:

        document_key = document.document_key

        if (

            not force

            and exists(
                document_key,
            )

        ):

            print(
                f"[CACHE] {document_key}",
            )

            success.append(
                document_key,
            )

            continue

        print(
            document_key,
        )

        try:

            soup = BeautifulSoup(

                document.content,

                "html.parser",

            )

            total_pages = get_total_pages(
                soup,
            )

            runtime = {

                "document_key": document_key,

                "source_url": document.source_url,

                "total_pages": total_pages,

                "pages": build_pages(

                    source_url=document.source_url,

                    total_pages=total_pages,

                ),

            }

            _, created = save_catalog_runtime(

                document_key=document_key,

                runtime=runtime,

            )

            print(

                f"  Pages : {total_pages}"

            )

            print(

                f"  Saved : {'CREATED' if created else 'UPDATED'}"

            )

            success.append(
                document_key,
            )

        except Exception as e:

            failed.append(

                (
                    document_key,
                    str(e),
                )

            )

            print(
                f"  ERROR : {e}"
            )

        print()

    print("=" * 70)
    print("RESULT")
    print("=" * 70)

    print(f"SUCCESS : {len(success)}")
    print(f"FAILED  : {len(failed)}")

    print("=" * 70)


# ==============================================================================
# Entry Point
# ==============================================================================

def main(
    *,
    method: str = "default",
    mid: str | None = None,
    list_only: bool = False,
    force: bool = False,
) -> None:

    discover(

        force=force,

    )


if __name__ == "__main__":

    main()