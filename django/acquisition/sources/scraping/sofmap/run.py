"""
==============================================================================
FILE:
    acquisition/sources/scraping/sofmap/run.py

SHIN CORE LINX

sofmap Runtime

Entry Point
==============================================================================
"""

from __future__ import annotations


from .pipeline import (
    main as pipeline,
)


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
    Execute STORM Runtime.
    """

    pipeline(
        force=force,
    )


if __name__ == "__main__":

    main()