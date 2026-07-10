# /home/maya/shin-dev/shin-vps/django/visualization/common/paths.py

"""
============================================================

SHIN CORE LINX
Visualization Platform
Common Paths

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

MASTER_DATA = ROOT / "master_data"

# --------------------------------------------------
# Visualization
# --------------------------------------------------

VISUALIZATION = ROOT / "visualization"

# --------------------------------------------------
# Common
# --------------------------------------------------

COMMON = VISUALIZATION / "common"

# --------------------------------------------------
# Documents
# --------------------------------------------------

DOCS = VISUALIZATION / "docs"
TEMPLATES = VISUALIZATION / "templates"
LOGS = VISUALIZATION / "logs"
OUTPUT = VISUALIZATION / "output"

# --------------------------------------------------
# Sources
# --------------------------------------------------

RUNTIME = VISUALIZATION / "runtime"
STRUCTURES = VISUALIZATION / "structures"
RELATION_MAP = VISUALIZATION / "relation_map"
PROJECTION = VISUALIZATION / "projection"

# --------------------------------------------------
# Observation
# --------------------------------------------------

EVIDENCE = VISUALIZATION / "evidence"
OBSERVATORY = VISUALIZATION / "observatory"
REVIEWS = VISUALIZATION / "reviews"

# --------------------------------------------------
# Generator
# --------------------------------------------------

GENERATORS = VISUALIZATION / "generators"
GENERATOR_API = GENERATORS / "api"
GENERATOR_EVIDENCE = GENERATORS / "evidence"
GENERATOR_GRAPH = GENERATORS / "graph"
GENERATOR_OBSERVATORY = GENERATORS / "observatory"
GENERATOR_PROJECTION = GENERATORS / "projection"
GENERATOR_REVIEW = GENERATORS / "review"
GENERATOR_RUNTIME = GENERATORS / "runtime"
GENERATOR_STRUCTURES = GENERATORS / "structures"

# --------------------------------------------------
# README
# --------------------------------------------------

README = VISUALIZATION / "README.md"