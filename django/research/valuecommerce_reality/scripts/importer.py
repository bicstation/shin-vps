# /home/maya/shin-vps/django/research/valuecommerce_reality/scripts/importer.py

from __future__ import annotations

import json
from pathlib import Path
from typing import Any


BASE_DIR = Path(__file__).resolve().parent.parent

OUTPUT_DIR = BASE_DIR / "output"


def load_json(path: Path) -> Any:
    """
    Load JSON file.
    """

    with path.open(
        "r",
        encoding="utf-8",
    ) as fp:
        return json.load(fp)


def import_raw(filename: str) -> dict[str, Any]:
    """
    Load raw API response.
    """

    return load_json(
        OUTPUT_DIR / "raw" / filename,
    )


def import_observation(
    filename: str,
) -> dict[str, Any]:
    """
    Load observation result.
    """

    return load_json(
        OUTPUT_DIR / "observation" / filename,
    )


def import_mapping(
    filename: str,
) -> list[dict[str, Any]]:
    """
    Load mapped products.
    """

    return load_json(
        OUTPUT_DIR / "mapping" / filename,
    )


if __name__ == "__main__":

    observation = import_observation(
        "thinkpad_observation.json",
    )

    print(observation)