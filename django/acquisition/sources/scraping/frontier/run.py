#!/usr/bin/env python3
"""
==============================================================================
FRONTIER Runtime

Entry Point

Reality Source
        │
        ▼
Pipeline
        │
        ▼
Acquire Runtime
        │
        ▼
Observation Runtime
        │
        ▼
Mapper Runtime
        │
        ▼
Integration Runtime
==============================================================================
"""

from __future__ import annotations

from .pipeline import (
    main as pipeline,
)


# ==============================================================================
# Entry Point
# ==============================================================================

def main() -> None:
    """
    Execute FRONTIER Runtime.
    """

    pipeline()


if __name__ == "__main__":
    main()