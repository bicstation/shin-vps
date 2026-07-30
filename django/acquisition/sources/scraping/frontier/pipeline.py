#!/usr/bin/env python3
"""
==============================================================================
FRONTIER Runtime Pipeline

Reality Source
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
        │
        ▼
PCProduct

Reality First
Observation First
Translation Authority
Semantic Later
==============================================================================
"""

from __future__ import annotations

from acquisition.common.trace.reality_trace import (
    trace_pipeline,
)

from .fetch_list import main as fetch_seed
from .discover_series import main as discover_series
from .discover_models import main as discover_models
from .fetch_products import main as fetch_products

from .observe import main as observe

from .mapper import main as mapper

from .integration import main as integration


# ==============================================================================
# Acquire Runtime
# ==============================================================================

def run_acquire() -> None:
    """
    Execute Acquire Runtime.
    """

    fetch_seed()

    discover_series()

    discover_models()

    fetch_products()


# ==============================================================================
# Observation Runtime
# ==============================================================================

def run_observation() -> None:
    """
    Execute Observation Runtime.
    """

    observe()


# ==============================================================================
# Mapper Runtime
# ==============================================================================

def run_mapper() -> None:
    """
    Execute Mapper Runtime.
    """

    mapper()


# ==============================================================================
# Integration Runtime
# ==============================================================================

def run_integration() -> None:
    """
    Execute Integration Runtime.
    """

    integration()


# ==============================================================================
# Pipeline
# ==============================================================================

def run() -> None:
    """
    Execute complete FRONTIER Runtime Pipeline.
    """

    print()
    print("=" * 70)
    trace_pipeline("Acquire Runtime")
    print("=" * 70)

    run_acquire()

    print()
    print("=" * 70)
    trace_pipeline("Observation Runtime")
    print("=" * 70)

    run_observation()

    print()
    print("=" * 70)
    trace_pipeline("Mapper Runtime")
    print("=" * 70)

    run_mapper()

    print()
    print("=" * 70)
    trace_pipeline("Integration Runtime")
    print("=" * 70)

    run_integration()

    print()
    print("=" * 70)
    trace_pipeline("FRONTIER Runtime Complete")
    print("=" * 70)


# ==============================================================================
# Entry Point
# ==============================================================================

def main() -> None:
    """
    Runtime Entry Point.
    """

    run()


if __name__ == "__main__":
    main()