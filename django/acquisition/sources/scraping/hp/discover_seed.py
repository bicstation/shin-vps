#!/usr/bin/env python3

# ============================================================================
#
# FILE:
# acquisition/sources/scraping/hp/discover_seed.py
#
# SHIN CORE LINX
#
# HP Seed Discovery Runtime
#
# Reality
#
# seed.tsv
#     │
#     ▼
# Seed Runtime
#     │
#     ▼
# Seed Reality
#
# Responsibilities
#
# - Load Seed Reality
#
# NOT
#
# - HTTP Fetch
# - Acquisition
# - Observation
# - Mapping
# - Persistence
#
# ============================================================================

from __future__ import annotations

import csv

from .settings import (
    SEED_TSV,
)


# ============================================================================
# Runtime
# ============================================================================

def discover():

    with SEED_TSV.open(
        "r",
        encoding="utf-8",
        newline="",
    ) as f:

        return list(
            csv.DictReader(
                f,
                delimiter="\t",
            )
        )


# ============================================================================
# Entry Point
# ============================================================================

def main():

    return discover()


if __name__ == "__main__":

    main()