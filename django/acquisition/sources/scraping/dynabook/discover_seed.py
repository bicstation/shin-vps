# ==============================================================================
#
# FILE:
# acquisition/sources/scraping/dynabook/discover_seed.py
#
# SHIN CORE LINX
#
# dynabook Seed Discovery Runtime
#
# Reality
#
# PCProduct DB
#     │
#     ▼
# Seed Runtime
#     │
#     ▼
# Seed Reality
#
# Responsibilities
#
# - Load existing dynabook PCProduct Reality
# - Validate Seed Entries
#
# NOT
#
# - URL Resolution
# - HTTP Fetch
# - Acquisition
# - Observation
# - Mapping
# - Persistence
#
# ==============================================================================

from __future__ import annotations

from api.models import (
    PCProduct,
)


# ==============================================================================
# Runtime
# ==============================================================================

def discover() -> list[dict[str, str]]:
    """
    Load dynabook Seed Reality from existing PCProduct records.

    Returns
    -------
    list[dict[str, str]]
        Seed entries for dynabook Reality Acquisition.
    """

    products = (
        PCProduct.objects
        .filter(
            maker="dynabook",
        )
        .order_by(
            "id",
        )
    )

    seeds: list[dict[str, str]] = []

    for product in products:

        seeds.append(
            {
                "unique_id": product.unique_id or "",
                "maker": product.maker or "",
                "name": product.name or "",
                "affiliate_url": product.affiliate_url or "",
            }
        )

    return seeds


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