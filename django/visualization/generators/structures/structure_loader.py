# /home/maya/shin-dev/shin-vps/django/visualization/generators/structures/structure_loader.py

"""
============================================================

SHIN CORE LINX

Visualization Platform

Structure Loader

============================================================

TSV Reality

        ↓

Structure Object

============================================================
"""

# --------------------------------------------------
# Imports
# --------------------------------------------------

import csv

from visualization.common.paths import (
    MASTER_DATA,
    STRUCTURES,
)

# --------------------------------------------------
# Paths
# --------------------------------------------------

UNIVERSES = MASTER_DATA / "semantic_universes.tsv"
GROUPS = MASTER_DATA / "semantic_groups.tsv"
GROUP_MAPPINGS = MASTER_DATA / "semantic_group_mappings.tsv"

# --------------------------------------------------
# Load Universes
# --------------------------------------------------

def load_universes():

    universes = []

    with open(
        UNIVERSES,
        encoding="utf-8",
    ) as f:

        reader = csv.DictReader(
            f,
            delimiter="\t",
        )

        for row in reader:

            if row.get(
                "is_active",
                "1",
            ) != "1":
                continue

            universes.append(
                row,
            )

    return universes

# --------------------------------------------------
# Load Groups
# --------------------------------------------------

def load_groups():

    groups = []

    with open(
        GROUPS,
        encoding="utf-8",
    ) as f:

        reader = csv.DictReader(
            f,
            delimiter="\t",
        )

        for row in reader:

            if row.get(
                "is_active",
                "1",
            ) != "1":
                continue

            groups.append(
                row,
            )

    return groups

# --------------------------------------------------
# Load Group Mappings
# --------------------------------------------------

def load_group_mappings():

    mappings = []

    with open(
        GROUP_MAPPINGS,
        encoding="utf-8",
    ) as f:

        reader = csv.DictReader(
            f,
            delimiter="\t",
        )

        for row in reader:

            if row.get(
                "is_active",
                "1",
            ) != "1":
                continue

            mappings.append(
                row,
            )

    return mappings

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