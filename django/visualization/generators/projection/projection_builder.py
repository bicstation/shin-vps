# /home/maya/shin-vps/django/visualization/generators/projection/projection_builder.py

# /home/maya/shin-vps/django/visualization/generators/projection/projection_builder.py

"""
============================================================

SHIN CORE LINX

Visualization Platform

Projection Builder

============================================================

Projection Object

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
# Build Projection
# --------------------------------------------------

def build_projection(

    projections,

):

    lines = []

    # ------------------------------------------
    # Header
    # ------------------------------------------

    heading(

        lines,

        "Projection",

    )

    # ------------------------------------------
    # Products
    # ------------------------------------------

    section(

        lines,

        "Products",

    )

    if projections:

        last = len(projections) - 1

        for index, projection in enumerate(projections):

            text = (

                f"{projection['unique_id']}"

                f" : "

                f"{projection['name']}"

            )

            if index == last:

                last_item(

                    lines,
                    text,

                )

            else:

                item(

                    lines,
                    text,

                )

    else:

        last_item(

            lines,

            "No Products",

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

        f"Product Count : {len(projections)}",

    )

    blank(lines)

    return "\n".join(lines)


# --------------------------------------------------
# Build Product Projection
# --------------------------------------------------

def build_product_projection(

    projection,

):

    if projection is None:

        return ""

    lines = []

    heading(

        lines,

        "Product Projection",

    )

    section(

        lines,

        "Identity",

    )

    item(

        lines,

        f"Unique ID : {projection['unique_id']}",

    )

    item(

        lines,

        f"Name : {projection['name']}",

    )

    item(

        lines,

        f"Brand : {projection['brand']}",

    )

    item(

        lines,

        f"Category : {projection['category']}",

    )

    last_item(

        lines,

        f"Price : {projection['price']}",

    )

    blank(lines)

    return "\n".join(lines)


# --------------------------------------------------
# Build Summary
# --------------------------------------------------

def build_summary(

    summary,

):

    lines = []

    heading(

        lines,

        "Projection Summary",

    )

    section(

        lines,

        "Statistics",

    )

    last_item(

        lines,

        f"Product Count : {summary['product_count']}",

    )

    blank(lines)

    return "\n".join(lines)