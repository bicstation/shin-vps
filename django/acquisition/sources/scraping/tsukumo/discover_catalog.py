#!/usr/bin/env python3
"""
==============================================================================
SHIN CORE LINX

TSUKUMO Catalog Discovery

Catalog Runtime

AcquisitionDocument (catalog)
        │
        ▼
Catalog Runtime
        │
        ▼
AcquisitionDocument (catalog_runtime)

Reality First
Observation First

Responsibilities

- Discover Catalog Reality
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

from api.models.acquisition_document import (
    AcquisitionDocument,
)

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


# ==============================================================================
# Cache
# ==============================================================================

def exists(
    document_key: str,
) -> bool:

    return AcquisitionDocument.objects.filter(

        source_type="scraping",

        source_name=SITE_NAME.lower(),

        document_type=DOCUMENT_OUTPUT,

        document_key=document_key,

    ).exists()


# ==============================================================================
# Persistence
# ==============================================================================

def save_catalog_runtime(
    *,
    document_key: str,
    runtime: dict,
):

    document, created = AcquisitionDocument.objects.update_or_create(

        source_type="scraping",

        source_name=SITE_NAME.lower(),

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

    return document, created

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

    print("=" * 70)
    print(f"📚 {SITE_NAME} CATALOG DISCOVERY")
    print("=" * 70)

    documents = (

        AcquisitionDocument.objects

        .filter(

            source_type="scraping",

            source_name=SITE_NAME.lower(),

            document_type=DOCUMENT_INPUT,

        )

        .order_by(

            "document_key",

        )

    )

    success: list[str] = []

    failed: list[tuple[str, str]] = []

    for document in documents:

        document_key = document.document_key

        if (

            not force

            and exists(
                document_key,
            )

        ):

            success.append(
                document_key,
            )

            print(
                f"[CACHE] {document_key}"
            )

            continue

        print(
            document_key,
        )

        try:

            #
            # Reality
            #

            runtime = {

                "document_key": document_key,

                "source_url": document.source_url,

                "content_type": document.content_type,

                "html": document.content,

            }

            _, created = save_catalog_runtime(

                document_key=document_key,

                runtime=runtime,

            )

            success.append(

                document_key,

            )

            print(

                f"  Saved : {'CREATED' if created else 'UPDATED'}"

            )
            
        except Exception as e:

            failed.append(

                (

                    document_key,

                    str(e),

                )

            )

            print(

                "  Status : ERROR"

            )

            print(

                f"  Reason : {e}"

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
    **kwargs,
) -> None:

    discover(

        force=kwargs.get(

            "force",

            False,

        ),

    )


if __name__ == "__main__":

    main()