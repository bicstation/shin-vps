#!/usr/bin/env python3
"""
==============================================================================
FILE:
    acquisition/sources/scraping/lenovo/pipeline.py

SHIN CORE LINX

LENOVO OpenAPI Runtime Pipeline

Reality First
Observation First

Pipeline

Seed
    │
    ▼
OpenAPI Fetch
    │
    ▼
OpenAPI Observation
    │
    ▼
OpenAPI Formatter
    │
    ▼
OpenAPI Mapper
    │
    ▼
ImportDocument Writer
    │
    ▼
Integration
    │
    ▼
PCProduct

Responsibilities

- Coordinate Lenovo acquisition pipeline
- Pass Runtime Contract between stages
- Pass Import Contract between stages
- Control Runtime Breakpoints
- Report pipeline completion

NOT Responsibilities

- HTTP Acquisition
- HTML Parsing
- Reality Observation
- Formatting
- Mapping
- Persistence
- Product Building
- Semantic Processing

==============================================================================

Important

Pipeline is an orchestration layer.

Pipeline does NOT rebuild Runtime data.

Pipeline does NOT modify Contracts.

Each Runtime owns its own responsibility.

==============================================================================
"""

from __future__ import annotations


from acquisition.common.trace.reality_trace import (
    trace_pipeline,
)


# ==============================================================================
# Runtime Imports
# ==============================================================================

from .discover_seed import (
    main as discover_seed,
)

from .fetch_openapi import (
    main as fetch_openapi,
)

from .observe_openapi import (
    main as observe_openapi,
)

from .formatter_openapi import (
    main as formatter_openapi,
)

from .mapper import (
    main as mapper_openapi,
)

from .writer import (
    main as writer,
)

from .integration import (
    main as integration,
)


# ==============================================================================
# Breakpoint
# ==============================================================================

BREAKPOINT = "integration"

# BREAKPOINT = "seed"
# BREAKPOINT = "fetch_openapi"
# BREAKPOINT = "observe_openapi"
# BREAKPOINT = "formatter_openapi"
# BREAKPOINT = "mapper_openapi"
# BREAKPOINT = "writer"
# BREAKPOINT = "integration"


# ==============================================================================
# Runtime Names
# ==============================================================================

PIPELINE_SEED = (
    "Seed Runtime"
)

PIPELINE_FETCH_OPENAPI = (
    "OpenAPI Fetch Runtime"
)

PIPELINE_OBSERVE_OPENAPI = (
    "OpenAPI Observation Runtime"
)

PIPELINE_FORMATTER_OPENAPI = (
    "OpenAPI Formatter Runtime"
)

PIPELINE_MAPPER_OPENAPI = (
    "OpenAPI Mapper Runtime"
)

PIPELINE_WRITER = (
    "ImportDocument Writer Runtime"
)

PIPELINE_INTEGRATION = (
    "Integration Runtime"
)

PIPELINE_COMPLETE = (
    "LENOVO Runtime Complete"
)


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

    print(
        f"🛑 BREAKPOINT : {name}"
    )

    print("=" * 70)

    return True

# ==============================================================================
# Runtime Wrappers
# ==============================================================================

def run_seed(
    **kwargs,
) -> None:
    """
    Execute Seed Runtime.
    """

    discover_seed(
        **kwargs,
    )


def run_fetch_openapi(
    **kwargs,
) -> dict:
    """
    Execute OpenAPI Fetch Runtime.

    Returns
    -------
    dict
        Lenovo OpenAPI Reality Runtime.
    """

    return fetch_openapi(
        **kwargs,
    )


def run_observe_openapi(
    *,
    runtime: dict,
) -> None:
    """
    Execute OpenAPI Observation Runtime.
    """

    observe_openapi(
        runtime=runtime,
    )


def run_formatter_openapi() -> list[dict]:
    """
    Execute OpenAPI Formatter Runtime.

    Returns
    -------
    list[dict]
        Formatter Runtime Contracts.
    """

    return formatter_openapi()


