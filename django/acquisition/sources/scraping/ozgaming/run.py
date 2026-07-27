#!/usr/bin/env python3
"""
==============================================================================
OZ GAMING Runtime

Entry Point
==============================================================================

Pipeline

    Reality
        │
        ▼
    AcquisitionDocument
        │
        ▼
    ImportDocument
        │
        ▼
    PCProduct
"""

from __future__ import annotations

from .pipeline import run as pipeline


# ==========================================================
# Main
# ==========================================================

def main():

    pipeline()


if __name__ == "__main__":

    main()