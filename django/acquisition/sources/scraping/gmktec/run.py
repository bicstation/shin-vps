"""
FILE:
acquisition/sources/scraping/gmktec/run.py

SHIN CORE LINX

GMKtec Acquisition Runtime

Entry Point

Pipeline

Responsibilities

- Execute Acquisition Pipeline

NOT

- HTML Parsing
- Observation
- Adapter
- Integration
- Business Logic
"""

from __future__ import annotations

from .pipeline import run


# ==========================================================
# Entry Point
# ==========================================================

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


# ==========================================================
# Standalone Execution
# ==========================================================

if __name__ == "__main__":
    main()