#!/usr/bin/env python3

"""
==============================================================================
FILE:
    acquisition/sources/scraping/dell/pipeline.py

SHIN CORE LINX

DELL Scraping Runtime Pipeline

Reality First

Runtime Flow

    PCProduct
        │
        ▼
    Seed Runtime
        │
        ▼
    URL Resolver
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
    Observation Save Runtime
        │
        ▼
    PCProduct Verification
        │
        ▼
    DELL Runtime Complete


Responsibilities

- Execute Runtime Stages
- Preserve Runtime Order
- Coordinate Runtime Flow
- Save Scraping Observation
- Verify Saved PCProduct


NOT Responsibilities

- HTML Parsing
- HTTP Acquisition
- Reality Observation
- Semantic Processing
- Product Reconstruction
- Affiliate Generation
- Import Contract
- Product Builder
- Semantic Runtime
- Model Mapper
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

from .observation_store import (
    main as observation_store,
)

from .verify import (
    main as verify,
)


# ==============================================================================
# Breakpoint
# ==============================================================================

BREAKPOINT = "observe_listing"

# BREAKPOINT = "seed"
# BREAKPOINT = "acquire_listing"
# BREAKPOINT = "observe_listing"
# BREAKPOINT = "formatter"
# BREAKPOINT = "observation_store"
# BREAKPOINT = "verify"


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

PIPELINE_OBSERVATION_STORE = (
    "Observation Store Runtime"
)

PIPELINE_VERIFY = (
    "PCProduct Verification Runtime"
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
):
    """
    Execute Runtime Stage.

    Pipeline owns orchestration only.
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

    Seed Runtime discovers existing DELL
    PCProducts from the database.
    """

    return discover_seed()


def run_acquire_listing(
    *,
    force: bool = False,
):
    """
    Execute DELL Listing Acquire Runtime.
    """

    return acquire_listing(
        force=force,
    )


def run_observe_listing():
    """
    Execute DELL Listing Observation Runtime.
    """

    return observe_listing()


def run_formatter(
    observations,
):
    """
    Execute DELL Card Formatter Runtime.

    Observation is received from the
    Observation Runtime.

    No HTML access occurs here.
    """

    return formatter_cards(
        observations=observations,
    )


def run_observation_store(
    runtimes,
):
    """
    Save formatted Observation into
    PCProduct.observation.
    """

    return observation_store(
        runtimes=runtimes,
    )


def run_verify():
    """
    Verify actual saved PCProduct records.
    """

    return verify()


# ==============================================================================
# Runtime Pipeline
# ==============================================================================

def run(
    *,
    force: bool = False,
):
    """
    Execute DELL Scraping Runtime.

    Final responsibility:

        Scraping Reality
              ↓
        Observation
              ↓
        PCProduct.observation
              ↓
        Verification
    """

    # --------------------------------------------------------------------------
    # Seed
    # --------------------------------------------------------------------------

    seeds = run_stage(
        PIPELINE_SEED,
        run_seed,
    )

    if checkpoint(
        "seed",
    ):
        return

    # --------------------------------------------------------------------------
    # Listing Acquire
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
    # Formatter
    # --------------------------------------------------------------------------

    runtimes = run_stage(
        PIPELINE_FORMATTER,
        run_formatter,
        observations=observations,
    )

    if checkpoint(
        "formatter",
    ):
        return

    # --------------------------------------------------------------------------
    # Observation Store
    # --------------------------------------------------------------------------

    run_stage(
        PIPELINE_OBSERVATION_STORE,
        run_observation_store,
        runtimes=runtimes,
    )

    if checkpoint(
        "observation_store",
    ):
        return

    # --------------------------------------------------------------------------
    # Verification
    # --------------------------------------------------------------------------

    run_stage(
        PIPELINE_VERIFY,
        run_verify,
    )

    if checkpoint(
        "verify",
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
):
    """
    DELL Scraping Runtime Entry Point.
    """

    return run(
        force=force,
    )


# ==============================================================================
# Direct Execution
# ==============================================================================

if __name__ == "__main__":

    main()