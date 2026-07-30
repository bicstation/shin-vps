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

Overview

Execute the complete FRONTIER Runtime Pipeline.

Each Runtime is responsible for exactly one stage
of the acquisition lifecycle.

Responsibilities

- Execute Runtime Stages
- Preserve Runtime Order
- Coordinate Runtime Flow

Not Responsibilities

- HTML Parsing
- Reality Observation
- Mapping
- Product Building
- Semantic Processing
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
# Pipeline Stage
# ==============================================================================

PIPELINE_ACQUIRE = "Acquire Runtime"

PIPELINE_OBSERVATION = "Observation Runtime"

PIPELINE_MAPPER = "Mapper Runtime"

PIPELINE_INTEGRATION = "Integration Runtime"

PIPELINE_COMPLETE = "FRONTIER Runtime Complete"


# ==============================================================================
# Stage Runner
# ==============================================================================

def run_stage(
    title: str,
    runtime,
) -> None:
    """
    Execute a Runtime stage.
    """

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
    """
    Execute Acquire Runtime.
    """

    #
    # Seed Discovery
    #

    fetch_seed()

    #
    # Runtime Discovery
    #

    discover_series()

    discover_models()

    #
    # Product Acquisition
    #

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
# Runtime Pipeline
# ==============================================================================

def run() -> None:
    """
    Execute the complete Runtime Pipeline.
    """

    run_stage(
        PIPELINE_ACQUIRE,
        run_acquire,
    )

    run_stage(
        PIPELINE_OBSERVATION,
        run_observation,
    )

    run_stage(
        PIPELINE_MAPPER,
        run_mapper,
    )

    run_stage(
        PIPELINE_INTEGRATION,
        run_integration,
    )

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
    """
    Runtime Entry Point.
    """

    run()


if __name__ == "__main__":
    main()