def run_mapper_openapi(
    runtimes: list[dict],
) -> list[dict]:
    """
    Execute OpenAPI Mapper Runtime.

    Parameters
    ----------
    runtimes:
        Formatter Runtime Contracts.

    Returns
    -------
    list[dict]
        Import Contracts.
    """

    return mapper_openapi(
        runtimes=runtimes,
    )


def run_writer(
    contracts: list[dict],
) -> dict:
    """
    Execute ImportDocument Writer Runtime.

    Parameters
    ----------
    contracts:
        Import Contracts produced by Mapper.

    Returns
    -------
    dict
        Writer Runtime result.
    """

    return writer(
        contracts=contracts,
    )


def run_integration() -> object:
    """
    Execute Integration Runtime.
    """

    return integration()

# ==============================================================================
# Runtime Pipeline
# ==============================================================================

def run(
    **kwargs,
) -> None:
    """
    Execute LENOVO Runtime Pipeline.
    """

    # --------------------------------------------------------------------------
    # Seed Runtime
    # --------------------------------------------------------------------------

    print()

    print("=" * 70)

    trace_pipeline(
        PIPELINE_SEED,
    )

    print("=" * 70)

    run_seed(
        **kwargs,
    )

    if checkpoint("seed"):

        return

    # --------------------------------------------------------------------------
    # OpenAPI Fetch Runtime
    # --------------------------------------------------------------------------

    print()

    print("=" * 70)

    trace_pipeline(
        PIPELINE_FETCH_OPENAPI,
    )

    print("=" * 70)

    runtime = run_fetch_openapi(
        **kwargs,
    )

    if checkpoint("fetch_openapi"):

        return

    # --------------------------------------------------------------------------
    # OpenAPI Observation Runtime
    # --------------------------------------------------------------------------

    print()

    print("=" * 70)

    trace_pipeline(
        PIPELINE_OBSERVE_OPENAPI,
    )

    print("=" * 70)

    run_observe_openapi(
        runtime=runtime,
    )

    if checkpoint("observe_openapi"):

        return

    # --------------------------------------------------------------------------
    # OpenAPI Formatter Runtime
    # --------------------------------------------------------------------------

    print()

    print("=" * 70)

    trace_pipeline(
        PIPELINE_FORMATTER_OPENAPI,
    )

    print("=" * 70)

    runtimes = run_formatter_openapi()

    print()

    print(
        f"Formatted Products : "
        f"{len(runtimes)}"
    )

    if checkpoint("formatter_openapi"):

        return

    # --------------------------------------------------------------------------
    # OpenAPI Mapper Runtime
    # --------------------------------------------------------------------------

    print()

    print("=" * 70)

    trace_pipeline(
        PIPELINE_MAPPER_OPENAPI,
    )

    print("=" * 70)

    contracts = run_mapper_openapi(
        runtimes,
    )

    print()

    print(
        f"Import Contracts : "
        f"{len(contracts)}"
    )

    if checkpoint("mapper_openapi"):

        return

    # --------------------------------------------------------------------------
    # ImportDocument Writer Runtime
    # --------------------------------------------------------------------------

    print()

    print("=" * 70)

    trace_pipeline(
        PIPELINE_WRITER,
    )

    print("=" * 70)

    writer_result = run_writer(
        contracts,
    )

    if checkpoint("writer"):

        return

    # --------------------------------------------------------------------------
    # Integration Runtime
    # --------------------------------------------------------------------------

    print()

    print("=" * 70)

    trace_pipeline(
        PIPELINE_INTEGRATION,
    )

    print("=" * 70)

    integration_result = run_integration()

    if checkpoint("integration"):

        return

    # --------------------------------------------------------------------------
    # Complete
    # --------------------------------------------------------------------------

    print()

    print("=" * 70)

    trace_pipeline(
        PIPELINE_COMPLETE,
    )

    print("=" * 70)

    print()

    print(
        "LENOVO PIPELINE COMPLETE"
    )

# ==============================================================================
# Entry Point
# ==============================================================================

def main(
    **kwargs,
) -> None:
    """
    LENOVO Runtime Entry Point.
    """

    run(
        **kwargs,
    )


# ==============================================================================
# Standalone Execution
# ==============================================================================

if __name__ == "__main__":

    main()