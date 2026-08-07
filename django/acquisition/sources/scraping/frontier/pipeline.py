#!/usr/bin/env python3
"""
==============================================================================
FILE:
    acquisition/sources/scraping/frontier/pipeline.py

SHIN CORE LINX

FRONTIER Acquisition Pipeline

Reality Acquisition Framework

                    Reality
                       │
                       ▼
                 Fetch Runtime
                       │
                       ▼
                Acquire Runtime
                       │
                       ▼
             Observation Runtime
                       │
                       ▼
               Formatter Runtime
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

Responsibilities

- Execute Runtime Stages
- Preserve Runtime Order
- Coordinate Runtime Flow

NOT Responsibilities

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

from .discover_seed import (
    main as discover_seed,
)

from .acquire_listing import (
    main as acquire_listing,
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
# Breakpoint
# ==============================================================================

BREAKPOINT = "acquire"

# BREAKPOINT = "fetch"
# BREAKPOINT = "acquire"
# BREAKPOINT = "observation"
# BREAKPOINT = "formatter"
# BREAKPOINT = "mapper"
# BREAKPOINT = "integration"

# ==============================================================================
# Runtime Names
# ==============================================================================

PIPELINE_FETCH = "Fetch Runtime"

PIPELINE_ACQUIRE = "Acquire Runtime"

PIPELINE_OBSERVATION = "Observation Runtime"

PIPELINE_FORMATTER = "Formatter Runtime"

PIPELINE_MAPPER = "Mapper Runtime"

PIPELINE_INTEGRATION = "Integration Runtime"

PIPELINE_COMPLETE = "FRONTIER Runtime Complete"

# ==============================================================================
# Breakpoint
# ==============================================================================

def checkpoint(
    name: str,
) -> bool:
    """
    Runtime Breakpoint.
    """

    if BREAKPOINT != name:

        return False

    print()

    print("=" * 70)

    print(f"🛑 BREAKPOINT : {name}")

    print("=" * 70)

    return True


# ==============================================================================
# Stage Runner
# ==============================================================================

def run_stage(
    title: str,
    runtime,
    **kwargs,
) -> None:
    """
    Execute Runtime Stage.
    """

    print()

    print("=" * 70)

    trace_pipeline(
        title,
    )

    print("=" * 70)

    runtime(
        **kwargs,
    )


# ==============================================================================
# Runtime Wrappers
# ==============================================================================

def run_fetch(
    **kwargs,
) -> None:
    """
    Execute Fetch Runtime.
    """

    discover_seed(
        **kwargs,
    )


def run_acquire(
    **kwargs,
) -> None:
    """
    Execute Acquire Runtime.
    """

    acquire_listing(
        **kwargs,
    )


def run_observation(
    **kwargs,
) -> None:
    """
    Execute Observation Runtime.
    """

    observe(
        **kwargs,
    )


def run_formatter(
    **kwargs,
) -> None:
    """
    Execute Formatter Runtime.
    """

    #
    # Reserved
    #
    # Formatter Runtime will be implemented
    # after Observation Runtime.
    #

    return


def run_mapper(
    **kwargs,
) -> None:
    """
    Execute Mapper Runtime.
    """

    mapper(
        **kwargs,
    )


def run_integration(
    **kwargs,
) -> None:
    """
    Execute Integration Runtime.
    """

    integration(
        **kwargs,
    )

# ==============================================================================
# Runtime Pipeline
# ==============================================================================

def run(
    **kwargs,
) -> None:
    """
    Execute FRONTIER Runtime Pipeline.
    """

    #
    # Fetch Runtime
    #

    run_stage(

        PIPELINE_FETCH,

        run_fetch,

        **kwargs,

    )

    if checkpoint("fetch"):

        return

    #
    # Acquire Runtime
    #

    run_stage(

        PIPELINE_ACQUIRE,

        run_acquire,

        **kwargs,

    )

    if checkpoint("acquire"):

        return

    #
    # Observation Runtime
    #

    run_stage(

        PIPELINE_OBSERVATION,

        run_observation,

        **kwargs,

    )

    if checkpoint("observation"):

        return

    #
    # Formatter Runtime
    #

    run_stage(

        PIPELINE_FORMATTER,

        run_formatter,

        **kwargs,

    )

    if checkpoint("formatter"):

        return

    #
    # Mapper Runtime
    #

    run_stage(

        PIPELINE_MAPPER,

        run_mapper,

        **kwargs,

    )

    if checkpoint("mapper"):

        return

    #
    # Integration Runtime
    #

    run_stage(

        PIPELINE_INTEGRATION,

        run_integration,

        **kwargs,

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

def main(
    **kwargs,
) -> None:
    """
    FRONTIER Runtime Entry Point.
    """

    run(
        **kwargs,
    )


if __name__ == "__main__":

    main()