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
    Listing Acquire Runtime
        │
        ▼
    Listing Observation Runtime
        │
        ▼
    Observation Store Runtime
        │
        ▼
    PCProduct Verification
        │
        ▼
    Identity Runtime
        │
        ▼
    DELL Runtime Complete


Responsibilities

- Execute Runtime Stages
- Preserve Runtime Order
- Coordinate Runtime Flow
- Save Scraping Observation
- Verify Saved PCProduct
- Connect Scraping Reality to Common Identity Runtime


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
- Card Formatting
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


from .observation_store import (
    main as observation_store,
)


from .verify import (
    main as verify,
)


from .identity import (
    main as identity,
)


# ==============================================================================
# Breakpoint
# ==============================================================================

BREAKPOINT = "identity"

# BREAKPOINT = "seed"
# BREAKPOINT = "acquire_listing"
# BREAKPOINT = "observe_listing"
# BREAKPOINT = "observation_store"
# BREAKPOINT = "verify"
# BREAKPOINT = "identity"


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


PIPELINE_OBSERVATION_STORE = (
    "Observation Store Runtime"
)


PIPELINE_VERIFY = (
    "PCProduct Verification Runtime"
)


PIPELINE_IDENTITY = (
    "Identity Runtime"
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

    Returns:

        Observation Reality
    """

    return observe_listing()


def run_observation_store(
    observations,
):
    """
    Save DELL Observation Reality
    into PCProduct.observation_runtime.
    """

    return observation_store(
        observations=observations,
    )


def run_verify():
    """
    Verify actual saved PCProduct records.
    """

    return verify()


def run_identity():
    """
    Execute Common Identity Runtime
    for DELL PCProducts.

    Existing Observation Reality is already stored
    in PCProduct.observation_runtime.

    The Identity Runtime receives:

        maker
        name
        description
        observation_runtime

    No Observation-based execution condition
    is applied here.
    """

    return identity()


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
        PCProduct.observation_runtime
              ↓
        Verification
              ↓
        Common Identity Runtime
              ↓
        brand / series / collaboration
              ↓
        DELL Runtime Complete
    """

    # ==========================================================================
    # Seed Runtime
    # ==========================================================================

    seeds = run_stage(
        PIPELINE_SEED,
        run_seed,
    )

    if checkpoint(
        "seed",
    ):
        return

    # ==========================================================================
    # Listing Acquire Runtime
    # ==========================================================================

    run_stage(
        PIPELINE_ACQUIRE_LISTING,
        run_acquire_listing,
        force=force,
    )

    if checkpoint(
        "acquire_listing",
    ):
        return

    # ==========================================================================
    # Listing Observation Runtime
    # ==========================================================================

    observations = run_stage(
        PIPELINE_OBSERVE_LISTING,
        run_observe_listing,
    )

    if checkpoint(
        "observe_listing",
    ):
        return observations

    # ==========================================================================
    # Observation Store Runtime
    # ==========================================================================

    run_stage(
        PIPELINE_OBSERVATION_STORE,
        run_observation_store,
        observations=observations,
    )

    if checkpoint(
        "observation_store",
    ):
        return

    # ==========================================================================
    # PCProduct Verification Runtime
    # ==========================================================================

    run_stage(
        PIPELINE_VERIFY,
        run_verify,
    )

    if checkpoint(
        "verify",
    ):
        return

    # ==========================================================================
    # Identity Runtime
    # ==========================================================================

    run_stage(
        PIPELINE_IDENTITY,
        run_identity,
    )

    if checkpoint(
        "identity",
    ):
        return

    # ==========================================================================
    # Complete
    # ==========================================================================

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