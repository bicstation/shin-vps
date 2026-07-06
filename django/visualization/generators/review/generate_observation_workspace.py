#!/usr/bin/env python3

"""
============================================================

SHIN CORE LINX

TSV Semantic Authority Team

Observation Workspace Generator

============================================================

Mission

    Semantic Entity
            ↓
    Observation Workspace
            ↓
    Reviewer
            ↓
    Observation Report

============================================================

Current Version

    Version 0.1

Status

    ✔ Initial Development

============================================================

Commander Directive

Generator creates Workspace only.

Generator NEVER creates:

    Observation

    Evidence

    Interpretation

    Proposal

============================================================
"""

# --------------------------------------------------
# Version
# --------------------------------------------------

VERSION = "0.1"

# --------------------------------------------------
# Imports
# --------------------------------------------------

from pathlib import Path

import csv
import sys

# --------------------------------------------------
# Paths
# --------------------------------------------------

ROOT = Path(__file__).resolve().parents[3]

MASTER = ROOT / "master_data"

GROUPS = MASTER / "semantic_groups.tsv"

REVIEWS = (
    ROOT
    / "visualization"
    / "reviews"
    / "universes"
)
# --------------------------------------------------
# Load Entity
# --------------------------------------------------

def load_entity(group_slug):

    with open(GROUPS, encoding="utf-8") as f:

        reader = csv.DictReader(
            f,
            delimiter="\t"
        )

        for row in reader:

            if row["is_active"] != "1":
                continue

            if row["group_slug"] == group_slug:

                return row

    return None


# --------------------------------------------------
# Find Universe
# --------------------------------------------------

def find_universe(entity):

    return entity["parent_group"]


# --------------------------------------------------
# Main
# --------------------------------------------------

def main():

    if len(sys.argv) != 2:

        print()

        print("Usage:")

        print(
            "python3 generate_observation_workspace.py <group_slug>"
        )

        print()

        print(
            "Example:"
        )

        print()

        print(
            "python3 generate_observation_workspace.py usage-ai"
        )

        print()

        return

    group_slug = sys.argv[1]

    entity = load_entity(group_slug)

    if entity is None:

        print()

        print(
            f"Semantic Entity not found : {group_slug}"
        )

        print()

        return
   
    universe_slug = find_universe(entity)
    
    observation_dir = get_observation_dir(

        universe_slug,

        group_slug,

    )

    observation_no = next_observation_number(

        observation_dir,

    )

    observation_file = get_observation_file(

        observation_dir,

        observation_no,

    )
    
    markdown = build_workspace(

        universe_slug,

        group_slug,

        observation_no,

    )

    observation_file.write_text(

        markdown,

        encoding="utf-8",

    )
    
    print()

    print("========================================")

    print(" SHIN CORE LINX")

    print(" Observation Workspace Generator")

    print("========================================")

    print()

    print("Version     :", VERSION)

    print("Universe    :", universe_slug)

    print("Entity      :", group_slug)

    print("Observation :", observation_no)

    print()

    print("Generated:")
    
    print()

    print(observation_file)
    
    print()
    
    print("Workspace Ready.")

    print()
   
    
# --------------------------------------------------
# Observation Directory
# --------------------------------------------------

def get_observation_dir(

    universe_slug,
    group_slug,

):

    observation_dir = (

        REVIEWS
        / universe_slug
        / "observations"
        / group_slug

    )

    observation_dir.mkdir(

        parents=True,
        exist_ok=True,

    )

    return observation_dir


# --------------------------------------------------
# Next Observation Number
# --------------------------------------------------

def next_observation_number(

    observation_dir,

):

    numbers = []

    for file in observation_dir.glob("*.md"):

        try:

            numbers.append(

                int(file.stem)

            )

        except ValueError:

            continue

    if not numbers:

        return "0001"

    return f"{max(numbers)+1:04d}"


# --------------------------------------------------
# Observation File
# --------------------------------------------------

def get_observation_file(

    observation_dir,

    observation_no,

):

    return (

        observation_dir
        / f"{observation_no}.md"

    )


# --------------------------------------------------
# Build Workspace
# --------------------------------------------------

def build_workspace(

    universe_slug,
    group_slug,
    observation_no,

):

    lines = []

    lines.append("# Semantic Reality Observation Report")
    lines.append("")

    lines.append(f"Mission           : Mission 001 Phase 3")
    lines.append(f"Universe          : {universe_slug}")
    lines.append(f"Entity            : {group_slug}")
    lines.append("")

    lines.append(f"Observation No    : {observation_no}")
    lines.append("Reviewer          :")
    lines.append("Observation Date  :")
    lines.append("Status            : Draft")

    lines.append("")
    lines.append("---")
    lines.append("")

    lines.append("# Mission")
    lines.append("")
    lines.append("Semantic Reality Observation")
    lines.append("")
    lines.append("Target Entity")
    lines.append("")
    lines.append(group_slug)
    lines.append("")
    lines.append("Purpose")
    lines.append("")
    lines.append("Observe Reality")
    lines.append("")
    lines.append("Do NOT modify TSV.")
    lines.append("")
    lines.append("---")
    lines.append("")

    categories = [

        "Presentation",

        "Description",

        "Attribute Mapping",

        "Alias",

        "Negative Alias",

        "Workflow",

        "Metadata",

        "Runtime Projection",

        "Frontend Projection",

    ]

    for index, category in enumerate(

        categories,

        start=1,

    ):

    lines.append(
            f"# Observation {index:03d}"
    )

    lines.append("")

    lines.append("## Category")
    lines.append("")
    lines.append(category)
    lines.append("")

    lines.append("### Observed")
    lines.append("")
    lines.append("-")
    lines.append("")

    lines.append("### Evidence")
    lines.append("")

    lines.append("#### Source")
    lines.append("")
    lines.append("-")
    lines.append("")

    lines.append("#### Reference")
    lines.append("")
    lines.append("-")
    lines.append("")

    lines.append("### Interpretation")
    lines.append("")
    lines.append("-")
    lines.append("")

    lines.append("---")
    lines.append("")
        
    lines.append("# Observation Summary")
    lines.append("")

    lines.append("Observation Count")
    lines.append("")
    lines.append(str(len(categories)))
    lines.append("")

    lines.append("Evidence Sources")
    lines.append("")
    lines.append("-")
    lines.append("")

    lines.append("Overall Status")
    lines.append("")
    lines.append("Draft")
    lines.append("")

    lines.append("---")
    lines.append("")

    lines.append("# Commander Review")
    lines.append("")
    lines.append("Pending")
    lines.append("")

    return "\n".join(lines)

# --------------------------------------------------
# Entry Point
# --------------------------------------------------

if __name__ == "__main__":

    main()