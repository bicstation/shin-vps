# /home/maya/shin-dev/shin-vps/django/visualization/generators/runtime/runtime_loader.py

"""
============================================================

SHIN CORE LINX

Visualization Platform

Runtime Loader

============================================================

Reality

↓

Runtime Object

============================================================
"""

# --------------------------------------------------
# Imports
# --------------------------------------------------

import csv

from api.services.semantic.v2.discover.group_identity_runtime import (
    build_group_identity_runtime,
)

from visualization.common.paths import (
    MASTER_DATA,
    RUNTIME,
)

# --------------------------------------------------
# Paths
# --------------------------------------------------

GROUPS = MASTER_DATA / "semantic_groups.tsv"

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

            groups.append(
                row,
            )

    return groups

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
# Load Runtime
# --------------------------------------------------

def load_runtime(

    entity_slug,

):

    return build_group_identity_runtime(

        entity_slug,

    )

# --------------------------------------------------
# Universe
# --------------------------------------------------

def get_universe(

    group,

):

    return group["parent_group"]

# --------------------------------------------------
# Runtime Directory
# --------------------------------------------------

def get_runtime_dir(

    universe_slug,

):

    runtime_dir = (

        RUNTIME
        / universe_slug

    )

    runtime_dir.mkdir(

        parents=True,
        exist_ok=True,

    )

    return runtime_dir

# --------------------------------------------------
# Runtime File
# --------------------------------------------------

def get_runtime_file(

    runtime_dir,
    entity_slug,

):

    return (

        runtime_dir
        / f"{entity_slug}.md"

    )