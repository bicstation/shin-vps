#!/usr/bin/env python3

"""
============================================================

SHIN CORE LINX

TSV Semantic Authority Team

Semantic Entity Review Generator

============================================================

Mission

    group_slug
            ↓
    Semantic Entity
            ↓
    Markdown Report

============================================================

Current Version

    Version 0.1

Status

    ✔ Phase 1

Current Responsibility

    group_slug
            ↓
    TSV
            ↓
    Markdown Report

============================================================

Roadmap

Version 0.1
------------------------------
Presentation
Description
Attributes
Alias
Negative Alias
Workflow
Metadata

✔ Current

Version 0.2
------------------------------
Runtime Projection

Version 0.3
------------------------------
Frontend Projection

Version 0.4
------------------------------
Ranking Projection

Version 1.0
------------------------------
Semantic Entity Review Generator

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

REVIEWS = (
    ROOT
    / "visualization"
    / "reviews"
    / "universes"
)

GROUPS = MASTER / "semantic_groups.tsv"

ATTRIBUTES = MASTER / "semantic_group_mappings.tsv"

ALIASES = MASTER / "semantic_aliases.tsv"

NEGATIVE_ALIASES = (
    MASTER
    / "semantic_negative_aliases.tsv"
)

WORKFLOWS = (
    MASTER
    / "semantic_workflow_mappings.tsv"
)

METADATA = (
    MASTER
    / "semantic_slug_metadata.tsv"
)


# --------------------------------------------------
# Utilities
# --------------------------------------------------

def load_tsv(path):

    with open(path, encoding="utf-8") as f:

        return list(
            csv.DictReader(
                f,
                delimiter="\t"
            )
        )


# --------------------------------------------------
# Load Semantic Group
# --------------------------------------------------

def load_group(group_slug):

    rows = load_tsv(GROUPS)

    for row in rows:

        if row["is_active"] != "1":
            continue

        if row["group_slug"] == group_slug:

            return row

    return None

# --------------------------------------------------
# Load Attribute Mapping
# --------------------------------------------------

def load_attributes(group_slug):

    attributes = []

    rows = load_tsv(ATTRIBUTES)

    for row in rows:

        if row["group_slug"] != group_slug:
            continue

        attributes.append(
            row["attribute_slug"]
        )

    attributes.sort()

    return attributes


# --------------------------------------------------
# Load Aliases
# --------------------------------------------------

def load_aliases(group_slug):

    aliases = []

    rows = load_tsv(ALIASES)

    for row in rows:

        #
        # semantic_aliases.tsv
        #
        # slug
        # alias
        #

        if row["slug"] != group_slug:
            continue

        aliases.append(row)

    aliases.sort(
        key=lambda x: x["alias"]
    )

    return aliases


# --------------------------------------------------
# Load Negative Aliases
# --------------------------------------------------

def load_negative_aliases(group_slug):

    negatives = []

    rows = load_tsv(NEGATIVE_ALIASES)

    for row in rows:

        if row["slug"] != group_slug:
            continue

        negatives.append(row)

    negatives.sort(
        key=lambda x: x["negative_alias"]
    )

    return negatives


# --------------------------------------------------
# Load Workflow
# --------------------------------------------------

def load_workflows(group_slug):

    incoming = []

    outgoing = []

    rows = load_tsv(WORKFLOWS)

    for row in rows:

        #
        # workflow_slug
        # は usage-ai など
        #

        if row["workflow_slug"] == group_slug:

            incoming.append(row)

        #
        # group_slug 自身から
        # 他Workflowへ向かう場合
        #

        if row["group_slug"] == group_slug:

            outgoing.append(row)

    incoming.sort(

        key=lambda x: int(x["weight"]),

        reverse=True

    )

    outgoing.sort(

        key=lambda x: int(x["weight"]),

        reverse=True

    )

    return incoming, outgoing


# --------------------------------------------------
# Load Metadata
# --------------------------------------------------

def load_metadata(group_slug):

    #
    # Version 0.1
    #
    # metadata が存在しなくても
    # エラーにしない
    #

    if not METADATA.exists():

        return None

    rows = load_tsv(METADATA)

    for row in rows:

        if row["slug"] == group_slug:

            return row

    return None

# --------------------------------------------------
# Build Markdown
# --------------------------------------------------

def build_markdown(

    group,

    attributes,

    aliases,

    negative_aliases,

    incoming,

    outgoing,

    metadata

):

    lines = []

    # --------------------------------------------------
    # Header
    # --------------------------------------------------

    lines.append("# Semantic Entity Review")
    lines.append("")

    lines.append(
        f"Universe : {group['parent_group']}"
    )

    lines.append(
        f"Entity   : {group['group_slug']}"
    )

    lines.append(
        f"Version  : {VERSION}"
    )

    lines.append("")

    lines.append("Status : Draft")

    lines.append("")
    lines.append("---")
    lines.append("")

    # --------------------------------------------------
    # Presentation
    # --------------------------------------------------

    lines.append("## Presentation")
    lines.append("")

    lines.append("Name")
    lines.append("")
    lines.append(group["presentation_name"])
    lines.append("")

    lines.append("Description")
    lines.append("")
    lines.append(
        group["presentation_description"]
    )
    lines.append("")

    lines.append("---")
    lines.append("")

    # --------------------------------------------------
    # Attributes
    # --------------------------------------------------

    lines.append("## Attribute Mapping")
    lines.append("")

    if attributes:

        for attribute in attributes:

            lines.append(
                f"- {attribute}"
            )

    else:

        lines.append("-")

    lines.append("")
    lines.append("---")
    lines.append("")

    # --------------------------------------------------
    # Aliases
    # --------------------------------------------------

    lines.append("## Alias")
    lines.append("")

    if aliases:

        for row in aliases:

            lines.append(
                f"- {row['alias']}"
            )

    else:

        lines.append("-")

    lines.append("")
    lines.append("---")
    lines.append("")

    # --------------------------------------------------
    # Negative Alias
    # --------------------------------------------------

    lines.append("## Negative Alias")
    lines.append("")

    if negative_aliases:

        for row in negative_aliases:

            lines.append(

                f"- {row['negative_alias']}"

            )

    else:

        lines.append("-")

    lines.append("")
    lines.append("---")
    lines.append("")

    # --------------------------------------------------
    # Workflow
    # --------------------------------------------------

    lines.append("## Workflow")
    lines.append("")

    lines.append("Incoming")
    lines.append("")

    if incoming:

        for row in incoming:

            lines.append(

                f"- {row['group_slug']} ({row['weight']})"

            )

    else:

        lines.append("-")

    lines.append("")
    lines.append("Outgoing")
    lines.append("")

    if outgoing:

        for row in outgoing:

            lines.append(

                f"- {row['workflow_slug']} ({row['weight']})"

            )

    else:

        lines.append("-")

    lines.append("")
    lines.append("---")
    lines.append("")

    # --------------------------------------------------
    # Metadata
    # --------------------------------------------------

    lines.append("## Metadata")
    lines.append("")

    if metadata:

        for key, value in metadata.items():

            lines.append(
                f"{key} : {value}"
            )

    else:

        lines.append("-")

    lines.append("")
    lines.append("---")
    lines.append("")

    # --------------------------------------------------
    # Runtime
    # --------------------------------------------------

    lines.append("## Runtime Projection")
    lines.append("")
    lines.append("-")
    lines.append("")

    lines.append("---")
    lines.append("")

    # --------------------------------------------------
    # Frontend
    # --------------------------------------------------

    lines.append("## Frontend Projection")
    lines.append("")
    lines.append("-")
    lines.append("")

    lines.append("---")
    lines.append("")

    # --------------------------------------------------
    # Observation
    # --------------------------------------------------

    lines.append("## Observation")
    lines.append("")
    lines.append("-")
    lines.append("")

    lines.append("---")
    lines.append("")

    # --------------------------------------------------
    # Good
    # --------------------------------------------------

    lines.append("## Good")
    lines.append("")
    lines.append("-")
    lines.append("")

    lines.append("---")
    lines.append("")

    # --------------------------------------------------
    # Concern
    # --------------------------------------------------

    lines.append("## Concern")
    lines.append("")
    lines.append("-")
    lines.append("")

    lines.append("---")
    lines.append("")

    # --------------------------------------------------
    # Proposal
    # --------------------------------------------------

    lines.append("## Proposal")
    lines.append("")
    lines.append("-")
    lines.append("")

    return "\n".join(lines)


# --------------------------------------------------
# Save Report
# --------------------------------------------------

def save_report(report_file, markdown):

    report_file.write_text(

        markdown,

        encoding="utf-8"

    )


# --------------------------------------------------
# Print Summary
# --------------------------------------------------

def print_summary(

    group,

    report_file

):

    print()

    print("========================================")
    print(f" SHIN CORE LINX")
    print(f" Semantic Entity Review Generator v{VERSION}")
    print("========================================")

    print()

    print(
        f"Universe : {group['parent_group']}"
    )

    print(
        f"Entity   : {group['group_slug']}"
    )

    print()

    print("Generated:")

    print(report_file)

    print()


# --------------------------------------------------
# Main
# --------------------------------------------------

def main():

    if len(sys.argv) != 2:

        print()

        print("Usage:")

        print()

        print(
            "python3 generate_entity_review.py <group_slug>"
        )

        print()

        print(
            f"Current Version : {VERSION}"
        )

        print()

        return

    group_slug = sys.argv[1]

    #
    # Group
    #

    group = load_group(group_slug)

    if group is None:

        print()

        print("========================================")
        print(" ERROR")
        print("========================================")

        print()

        print(
            f"Group not found : {group_slug}"
        )

        print()

        return

    #
    # Reality
    #

    attributes = load_attributes(group_slug)

    aliases = load_aliases(group_slug)

    negative_aliases = load_negative_aliases(group_slug)

    incoming, outgoing = load_workflows(group_slug)

    metadata = load_metadata(group_slug)

    #
    # Markdown
    #

    markdown = build_markdown(

        group,

        attributes,

        aliases,

        negative_aliases,

        incoming,

        outgoing,

        metadata

    )

    #
    # Output
    #

    report_dir = (

        REVIEWS
        / group["parent_group"]
        / "reports"

    )

    report_dir.mkdir(

        parents=True,

        exist_ok=True

    )

    report_file = (

        report_dir

        / f"{group_slug}.md"

    )

    save_report(

        report_file,

        markdown

    )

    print_summary(

        group,

        report_file

    )


# --------------------------------------------------
# Entry Point
# --------------------------------------------------

if __name__ == "__main__":

    main()