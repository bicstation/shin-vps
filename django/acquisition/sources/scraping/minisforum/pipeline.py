#!/usr/bin/env python3
"""
FILE:
acquisition/sources/scraping/minisforum/pipeline.py

SHIN CORE LINX

Minisforum Reality Acquisition Pipeline

Reality Source
Minisforum AMD Mini PC Collection
        ↓
Fetch Runtime
        ↓
Acquire Runtime
        ↓
Observation Runtime
        ↓
Formatter Runtime
        ↓
Mapper Runtime
        ↓
Integration Runtime
        ↓
Import Contract

Reality First
Observation First
Document First
Runtime Contract First
Single Responsibility
"""

from __future__ import annotations


# ==========================================================
# Runtime Imports
# ==========================================================

from .fetch_collection import (
    main as fetch_collection,
)

from .discover_product import (
    main as discover_product,
)

from .fetch_product import (
    main as fetch_product,
)

from .observe import (
    main as observe,
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


# ==========================================================
# Breakpoint
# ==========================================================

BREAKPOINT: str | None = "integration"


# ==========================================================
# Available Breakpoints
# ==========================================================

#
# "fetch_collection"
#
# Collection Fetch Runtime確認後に停止
#
#
# "discover_product"
#
# Collection Realityから
# Product Acquisition Unitsを発見した後に停止
#
#
# "fetch_product"
#
# Product HTML Acquisition確認後に停止
#
#
# "observe"
#
# ObservationDocument確認後に停止
#
#
# "formatter"
#
# Formatter Runtime確認後に停止
#
#
# "mapper"
#
# Mapper Runtime確認後に停止
#
#
# "integration"
#
# Import Contract確認後に停止
#
#
# None
#
# Pipeline Completeまで実行
#


# ==========================================================
# Runtime Names
# ==========================================================

PIPELINE_FETCH_COLLECTION = (
    "Minisforum Collection Fetch Runtime"
)

PIPELINE_DISCOVER_PRODUCT = (
    "Minisforum Product Discovery Runtime"
)

PIPELINE_FETCH_PRODUCT = (
    "Minisforum Product Fetch Runtime"
)

PIPELINE_OBSERVE = (
    "Minisforum Observation Runtime"
)

PIPELINE_FORMATTER = (
    "Minisforum Formatter Runtime"
)

PIPELINE_MAPPER = (
    "Minisforum Mapper Runtime"
)

PIPELINE_INTEGRATION = (
    "Minisforum Integration Runtime"
)

PIPELINE_COMPLETE = (
    "Minisforum Reality Acquisition Complete"
)


# ==========================================================
# Breakpoint
# ==========================================================

def checkpoint(
    name: str,
) -> bool:
    """
    Stop Pipeline when the configured
    Breakpoint is reached.
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


# ==========================================================
# Fetch / Acquire Runtime
# ==========================================================

def run_acquire() -> bool:
    """
    Execute Fetch and Acquire Runtimes.

    Minisforum Reality
        ↓
    Collection Fetch
        ↓
    Product Discovery
        ↓
    Product Fetch
    """

    # ======================================================
    # Collection Fetch
    # ======================================================

    print()
    print("=" * 70)
    print(
        PIPELINE_FETCH_COLLECTION
    )
    print("=" * 70)

    fetch_collection()

    if checkpoint(
        "fetch_collection"
    ):
        return True

    # ======================================================
    # Product Discovery
    # ======================================================

    print()
    print("=" * 70)
    print(
        PIPELINE_DISCOVER_PRODUCT
    )
    print("=" * 70)

    discover_product()

    if checkpoint(
        "discover_product"
    ):
        return True

    # ======================================================
    # Product Fetch
    # ======================================================

    print()
    print("=" * 70)
    print(
        PIPELINE_FETCH_PRODUCT
    )
    print("=" * 70)

    fetch_product()

    if checkpoint(
        "fetch_product"
    ):
        return True

    return False


# ==========================================================
# Observation Runtime
# ==========================================================

def run_observe() -> bool:
    """
    Execute Observation Runtime.

    Product AcquisitionDocument
        ↓
    ObservationDocument
    """

    print()
    print("=" * 70)
    print(
        PIPELINE_OBSERVE
    )
    print("=" * 70)

    observe()

    if checkpoint(
        "observe"
    ):
        return True

    return False


# ==========================================================
# Formatter Runtime
# ==========================================================

def run_formatter() -> bool:
    """
    Execute Formatter Runtime.

    ObservationDocument
        ↓
    Formatter Runtime
        ↓
    Formatter Contract
    """

    print()
    print("=" * 70)
    print(
        PIPELINE_FORMATTER
    )
    print("=" * 70)

    formatter()

    if checkpoint(
        "formatter"
    ):
        return True

    return False


# ==========================================================
# Mapper Runtime
# ==========================================================

def run_mapper() -> bool:
    """
    Execute Mapper Runtime.

    Formatter Contract
        ↓
    Mapper Runtime
        ↓
    Mapper Contract
    """

    print()
    print("=" * 70)
    print(
        PIPELINE_MAPPER
    )
    print("=" * 70)

    mapper()

    if checkpoint(
        "mapper"
    ):
        return True

    return False


# ==========================================================
# Integration Runtime
# ==========================================================

def run_integration() -> bool:
    """
    Execute Integration Runtime.

    Mapper Contract
        ↓
    Integration Runtime
        ↓
    Import Contract
    """

    print()
    print("=" * 70)
    print(
        PIPELINE_INTEGRATION
    )
    print("=" * 70)

    integration()

    if checkpoint(
        "integration"
    ):
        return True

    return False


# ==========================================================
# Pipeline
# ==========================================================

def run() -> None:
    """
    Execute complete Minisforum Reality Acquisition Pipeline.

    Reality
        ↓
    Fetch Runtime
        ↓
    Acquire Runtime
        ↓
    Observation Runtime
        ↓
    Formatter Runtime
        ↓
    Mapper Runtime
        ↓
    Integration Runtime
        ↓
    Import Contract
    """

    # ======================================================
    # Fetch + Acquire
    # ======================================================

    if run_acquire():
        return

    # ======================================================
    # Observation
    # ======================================================

    if run_observe():
        return

    # ======================================================
    # Formatter
    # ======================================================

    if run_formatter():
        return

    # ======================================================
    # Mapper
    # ======================================================

    if run_mapper():
        return

    # ======================================================
    # Integration
    # ======================================================

    if run_integration():
        return

    # ======================================================
    # Complete
    # ======================================================

    print()
    print("=" * 70)
    print(
        PIPELINE_COMPLETE
    )
    print("=" * 70)

    print()
    print(
        "MINISFORUM REALITY ACQUISITION PIPELINE COMPLETE"
    )

    print(
        "Import Contract is ready."
    )

    print("=" * 70)


# ==========================================================
# Standalone Execution
# ==========================================================

if __name__ == "__main__":
    run()