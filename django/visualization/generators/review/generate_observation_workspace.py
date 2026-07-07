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

    Version 0.3

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

VERSION = "0.3"

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
        entity,
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
    entity,
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
    
    # --------------------------------------------------
    # Reality Snapshot
    # --------------------------------------------------

    lines.append("# Reality Snapshot")
    lines.append("")

    lines.append(f"Universe")
    lines.append("")
    lines.append(universe_slug)
    lines.append("")

    lines.append("Entity")
    lines.append("")
    lines.append(group_slug)
    lines.append("")

    lines.append("Current Reality")
    lines.append("")
    lines.append("Generated from TSV")
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

        {
            "name": "Presentation",
            "question": "現在の名称は Reality を適切に表現しているか。",
            "source": "semantic_groups.tsv",
            "reference": "group_slug : usage-ai",
        },

        {
            "name": "Description",
            "question": "Description は Semantic Reality を十分説明しているか。",
            "source": "semantic_groups.tsv",
            "reference": "description",
        },

        {
            "name": "Attribute Mapping",
            "question": "Reality を構成する Attribute は適切に整理されているか。",
            "source": "semantic_group_mappings.tsv",
            "reference": "group_slug",
        },

        {
            "name": "Alias",
            "question": "Reality を検索・発見するために十分な Alias が登録されているか。",
            "source": "semantic_aliases.tsv",
            "reference": "group_slug",
        },

        {
            "name": "Negative Alias",
            "question": "誤認識を防ぐための Negative Alias が登録されているか。",
            "source": "semantic_negative_aliases.tsv",
            "reference": "group_slug",
        },

        {
            "name": "Workflow",
            "question": "Workflow は Reality を自然に表現しているか。",
            "source": "semantic_workflow_mappings.tsv",
            "reference": "group_slug",
        },

        {
            "name": "Metadata",
            "question": "Metadata は Semantic Entity を補足できているか。",
            "source": "semantic_slug_metadata.tsv",
            "reference": "slug",
        },

        {
            "name": "Runtime Projection",
            "question": "Runtime は TSV を正しく投影しているか。",
            "source": "Authority Runtime / Generated Runtime",
            "reference": "runtime payload",
        },

        {
            "name": "Frontend Projection",
            "question": "Frontend は Runtime を正しく表示しているか。",
            "source": "Generated Runtime",
            "reference": "frontend payload",
        },

    ]


    for index, category in enumerate(

        categories,

        start=1,

    ):

        lines.append(
            f"# Observation {index:03d}"
        )

        lines.append("")

        # ----------------------------------
        # Category
        # ----------------------------------

        lines.append("## Category")
        lines.append("")
        lines.append(category["name"])
        lines.append("")

        # ----------------------------------
        # Review Question
        # ----------------------------------

        lines.append("## Review Question")
        lines.append("")
        lines.append(category["question"])
        lines.append("")

        # ----------------------------------
        # Observation
        # ----------------------------------

        lines.append("### Observed")
        lines.append("")
        lines.append("-")
        lines.append("")

        # ----------------------------------
        # Evidence
        # ----------------------------------

        lines.append("### Evidence")
        lines.append("")

        lines.append("#### Source")
        lines.append("")
        lines.append(category["source"])
        lines.append("")

        lines.append("#### Reference")
        lines.append("")
        lines.append(category["reference"])
        lines.append("")

        # ----------------------------------
        # Interpretation
        # ----------------------------------

        lines.append("### Interpretation")
        lines.append("")
        lines.append("-")
        lines.append("")

        lines.append("---")
        lines.append("")
    

    lines.append("# Observation Summary")
    lines.append("")
    
    # ----------------------------------
    # Review Progress
    # ----------------------------------
    
    lines.append("Review Progress")
    lines.append("")

    for category in categories:

        lines.append(
            f"- [ ] {category['name']}"
        )

    lines.append("")

    lines.append("Observation Count")
    lines.append("")
    lines.append(str(len(categories)))
    lines.append("")

    lines.append("Completed")
    lines.append("")
    lines.append("0")
    lines.append("")

    lines.append("Remaining")
    lines.append("")
    lines.append(str(len(categories)))
    lines.append("")
    
    lines.append("Evidence Sources")
    lines.append("")

    sources = []

    for category in categories:

        if category["source"] not in sources:

            sources.append(
                category["source"]
            )

    for source in sources:

        lines.append(
            f"- {source}"
        )

    lines.append("")

    lines.append("Overall Status")
    lines.append("")
    lines.append("Draft")
    lines.append("")

    lines.append("---")
    lines.append("")
    
    lines.append("# Commander Review")
    lines.append("")

    lines.append("Status")
    lines.append("")
    lines.append("Pending")
    lines.append("")

    lines.append("Review Date")
    lines.append("")
    lines.append("-")
    lines.append("")

    lines.append("Decision")
    lines.append("")
    lines.append("-")
    lines.append("")

    lines.append("Comments")
    lines.append("")
    lines.append("-")
    lines.append("")

    return "\n".join(lines)

# --------------------------------------------------
# Entry Point
# --------------------------------------------------

if __name__ == "__main__":

    main()