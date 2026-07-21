# /home/maya/shin-vps/django/research/valuecommerce_reality/scripts/exporter.py

from __future__ import annotations

import json
from pathlib import Path
from typing import Any


BASE_DIR = Path(__file__).resolve().parent.parent


def export_json(
    data: dict[str, Any] | list[Any],
    directory: str,
    filename: str,
) -> Path:
    """
    Export JSON data.

    Parameters
    ----------
    data
        JSON serializable object.
    directory
        Output directory under output/.
    filename
        Output filename.

    Returns
    -------
    Path
        Exported file path.
    """

    output_dir = BASE_DIR / "output" / directory

    output_dir.mkdir(
        parents=True,
        exist_ok=True,
    )

    path = output_dir / filename

    with path.open(
        "w",
        encoding="utf-8",
    ) as fp:
        json.dump(
            data,
            fp,
            ensure_ascii=False,
            indent=2,
        )

    return path