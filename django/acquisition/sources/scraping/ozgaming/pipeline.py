#!/usr/bin/env python3
"""
==============================================================================
OZ GAMING Pipeline

Reality
    │
    ▼
Fetch
    │
    ▼
AcquisitionDocument
    │
    ▼
Mapper
    │
    ▼
ImportDocument
    │
    ▼
Integration
    │
    ▼
PCProduct
==============================================================================

Responsibilities
----------------
1. Fetch Reality
2. Build Import Documents
3. Import Products
"""

from __future__ import annotations

from .fetch_list import fetch
from .mapper import run as map_runtime
from .integration import run as import_runtime


# ==========================================================
# Pipeline
# ==========================================================

def run():

    print()
    print("=" * 70)
    print("🚀 OZ GAMING PIPELINE")
    print("=" * 70)
    print()

    #
    # Step 1
    #

    print("[1/3] Reality Fetch")
    fetch()

    #
    # Step 2
    #

    print()
    print("[2/3] Build Import Documents")
    map_runtime()

    #
    # Step 3
    #

    print()
    print("[3/3] Import Products")
    import_runtime()

    print()
    print("=" * 70)
    print("✅ OZ GAMING PIPELINE COMPLETE")
    print("=" * 70)


# ==========================================================
# Main
# ==========================================================

def main():

    run()


if __name__ == "__main__":

    main()