#!/usr/bin/env python3

# /home/maya/shin-dev/shin-vps/django/visualization/generators/review/generate_review.py

"""
============================================================

SHIN CORE LINX

Visualization Platform

Review Generator

============================================================

Observation
        ↓
Loader
        ↓
Collector
        ↓
Analyzer
        ↓
Builder
        ↓
Writer
        ↓
Review Artifact

============================================================

Reality is NOT modified.

Generator orchestrates the Review Layer.

============================================================
"""

# --------------------------------------------------
# Version
# --------------------------------------------------

VERSION = "1.0"

# --------------------------------------------------
# Imports
# --------------------------------------------------

from pathlib import Path

import os
import sys

ROOT = Path(__file__).resolve().parents[3]

if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

os.environ.setdefault(
    "DJANGO_SETTINGS_MODULE",
    "tiper_api.settings",
)

import django

django.setup()

# --------------------------------------------------
# Loader
# --------------------------------------------------

from visualization.generators.review.review_loader import (

    load_review_sources,

)

# --------------------------------------------------
# Collector
# --------------------------------------------------

from visualization.generators.review.review_collector import (

    collect_review_source,

)


# --------------------------------------------------
# Analyzer
# --------------------------------------------------

from visualization.generators.review.review_analyzer import (

    analyze_review,

)

# --------------------------------------------------
# Builder
# --------------------------------------------------

from visualization.generators.review.review_builder import (

    build_review,
    build_proposal,
    build_summary,
    build_commander_report,

)

# --------------------------------------------------
# Writer
# --------------------------------------------------

from visualization.generators.review.review_writer import (

    write_review,
    write_proposal,
    write_summary,
    write_commander_report,

)

# --------------------------------------------------
# Output
# --------------------------------------------------

OUTPUT = (
    ROOT
    / "visualization"
    / "reviews"
)

# --------------------------------------------------
# Generate Review
# --------------------------------------------------

def generate_review(

    review,

):

    markdown = build_review(

        review,

    )

    output_file = (

        OUTPUT
        / review["universe"]
        / f"{review['entity']}.md"

    )

    write_review(

        output_file,

        markdown,

    )

# --------------------------------------------------
# Generate Proposal
# --------------------------------------------------

def generate_proposal(

    review,

):

    #
    # Phase 2
    #

    # markdown = build_proposal(
    #     review,
    # )

    # output_file = (
    #     OUTPUT
    #     / review["universe"]
    #     / f"{review['entity']}-proposal.md"
    # )

    # write_proposal(
    #     output_file,
    #     markdown,
    # )

    return

# --------------------------------------------------
# Generate Summary
# --------------------------------------------------

def generate_summary(

    reviews,

):

    #
    # Phase 2
    #

    # markdown = build_summary(
    #     reviews,
    # )

    # write_summary(
    #     OUTPUT / "summary.md",
    #     markdown,
    # )

    return

# --------------------------------------------------
# Generate Commander Report
# --------------------------------------------------

def generate_commander(

    reviews,

):

    #
    # Future
    #

    # markdown = build_commander_report(
    #     reviews,
    # )

    # write_commander_report(
    #     OUTPUT / "commander.md",
    #     markdown,
    # )

    return

# --------------------------------------------------
# Main
# --------------------------------------------------

def main():

    #
    # Temporary Example
    #
    # Phase 2:
    # CLI から Universe / Entity を受け取る
    #

    universe = "usage"

    entity = "usage-ai"

    #
    # Load
    #

    sources = load_review_sources(

        universe,

        entity,

    )

    #
    # Collect
    #
    
    review_source = collect_review_source(

        universe,

        entity,

        sources,

    )
    
    #
    # Analyze
    #

    review = analyze_review(

        review_source,

    )

    #
    # Generate
    #

    generate_review(

        review,

    )


    generate_proposal(

        review,

    )

    generate_summary(

        [review],

    )

    generate_commander(

        [review],

    )

    #
    # Console
    #

    print()
    print("========================================")
    print(" SHIN CORE LINX")
    print(" Review Generator")
    print("========================================")
    print()
    print("Version  :", VERSION)
    print("Universe :", universe)
    print("Entity   :", entity)
    print()
    print("Review Generation Completed.")
    print()

# --------------------------------------------------
# Entry Point
# --------------------------------------------------

if __name__ == "__main__":

    main()