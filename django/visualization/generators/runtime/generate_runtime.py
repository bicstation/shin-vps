#!/usr/bin/env python3

# /home/maya/shin-vps/django/visualization/generators/runtime/generate_runtime.py

"""
============================================================

SHIN CORE LINX

Visualization Platform

Runtime Observation Generator

============================================================

Semantic Entity
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

Generator orchestrates the Runtime Observation Layer.

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

from visualization.generators.runtime.runtime_loader import (

    load_group,
    load_groups,
    load_runtime,
    get_universe,
    get_runtime_dir,
    get_runtime_file,

)

# --------------------------------------------------
# Collector
# --------------------------------------------------

from visualization.generators.runtime.runtime_collector import (

    collect_runtime_observation,

)

# --------------------------------------------------
# Builder
# --------------------------------------------------

from visualization.generators.runtime.runtime_builder import (

    build_runtime_observation,

)

# --------------------------------------------------
# Writer
# --------------------------------------------------

from visualization.generators.runtime.runtime_writer import (

    write_markdown,

)

# --------------------------------------------------
# Generate Entity
# --------------------------------------------------

def generate_entity(

    group,

):

    entity_slug = group["group_slug"]

    runtime = load_runtime(

        entity_slug,

    )

    observation = collect_runtime_observation(

        group,
        runtime,

    )

    markdown = build_runtime_observation(

        observation,

    )

    universe = get_universe(

        group,

    )

    runtime_dir = get_runtime_dir(

        universe,

    )

    output_file = get_runtime_file(

        runtime_dir,
        entity_slug,

    )

    write_markdown(

        output_file,
        markdown,

    )

    print(

        f"[OK] {entity_slug}"

    )

# --------------------------------------------------
# Main
# --------------------------------------------------

def main():

    #
    # Target Groups
    #

    if len(sys.argv) == 2:

        group = load_group(

            sys.argv[1],

        )

        if group is None:

            print()
            print(
                f"Semantic Group not found : {sys.argv[1]}"
            )
            print()

            return

        groups = [

            group,

        ]

    else:

        groups = load_groups()

    #
    # Generate
    #

    for group in groups:

        generate_entity(

            group,

        )

    #
    # Console
    #

    print()
    print("========================================")
    print(" SHIN CORE LINX")
    print(" Runtime Observation")
    print("========================================")
    print()

    print(

        "Version :",
        VERSION,

    )

    print()

    print(

        "Runtime Observation Ready."

    )

    print()

# --------------------------------------------------
# Entry Point
# --------------------------------------------------

if __name__ == "__main__":

    main()