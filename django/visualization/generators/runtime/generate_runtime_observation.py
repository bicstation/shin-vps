#!/usr/bin/env python3

# /home/maya/shin-vps/django/visualization/generators/runtime/generate_runtime_observation.py

"""
============================================================

SHIN CORE LINX

TSV Semantic Infrastructure Team

Runtime Observation Generator

============================================================

Mission

Semantic Entity
        ↓
Group Identity Runtime
        ↓
Runtime Observation
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


from api.services.semantic.v2.discover.group_identity_runtime import (
    build_group_identity_runtime,
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
    / "runtime"
)

# --------------------------------------------------
# Load Runtime
# --------------------------------------------------

def load_runtime(

    entity_slug,

):

    runtime = (
        build_group_identity_runtime(
            entity_slug,
        )
    )

    return runtime

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
# Build Runtime Observation
# --------------------------------------------------

def build_runtime_observation(

    group,
    runtime,

):

    lines = []

    lines.append("# Runtime Observation")
    lines.append("")

    lines.append("Status")

    ready = runtime.get(
        "ready",
        False,
    )

    lines.append(
        f"└── Ready : {ready}"
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
        print("python3 generate_runtime_observation.py <group_slug>")
        print()
        print("Example:")
        print("python3 generate_runtime_observation.py usage-ai")
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
    # Runtime Observation
    # （Phase 2 で load_runtime() を実装）
    #

    runtime = load_runtime(
        entity_slug,
    )

    markdown = build_runtime_observation(
        group,
        runtime,
    )

    structure_file.write_text(
        markdown,
        encoding="utf-8",
    )

    print()
    print("========================================")
    print(" SHIN CORE LINX")
    print(" Runtime Observation")
    print("========================================")
    print()
    print("Version  :", VERSION)
    print("Target   :", entity_slug)
    print("Universe :", universe_slug)
    print("Output   :", structure_file)
    print()
    print("Runtime Observation Ready.")
    print()


if __name__ == "__main__":

    main()
