# /home/maya/shin-vps/django/acquisition/sources/scraping/tsukumo/pipeline.py

#!/usr/bin/env python3
# ==============================================================================
# SHIN CORE LINX
#
# TSUKUMO Pipeline
#
# Catalog
#     ↓
# Series Discovery
#     ↓
# Card Discovery
#     ↓
# Observation
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
from .observe import main as observe
from .formatter import main as formatter
from .mapper import main as mapper
from .integration import main as integration


# ==============================================================================
# Breakpoint
# ==============================================================================

BREAKPOINT = "cards"

# BREAKPOINT = "catalog"
# BREAKPOINT = "series"
# BREAKPOINT = "cards"
# BREAKPOINT = "observation"
# BREAKPOINT = "formatter"
# BREAKPOINT = "mapper"
# BREAKPOINT = "integration"


# ==============================================================================
# Runtime Names
# ==============================================================================

PIPELINE_CATALOG = "Catalog Runtime"
PIPELINE_SERIES = "Series Runtime"
PIPELINE_CARD = "Card Runtime"

PIPELINE_OBSERVATION = "Observation Runtime"
PIPELINE_FORMATTER = "Formatter Runtime"
PIPELINE_MAPPER = "Mapper Runtime"
PIPELINE_INTEGRATION = "Integration Runtime"

PIPELINE_COMPLETE = "TSUKUMO Runtime Complete"


# ==============================================================================
# Breakpoint
# ==============================================================================

def checkpoint(name: str) -> bool:

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
# Series Runtime
# ==============================================================================

def run_series() -> None:

    discover_catalog()


# ==============================================================================
# Card Runtime
# ==============================================================================

def run_cards() -> None:

    discover_cards()


# ==============================================================================
# Observation Runtime
# ==============================================================================

def run_observation() -> None:

    observe()


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
        PIPELINE_SERIES,
        run_series,
    )

    if checkpoint("series"):
        return

    run_stage(
        PIPELINE_CARD,
        run_cards,
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