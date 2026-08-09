# ==============================================================================
#
# FILE:
# acquisition/sources/scraping/mouse/run.py
#
# SHIN CORE LINX
#
# MOUSE Runtime
#
# Entry Point
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
    Execute MOUSE Runtime.
    """

    pipeline(
        force=force,
    )


# ==============================================================================
# Direct Execution
# ==============================================================================

if __name__ == "__main__":

    main()