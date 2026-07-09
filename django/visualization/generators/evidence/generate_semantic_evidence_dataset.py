#!/usr/bin/env python3

# /home/maya/shin-vps/django/visualization/generators/evidence/generate_semantic_evidence_dataset.py

"""
============================================================

SHIN CORE LINX

TSV Semantic Infrastructure Team

Semantic Evidence Dataset Generator

============================================================

Semantic Entity
        ↓
Evidence Collection
        ↓
Markdown
        ↓
Output

============================================================

Reality is NOT modified.

Generator orchestrates the Observation Layer.

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

from visualization.generators.evidence.evidence_loader import (

    load_products,
    load_runtime,
    load_group,
    load_groups,
    load_aliases,
    load_negative_aliases,
    get_universe,
    get_structure_dir,
    get_structure_file,

)

# --------------------------------------------------
# Collector
# --------------------------------------------------

from visualization.generators.evidence.evidence_collector import (

    find_product_evidence,

)

# --------------------------------------------------
# Builder
# --------------------------------------------------

from visualization.generators.evidence.evidence_builder import (

    build_semantic_evidence_dataset,

)

# --------------------------------------------------
# Writer
# --------------------------------------------------

from visualization.generators.evidence.evidence_writer import (

    write_markdown,

)

# --------------------------------------------------
# Main
# --------------------------------------------------

def main():

    # ----------------------------------------------
    # Arguments
    # ----------------------------------------------

    if len(sys.argv) == 2:

        groups = [

            load_group(
                sys.argv[1]
            )

        ]

    else:

        groups = load_groups()
    
    
    for group in groups:
        
        # ----------------------------------------------
        # Reality
        # ----------------------------------------------

        if group is None:

            print()
            print(
                f"Semantic Group not found : {entity_slug}"
            )
            print()

            return
        
        entity_slug = group["group_slug"]        

        products = load_products()

        aliases = load_aliases(
            entity_slug,
        )

        negative_aliases = load_negative_aliases(
            entity_slug,
        )

        runtime = load_runtime(
            entity_slug,
        )

        # Runtime は Phase 2 以降で利用

        # ----------------------------------------------
        # Output
        # ----------------------------------------------

        universe_slug = get_universe(
            group,
        )

        structure_dir = get_structure_dir(
            universe_slug,
        )

        structure_file = get_structure_file(
            structure_dir,
            entity_slug,
        )

        # ----------------------------------------------
        # Build
        # ----------------------------------------------

        markdown = build_semantic_evidence_dataset(

            group,

            aliases,

            negative_aliases,

            products,

            find_product_evidence,

        )

        # ----------------------------------------------
        # Write
        # ----------------------------------------------

        write_markdown(

            structure_file,

            markdown,

        )

        # ----------------------------------------------
        # Console
        # ----------------------------------------------

        print()
        print("========================================")
        print(" SHIN CORE LINX")
        print(" Semantic Evidence Dataset")
        print("========================================")
        print()
        print("Version  :", VERSION)
        print("Target   :", entity_slug)
        print("Universe :", universe_slug)
        print("Output   :", structure_file)
        print()
        print("Semantic Evidence Dataset Ready.")
        print()


if __name__ == "__main__":

    main()