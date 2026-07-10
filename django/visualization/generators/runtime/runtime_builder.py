# /home/maya/shin-dev/shin-vps/django/visualization/generators/runtime/runtime_builder.py

"""
============================================================

SHIN CORE LINX

Visualization Platform

Runtime Builder

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
# Build Runtime Observation
# --------------------------------------------------

def build_runtime_observation(

    observation,

):

    lines = []

    # ------------------------------------------
    # Header
    # ------------------------------------------

    heading(

        lines,

        "Runtime Observation",

    )

    # ------------------------------------------
    # Entity
    # ------------------------------------------

    section(

        lines,

        "Semantic Entity",

    )

    last_item(

        lines,

        observation["entity"],

    )

    blank(lines)

    # ------------------------------------------
    # Status
    # ------------------------------------------

    section(

        lines,

        "Status",

    )

    last_item(

        lines,

        f"Ready : {observation['ready']}",

    )

    blank(lines)

    # ------------------------------------------
    # Authority
    # ------------------------------------------

    section(

        lines,

        "Authority",

    )

    item(

        lines,

        f"Semantic Authority : {observation['semantic_authority']}",

    )

    item(

        lines,

        f"Schema Version : {observation['semantic_schema_version']}",

    )

    last_item(

        lines,

        f"Authority Version : {observation['authority_version']}",

    )

    blank(lines)

    # ------------------------------------------
    # Runtime
    # ------------------------------------------

    section(

        lines,

        "Runtime",

    )

    item(

        lines,

        f"Product Count : {observation['product_count']}",

    )

    last_item(

        lines,

        f"Intent Count : {observation['intent_count']}",

    )

    blank(lines)

    return "\n".join(lines)