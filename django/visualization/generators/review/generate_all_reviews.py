#!/usr/bin/env python3

"""
============================================================

SHIN CORE LINX

TSV Semantic Authority Team

Generate All Universe Reviews

Version 0.1

Mission

    semantic_universes.tsv
            ↓
    Universe Review Generator
            ↓
    All review.md

============================================================
"""

from pathlib import Path
import csv
import subprocess
import sys


# --------------------------------------------------
# Version
# --------------------------------------------------

VERSION = "0.1"


# --------------------------------------------------
# Paths
# --------------------------------------------------

ROOT = Path(__file__).resolve().parents[2]

MASTER = ROOT / "master_data"

UNIVERSES = MASTER / "semantic_universes.tsv"

GENERATOR = (
    ROOT
    / "visualization"
    / "generators"
    / "generate_universe_review.py"
)


# --------------------------------------------------
# Load Universes
# --------------------------------------------------

def load_universes():

    universes = []

    with open(UNIVERSES, encoding="utf-8") as f:

        reader = csv.DictReader(f, delimiter="\t")

        for row in reader:

            if row["is_active"] != "1":
                continue

            universes.append(row)

    universes.sort(
        key=lambda row: int(row["sort_order"])
    )

    return universes


# --------------------------------------------------
# Generate Reviews
# --------------------------------------------------

def generate_reviews(universes):

    for universe in universes:

        slug = universe["universe_slug"]

        print("----------------------------------------")
        print(f"Generating : {slug}")

        subprocess.run(
            [
                sys.executable,
                str(GENERATOR),
                slug,
            ],
            check=True,
        )


# --------------------------------------------------
# Summary
# --------------------------------------------------

def print_summary(universes):

    print()

    print("========================================")
    print(" SHIN CORE LINX")
    print(f" Generate All Reviews v{VERSION}")
    print("========================================")

    print()

    print(f"Universes : {len(universes)}")

    print()

    print("Completed.")

    print()


# --------------------------------------------------
# Main
# --------------------------------------------------

def main():

    universes = load_universes()

    generate_reviews(universes)

    print_summary(universes)


# --------------------------------------------------
# Entry Point
# --------------------------------------------------

if __name__ == "__main__":

    main()