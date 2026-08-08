#!/usr/bin/env python3

# ============================================================================
# FILE:
# acquisition/sources/scraping/lenovo/pipeline.py
#
# SHIN CORE LINX
#
# LENOVO OpenAPI Runtime Pipeline
#
# Reality First
# Observation First
#
# Pipeline
#
# Seed
# │
# ▼
# OpenAPI Fetch
# │
# ▼
# OpenAPI Observation
# │
# ▼
# OpenAPI Formatter
# │
# ▼
# OpenAPI Mapper
# │
# ▼
# ImportDocument Writer
# │
# ▼
# Integration
# │
# ▼
# PCProduct
#
# Responsibilities
#
# - Coordinate Lenovo acquisition pipeline
# - Pass Runtime Contract between stages
# - Pass Import Contract between stages
# - Control Runtime Breakpoints
# - Report pipeline completion
#
# NOT Responsibilities
#
# - HTTP Acquisition
# - HTML Parsing
# - Reality Observation
# - Formatting
# - Mapping
# - Persistence
# - Product Building
# - Semantic Processing
#
# IMPORTANT
#
# Pipeline does NOT iterate over individual Seeds.
#
# Pipeline passes collection Contracts between Runtime stages.
#
# Each Runtime owns processing of its own collection.
#
# ============================================================================

from __future__ import annotations


from acquisition.common.trace.reality_trace import (
    trace_pipeline,
)


# ============================================================================
# Runtime Imports
# ============================================================================

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


# ============================================================================
# Breakpoint
# ============================================================================

BREAKPOINT = "integration"

# BREAKPOINT = "seed"
# BREAKPOINT = "fetch_openapi"
# BREAKPOINT = "observe_openapi"
# BREAKPOINT = "formatter_openapi"
# BREAKPOINT = "mapper_openapi"
# BREAKPOINT = "writer"
# BREAKPOINT = "integration"


# ============================================================================
# Runtime Names
# ============================================================================

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


# ============================================================================
# Breakpoint
# ============================================================================

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


# ============================================================================
# Runtime Wrappers
# ============================================================================

def run_seed(
    **kwargs,
) -> list[dict]:
    """
    Execute Seed Runtime.

    Returns
    -------
    list[dict]
        Lenovo Seed Reality collection.
    """

    return discover_seed(
        **kwargs,
    )


def run_fetch_openapi(
    *,
    seeds: list[dict],
    **kwargs,
) -> list[dict]:
    """
    Execute OpenAPI Fetch Runtime.

    Parameters
    ----------
    seeds:
        Lenovo Seed Reality collection.

    Returns
    -------
    list[dict]
        Lenovo OpenAPI Reality Runtime collection.

    NOTE
    ----
    The Fetch Runtime owns iteration over Seeds.
    """

    return fetch_openapi(
        seeds=seeds,
        **kwargs,
    )


def run_observe_openapi(
    *,
    runtimes: list[dict],
) -> None:
    """
    Execute OpenAPI Observation Runtime.

    Parameters
    ----------
    runtimes:
        Lenovo OpenAPI Reality Runtime collection.

    NOTE
    ----
    The Observation Runtime owns iteration over
    Reality Runtime entries.
    """

    observe_openapi(
        runtimes=runtimes,
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


# ============================================================================
# Runtime Pipeline
# ============================================================================

def run(
    **kwargs,
) -> None:
    """
    Execute LENOVO Runtime Pipeline.

    Pipeline is an orchestration layer only.

    Pipeline does NOT:

    - iterate over individual Seeds
    - fetch HTTP resources
    - observe Reality
    - format products
    - map contracts
    - write documents
    - build products

    Pipeline only passes Runtime Contracts between stages.
    """

    # ========================================================================
    # Seed Runtime
    # ========================================================================

    print()

    print("=" * 70)

    trace_pipeline(
        PIPELINE_SEED,
    )

    print("=" * 70)

    seeds = run_seed(
        **kwargs,
    )

    print()

    print(
        f"Seed Entries : {len(seeds)}"
    )

    for index, seed in enumerate(
        seeds,
        start=1,
    ):

        print(
            f"  [{index:>2}] "
            f"{seed.get('entry_name', '')}"
        )

    if checkpoint(
        "seed",
    ):

        return

    # ========================================================================
    # OpenAPI Fetch Runtime
    #
    # Pipeline passes the complete Seed collection.
    #
    # Fetch Runtime is responsible for processing each Seed.
    # ========================================================================

    print()

    print("=" * 70)

    trace_pipeline(
        PIPELINE_FETCH_OPENAPI,
    )

    print("=" * 70)

    runtimes = run_fetch_openapi(
        seeds=seeds,
        **kwargs,
    )

    print()

    print(
        f"OpenAPI Runtimes : "
        f"{len(runtimes)}"
    )

    if checkpoint(
        "fetch_openapi",
    ):

        return

    # ========================================================================
    # OpenAPI Observation Runtime
    #
    # Pipeline passes the complete Reality collection.
    #
    # Observation Runtime is responsible for processing
    # each Reality Runtime.
    # ========================================================================

    print()

    print("=" * 70)

    trace_pipeline(
        PIPELINE_OBSERVE_OPENAPI,
    )

    print("=" * 70)

    run_observe_openapi(
        runtimes=runtimes,
    )

    if checkpoint(
        "observe_openapi",
    ):

        return

    # ========================================================================
    # OpenAPI Formatter Runtime
    #
    # All observed products are now available as
    # AcquisitionDocument(product).
    #
    # Formatter owns its own collection processing.
    # ========================================================================

    print()

    print("=" * 70)

    trace_pipeline(
        PIPELINE_FORMATTER_OPENAPI,
    )

    print("=" * 70)

    formatted_runtimes = run_formatter_openapi()

    print()

    print(
        f"Formatted Products : "
        f"{len(formatted_runtimes)}"
    )

    if checkpoint(
        "formatter_openapi",
    ):

        return

    # ========================================================================
    # OpenAPI Mapper Runtime
    # ========================================================================

    print()

    print("=" * 70)

    trace_pipeline(
        PIPELINE_MAPPER_OPENAPI,
    )

    print("=" * 70)

    contracts = run_mapper_openapi(
        formatted_runtimes,
    )

    print()

    print(
        f"Import Contracts : "
        f"{len(contracts)}"
    )

    if checkpoint(
        "mapper_openapi",
    ):

        return

    # ========================================================================
    # ImportDocument Writer Runtime
    # ========================================================================

    print()

    print("=" * 70)

    trace_pipeline(
        PIPELINE_WRITER,
    )

    print("=" * 70)

    writer_result = run_writer(
        contracts,
    )

    print()

    print(
        f"Writer Result : "
        f"{writer_result}"
    )

    if checkpoint(
        "writer",
    ):

        return

    # ========================================================================
    # Integration Runtime
    # ========================================================================

    print()

    print("=" * 70)

    trace_pipeline(
        PIPELINE_INTEGRATION,
    )

    print("=" * 70)

    integration_result = run_integration()

    print()

    print(
        f"Integration Result : "
        f"{integration_result}"
    )

    if checkpoint(
        "integration",
    ):

        return

    # ========================================================================
    # Complete
    # ========================================================================

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


# ============================================================================
# Entry Point
# ============================================================================

def main(
    **kwargs,
) -> None:
    """
    LENOVO Runtime Entry Point.
    """

    run(
        **kwargs,
    )


# ============================================================================
# Standalone Execution
# ============================================================================

if __name__ == "__main__":

    main()