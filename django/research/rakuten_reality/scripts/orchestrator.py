# /home/maya/shin-dev/shin-vps/django/research/rakuten_reality/scripts/orchestrator.py

"""
Rakuten Reality Research

Orchestrator

Responsibility
--------------
Coordinate the Reality Observation pipeline.

Pipeline

Client
    ↓
Observe
    ↓
Mapper
    ↓
Exporter
    ↓
Formatter

This module MUST NOT:

- Call requests directly
- Generate Observations directly
- Perform Validation
"""

from __future__ import annotations

from client import fetch_items
from exporter import (
    save_observations,
    save_payloads,
    save_raw,
)
from formatter import (
    print_footer,
    print_header,
    print_products,
    print_summary,
)
from mapper import to_payloads
from observe import create_observations


def build_filename(
    *,
    keyword: str | None = None,
    shop_code: str | None = None,
    item_code: str | None = None,
    genre_id: str | None = None,
) -> str:
    """
    Build output filename.
    """

    if item_code:
        return item_code.replace(":", "_") + ".json"

    if shop_code:
        return shop_code + ".json"

    if keyword:
        return keyword.replace(" ", "_") + ".json"

    if genre_id:
        return f"genre_{genre_id}.json"

    return "result.json"


def run(
    *,
    keyword: str | None = None,
    shop_code: str | None = None,
    item_code: str | None = None,
    genre_id: str | None = None,
    page: int = 1,
    hits: int = 30,
) -> None:
    """
    Execute the Reality Observation pipeline.
    """

    print_header()

    # ------------------------------------------------------
    # Fetch
    # ------------------------------------------------------

    raw_json = fetch_items(
        keyword=keyword,
        shop_code=shop_code,
        item_code=item_code,
        genre_id=genre_id,
        page=page,
        hits=hits,
    )

    filename = build_filename(
        keyword=keyword,
        shop_code=shop_code,
        item_code=item_code,
        genre_id=genre_id,
    )

    # ------------------------------------------------------
    # Save Raw
    # ------------------------------------------------------

    save_raw(
        filename,
        raw_json,
    )

    # ------------------------------------------------------
    # Observe
    # ------------------------------------------------------

    observations = create_observations(
        raw_json,
    )

    save_observations(
        filename,
        [
            observation.to_dict()
            for observation in observations
        ],
    )

    # ------------------------------------------------------
    # Map
    # ------------------------------------------------------

    payloads = to_payloads(
        observations,
    )

    save_payloads(
        filename,
        payloads,
    )

    # ------------------------------------------------------
    # Display
    # ------------------------------------------------------

    print_summary(
        raw_json,
    )

    print_products(
        raw_json,
    )

    print_footer()
    
    