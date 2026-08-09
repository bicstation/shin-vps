# ==============================================================================
#
# FILE:
# acquisition/sources/scraping/mouse/seed.py
#
# SHIN CORE LINX
#
# MOUSE Seed Discovery Runtime
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
# - Validate Seed Entries
#
# NOT
#
# - HTTP Fetch
# - Acquisition
# - Observation
# - Mapping
# - Persistence
#
# ==============================================================================

from __future__ import annotations

import csv

from .settings import (
    SEED_TSV,
)


# ==============================================================================
# Runtime
# ==============================================================================

def discover() -> list[dict[str, str]]:
    """
    Load MOUSE Seed Reality.

    Returns
    -------

    list[dict[str, str]]

        Seed entries loaded from seed.tsv.
    """

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


# ==============================================================================
# Entry Point
# ==============================================================================

def main() -> list[dict[str, str]]:
    """
    Runtime Entry Point.
    """

    return discover()


# ==============================================================================
# Direct Execution
# ==============================================================================

if __name__ == "__main__":

    main()