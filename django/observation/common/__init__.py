# /home/maya/shin-vps/django/observation/common/__init__.py

"""
============================================================

SHIN CORE LINX

Observation Platform

Common Package

============================================================

Shared utilities for the Observation Platform.

============================================================
"""

# --------------------------------------------------
# Paths
# --------------------------------------------------

from .paths import (
    ROOT,
    DJANGO_ROOT,
    OBSERVATION,
    COMMON,
    GENERATORS,
    DATASETS,
    OUTPUT,
    OUTPUT_MARKDOWN,
    OUTPUT_JSON,
)

# --------------------------------------------------
# Loader
# --------------------------------------------------

from .loader import (
    load_products,
)

# --------------------------------------------------
# Dataset
# --------------------------------------------------

from .dataset import (
    ObservationDataset,
)

# --------------------------------------------------
# Writer
# --------------------------------------------------

from .writer import (
    write_text,
    write_markdown,
    write_json,
    write_tsv,
)

# --------------------------------------------------
# Public API
# --------------------------------------------------

__all__ = [

    # Paths
    "ROOT",
    "DJANGO_ROOT",
    "OBSERVATION",
    "COMMON",
    "GENERATORS",
    "DATASETS",
    "OUTPUT",
    "OUTPUT_MARKDOWN",
    "OUTPUT_JSON",

    # Loader
    "load_products",

    # Dataset
    "ObservationDataset",

    # Writer
    "write_text",
    "write_markdown",
    "write_json",
    "write_tsv",

]