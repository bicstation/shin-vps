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

    heading(

        lines,

        "Semantic Review",

    )

    # ------------------------------------------
    # Status
    # ------------------------------------------

    section(

        lines,

        "Status",

    )

    last_item(

        lines,

        review["status"],

    )

    blank(lines)

    # ------------------------------------------
    # Summary
    # ------------------------------------------

    section(

        lines,

        "Summary",

    )

    last_item(

        lines,

        str(review["summary"]),

    )

    blank(lines)

    # ------------------------------------------
    # Issues
    # ------------------------------------------

    section(

        lines,

        "Issues",

    )

    if review["issues"]:

        for issue in review["issues"][:-1]:

            item(

                lines,

                issue,

            )

        last_item(

            lines,

            review["issues"][-1],

        )

    else:

        last_item(

            lines,

            "None",

        )

    blank(lines)

    # ------------------------------------------
    # Proposals
    # ------------------------------------------

    section(

        lines,

        "Proposals",

    )

    if review["proposals"]:

        for proposal in review["proposals"][:-1]:

            item(

                lines,

                proposal,

            )

        last_item(

            lines,

            review["proposals"][-1],

        )

    else:

        last_item(

            lines,

            "None",

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