# /home/maya/shin-dev/shin-vps/django/visualization/generators/api/api_builder.py

# /home/maya/shin-dev/shin-vps/django/visualization/generators/api/api_builder.py

"""
============================================================

SHIN CORE LINX

Visualization Platform

API Builder

============================================================

API Observation

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
# Build API Observation
# --------------------------------------------------

def build_api(

    observation,

):

    lines = []

    # ------------------------------------------
    # Header
    # ------------------------------------------

    heading(

        lines,

        "API Observation",

    )

    # ------------------------------------------
    # Endpoint
    # ------------------------------------------

    section(

        lines,

        "Endpoint",

    )

    last_item(

        lines,

        observation["endpoint"],

    )

    blank(lines)

    # ------------------------------------------
    # Status
    # ------------------------------------------

    section(

        lines,

        "Status",

    )

    item(

        lines,

        f"HTTP Status : {observation['status']}",

    )

    last_item(

        lines,

        f"Response Time : {observation['elapsed']} ms",

    )

    blank(lines)

    # ------------------------------------------
    # Payload
    # ------------------------------------------

    section(

        lines,

        "Payload",

    )

    item(

        lines,

        f"Type : {observation['payload_type']}",

    )

    last_item(

        lines,

        f"Items : {observation['payload_count']}",

    )

    blank(lines)

    return "\n".join(lines)

# --------------------------------------------------
# Build Endpoint
# --------------------------------------------------

def build_endpoint(

    observation,

):

    """
    Phase 2

    Endpoint Detail
    """

    return ""

# --------------------------------------------------
# Build Summary
# --------------------------------------------------

def build_summary(

    observations,

):

    """
    Phase 2

    API Summary
    """

    return ""

# --------------------------------------------------
# Build Health Report
# --------------------------------------------------

def build_health_report(

    observations,

):

    """
    Future

    API Health Dashboard
    """

    return ""