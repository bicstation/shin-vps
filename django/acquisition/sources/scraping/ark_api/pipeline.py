#!/usr/bin/env python3

# ============================================================================
#
# FILE:
# acquisition/sources/scraping/ark/pipeline.py
#
# SHIN CORE LINX
#
# ARK Runtime Pipeline
#
# Reality First
# Observation First
#
# Pipeline
#
# Seed
# │
# ▼
# ARK Fetch
# │
# ▼
# ARK Observation
# │
# ▼
# ARK Formatter
# │
# ▼
# ARK Mapper
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
# - Coordinate ARK acquisition pipeline
# - Pass Runtime Contracts between stages
# - Control Runtime Breakpoints
# - Report pipeline completion
#
# NOT
#
# - HTTP Acquisition
# - ARK HTML Parsing
# - Reality Observation
# - Formatting
# - Mapping
# - Persistence
# - Product Building
# - Semantic Processing
#
# ============================================================================

from __future__ import annotations

from acquisition.common.trace.reality_trace import (
    trace_pipeline,
)

from .discover_seed import (
    main as discover_seed,
)

from .fetch_ark import (
    main as fetch_ark,
)

from .observe_ark import (
    main as observe_ark,
)

from .formatter import (
    main as formatter,
)

from .mapper import (
    main as mapper,
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


# ----------------------------------------------------------------------------
# Available Breakpoints
# ----------------------------------------------------------------------------
#
# "seed"
#
#   Seed Reality確認後に停止
#
# "fetch_ark"
#
#   ARK HTML Acquisition確認後に停止
#
# "observe_ark"
#
#   ARK Product Reality確認後に停止
#
# "formatter"
#
#   Formatter確認後に停止
#
# "mapper"
#
#   Import Contract確認後に停止
#
# "writer"
#
#   ImportDocument Writer確認後に停止
#
# "integration"
#
#   Integration前で停止
#
# None
#
#   Pipeline Completeまで実行
#
# ----------------------------------------------------------------------------
#
# Example
#
# BREAKPOINT = "seed"
#
# BREAKPOINT = "fetch_ark"
#
# BREAKPOINT = "observe_ark"
#
# BREAKPOINT = "formatter"
#
# BREAKPOINT = "mapper"
#
# BREAKPOINT = "writer"
#
# BREAKPOINT = "integration"
#
# BREAKPOINT = None
#
# ----------------------------------------------------------------------------


# ============================================================================
# Runtime Names
# ============================================================================

PIPELINE_SEED = (
    "Seed Runtime"
)

PIPELINE_FETCH_ARK = (
    "ARK Fetch Runtime"
)

PIPELINE_OBSERVE_ARK = (
    "ARK Observation Runtime"
)

PIPELINE_FORMATTER = (
    "ARK Formatter Runtime"
)

PIPELINE_MAPPER = (
    "ARK Mapper Runtime"
)

PIPELINE_WRITER = (
    "ImportDocument Writer Runtime"
)

PIPELINE_INTEGRATION = (
    "Integration Runtime"
)

PIPELINE_COMPLETE = (
    "ARK Runtime Complete"
)


# ============================================================================
# Breakpoint
# ============================================================================

def checkpoint(
    name: str,
) -> bool:

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

    return discover_seed(
        **kwargs,
    )


def run_fetch_ark(
    *,
    seeds: list[dict],
    **kwargs,
) -> list[dict]:

    return fetch_ark(
        seeds=seeds,
        **kwargs,
    )


def run_observe_ark(
    *,
    runtimes: list[dict],
    **kwargs,
):

    return observe_ark(
        runtimes=runtimes,
        **kwargs,
    )


def run_formatter(
    **kwargs,
) -> list[dict]:

    return formatter(
        **kwargs,
    )


def run_mapper(
    runtimes: list[dict],
    **kwargs,
) -> list[dict]:

    return mapper(
        runtimes=runtimes,
        **kwargs,
    )


def run_writer(
    contracts: list[dict],
    **kwargs,
) -> dict:

    return writer(
        contracts=contracts,
        **kwargs,
    )


def run_integration(
    **kwargs,
) -> object:

    return integration(
        **kwargs,
    )


# ============================================================================
# Runtime Pipeline
# ============================================================================

def run(
    **kwargs,
) -> None:

    # ========================================================================
    # Seed
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

    if checkpoint("seed"):
        return

    # ========================================================================
    # ARK Fetch
    # ========================================================================

    print()
    print("=" * 70)

    trace_pipeline(
        PIPELINE_FETCH_ARK,
    )

    print("=" * 70)

    runtimes = run_fetch_ark(
        seeds=seeds,
        **kwargs,
    )

    print()
    print(
        f"ARK Fetch Runtimes : "
        f"{len(runtimes)}"
    )

    if checkpoint("fetch_ark"):
        return

    # ========================================================================
    # ARK Observation
    # ========================================================================

    print()
    print("=" * 70)

    trace_pipeline(
        PIPELINE_OBSERVE_ARK,
    )

    print("=" * 70)

    product_realities = run_observe_ark(
        runtimes=runtimes,
        **kwargs,
    )

    if product_realities is None:

        product_realities = runtimes

    print()
    print(
        f"Product Realities : "
        f"{len(product_realities)}"
    )

    if checkpoint("observe_ark"):
        return

    # ========================================================================
    # Formatter
    # ========================================================================

    print()
    print("=" * 70)

    trace_pipeline(
        PIPELINE_FORMATTER,
    )

    print("=" * 70)

    formatted_runtimes = run_formatter(
        runtimes=product_realities,
        **kwargs,
    )

    print()
    print(
        f"Formatted Products : "
        f"{len(formatted_runtimes)}"
    )

    if checkpoint("formatter"):
        return

    # ========================================================================
    # Mapper
    # ========================================================================

    print()
    print("=" * 70)

    trace_pipeline(
        PIPELINE_MAPPER,
    )

    print("=" * 70)

    contracts = run_mapper(
        formatted_runtimes,
        **kwargs,
    )

    print()
    print(
        f"Import Contracts : "
        f"{len(contracts)}"
    )

    if checkpoint("mapper"):
        return

    # ========================================================================
    # Writer
    # ========================================================================

    print()
    print("=" * 70)

    trace_pipeline(
        PIPELINE_WRITER,
    )

    print("=" * 70)

    writer_result = run_writer(
        contracts,
        **kwargs,
    )

    print()
    print(
        f"Writer Result : "
        f"{writer_result}"
    )

    if checkpoint("writer"):
        return

    # ========================================================================
    # Integration
    # ========================================================================

    print()
    print("=" * 70)

    trace_pipeline(
        PIPELINE_INTEGRATION,
    )

    print("=" * 70)

    integration_result = run_integration(
        **kwargs,
    )

    print()
    print(
        f"Integration Result : "
        f"{integration_result}"
    )

    if checkpoint("integration"):
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
        "ARK PIPELINE COMPLETE"
    )


# ============================================================================
# Entry Point
# ============================================================================

def main(
    **kwargs,
) -> None:

    run(
        **kwargs,
    )


# ============================================================================
# Standalone Execution
# ============================================================================

if __name__ == "__main__":

    main()