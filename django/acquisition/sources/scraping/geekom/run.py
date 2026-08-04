#!/usr/bin/env python3
"""
==============================================================================
FILE:
    acquisition/sources/scraping/geekom/run.py

SHIN CORE LINX
GEEKOM Acquisition Runtime

Entry Point

Pipeline

Reality Source
        │
        ▼
pipeline.py
        │
        ▼
PCProduct Payload
==============================================================================

Responsibilities

- Execute Acquisition Pipeline

NOT

- HTML Parsing
- Observation
- Adapter
- Integration
- Business Logic
==============================================================================
"""

from __future__ import annotations

from .pipeline import run

def main(
    *,
    method: str = "default",
    mid: str | None = None,
    list_only: bool = False,
    force: bool = False,
) -> None:
    """
    Execute Acquisition Pipeline.
    """

    run()


if __name__ == "__main__":
    main()