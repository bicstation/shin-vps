#!/usr/bin/env python3

"""
==============================================================================
FILE:
    acquisition/sources/scraping/storm/pipeline.py

SHIN CORE LINX

STORM Runtime Pipeline

Reality Acquisition Framework

            Reality
               │
               ▼
         Seed Runtime
               │
               ▼
   Listing Acquire Runtime
               │
               ▼
Listing Observation Runtime
               │
               ▼
     Card Formatter Runtime
               │
               ▼
        Mapper Runtime
               │
               ▼
 ImportDocument Writer Runtime
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
- Runtime Formatting
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

BREAKPOINT = "integration"

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
    "STORM Runtime Complete"
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
) -> None:
    """
    Execute Runtime Stage.
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

    runtime(
        **kwargs,
    )


# ==============================================================================
# Runtime Wrappers
# ==============================================================================

def run_seed() -> None:
    """
    Execute Seed Runtime.

    Seed Runtime receives no runtime options.
    """

    discover_seed()


def run_acquire_listing(
    *,
    force: bool = False,
) -> None:
    """
    Execute Listing Acquire Runtime.

    force belongs exclusively to Listing Acquire.
    """

    acquire_listing(
        force=force,
    )


def run_observe_listing() -> None:
    """
    Execute Listing Observation Runtime.
    """

    observe_listing()


def run_formatter() -> None:
    """
    Execute Card Formatter Runtime.
    """

    formatter_cards()


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

    integration()


# ==============================================================================
# Runtime Pipeline
# ==============================================================================

def run(
    *,
    force: bool = False,
) -> None:
    """
    Execute STORM Runtime Pipeline.

    Runtime options are explicitly routed to the Runtime
    that owns them.

    force
        → Listing Acquire Runtime only.
    """

    # --------------------------------------------------------------------------
    # Seed Runtime
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
    # --------------------------------------------------------------------------

    run_stage(
        PIPELINE_OBSERVE_LISTING,
        run_observe_listing,
    )

    if checkpoint(
        "observe_listing",
    ):
        return


    # --------------------------------------------------------------------------
    # Card Formatter Runtime
    # --------------------------------------------------------------------------

    run_stage(
        PIPELINE_FORMATTER,
        run_formatter,
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
    STORM Runtime Entry Point.
    """

    run(
        force=force,
    )


if __name__ == "__main__":

    main()