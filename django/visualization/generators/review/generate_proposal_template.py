#!/usr/bin/env python3

"""
============================================================

SHIN CORE LINX

TSV Semantic Authority Team

Proposal Template Generator

============================================================

Mission

    Universe
        ↓
    proposal.md

============================================================

Current Version

    Version 0.1

Status

    ✔ Phase 1 Complete

Current Responsibility

    Universe
        ↓
    Proposal Template
        ↓
    proposal.md

============================================================

Roadmap

Version 0.1
------------------------------
Proposal Template

✔ Completed

Version 0.2
------------------------------
Review Summary Copy

Version 0.3
------------------------------
Review Metadata

Version 1.0
------------------------------
Proposal Workspace

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

ROOT = Path(__file__).resolve().parents[3]

MASTER = ROOT / "master_data"

UNIVERSES = MASTER / "semantic_universes.tsv"

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
# Build Proposal
# --------------------------------------------------
def build_proposal(universe):

    lines = []

    lines.append("# Proposal")
    lines.append("")
    lines.append(f"Universe : {universe['universe_slug']}")
    lines.append("")
    lines.append("Status : Draft")
    lines.append("")
    lines.append("---")
    lines.append("")
    lines.append("## Review Reference")
    lines.append("")
    lines.append("review.md")
    lines.append("")
    lines.append("---")
    lines.append("")
    lines.append("## Improvement Proposals")
    lines.append("")
    lines.append("-")
    lines.append("")
    lines.append("---")
    lines.append("")
    lines.append("## Reason")
    lines.append("")
    lines.append("-")
    lines.append("")
    lines.append("---")
    lines.append("")
    lines.append("## Commander Decision")
    lines.append("")
    lines.append("Pending")
    lines.append("")
    lines.append("---")
    lines.append("")
    lines.append("## Decision")
    lines.append("")
    lines.append("Pending")
    lines.append("")

    return "\n".join(lines)

# --------------------------------------------------
# Save Proposal
# --------------------------------------------------

def save_proposal(proposal_file, markdown):

    #
    # Never overwrite an existing proposal.
    #
    if proposal_file.exists():

        print()

        print("Proposal already exists.")

        print(proposal_file)

        print()

        return False

    proposal_file.write_text(

        markdown,

        encoding="utf-8"

    )

    return True


# --------------------------------------------------
# Print Summary
# --------------------------------------------------

def print_summary(

    universe_slug,

    proposal_file,

    created

):

    print()

    print("========================================")
    print(" SHIN CORE LINX")
    print(f" Proposal Template Generator v{VERSION}")
    print("========================================")

    print()

    print(f"Universe : {universe_slug}")

    print()

    if created:

        print("Status   : Created")

    else:

        print("Status   : Already Exists")

    print()

    print("Proposal:")

    print(proposal_file)

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
            "python3 generate_proposal_template.py <universe_slug>"
        )

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

    proposal_dir = REVIEWS / universe_slug

    proposal_dir.mkdir(

        parents=True,

        exist_ok=True

    )

    proposal_file = proposal_dir / "proposal.md"

    markdown = build_proposal(

        universe

    )

    created = save_proposal(

        proposal_file,

        markdown

    )

    print_summary(

        universe_slug,

        proposal_file,

        created

    )


# --------------------------------------------------
# Entry Point
# --------------------------------------------------

if __name__ == "__main__":

    main()