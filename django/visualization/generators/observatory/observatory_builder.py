# /home/maya/shin-dev/shin-vps/django/visualization/generators/observatory/observatory_builder.py

"""
============================================================

SHIN CORE LINX
Visualization Platform
Observatory Builder

============================================================

Observation
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
# Build Observatory
# --------------------------------------------------

def build_observatory(

    universe,

    observations,

):

    lines = []

    # ------------------------------------------
    # Header
    # ------------------------------------------

    heading(

        lines,

        "Semantic Observatory",

    )

    section(

        lines,

        "Universe",

    )

    last_item(

        lines,

        universe,

    )

    blank(lines)

    # ------------------------------------------
    # Observation Summary
    # ------------------------------------------

    section(

        lines,

        "Observation Summary",

    )

    if not observations:

        last_item(

            lines,

            "No Observation",

        )

        blank(lines)

        return "\n".join(lines)

    for observation in observations:

        item(

            lines,

            observation["entity"],

        )

        lines.append(

            f"│   ├── Product Count : {observation['product_count']}"

        )

        lines.append(

            f"│   ├── Total Alias : {observation['total_alias']}"

        )

        lines.append(

            f"│   ├── Matched Alias : {observation['matched_alias']}"

        )

        lines.append(

            f"│   ├── No Evidence : {observation['no_evidence']}"

        )

        lines.append(

            f"│   └── Coverage : {observation['coverage']:.2f}%"

        )

    blank(lines)

    # ------------------------------------------
    # Statistics
    # ------------------------------------------

    section(

        lines,

        "Statistics",

    )

    last_item(

        lines,

        f"Entity Count : {len(observations)}",

    )

    blank(lines)

    return "\n".join(lines)