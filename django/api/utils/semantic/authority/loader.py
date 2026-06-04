# =========================================================
# FILE:
# api/utils/semantic/authority/loader.py
# =========================================================

import csv

from pathlib import Path

from django.conf import settings


# =========================================================
# BASE
# =========================================================

BASE_DIR = (
    Path(settings.BASE_DIR)
    / "master_data"
)


# =========================================================
# TSV
# =========================================================

def load_tsv(filename):

    path = BASE_DIR / filename

    rows = []

    with open(

        path,

        "r",

        encoding="utf-8",

    ) as f:

        reader = csv.DictReader(

            f,

            delimiter="\t",
        )

        rows.extend(reader)

    return rows


# =========================================================
# LOAD MASTER
# =========================================================

def load_semantic_master():

    return {

        "attributes": load_tsv(
            "semantic_attributes.tsv"
        ),

        "aliases": load_tsv(
            "semantic_aliases.tsv"
        ),

        "negative_aliases": load_tsv(
            "semantic_negative_aliases.tsv"
        ),

        "normalization_rules": load_tsv(
            "semantic_normalization_rules.tsv"
        ),

        "groups": load_tsv(
            "semantic_groups.tsv"
        ),

        "group_mappings": load_tsv(
            "semantic_group_mappings.tsv"
        ),
    }