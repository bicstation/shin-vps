"""
SHIN CORE LINX
HP Runtime

Entry Point
"""

from __future__ import annotations

from .pipeline import (
    main as pipeline,
)


# ============================================================================
# Entry Point
# ============================================================================

def main(
    *,
    method: str = "default",
    mid: str | None = None,
    list_only: bool = False,
    force: bool = False,
) -> None:
    """
    Execute HP Runtime.

    Compatibility arguments are accepted from
    the shared import_products command.

    HP Runtime does not currently use:

    - method
    - mid
    - list_only
    - force
    """

    pipeline()


# ============================================================================
# Standalone Execution
# ============================================================================

if __name__ == "__main__":
    main()