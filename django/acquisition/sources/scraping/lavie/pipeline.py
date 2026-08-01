#!/usr/bin/env python3
"""
==============================================================================
SHIN CORE LINX

LAVIE Runtime Pipeline

Reality Source
        │
        ▼
Acquire Runtime
        │
        ▼
Formatter Runtime
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

from .fetch_list import (
    main as fetch_seed,
)

from .discover_series import (
    main as discover_series,
)

from .discover_models import (
    main as discover_models,
)

from .fetch_products import (
    main as fetch_products,
)

from .observe import (
    main as observe,
)

from .mapper import (
    main as mapper,
)

from .integration import (
    main as integration,
)


# ==============================================================================
# Development
# ==============================================================================

BREAKPOINT = "seed"

# BREAKPOINT = "seed"
# BREAKPOINT = "series"
# BREAKPOINT = "model"
# BREAKPOINT = "product"
# BREAKPOINT = "observation"
# BREAKPOINT = "mapper"
# BREAKPOINT = "integration"


# ==============================================================================
# Pipeline Stage
# ==============================================================================

PIPELINE_ACQUIRE = "Acquire Runtime"

PIPELINE_OBSERVATION = "Observation Runtime"

PIPELINE_MAPPER = "Mapper Runtime"

PIPELINE_INTEGRATION = "Integration Runtime"

PIPELINE_COMPLETE = "LAVIE Runtime Complete"


# ==============================================================================
# Breakpoint
# ==============================================================================

def checkpoint(name: str) -> bool:

    if BREAKPOINT == name:

        print()

        print("=" * 70)

        print(f"🛑 BREAKPOINT : {name}")

        print("=" * 70)

        return True

    return False


# ==============================================================================
# Stage Runner
# ==============================================================================

def run_stage(
    title: str,
    runtime,
) -> None:

    print()

    print("=" * 70)

    trace_pipeline(
        title,
    )

    print("=" * 70)

    runtime()


# ==============================================================================
# Acquire Runtime
# ==============================================================================

def run_acquire() -> None:

    fetch_seed()

    if checkpoint("seed"):
        return

    discover_series()

    if checkpoint("series"):
        return

    discover_models()

    if checkpoint("model"):
        return

    fetch_products()

    if checkpoint("product"):
        return


# ==============================================================================
# Observation Runtime
# ==============================================================================

def run_observation() -> None:

    observe()

    checkpoint("observation")


# ==============================================================================
# Mapper Runtime
# ==============================================================================

def run_mapper() -> None:

    mapper()

    checkpoint("mapper")


# ==============================================================================
# Integration Runtime
# ==============================================================================

def run_integration() -> None:

    integration()

    checkpoint("integration")


# ==============================================================================
# Runtime Pipeline
# ==============================================================================

def run() -> None:

    run_stage(
        PIPELINE_ACQUIRE,
        run_acquire,
    )

    if checkpoint("seed"):
        return

    if checkpoint("series"):
        return

    if checkpoint("model"):
        return

    if checkpoint("product"):
        return

    run_stage(
        PIPELINE_OBSERVATION,
        run_observation,
    )

    if checkpoint("observation"):
        return

    run_stage(
        PIPELINE_MAPPER,
        run_mapper,
    )

    if checkpoint("mapper"):
        return

    run_stage(
        PIPELINE_INTEGRATION,
        run_integration,
    )

    if checkpoint("integration"):
        return

    print()

    print("=" * 70)

    trace_pipeline(
        PIPELINE_COMPLETE,
    )

    print("=" * 70)


# ==============================================================================
# Entry Point
# ==============================================================================

def main() -> None:

    run()


if __name__ == "__main__":

    main()