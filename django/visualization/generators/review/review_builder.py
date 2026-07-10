# /home/maya/shin-dev/shin-vps/django/visualization/generators/review/review_builder.py

# /home/maya/shin-dev/shin-vps/django/visualization/generators/review/review_builder.py

"""
============================================================

SHIN CORE LINX

Visualization Platform

Review Builder

============================================================

Review Object

        ↓

Markdown

============================================================
"""

# --------------------------------------------------
# Imports
# --------------------------------------------------

from visualization.common.markdown import (

    heading,
    section,
    blank,
    item,
    last_item,

)

# --------------------------------------------------
# Build Review
# --------------------------------------------------

def build_review(

    review,

):

    lines = []

    summary = review["summary"]
    score = review["score"]

    # ------------------------------------------
    # Header
    # ------------------------------------------

    heading(

        lines,

        "Semantic Review",

    )

    # ------------------------------------------
    # Universe
    # ------------------------------------------

    section(

        lines,

        "Universe",

    )

    item(

        lines,

        review["universe"],

    )

    last_item(

        lines,

        review["entity"],

    )

    blank(lines)

    # ------------------------------------------
    # Observation Status
    # ------------------------------------------

    section(

        lines,

        "Observation",

    )

    item(

        lines,

        f"Evidence : {summary['evidence_ready']}",

    )

    item(

        lines,

        f"Runtime : {summary['runtime_ready']}",

    )

    last_item(

        lines,

        f"Observatory : {summary['observatory_ready']}",

    )

    blank(lines)

    # ------------------------------------------
    # Score
    # ------------------------------------------

    section(

        lines,

        "Score",

    )

    last_item(

        lines,

        f"{score['score']} / {score['max_score']}",

    )

    blank(lines)

    return "\n".join(lines)

# --------------------------------------------------
# Build Proposal
# --------------------------------------------------

def build_proposal(

    review,

):

    """
    Phase 2

    Proposal Generator
    """

    return ""

# --------------------------------------------------
# Build Summary
# --------------------------------------------------

def build_summary(

    reviews,

):

    """
    Phase 2

    Universe Summary
    """

    return ""

# --------------------------------------------------
# Build Commander Report
# --------------------------------------------------

def build_commander_report(

    reviews,

):

    """
    Future

    Commander Dashboard
    """

    return ""