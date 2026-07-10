# /home/maya/shin-dev/shin-vps/django/visualization/generators/observatory/observatory_loader.py

"""
============================================================

SHIN CORE LINX
Visualization Platform
Observatory Loader

============================================================

Evidence Loader

Markdown
TSV
↓
Python Objects

============================================================
"""

# --------------------------------------------------
# Imports
# --------------------------------------------------

import csv

from visualization.common.paths import (

    EVIDENCE,

    MASTER_DATA,

    OBSERVATORY,

)

# --------------------------------------------------
# Master Data
# --------------------------------------------------

GROUPS = MASTER_DATA / "semantic_groups.tsv"

# --------------------------------------------------
# Groups
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
# Universe
# --------------------------------------------------

def get_universe(

    group,

):

    return group["parent_group"]

# --------------------------------------------------
# Evidence Directory
# --------------------------------------------------

def get_evidence_dir(

    universe_slug,

):

    return (

        EVIDENCE

        / universe_slug

    )

# --------------------------------------------------
# Evidence File
# --------------------------------------------------

def get_evidence_file(

    universe_slug,

    entity_slug,

):

    return (

        get_evidence_dir(

            universe_slug,

        )

        / f"{entity_slug}.md"

    )

# --------------------------------------------------
# Read Evidence
# --------------------------------------------------

def load_evidence(

    universe_slug,

    entity_slug,

):

    evidence_file = get_evidence_file(

        universe_slug,

        entity_slug,

    )

    if not evidence_file.exists():

        return None

    return evidence_file.read_text(

        encoding="utf-8",

    )

# --------------------------------------------------
# Observatory Directory
# --------------------------------------------------

def get_observatory_dir(

    universe_slug,

):

    directory = (

        OBSERVATORY

        / universe_slug

    )

    directory.mkdir(

        parents=True,

        exist_ok=True,

    )

    return directory

# --------------------------------------------------
# Observatory File
# --------------------------------------------------

def get_observatory_file(

    universe_slug,

):

    return (

        get_observatory_dir(

            universe_slug,

        )

        / "index.md"

    )