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

BREAKPOINT = "cards"

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
) -> None:

    print()

    print("=" * 70)

    trace_pipeline(
        title,
    )

    print("=" * 70)

    runtime()


# ==============================================================================
# Catalog Runtime
# ==============================================================================

def run_catalog() -> None:

    fetch_catalog()


# ==============================================================================
# Catalog Discovery Runtime
# ==============================================================================

def run_discover_catalog() -> None:

    discover_catalog()


# ==============================================================================
# Card Discovery Runtime
# ==============================================================================

def run_discover_cards() -> None:

    discover_cards()


# ==============================================================================
# Card Observation Runtime
# ==============================================================================

def run_observation() -> None:

    observe_cards()


# ==============================================================================
# Formatter Runtime
# ==============================================================================

def run_formatter() -> None:

    formatter()


# ==============================================================================
# Mapper Runtime
# ==============================================================================

def run_mapper() -> None:

    mapper()


# ==============================================================================
# Integration Runtime
# ==============================================================================

def run_integration() -> None:

    integration()


# ==============================================================================
# Pipeline
# ==============================================================================

def run() -> None:

    run_stage(
        PIPELINE_CATALOG,
        run_catalog,
    )

    if checkpoint("catalog"):
        return

    run_stage(
        PIPELINE_DISCOVER_CATALOG,
        run_discover_catalog,
    )

    if checkpoint("discover_catalog"):
        return

    run_stage(
        PIPELINE_DISCOVER_CARDS,
        run_discover_cards,
    )

    if checkpoint("cards"):
        return

    run_stage(
        PIPELINE_OBSERVATION,
        run_observation,
    )

    if checkpoint("observation"):
        return

    run_stage(
        PIPELINE_FORMATTER,
        run_formatter,
    )

    if checkpoint("formatter"):
        return

    run_stage(
        PIPELINE_MAPPER,
        run_mapper,
    )

    if checkpoint("mapper"):
        return

    run_stage(
        PIPELINE_INTEGRATION,
        run_integration,
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

def main() -> None:

    run()


if __name__ == "__main__":

    main()