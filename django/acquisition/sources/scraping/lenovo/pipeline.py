#!/usr/bin/env python3
"""
==============================================================================
FILE:
    acquisition/sources/scraping/lenovo/pipeline.py

SHIN CORE LINX

LENOVO Runtime Pipeline

Reality First
Observation First

Seed
    │
    ▼
OpenAPI Fetch
    │
    ▼
OpenAPI Observe
    │
    ▼
Product Acquire
    │
    ▼
Mapper
    │
    ▼
Writer
    │
    ▼
Integration

==============================================================================
"""

from __future__ import annotations

from acquisition.common.trace.reality_trace import (
    trace_pipeline,
)

from .discover_seed import (
    main as discover_seed,
)

from .fetch_openapi import (
    main as fetch_openapi,
)

from .observe_openapi import (
    main as observe_openapi,
)

from .acquire_product import (
    main as acquire_product,
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

BREAKPOINT = "observe_openapi"

# BREAKPOINT = "seed"
# BREAKPOINT = "fetch_openapi"
# BREAKPOINT = "observe_openapi"
# BREAKPOINT = "acquire_product"
# BREAKPOINT = "mapper"
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

PIPELINE_ACQUIRE_PRODUCT = (
    "Product Acquire Runtime"
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


def run_fetch_openapi(
    **kwargs,
) -> dict:
    """
    Execute OpenAPI Fetch Runtime.
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



def run_acquire_product(
    **kwargs,
) -> None:
    """
    Execute Product Acquire Runtime.
    """

    acquire_product(

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

        contracts=contracts,

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
    Execute LENOVO Runtime Pipeline.
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
    # OpenAPI Fetch Runtime
    #

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

    #
    # OpenAPI Fetch Runtime
    #
    
    print()

    print("=" * 70)

    trace_pipeline(

        PIPELINE_FETCH_OPENAPI,

    )

    print("=" * 70)

    runtime = run_fetch_openapi(

        **kwargs,

    )

    run_stage(

        PIPELINE_FETCH_OPENAPI,

        run_fetch_openapi,

        **kwargs,

    )

    if checkpoint("fetch_openapi"):

        return
    
    #
    # OpenAPI Observation Runtime
    #

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

    #
    # Product Acquire Runtime
    #

    run_stage(

        PIPELINE_ACQUIRE_PRODUCT,

        run_acquire_product,

        **kwargs,

    )

    if checkpoint("acquire_product"):

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
    LENOVO Runtime Entry Point.
    """

    run(
        **kwargs,
    )


if __name__ == "__main__":

    main()
    