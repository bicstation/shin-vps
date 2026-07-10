# /home/maya/shin-dev/shin-vps/django/visualization/generators/graph/graph_loader.py

# /home/maya/shin-dev/shin-vps/django/visualization/generators/graph/graph_loader.py

"""
============================================================

SHIN CORE LINX

Visualization Platform

Graph Loader

============================================================

TSV Reality

        ↓

Graph Object

============================================================
"""

# --------------------------------------------------
# Imports
# --------------------------------------------------

import csv

from visualization.common.paths import (
    MASTER_DATA,
)

# --------------------------------------------------
# Paths
# --------------------------------------------------

UNIVERSES = MASTER_DATA / "semantic_universes.tsv"

GROUPS = MASTER_DATA / "semantic_groups.tsv"

GROUP_MAPPINGS = (
    MASTER_DATA
    / "semantic_group_mappings.tsv"
)

ATTRIBUTES = (
    MASTER_DATA
    / "semantic_attributes.tsv"
)

ALIASES = (
    MASTER_DATA
    / "semantic_aliases.tsv"
)

WORKFLOW = (
    MASTER_DATA
    / "semantic_workflow_mappings.tsv"
)

# --------------------------------------------------
# Generic TSV Loader
# --------------------------------------------------

def load_tsv(path):

    rows = []

    with open(
        path,
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

            rows.append(row)

    return rows

# --------------------------------------------------
# Load Universes
# --------------------------------------------------

def load_universes():

    return load_tsv(
        UNIVERSES,
    )

# --------------------------------------------------
# Load Groups
# --------------------------------------------------

def load_groups():

    return load_tsv(
        GROUPS,
    )

# --------------------------------------------------
# Load Group Mappings
# --------------------------------------------------

def load_group_mappings():

    return load_tsv(
        GROUP_MAPPINGS,
    )

# --------------------------------------------------
# Load Attributes
# --------------------------------------------------

def load_attributes():

    return load_tsv(
        ATTRIBUTES,
    )

# --------------------------------------------------
# Load Aliases
# --------------------------------------------------

def load_aliases():

    return load_tsv(
        ALIASES,
    )

# --------------------------------------------------
# Load Workflow
# --------------------------------------------------

def load_workflow():

    return load_tsv(
        WORKFLOW,
    )