#!/usr/bin/env python3

# /home/maya/shin-dev/shin-vps/django/visualization/generators/structures/generate_semantic_structure.py

"""
============================================================

SHIN CORE LINX

Visualization Platform

Semantic Structure Generator

============================================================

TSV Reality
        ↓
Loader
        ↓
Collector
        ↓
Builder
        ↓
Writer
        ↓
Markdown

============================================================

Reality is NOT modified.

Generator orchestrates the Structure Layer.

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

from visualization.generators.structures.structure_loader import (

    load_universes,
    load_groups,
    load_group_mappings,
    get_structure_dir,
    get_structure_file,

)

# --------------------------------------------------
# Collector
# --------------------------------------------------

from visualization.generators.structures.structure_collector import (

    collect_structure,

)

# --------------------------------------------------
# Builder
# --------------------------------------------------

from visualization.generators.structures.structure_builder import (

    build_structure,
    build_tree,
    build_master_view,

)

# --------------------------------------------------
# Writer
# --------------------------------------------------

from visualization.generators.structures.structure_writer import (

    write_markdown,

)

# --------------------------------------------------
# Generate Universe
# --------------------------------------------------

def generate_universe(

    structure,

):

    universe = structure["universe"]

    universe_slug = universe["universe_slug"]

    structure_dir = get_structure_dir(

        universe_slug,

    )

    #
    # Structure
    #

    markdown = build_structure(

        structure,

    )

    output_file = get_structure_file(

        structure_dir,
        universe_slug,

    )

    write_markdown(

        output_file,
        markdown,

    )

    #
    # Tree
    # （Phase 2）
    #

    # tree = build_tree(
    #     structure,
    # )

    # write_markdown(
    #     ...
    # )

    print(

        f"[OK] {universe_slug}"

    )

# --------------------------------------------------
# Generate Master View
# --------------------------------------------------

def generate_master(

    structures,

):

    #
    # Phase 2
    #

    # markdown = build_master_view(
    #     structures,
    # )

    # write_markdown(
    #     ...
    # )

    return

# --------------------------------------------------
# Main
# --------------------------------------------------

def main():

    #
    # Load Reality
    #

    universes = load_universes()

    groups = load_groups()

    mappings = load_group_mappings()

    #
    # Collect
    #

    structures = collect_structure(

        universes,
        groups,
        mappings,

    )

    #
    # Universe
    #

    for structure in structures:

        generate_universe(

            structure,

        )

    #
    # Master View
    #

    generate_master(

        structures,

    )

    #
    # Console
    #

    print()
    print("========================================")
    print(" SHIN CORE LINX")
    print(" Semantic Structure")
    print("========================================")
    print()
    print("Version :", VERSION)
    print("Universe:", len(structures))
    print()
    print("Semantic Structure Ready.")
    print()

# --------------------------------------------------
# Entry Point
# --------------------------------------------------

if __name__ == "__main__":

    main()