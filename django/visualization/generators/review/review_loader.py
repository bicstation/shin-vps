"""
============================================================

SHIN CORE LINX

Visualization Platform

Review Loader

============================================================

Observation

        ↓

Review Object

============================================================
"""

# --------------------------------------------------
# Imports
# --------------------------------------------------

from pathlib import Path

# --------------------------------------------------
# Observation Paths
# --------------------------------------------------

ROOT = Path(__file__).resolve().parents[3]

OBSERVATORY = (
    ROOT
    / "visualization"
    / "observatory"
)

EVIDENCE = (
    ROOT
    / "visualization"
    / "evidence"
)

RUNTIME = (
    ROOT
    / "visualization"
    / "runtime"
)

# --------------------------------------------------
# Load Markdown
# --------------------------------------------------

def load_markdown(

    path,

):

    if not path.exists():

        return ""

    return path.read_text(

        encoding="utf-8",

    )

# --------------------------------------------------
# Load Evidence
# --------------------------------------------------

def load_evidence(

    universe,
    entity,

):

    return load_markdown(

        EVIDENCE
        / universe
        / f"{entity}.md"

    )

# --------------------------------------------------
# Load Runtime
# --------------------------------------------------

def load_runtime(

    universe,
    entity,

):

    return load_markdown(

        RUNTIME
        / universe
        / f"{entity}.md"

    )

# --------------------------------------------------
# Load Observatory
# --------------------------------------------------

def load_observatory(

    universe,

):

    return load_markdown(

        OBSERVATORY
        / universe
        / "index.md"

    )

# --------------------------------------------------
# Load Review Sources
# --------------------------------------------------

def load_review_sources(

    universe,
    entity,

):

    return {

        "evidence": load_evidence(

            universe,
            entity,

        ),

        "runtime": load_runtime(

            universe,
            entity,

        ),

        "observatory": load_observatory(

            universe,

        ),

    }