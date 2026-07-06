#!/usr/bin/env python3

"""
============================================================

SHIN CORE LINX

TSV Semantic Authority Team

Universe Review Generator

============================================================

Mission

    TSV
        ↓
    Semantic Review
        ↓
    review.md

============================================================

Current Version

    Version 0.1

Status

    ✔ Phase 1 Complete

Current Responsibility

    Universe
        ↓
    Current Groups
        ↓
    review.md

============================================================

Roadmap

Version 0.1
------------------------------
Universe
Current Groups

✔ Completed

Version 0.2
------------------------------
+ Attribute Count

Version 0.3
------------------------------
+ Workflow Count

Version 0.4
------------------------------
+ Alias Count

+ Negative Alias Count

Version 0.5
------------------------------
+ Slug Metadata

Version 1.0
------------------------------
Semantic Review Draft Generator

TSV
    ↓
Semantic Reality
    ↓
Review Draft

============================================================

Commander Directive

Observe Reality
        ↓
Understand Reality
        ↓
Review Reality
        ↓
Improvement Proposal
        ↓
Commander Review
        ↓
Commander Approval
        ↓
TSV Update

============================================================

Current Position

Backend Foundation

        ✔ Completed

Visualization Foundation

        ✔ Completed

Review Workspace

        ✔ Completed

Universe Review Generator

        ✔ Version 0.1

Semantic Review

        ► Next Phase

============================================================
"""

from pathlib import Path
import csv
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
GROUPS = MASTER / "semantic_groups.tsv"

REVIEWS = ROOT / "visualization" / "reviews" / "universes"

# --------------------------------------------------
# Load Universe
# --------------------------------------------------

def load_universe(universe_slug):

    with open(UNIVERSES, encoding="utf-8") as f:

        reader = csv.DictReader(f, delimiter="\t")

        for row in reader:

            if row["is_active"] != "1":
                continue

            if row["universe_slug"] == universe_slug:
                return row

    return None


# --------------------------------------------------
# Load Groups
# --------------------------------------------------

def load_groups(universe_slug):

    groups = []

    with open(GROUPS, encoding="utf-8") as f:

        reader = csv.DictReader(f, delimiter="\t")

        for row in reader:

            if row["is_active"] != "1":
                continue

            if row["parent_group"] != universe_slug:
                continue

            groups.append(row)

    groups.sort(
        key=lambda row: int(row["sort_order"])
    )

    return groups


# --------------------------------------------------
# Build Review Markdown
# --------------------------------------------------

def build_review(universe, groups):

    lines = []

    lines.append("# Universe Review")
    lines.append("")
    lines.append(f"Version  : {VERSION}")
    lines.append(f"Universe : {universe['universe_slug']}")
    lines.append(f"Title    : {universe['universe_title']}")
    lines.append("")
    lines.append("---")
    lines.append("")
    lines.append("## Current Groups")
    lines.append("")

    for group in groups:

        lines.append(
            f"- {group['group_slug']} : {group['presentation_name']}"
        )

    lines.append("")
    lines.append("---")
    lines.append("")
    lines.append("## Observation")
    lines.append("")
    lines.append("-")
    lines.append("")
    lines.append("---")
    lines.append("")
    lines.append("## Good")
    lines.append("")
    lines.append("-")
    lines.append("")
    lines.append("---")
    lines.append("")
    lines.append("## Concern")
    lines.append("")
    lines.append("-")
    lines.append("")
    lines.append("---")
    lines.append("")
    lines.append("## Proposal")
    lines.append("")
    lines.append("-")
    lines.append("")

    return "\n".join(lines)

# --------------------------------------------------
# Save Review
# --------------------------------------------------

def save_review(review_file, markdown):

    review_file.write_text(
        markdown,
        encoding="utf-8"
    )


# --------------------------------------------------
# Print Summary
# --------------------------------------------------

def print_summary(universe_slug, groups, review_file):

    print()

    print("========================================")
    print(" SHIN CORE LINX")
    print(f" Universe Review Generator v{VERSION}")
    print("========================================")

    print()

    print(f"Universe  : {universe_slug}")
    print(f"Groups    : {len(groups)}")

    print()

    print("Generated:")

    print(review_file)

    print()


# --------------------------------------------------
# Main
# --------------------------------------------------

def main():

    if len(sys.argv) != 2:

        print()
        print("Usage:")
        print()
        print("python3 generate_universe_review.py <universe_slug>")
        print()
        print(f"Current Version : {VERSION}")
        print()

        return

    universe_slug = sys.argv[1]

    universe = load_universe(universe_slug)

    if universe is None:

        print()

        print("========================================")
        print(" ERROR")
        print("========================================")
        print()

        print(f"Universe not found : {universe_slug}")
        print()

        return

    groups = load_groups(universe_slug)

    review_dir = REVIEWS / universe_slug

    review_dir.mkdir(
        parents=True,
        exist_ok=True
    )

    review_file = review_dir / "review.md"

    markdown = build_review(
        universe,
        groups
    )

    save_review(
        review_file,
        markdown
    )

    print_summary(
        universe_slug,
        groups,
        review_file
    )


# --------------------------------------------------
# Entry Point
# --------------------------------------------------

if __name__ == "__main__":

    main()