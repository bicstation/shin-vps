#!/usr/bin/env python3
"""
==============================================================================
FRONTIER Runtime Pipeline

Reality Source
        │
        ▼
Acquire Runtime
        │
        ▼
Observation Runtime
        │
        ▼
Adapter Runtime
        │
        ▼
Integration Runtime

Reality First
Observation First
Translation Authority
Semantic Later
==============================================================================
"""

from __future__ import annotations

from .fetch_list import fetch as fetch_seed
from .fetch_products import fetch as fetch_products

from .discover_models import discover as discover_models
from .discover_series import discover as discover_series
from .discover_products import discover as discover_products

from .observe import run as run_observe

from .formatter_list import format_products
from .mapper import main as mapper

from .integration import run as run_integration


# ==========================================================
# Acquire Runtime
# ==========================================================

def run_acquire(force: bool = False) -> None:

    fetch_seed(force=force)

    discover_models()

    fetch_products(force=force)

    discover_series()

    discover_products()


# ==========================================================
# Observation Runtime
# ==========================================================

def run_observation() -> None:

    run_observe()


# ==========================================================
# Adapter Runtime
# ==========================================================

def run_adapter() -> None:

    #
    # TSV → Observation Runtime の補助データ生成
    #

    format_products()

    #
    # ObservationDocument → ImportDocument
    #

    mapper()


# ==========================================================
# Integration Runtime
# ==========================================================

def run_integration_runtime() -> None:

    run_integration()


# ==========================================================
# Pipeline
# ==========================================================

def run(force: bool = False) -> None:

    run_acquire(force=force)

    run_observation()

    run_adapter()

    run_integration_runtime()


def main(force: bool = False) -> None:

    run(force=force)


if __name__ == "__main__":
    main()