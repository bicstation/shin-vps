#!/usr/bin/env python3
# ==============================================================================
# SHIN CORE LINX
#
# TSUKUMO Pipeline
#
# Catalog
#     ↓
# Catalog Discovery
#     ↓
# Card Discovery
#     ↓
# Card Observation
#     ↓
# Formatter
#     ↓
# Mapper
#     ↓
# Integration
# ==============================================================================

from __future__ import annotations

from acquisition.common.trace.reality_trace import trace_pipeline

from .fetch_catalog import main as fetch_catalog
from .discover_catalog import main as discover_catalog
from .discover_cards import main as discover_cards
from .observe_cards import main as observe_cards
from .formatter import main as formatter
from .mapper import main as mapper
from .integration import main as integration


# ==============================================================================
# Breakpoint
# ==============================================================================

BREAKPOINT = "integration"

# BREAKPOINT = "catalog"
# BREAKPOINT = "discover_catalog"
# BREAKPOINT = "cards"
# BREAKPOINT = "observation"
# BREAKPOINT = "formatter"
# BREAKPOINT = "mapper"
# BREAKPOINT = "integration"


# ==============================================================================
# Runtime Names
# ==============================================================================

PIPELINE_CATALOG = "Catalog Runtime"

PIPELINE_DISCOVER_CATALOG = "Catalog Discovery Runtime"

PIPELINE_DISCOVER_CARDS = "Card Discovery Runtime"

PIPELINE_OBSERVATION = "Card Observation Runtime"

PIPELINE_FORMATTER = "Formatter Runtime"

PIPELINE_MAPPER = "Mapper Runtime"

PIPELINE_INTEGRATION = "Integration Runtime"

PIPELINE_COMPLETE = "TSUKUMO Runtime Complete"


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
# Catalog Runtime
# ==============================================================================

def run_catalog(
    **kwargs,
) -> None:

    fetch_catalog(
        **kwargs,
    )


# ==============================================================================
# Catalog Discovery Runtime
# ==============================================================================

def run_discover_catalog(
    **kwargs,
) -> None:

    discover_catalog(
        **kwargs,
    )


# ==============================================================================
# Card Discovery Runtime
# ==============================================================================

def run_discover_cards(
    **kwargs,
) -> None:

    discover_cards(
        **kwargs,
    )


# ==============================================================================
# Card Observation Runtime
# ==============================================================================

def run_observation(
    **kwargs,
) -> None:

    observe_cards(
        **kwargs,
    )


# ==============================================================================
# Formatter Runtime
# ==============================================================================

def run_formatter(
    **kwargs,
) -> None:

    formatter(
        **kwargs,
    )


# ==============================================================================
# Mapper Runtime
# ==============================================================================

def run_mapper(
    **kwargs,
) -> None:

    mapper(
        **kwargs,
    )


# ==============================================================================
# Integration Runtime
# ==============================================================================

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
        PIPELINE_CATALOG,
        run_catalog,
        **kwargs,
    )

    if checkpoint("catalog"):
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

    if checkpoint("cards"):
        return

    run_stage(
        PIPELINE_OBSERVATION,
        run_observation,
        **kwargs,
    )

    if checkpoint("observation"):
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