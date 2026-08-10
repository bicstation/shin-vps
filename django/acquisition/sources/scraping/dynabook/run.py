# ==============================================================================
#
# FILE:
# acquisition/sources/scraping/dynabook/run.py
#
# SHIN CORE LINX
#
# dynabook Scraping Runtime
#
# Entry Point
#
# Reality First
#
# ==============================================================================

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
    Execute dynabook Scraping Runtime.
    """

    pipeline(
        force=force,
    )


# ==============================================================================
# Direct Execution
# ==============================================================================

if __name__ == "__main__":

    main()