#!/usr/bin/env python3
"""
==============================================================================
SHIN CORE LINX

ARK Acquisition Pipeline

Reality First Pipeline

                    Reality Mode
                         │
                         ▼
                Fetch Catalog Runtime
                         │
                         ▼
                  Reality Runtime
             ├── Export Reality
             └── Import Reality
                         │
                         ▼
             Catalog Discovery Runtime
                         │
                         ▼
              Card Discovery Runtime
                         │
                         ▼
             Card Observation Runtime
                         │
                         ▼
                Formatter Runtime
                         │
                         ▼
                  Mapper Runtime
                         │
                         ▼
               Integration Runtime

==============================================================================
"""

from __future__ import annotations

from acquisition.common.trace.reality_trace import (
    trace_pipeline,
)

from .settings import (
    REALITY_MODE,
)

from .fetch_catalog import (
    main as fetch_catalog,
)

from .export_reality import (
    main as export_reality,
)

from .import_reality import (
    main as import_reality,
)

from .discover_catalog import (
    main as discover_catalog,
)

from .discover_cards import (
    main as discover_cards,
)

from .observe_cards import (
    main as observe_cards,
)

from .formatter import (
    main as formatter,
)

from .mapper import (
    main as mapper,
)

from .integration import (
    main as integration,
)

# ==============================================================================
# Breakpoint
# ==============================================================================

BREAKPOINT = "integration"

# BREAKPOINT = "fetch_catalog"
# BREAKPOINT = "reality"
# BREAKPOINT = "discover_catalog"
# BREAKPOINT = "discover_cards"
# BREAKPOINT = "observe_cards"
# BREAKPOINT = "formatter"
# BREAKPOINT = "mapper"
# BREAKPOINT = "integration"

# ==============================================================================
# Runtime Names
# ==============================================================================

PIPELINE_FETCH_CATALOG = "Fetch Catalog Runtime"

PIPELINE_REALITY = "Reality Runtime"

PIPELINE_DISCOVER_CATALOG = "Catalog Discovery Runtime"

PIPELINE_DISCOVER_CARDS = "Card Discovery Runtime"

PIPELINE_OBSERVATION = "Card Observation Runtime"

PIPELINE_FORMATTER = "Formatter Runtime"

PIPELINE_MAPPER = "Mapper Runtime"

PIPELINE_INTEGRATION = "Integration Runtime"

PIPELINE_COMPLETE = "ARK Runtime Complete"

# ==============================================================================
# Breakpoint
# ==============================================================================


def checkpoint(
    name: str,
) -> bool:

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


def run_fetch_catalog(
    **kwargs,
) -> None:

    fetch_catalog(
        **kwargs,
    )


def run_reality(
    **kwargs,
) -> None:

    if REALITY_MODE == "export":

        export_reality(
            **kwargs,
        )

    elif REALITY_MODE == "import":

        import_reality(
            **kwargs,
        )

    else:

        raise RuntimeError(

            f"Unknown Reality Mode : {REALITY_MODE}"

        )


def run_discover_catalog(
    **kwargs,
) -> None:

    discover_catalog(
        **kwargs,
    )


def run_discover_cards(
    **kwargs,
) -> None:

    discover_cards(
        **kwargs,
    )


def run_observation(
    **kwargs,
) -> None:

    observe_cards(
        **kwargs,
    )


def run_formatter(
    **kwargs,
) -> None:

    formatter(
        **kwargs,
    )


def run_mapper(
    **kwargs,
) -> None:

    mapper(
        **kwargs,
    )


def run_integration(
    **kwargs,
) -> None:

    integration(
        **kwargs,
    )


# ==============================================================================
# Pipeline
# ==============================================================================


def run(
    **kwargs,
) -> None:

    run_stage(

        PIPELINE_FETCH_CATALOG,

        run_fetch_catalog,

        **kwargs,

    )

    if checkpoint("fetch_catalog"):

        return

    run_stage(

        PIPELINE_REALITY,

        run_reality,

        **kwargs,

    )

    if checkpoint("reality"):

        return

    run_stage(

        PIPELINE_DISCOVER_CATALOG,

        run_discover_catalog,

        **kwargs,

    )

    if checkpoint("discover_catalog"):

        return

    run_stage(

        PIPELINE_DISCOVER_CARDS,

        run_discover_cards,

        **kwargs,

    )

    if checkpoint("discover_cards"):

        return

    run_stage(

        PIPELINE_OBSERVATION,

        run_observation,

        **kwargs,

    )

    if checkpoint("observe_cards"):

        return

    run_stage(

        PIPELINE_FORMATTER,

        run_formatter,

        **kwargs,

    )

    if checkpoint("formatter"):

        return

    run_stage(

        PIPELINE_MAPPER,

        run_mapper,

        **kwargs,

    )

    if checkpoint("mapper"):

        return

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

    run(
        **kwargs,
    )


if __name__ == "__main__":

    main()