# /home/maya/shin-vps/django/research/rakuten_reality/scripts/genre/exporter.py

"""
Rakuten Genre Reality Research

Exporter

Responsibility
--------------
Save JSON files.

This module MUST NOT:

- Call APIs
- Generate Observations
- Validate Data
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

OUTPUT_DIR = (
    Path(__file__).resolve().parents[2]
    / "output"
)

RAW_DIR = OUTPUT_DIR / "raw"
OBSERVATION_DIR = OUTPUT_DIR / "observation"


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
    Save raw Genre API response.
    """

    return _save_json(
        directory=RAW_DIR,
        filename=filename,
        data=data,
    )


def save_genre_tree(
    filename: str,
    data: dict[str, Any],
) -> Path:
    """
    Save observed Genre Reality structure.
    """

    return _save_json(
        directory=OBSERVATION_DIR,
        filename=filename,
        data=data,
    )