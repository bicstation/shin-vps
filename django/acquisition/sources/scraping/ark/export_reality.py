# /home/maya/shin-vps/django/acquisition/sources/scraping/ark/export_reality.py
#!/usr/bin/env python3
"""
==============================================================================
SHIN CORE LINX

ARK Reality Export Runtime

AcquisitionDocument
        │
        ▼
Reality JSON

Responsibilities

- Export AcquisitionDocument
- Preserve Reality
- Produce Reality Package

Not Responsibilities

- Fetch
- Discovery
- Observation
- Formatter
- Mapper
- Integration

==============================================================================
"""

from __future__ import annotations

import json
from pathlib import Path

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

SOURCE_TYPE = "scraping"

DOCUMENT_TYPE = "catalog"

REALITY_DIR = (
    Path(__file__).parent
    / "reality"
    / "catalog"
)


# ==============================================================================
# Runtime
# ==============================================================================

def export(
) -> None:

    trace_pipeline(
        "REALITY EXPORT",
    )

    print()

    print("=" * 70)

    print(f"📦 {SITE_NAME.upper()} REALITY EXPORT")

    print("=" * 70)

    REALITY_DIR.mkdir(

        parents=True,

        exist_ok=True,

    )

    documents = (

        AcquisitionDocument.objects

        .filter(

            source_type=SOURCE_TYPE,

            source_name=SITE_NAME,

            document_type=DOCUMENT_TYPE,

        )

        .order_by(

            "document_key",

        )

    )

    exported = 0

    for document in documents:

        output = (

            REALITY_DIR

            / f"{document.document_key}.json"

        )

        runtime = {

            "source_type": document.source_type,

            "source_name": document.source_name,

            "document_type": document.document_type,

            "document_key": document.document_key,

            "source_url": document.source_url,

            "content_type": document.content_type,

            "content": document.content,

        }

        output.write_text(

            json.dumps(

                runtime,

                ensure_ascii=False,

                indent=2,

            ),

            encoding="utf-8",

        )

        print(

            f"✓ {output.name}"

        )

        exported += 1

    print()

    print("=" * 70)

    print("RESULT")

    print("=" * 70)

    print(f"EXPORTED : {exported}")

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

    export()


if __name__ == "__main__":

    main()