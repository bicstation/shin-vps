#!/usr/bin/env python3
"""
==============================================================================
FILE:
    acquisition/sources/scraping/lenovo/import_reality.py

SHIN CORE LINX

LENOVO Reality Import Runtime

Reality JSON
        │
        ▼
AcquisitionDocument

Reality First
Observation First

Responsibilities

- Import Reality Package
- Restore AcquisitionDocument
- Preserve Reality

NOT Responsibilities

- Discovery
- Fetch
- Observation
- Formatter
- Mapper
- Integration

==============================================================================
"""

from __future__ import annotations

import json

from pathlib import Path

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

REALITY_DIR = (

    Path(__file__).parent

    / "reality"

    / "catalog"

)

# ==============================================================================
# Runtime
# ==============================================================================

def import_reality() -> None:
    """
    Import Reality Package.
    """

    trace_pipeline(

        "REALITY IMPORT",

    )

    print()

    print("=" * 70)

    print(f"📥 {SITE_NAME} REALITY IMPORT")

    print("=" * 70)

    if not REALITY_DIR.exists():

        print(

            "Reality Directory Not Found"

        )

        return

    files = sorted(

        REALITY_DIR.glob(

            "page*.json"

        )

    )

    imported = 0

    for file in files:

        runtime = json.loads(

            file.read_text(

                encoding="utf-8",

            )

        )

        _, created = (

            AcquisitionDocument.objects

            .update_or_create(

                source_type=runtime["source_type"],

                source_name=runtime["source_name"],

                document_type=runtime["document_type"],

                document_key=runtime["document_key"],

                defaults={

                    "source_url": runtime["source_url"],

                    "content_type": runtime["content_type"],

                    "content": runtime["content"],

                },

            )

        )

        print(

            f"✓ {file.name} : "

            f"{'CREATED' if created else 'UPDATED'}"

        )

        imported += 1

    print()

    print("=" * 70)

    print("RESULT")

    print("=" * 70)

    print(f"IMPORTED : {imported}")

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
    """
    Runtime Entry Point.
    """

    import_reality()


if __name__ == "__main__":

    main()