# -*- coding: utf-8 -*-
# /home/maya/shin-vps/django/visualization/generators/evidence/evidence_loader.py

"""
============================================================

SHIN CORE LINX

TSV Semantic Infrastructure Team

Semantic Evidence Loader

============================================================

Responsibilities

TSV
Database
Runtime

Read Only

============================================================
"""

# --------------------------------------------------
# Imports
# --------------------------------------------------

from pathlib import Path

import csv

from api.models import (
    PCProduct,
)

from api.services.semantic.v2.discover.group_identity_runtime import (
    build_group_identity_runtime,
)

# --------------------------------------------------
# Paths
# --------------------------------------------------

ROOT = Path(__file__).resolve().parents[3]

MASTER = ROOT / "master_data"

GROUPS = MASTER / "semantic_groups.tsv"
ALIASES = MASTER / "semantic_aliases.tsv"
NEGATIVE_ALIASES = MASTER / "semantic_negative_aliases.tsv"

STRUCTURES = (
    ROOT
    / "visualization"
    / "evidence"
)

# --------------------------------------------------
# Load Products
# --------------------------------------------------

def load_products():

    return (

        PCProduct.objects.filter(

            is_active=True,

        )

        .order_by(
            "id"
        )

    )


# --------------------------------------------------
# Load Runtime
# --------------------------------------------------

def load_runtime(

    entity_slug,

):

    return (

        build_group_identity_runtime(

            entity_slug,

        )

    )


# --------------------------------------------------
# Load Group
# --------------------------------------------------

def load_group(

    entity_slug,

):

    with open(

        GROUPS,

        encoding="utf-8",

    ) as f:

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

            if row["is_active"] != "1":

                continue

            groups.append(row)

    return groups


# --------------------------------------------------
# Load Aliases
# --------------------------------------------------

def load_aliases(

    entity_slug,

):

    aliases = []

    with open(

        ALIASES,

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

            if row.get(

                "slug",

            ) != entity_slug:

                continue

            aliases.append(

                row.get(

                    "alias",

                    "",

                )

            )

    return sorted(

        list(

            set(

                aliases

            )

        )

    )


# --------------------------------------------------
# Load Negative Aliases
# --------------------------------------------------

def load_negative_aliases(

    entity_slug,

):

    aliases = []

    with open(

        NEGATIVE_ALIASES,

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

            if row.get(

                "slug",

            ) != entity_slug:

                continue

            aliases.append(

                row.get(

                    "negative_alias",

                    "",

                )

            )

    return sorted(

        list(

            set(

                aliases

            )

        )

    )


# --------------------------------------------------
# Universe
# --------------------------------------------------

def get_universe(

    group,

):

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