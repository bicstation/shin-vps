#!/usr/bin/env python3

# /home/maya/shin-vps/django/visualization/generators/api/generate_discover_api_observation.py

"""
============================================================

SHIN CORE LINX

TSV Semantic Infrastructure Team

Discover API Observation Generator

============================================================

Semantic Entity
        ↓
Discover API
        ↓
API Observation
        ↓
Markdown

============================================================

Reality is NOT modified.

Generator only visualizes existing TSV structure.

============================================================
"""

# --------------------------------------------------
# Version
# --------------------------------------------------

VERSION = "0.2"

# --------------------------------------------------
# Imports
# --------------------------------------------------

from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]

import os
import csv
import sys

if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

os.environ.setdefault(
    "DJANGO_SETTINGS_MODULE",
    "tiper_api.settings",
)

import django

django.setup()


from api.services.semantic.v2.discover.group_identity_api import (
    build_group_identity_api,
)

# --------------------------------------------------
# Paths
# --------------------------------------------------


MASTER = ROOT / "master_data"

GROUPS = MASTER / "semantic_groups.tsv"
GROUP_MAPPINGS = MASTER / "semantic_group_mappings.tsv"
ALIASES = MASTER / "semantic_aliases.tsv"
NEGATIVE_ALIASES = MASTER / "semantic_negative_aliases.tsv"
WORKFLOW = MASTER / "semantic_workflow_mappings.tsv"
METADATA = MASTER / "semantic_slug_metadata.tsv"

STRUCTURES = (
    ROOT
    / "visualization"
    / "api"
)

# --------------------------------------------------
# Load Discover API
# --------------------------------------------------

def load_discover_api(

    entity_slug,

):

    api = (
        build_group_identity_api(
            entity_slug,
        )
    )

    return api

# --------------------------------------------------
# Load Group
# --------------------------------------------------

def load_group(entity_slug):

    with open(GROUPS, encoding="utf-8") as f:

        reader = csv.DictReader(
            f,
            delimiter="\t",
        )

        for row in reader:

            if row["is_active"] != "1":
                continue

            if row["group_slug"] == entity_slug:

                return row

    return None


# --------------------------------------------------
# Universe
# --------------------------------------------------

def get_universe(group):

    return group["parent_group"]


# --------------------------------------------------
# Structure Directory
# --------------------------------------------------

def get_structure_dir(

    universe_slug,

):

    structure_dir = (

        STRUCTURES
        / universe_slug

    )

    structure_dir.mkdir(

        parents=True,
        exist_ok=True,

    )

    return structure_dir


# --------------------------------------------------
# Structure File
# --------------------------------------------------

def get_structure_file(

    structure_dir,
    group_slug,

):

    return (

        structure_dir
        / f"{group_slug}.md"

    )


# --------------------------------------------------
# Build Discover API Observation
# --------------------------------------------------

def build_discover_api_observation(

    group,
    api,

):

    lines = []

    lines.append("# api Observation")
    lines.append("")

    # -----------------------------
    # api Status
    # -----------------------------

    lines.append("api Status")

    found = api.get(
        "found",
        False,
    )

    ready = api.get(
        "ready",
        False,
    )

    lines.append(
        f"├── Found : {found}"
    )

    lines.append(
        f"└── Ready : {ready}"
    )

    lines.append("")
    
    # -----------------------------
    # Product Projection
    # -----------------------------

    lines.append("Product Projection")

    data = api.get(
        "data",
        {}
    )

    product_count = data.get(
        "product_count",
        0,
    )

    lines.append(
        f"└── Product Count : {product_count}"
    )

    lines.append("")
    
    
    # -----------------------------
    # Sample Products
    # -----------------------------

    lines.append("Sample Products")

    sample_products = data.get(
        "sample_products",
        [],
    )

    lines.append(
        f"└── Count : {len(sample_products)}"
    )

    lines.append("")

    return "\n".join(lines)



# --------------------------------------------------
# Main
# --------------------------------------------------

def main():

    if len(sys.argv) != 2:

        print()
        print("Usage:")
        print("python3 generate_api_observation.py <group_slug>")
        print()
        print("Example:")
        print("python3 generate_api_observation.py usage-ai")
        print()

        return

    entity_slug = sys.argv[1]

    group = load_group(entity_slug)

    if group is None:

        print()
        print(f"Semantic Group not found : {entity_slug}")
        print()

        return

    universe_slug = get_universe(group)

    structure_dir = get_structure_dir(
        universe_slug,
    )

    structure_file = get_structure_file(
        structure_dir,
        entity_slug,
    )

    #
    # Discover API Observation
    #

    api = load_discover_api(
        entity_slug,
    )

    markdown = build_discover_api_observation(
        group,
        api,
    )

    structure_file.write_text(
        markdown,
        encoding="utf-8",
    )

    print()
    print("========================================")
    print(" SHIN CORE LINX")
    print(" Discover API Observation")
    print("========================================")
    print()
    print("Version  :", VERSION)
    print("Target   :", entity_slug)
    print("Universe :", universe_slug)
    print("Output   :", structure_file)
    print()
    print("Discover API Observation Ready.")
    print()


if __name__ == "__main__":

    main()
