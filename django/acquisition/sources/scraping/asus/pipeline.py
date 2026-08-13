#!/usr/bin/env python3

"""
==============================================================================
FILE:
    acquisition/sources/scraping/asus/pipeline.py

SHIN CORE LINX

ASUS Identity Runtime Pipeline

Reality First

Runtime Flow

    Existing PCProduct
        │
        ▼
    Identity Runtime
        │
        ▼
    brand / series / collaboration
        │
        ▼
    ASUS Identity Runtime Complete


Responsibilities

- Execute ASUS Identity Runtime
- Connect existing ASUS PCProduct Reality
  directly to Common Identity Runtime

NOT Responsibilities

- HTML Parsing
- HTTP Acquisition
- Listing Acquisition
- Observation Acquisition
- Observation Extraction
- Observation Storage
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


from .identity import (
    main as identity,
)


# ==============================================================================
# Breakpoint
# ==============================================================================

BREAKPOINT = "identity"


# ==============================================================================
# Runtime Names
# ==============================================================================

PIPELINE_IDENTITY = (
    "Identity Runtime"
)


PIPELINE_COMPLETE = (
    "ASUS Identity Runtime Complete"
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
# Runtime Wrapper
# ==============================================================================

def run_identity():
    """
    Execute Common Identity Runtime
    for ASUS PCProducts.

    Existing PCProduct Reality:

        maker
        name
        description
        observation_runtime

    is passed directly to the Common
    Identity Runtime.

    No scraping Runtime is required.

    No Observation-based execution condition
    is applied.
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
    Execute ASUS Identity Runtime.

    Runtime:

        Existing PCProduct
              ↓
        Common Identity Runtime
              ↓
        identity.tsv
              ↓
        brand / series / collaboration
              ↓
        ASUS Identity Runtime Complete

    The force parameter is accepted for compatibility
    with the existing ASUS Runtime entry point.

    It is not used by Identity Runtime.
    """

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
    ASUS Identity Runtime Entry Point.
    """

    return run(
        force=force,
    )


# ==============================================================================
# Direct Execution
# ==============================================================================

if __name__ == "__main__":

    main()