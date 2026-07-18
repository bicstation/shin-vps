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
Import Contract
    ↓
Importer
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
    print_summary,
)
from mapper import to_payloads
from observe import create_observations
from import_contract import ImportContractBuilder
from importer import import_contracts


def build_filename(
    *,
    keyword: str | None = None,
    shop_code: str | None = None,
    item_code: str |None = None,
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
    fetch_all: bool = False,
) -> None:
    """
    Execute the Reality Observation pipeline.
    """

    print_header()

    raw_json = fetch_items(
        keyword=keyword,
        shop_code=shop_code,
        item_code=item_code,
        genre_id=genre_id,
        page=page,
        hits=hits,
        fetch_all=fetch_all,
    )

    filename = build_filename(
        keyword=keyword,
        shop_code=shop_code,
        item_code=item_code,
        genre_id=genre_id,
    )

    save_raw(
        filename,
        raw_json,
    )

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

    payloads = to_payloads(
        observations,
    )

    save_payloads(
        filename,
        payloads,
    )

    builder = ImportContractBuilder()

    contracts = [
        builder.build(payload)
        for payload in payloads
    ]

    import_contracts(
        contracts,
    )

    print_summary(
        raw_json,
    )

    print_footer()