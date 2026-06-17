# -*- coding: utf-8 -*-
# /home/maya/shin-vps/django/api/services/semantic/v2/authority/tsv_loader.py

"""
SHIN CORE LINX

Authority TSV Loader

Responsibility

TSV
↓
List[dict]

Only.

No semantic interpretation.
No normalization.
No grouping.
No workflow logic.
"""

from pathlib import Path
import csv


# ==========================================================
# BASE PATH
# ==========================================================

CURRENT_DIR = Path(__file__).resolve()

SEMANTIC_ROOT = (

    CURRENT_DIR

    .parents[3]

)

# ----------------------------------------------------------
# Example
#
# django/api/semantic_data/
# ----------------------------------------------------------

CURRENT_DIR = Path(__file__).resolve()

DJANGO_ROOT = (
    CURRENT_DIR.parents[5]
)

DEFAULT_TSV_DIR = (
    DJANGO_ROOT / "master_data"
)


# ==========================================================
# UTIL
# ==========================================================

def safe_value(value):

    if value is None:
        return ""

    return str(value).strip()


# ==========================================================
# TSV LOADER
# ==========================================================

def load_tsv(tsv_path):

    """
    Generic TSV Loader

    Returns

    [
        {
            column1: value,
            column2: value,
        }
    ]
    """

    tsv_path = Path(tsv_path)

    if not tsv_path.exists():

        raise FileNotFoundError(

            f"TSV not found: {tsv_path}"
        )

    rows = []

    with open(
        tsv_path,
        mode="r",
        encoding="utf-8",
        newline=""
    ) as fp:

        reader = csv.DictReader(
            fp,
            delimiter="\t"
        )

        for row_no, row in enumerate(reader, start=2):

            if None in row:

                print("\n===================")
                print("BROKEN TSV")
                print("===================")
                print(tsv_path)
                print(f"ROW={row_no}")
                print(row)

            cleaned = {}

            for key, value in row.items():

                if key is None:

                    print(
                        f"SKIP INVALID COLUMN "
                        f"{tsv_path} "
                        f"ROW={row_no}"
                    )

                    continue

                cleaned[
                    key.strip()
                ] = safe_value(value)

            rows.append(cleaned)
    
    
    return rows


# ==========================================================
# DIRECTORY LOADER
# ==========================================================

def load_all_tsvs(

    directory=DEFAULT_TSV_DIR
):

    """
    Returns

    {
        "semantic_groups":
            [...],

        "semantic_attributes":
            [...],
    }
    """

    directory = Path(directory)

    if not directory.exists():

        raise FileNotFoundError(

            f"Directory not found: {directory}"
        )

    registry = {}

    for file in directory.glob("*.tsv"):

        registry[
            file.stem
        ] = load_tsv(file)

    return registry


# ==========================================================
# SINGLE FILE
# ==========================================================

def load_named_tsv(

    name,

    directory=DEFAULT_TSV_DIR
):

    """
    Example

    load_named_tsv(
        "semantic_groups"
    )
    """

    file_path = (

        Path(directory)
        /
        f"{name}.tsv"
    )

    return load_tsv(
        file_path
    )


# ==========================================================
# DEBUG
# ==========================================================

if __name__ == "__main__":

    registry = load_all_tsvs()

    print()

    print(
        "=" * 50
    )

    print(
        "Loaded TSV Files"
    )

    print(
        "=" * 50
    )

    for name, rows in registry.items():

        print(

            f"{name}: {len(rows)} rows"
        )


# ==========================================================
# SEMANTIC GROUPS
# ==========================================================

def load_semantic_groups():

    return load_tsv(

        DEFAULT_TSV_DIR
        / "semantic_groups.tsv"
    )


# ==========================================================
# SEMANTIC ATTRIBUTES
# ==========================================================

def load_semantic_attributes():

    return load_tsv(

        DEFAULT_TSV_DIR
        / "semantic_attributes.tsv"
    )


# ==========================================================
# SEMANTIC GROUP MAPPINGS
# ==========================================================

def load_semantic_group_mappings():

    return load_tsv(

        DEFAULT_TSV_DIR
        / "semantic_group_mappings.tsv"
    )