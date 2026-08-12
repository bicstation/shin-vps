#!/usr/bin/env python3
"""
==============================================================================
SHIN CORE LINX

ARK Runtime

Runtime Entry Point

Responsibilities

- Runtime Entry Point
- Pipeline Invocation
- CLI Argument Forwarding

Not Responsibilities

- Fetch Runtime
- Observation Runtime
- Formatter Runtime
- Mapper Runtime
- Integration Runtime

==============================================================================
"""

from __future__ import annotations

from .pipeline import run


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

    run(
        method=method,
        mid=mid,
        list_only=list_only,
        force=force,
    )


# ==============================================================================
# CLI
# ==============================================================================

if __name__ == "__main__":

    main()