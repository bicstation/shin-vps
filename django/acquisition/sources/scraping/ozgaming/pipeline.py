#!/usr/bin/env python3
"""
OZ GAMING Acquisition Pipeline
"""

from __future__ import annotations

from .fetch_list import fetch
from .mapper import main as mapper
from .integration import main as integration


def run():

    print()
    print("=" * 70)
    print("🚀 OZ GAMING ACQUISITION PIPELINE")
    print("=" * 70)

    #
    # Acquisition
    #

    fetch()

    #
    # Mapping
    #

    mapper()

    #
    # Integration
    #

    integration()

    print()
    print("=" * 70)
    print("✅ OZ GAMING PIPELINE COMPLETE")
    print("=" * 70)


if __name__ == "__main__":
    run()