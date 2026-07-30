#!/usr/bin/env python3
"""
==============================================================================
GEEKOM Acquisition Pipeline

Reality Source
        │
        ▼
Acquire Runtime
        │
        ▼
AcquisitionDocument
        │
        ▼
Observation Runtime
        │
        ├─ Formatter Runtime (Memory)
        └─ Observation Runtime
        │
        ▼
ObservationDocument
        │
        ▼
Adapter Runtime
        │
        ▼
ImportDocument
        │
        ▼
Integration Runtime
        ├─ Identity Runtime
        ├─ Affiliate Runtime
        ├─ Commerce Runtime
        ├─ Normalize Runtime
        └─ PCProductBuilder
        │
        ▼
PCProduct
==============================================================================

Reality First
Observation First
Translation Authority
Semantic Later
==============================================================================
"""

from __future__ import annotations

from .fetch_root import main as fetch_root
from .discover_root import main as discover_root

from .fetch_list import main as fetch_list
from .discover_list import main as discover_list

from .fetch_product import main as fetch_product

from .observe import main as observe
from .mapper import main as mapper
from .integration import main as integration


# ==========================================================
# Acquire Runtime
# ==========================================================

def run_acquire() -> None:

    fetch_root()
    discover_root()

    fetch_list()
    discover_list()
    
    fetch_product()


# ==========================================================
# Observation Runtime
# ==========================================================

def run_observe() -> None:

    observe()


# ==========================================================
# Adapter Runtime
# ==========================================================

def run_adapter() -> None:

    mapper()


# ==========================================================
# Integration Runtime
# ==========================================================

def run_integration() -> None:

    integration()


# ==========================================================
# Pipeline
# ==========================================================

def run() -> None:

    run_acquire()

    run_observe()

    run_adapter()

    run_integration()


if __name__ == "__main__":
    run()