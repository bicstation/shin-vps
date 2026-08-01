from __future__ import annotations

import csv
from pathlib import Path

TSV_PATH = (
    Path(__file__).parent
    / "reality_sources.tsv"
)


def load_registry() -> dict[str, dict]:

    registry: dict[str, dict] = {}

    with TSV_PATH.open(
        encoding="utf-8",
        newline="",
    ) as fp:

        reader = csv.DictReader(
            fp,
            delimiter="\t",
        )

        for row in reader:

            registry[row["source_id"]] = row

    return registry


REGISTRY = load_registry()


def get_source(
    source_id: str,
) -> dict | None:

    return REGISTRY.get(
        str(source_id),
    )