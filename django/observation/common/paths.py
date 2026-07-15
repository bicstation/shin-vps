# /home/maya/shin-vps/django/observation/common/paths.py

"""
============================================================

SHIN CORE LINX

Observation Platform

Common Paths

============================================================

Common Path Definitions

============================================================
"""

# --------------------------------------------------
# Imports
# --------------------------------------------------

from pathlib import Path

# --------------------------------------------------
# Root
# --------------------------------------------------

ROOT = Path(__file__).resolve().parents[2]

# --------------------------------------------------
# Django
# --------------------------------------------------

DJANGO_ROOT = ROOT.parent

# --------------------------------------------------
# Observation
# --------------------------------------------------

OBSERVATION = ROOT

COMMON = OBSERVATION / "common"

GENERATORS = OBSERVATION / "generators"

DATASETS = OBSERVATION / "datasets"

OUTPUT = OBSERVATION / "output"

# --------------------------------------------------
# Output
# --------------------------------------------------

OUTPUT_MARKDOWN = OUTPUT / "markdown"

OUTPUT_JSON = OUTPUT / "json"