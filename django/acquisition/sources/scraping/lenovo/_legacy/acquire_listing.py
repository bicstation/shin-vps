#!/usr/bin/env python3
"""
==============================================================================
FILE:
    acquisition/sources/scraping/lenovo/acquire_listing.py

SHIN CORE LINX

LENOVO Listing Acquire Runtime

Reality First Pipeline

Seed Reality
        │
        ▼
Fetch Listing Runtime
        │
        ▼
AcquisitionDocument(seed)
        │
        ├──────────────┐
        │              │
        ▼              ▼
Reality Export   Reality Import
        │              │
        └──────┬───────┘
               ▼
      AcquisitionDocument

Reality First
Observation First

Responsibilities

- Execute Listing Acquisition Runtime
- Dispatch Reality Runtime
- Preserve Published Reality

NOT Responsibilities

- Browser Automation
- HTML Parsing
- Observation
- Formatter
- Mapper
- Semantic Processing
- Product Building

==============================================================================
"""

from __future__ import annotations

from acquisition.common.trace.reality_trace import (
    trace_pipeline,
)

from .fetch_listing import (
    main as fetch_listing,
)

from .export_reality import (
    main as export_reality,
)

from .import_reality import (
    main as import_reality,
)

from ..settings import (
    REALITY_MODE,
    SITE_NAME,
)


# ==============================================================================
# Runtime
# ==============================================================================

def acquire(
    *,
    force: bool = False,
) -> None:
    """
    Execute Listing Acquire Runtime.
    """

    print("=" * 70)

    print(f"🌐 {SITE_NAME} LISTING ACQUIRE")

    print("=" * 70)

    print(f"Reality Mode : {REALITY_MODE}")

    print("=" * 70)

    trace_pipeline(
        "ACQUIRE",
    )

    #
    # Reality Export
    #

    if REALITY_MODE == "export":

        #
        # Fetch Listing HTML
        #

        fetch_listing(

            force=force,

        )

        #
        # Export Reality Package
        #

        export_reality()

        return

    #
    # Reality Import
    #

    if REALITY_MODE == "import":

        import_reality()

        return

    #
    # Unknown Reality Mode
    #

    raise RuntimeError(

        f"Unknown Reality Mode : {REALITY_MODE}"

    )


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

    acquire(
        force=force,
    )


if __name__ == "__main__":

    main()