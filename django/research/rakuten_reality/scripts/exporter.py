# /home/maya/shin-dev/shin-vps/django/research/rakuten_reality/scripts/exporter.py

"""
Rakuten Reality Research

Exporter

Responsibility
--------------
Save JSON files.

This module MUST NOT:

- Call APIs
- Generate Observations
- Validate Data
- Map Payloads
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from config import (
    RAW_DIR,
    OBSERVATION_DIR,
    PAYLOAD_DIR,
)


def _save_json(
    directory: Path,
    filename: str,
    data: Any,
) -> Path:
    """
    Save JSON data.
    """

    directory.mkdir(
        parents=True,
        exist_ok=True,
    )

    output_path = directory / filename

    with output_path.open(
        "w",
        encoding="utf-8",
    ) as fp:

        json.dump(
            data,
            fp,
            ensure_ascii=False,
            indent=2,
        )

    return output_path


def save_raw(
    filename: str,
    data: dict[str, Any],
) -> Path:
    """
    Save Raw API response.
    """

    return _save_json(
        RAW_DIR,
        filename,
        data,
    )


def save_observations(
    filename: str,
    data: list[dict[str, Any]],
) -> Path:
    """
    Save Observation list.
    """

    return _save_json(
        OBSERVATION_DIR,
        filename,
        data,
    )


def save_payloads(
    filename: str,
    data: list[dict[str, Any]],
) -> Path:
    """
    Save PCProduct payload list.
    """

    return _save_json(
        PAYLOAD_DIR,
        filename,
        data,
    )