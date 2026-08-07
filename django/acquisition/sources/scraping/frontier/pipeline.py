#!/usr/bin/env python3
"""
==============================================================================
FILE:
    acquisition/sources/scraping/frontier/pipeline.py

SHIN CORE LINX

FRONTIER Runtime Pipeline

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
                 Card Acquire Runtime
                           │
                           ▼
              Card Observation Runtime
                           │
                           ▼
               Card Formatter Runtime
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

from .acquire_card import (
    main as acquire_card,
)

from .observe_card import (
    main as observe_card,
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
# BREAKPOINT = "acquire_card"
# BREAKPOINT = "observe_card"
# BREAKPOINT = "formatter"
# BREAKPOINT = "mapper"
# BREAKPOINT = "writer"
# BREAKPOINT = "integration"

# ==============================================================================
# Runtime Names
# ==============================================================================

PIPELINE_SEED = "Seed Runtime"

PIPELINE_ACQUIRE_LISTING = "Listing Acquire Runtime"

PIPELINE_OBSERVE_LISTING = "Listing Observation Runtime"

PIPELINE_ACQUIRE_CARD = "Card Acquire Runtime"

PIPELINE_OBSERVE_CARD = "Card Observation Runtime"

PIPELINE_FORMATTER = "Card Formatter Runtime"

PIPELINE_MAPPER = "Mapper Runtime"

PIPELINE_WRITER = "ImportDocument Writer Runtime"

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

def run_seed(
    **kwargs,
) -> None:
    """
    Execute Seed Runtime.
    """

    discover_seed(
        **kwargs,
    )


def run_acquire_listing(
    **kwargs,
) -> None:
    """
    Execute Listing Acquire Runtime.
    """

    acquire_listing(
        **kwargs,
    )


def run_observe_listing(
    **kwargs,
) -> None:
    """
    Execute Listing Observation Runtime.
    """

    observe_listing(
        **kwargs,
    )


def run_acquire_card(
    **kwargs,
) -> None:
    """
    Execute Card Acquire Runtime.
    """

    acquire_card(
        **kwargs,
    )


def run_observe_card(
    **kwargs,
) -> None:
    """
    Execute Card Observation Runtime.
    """

    observe_card(
        **kwargs,
    )


def run_formatter(
    **kwargs,
) -> None:
    """
    Execute Card Formatter Runtime.
    """

    formatter_cards(
        **kwargs,
    )

def run_mapper(
    **kwargs,
):
    """
    Execute Mapper Runtime.
    """

    return mapper(

        **kwargs,

    )


def run_writer(
    contracts,
):
    """
    Execute ImportDocument Writer Runtime.
    """

    return writer(

        contracts,

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
    # Seed Runtime
    #

    run_stage(

        PIPELINE_SEED,

        run_seed,

        **kwargs,

    )

    if checkpoint("seed"):

        return

    #
    # Listing Acquire Runtime
    #

    run_stage(

        PIPELINE_ACQUIRE_LISTING,

        run_acquire_listing,

        **kwargs,

    )

    if checkpoint("acquire_listing"):

        return

    #
    # Listing Observation Runtime
    #

    run_stage(

        PIPELINE_OBSERVE_LISTING,

        run_observe_listing,

        **kwargs,

    )

    if checkpoint("observe_listing"):

        return

    #
    # Card Acquire Runtime
    #

    run_stage(

        PIPELINE_ACQUIRE_CARD,

        run_acquire_card,

        **kwargs,

    )

    if checkpoint("acquire_card"):

        return

    #
    # Card Observation Runtime
    #

    run_stage(

        PIPELINE_OBSERVE_CARD,

        run_observe_card,

        **kwargs,

    )

    if checkpoint("observe_card"):

        return

    #
    # Card Formatter Runtime
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

    print()

    print("=" * 70)

    trace_pipeline(

        PIPELINE_MAPPER,

    )

    print("=" * 70)

    contracts = run_mapper(

        **kwargs,

    )

    if checkpoint("mapper"):

        return


    #
    # ImportDocument Writer Runtime
    #

    print()

    print("=" * 70)

    trace_pipeline(

        PIPELINE_WRITER,

    )

    print("=" * 70)

    run_writer(

        contracts=contracts,

    )

    if checkpoint("writer"):

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