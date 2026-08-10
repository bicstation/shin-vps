#!/usr/bin/env python3

# ==============================================================================
#
# FILE:
#
# acquisition/sources/scraping/dell/pipeline.py
#
# SHIN CORE LINX
#
# DELL Runtime Pipeline
#
# Reality Acquisition Framework
#
# DELL-specific entry:
#
# PCProduct
# │
# ▼
# Seed Runtime
# │
# ▼
# URL Resolver
# │
# ▼
# Listing Acquire Runtime
# │
# ▼
# Listing Observation Runtime
# │
# ▼
# Card Formatter Runtime
# │
# ▼
# Mapper Runtime
# │
# ▼
# ImportDocument Writer Runtime
# │
# ▼
# Integration Runtime
#
# Reality First
# Observation First
# Translation Authority
# Semantic Later
#
# Responsibilities
#
# - Execute Runtime Stages
# - Preserve Runtime Order
# - Coordinate Runtime Flow
#
# NOT Responsibilities
#
# - HTML Parsing
# - Reality Observation
# - Runtime Formatting
# - Mapping
# - Product Building
# - Semantic Processing
#
# ==============================================================================

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

from .observe_listing import (
    main as observe_listing,
)

from .formatter_cards import (
    main as formatter_cards,
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


# ==============================================================================
# Breakpoint
# ==============================================================================

BREAKPOINT = "formatter"

# BREAKPOINT = "seed"
# BREAKPOINT = "acquire_listing"
# BREAKPOINT = "observe_listing"
# BREAKPOINT = "formatter"
# BREAKPOINT = "mapper"
# BREAKPOINT = "writer"
# BREAKPOINT = "integration"


# ==============================================================================
# Runtime Names
# ==============================================================================

PIPELINE_SEED = (
    "Seed Runtime"
)

PIPELINE_ACQUIRE_LISTING = (
    "Listing Acquire Runtime"
)

PIPELINE_OBSERVE_LISTING = (
    "Listing Observation Runtime"
)

PIPELINE_FORMATTER = (
    "Card Formatter Runtime"
)

PIPELINE_MAPPER = (
    "Mapper Runtime"
)

PIPELINE_WRITER = (
    "ImportDocument Writer Runtime"
)

PIPELINE_INTEGRATION = (
    "Integration Runtime"
)

PIPELINE_COMPLETE = (
    "dell Runtime Complete"
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

    print(
        "=" * 70
    )

    print(
        f"🛑 BREAKPOINT : {name}"
    )

    print(
        "=" * 70
    )

    return True


# ==============================================================================
# Stage Runner
# ==============================================================================

def run_stage(
    title: str,
    runtime,
    **kwargs,
) -> object:
    """
    Execute Runtime Stage.

    Pipeline is responsible only for orchestration.
    """

    print()

    print(
        "=" * 70
    )

    trace_pipeline(
        title,
    )

    print(
        "=" * 70
    )

    return runtime(
        **kwargs,
    )


# ==============================================================================
# Runtime Wrappers
# ==============================================================================

def run_seed():
    """
    Execute DELL Seed Runtime.

    DELL does not use seed.tsv as the Reality source.

    The Seed Runtime discovers existing DELL PCProducts
    from the database and validates their affiliate URLs.

    Runtime options are not accepted here.
    """

    return discover_seed()


def run_acquire_listing(
    *,
    force: bool = False,
) -> None:
    """
    Execute DELL Listing Acquire Runtime.

    force belongs exclusively to Listing Acquire.
    """

    return acquire_listing(
        force=force,
    )


def run_observe_listing() -> list[dict]:
    """
    Execute DELL Listing Observation Runtime.

    Returns:

        Observation Reality
    """

    return observe_listing()


def run_formatter(
    observations: list[dict],
) -> list[dict]:
    """
    Execute DELL Card Formatter Runtime.

    Input:

        Observation Reality

    Output:

        Runtime Contracts
    """

    return formatter_cards(
        observations,
    )


def run_mapper():
    """
    Execute Mapper Runtime.
    """

    return mapper()


def run_writer(
    contracts,
):
    """
    Execute ImportDocument Writer Runtime.
    """

    return writer(
        contracts,
    )


def run_integration() -> None:
    """
    Execute Integration Runtime.
    """

    return integration()


# ==============================================================================
# Runtime Pipeline
# ==============================================================================

def run(
    *,
    force: bool = False,
) -> None:
    """
    Execute DELL Runtime Pipeline.

    Runtime options are explicitly routed to the Runtime
    that owns them.

    force
        → Listing Acquire Runtime only.

    DELL acquisition flow:

        PCProduct
            ↓
        Seed Runtime
            ↓
        URL Resolver
            ↓
        Listing Acquire
            ↓
        Listing Observation
            ↓
        Formatter
            ↓
        Mapper
            ↓
        Writer
            ↓
        Integration
    """

    # --------------------------------------------------------------------------
    # Seed Runtime
    #
    # DELL:
    #
    #   PCProduct DB
    #       ↓
    #   Existing DELL products
    # --------------------------------------------------------------------------

    run_stage(
        PIPELINE_SEED,
        run_seed,
    )

    if checkpoint(
        "seed",
    ):
        return

    # --------------------------------------------------------------------------
    # Listing Acquire Runtime
    #
    # DELL:
    #
    #   PCProduct.affiliate_url
    #          ↓
    #   url_resolver.py
    #          ↓
    #   DELL Official URL
    #          ↓
    #   HTTP
    #          ↓
    #   HTML
    # --------------------------------------------------------------------------

    run_stage(
        PIPELINE_ACQUIRE_LISTING,
        run_acquire_listing,
        force=force,
    )

    if checkpoint(
        "acquire_listing",
    ):
        return

    # --------------------------------------------------------------------------
    # Listing Observation Runtime
    #
    # HTML
    #   ↓
    # Manufacturer Reality
    #   ↓
    # Observation
    # --------------------------------------------------------------------------

    observations = run_stage(
        PIPELINE_OBSERVE_LISTING,
        run_observe_listing,
    )

    if checkpoint(
        "observe_listing",
    ):
        return

    # --------------------------------------------------------------------------
    # Card Formatter Runtime
    #
    # Observation
    #      ↓
    # Runtime Contract
    # --------------------------------------------------------------------------

    contracts = run_stage(
        PIPELINE_FORMATTER,
        run_formatter,
        observations=observations,
    )

    if checkpoint(
        "formatter",
    ):
        return

    # --------------------------------------------------------------------------
    # Mapper Runtime
    # --------------------------------------------------------------------------

    print()

    print(
        "=" * 70
    )

    trace_pipeline(
        PIPELINE_MAPPER,
    )

    print(
        "=" * 70
    )

    contracts = run_mapper()

    if checkpoint(
        "mapper",
    ):
        return

    # --------------------------------------------------------------------------
    # ImportDocument Writer Runtime
    # --------------------------------------------------------------------------

    print()

    print(
        "=" * 70
    )

    trace_pipeline(
        PIPELINE_WRITER,
    )

    print(
        "=" * 70
    )

    run_writer(
        contracts=contracts,
    )

    if checkpoint(
        "writer",
    ):
        return

    # --------------------------------------------------------------------------
    # Integration Runtime
    # --------------------------------------------------------------------------

    run_stage(
        PIPELINE_INTEGRATION,
        run_integration,
    )

    if checkpoint(
        "integration",
    ):
        return

    # --------------------------------------------------------------------------
    # Complete
    # --------------------------------------------------------------------------

    print()

    print(
        "=" * 70
    )

    trace_pipeline(
        PIPELINE_COMPLETE,
    )

    print(
        "=" * 70
    )


# ==============================================================================
# Entry Point
# ==============================================================================

def main(
    *,
    force: bool = False,
) -> None:
    """
    DELL Runtime Entry Point.
    """

    run(
        force=force,
    )


# ==============================================================================
# Direct Execution
# ==============================================================================

if __name__ == "__main__":
    main()