# /home/maya/shin-dev/shin-vps/django/api/utils/semantic/loader.py

# =========================================================
# SHIN CORE LINX｜Semantic Loader
# /api/utils/semantic/loader.py
# =========================================================

import csv

from pathlib import Path


# =========================================================
# Base Dir
# =========================================================

BASE_DIR = Path("/usr/src/app")

MASTER_DIR = (
    BASE_DIR
    / "master_data"
)


# =========================================================
# Generic TSV Loader
# =========================================================

def load_tsv(filename):

    path = MASTER_DIR / filename

    rows = []

    if not path.exists():

        print(
            f"❌ TSV NOT FOUND: {path}"
        )

        return rows

    with open(
        path,
        "r",
        encoding="utf-8"
    ) as f:

        reader = csv.DictReader(
            f,
            delimiter="\t"
        )

        for row in reader:

            # 空行防止
            if not any(row.values()):
                continue

            rows.append(row)

    return rows


# =========================================================
# Aliases
# =========================================================

def load_aliases():

    return load_tsv(
        "semantic_aliases.tsv"
    )


# =========================================================
# Negative Aliases
# =========================================================

def load_negative_aliases():

    return load_tsv(
        "semantic_negative_aliases.tsv"
    )


# =========================================================
# Normalization Rules
# =========================================================

def load_normalization_rules():

    return load_tsv(
        "semantic_normalization_rules.tsv"
    )


# =========================================================
# Semantic Groups
# =========================================================

def load_groups():

    return load_tsv(
        "semantic_groups.tsv"
    )


# =========================================================
# Group Mappings
# =========================================================

def load_group_mappings():

    return load_tsv(
        "semantic_group_mappings.tsv"
    )