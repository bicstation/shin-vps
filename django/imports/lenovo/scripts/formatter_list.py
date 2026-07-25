# /home/maya/shin-vps/django/imports/lenovo/scripts/formatter_list.py

#!/usr/bin/env python3
"""
Lenovo Formatter Runtime

AcquireしたReality HTMLから
Product Payloadを生成する。

Pipeline

TSV
    ↓
HTML Parser
    ↓
Product Builder
    ↓
Specification Parser
    ↓
Observation Builder
    ↓
Payload Writer
"""

from pathlib import Path
import csv

from imports.lenovo.formatter.parser import parse
from imports.lenovo.formatter.product_builder import build
from imports.lenovo.formatter.spec_parser import attach as attach_specs
from imports.lenovo.formatter.observation_builder import (
    attach as attach_observation,
)
from imports.lenovo.formatter.writer import write


BASE_DIR = Path(__file__).resolve().parent.parent

LIST_FILE = BASE_DIR / "scripts" / "list.tsv"

RAW_DIR = BASE_DIR / "output" / "raw"

OUTPUT_FILE = (
    BASE_DIR
    / "output"
    / "payload"
    / "products.json"
)


def load_entries():

    with open(
        LIST_FILE,
        encoding="utf-8",
    ) as f:

        return list(
            csv.DictReader(
                f,
                delimiter="\t",
            )
        )


def main():

    entries = load_entries()

    results = []

    print("=" * 60)
    print("LENOVO FORMATTER")
    print("=" * 60)

    for index, entry in enumerate(entries, start=1):

        file = entry["file"]

        html_file = RAW_DIR / f"{file}.html"

        if not html_file.exists():

            print(
                f"[{index}/{len(entries)}] Skip : {file}.html"
            )

            continue

        print(
            f"[{index}/{len(entries)}] Parsing : {file}.html"
        )

        soup = parse(
            html_file,
        )

        products = build(
            soup,
            entry,
        )

        attach_specs(
            soup,
            products,
        )

        attach_observation(
            products,
        )

        results.extend(
            products,
        )

    write(
        results,
        OUTPUT_FILE,
    )

    print()
    print("=" * 60)
    print(f"Products : {len(results)}")
    print(f"Saved    : {OUTPUT_FILE}")
    print("=" * 60)


if __name__ == "__main__":
    main()