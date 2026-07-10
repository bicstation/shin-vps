"""
============================================================

SHIN CORE LINX

Visualization Platform

Structure Builder

============================================================

Structure Object

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
# Build Structure
# --------------------------------------------------

def build_structure(

    structure,

):

    universe = structure["universe"]
    groups = structure["groups"]

    lines = []

    heading(
        lines,
        "Semantic Structure",
    )

    section(
        lines,
        "Universe",
    )

    last_item(
        lines,
        universe["universe_slug"],
    )

    blank(lines)

    section(
        lines,
        "Groups",
    )

    if groups:

        last = len(groups) - 1

        for index, group in enumerate(groups):

            text = group["group_slug"]

            label = group.get("label", "")

            if label:
                text += f" ({label})"

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
            "No Groups",
        )

    blank(lines)

    section(
        lines,
        "Statistics",
    )

    last_item(
        lines,
        f"Group Count : {len(groups)}",
    )

    blank(lines)

    return "\n".join(lines)


# --------------------------------------------------
# Build Tree
# --------------------------------------------------
def build_tree(

    structure,

):

    group = structure["group"]
    metadata = structure["metadata"]
    attributes = structure["attributes"]
    aliases = structure["aliases"]
    negative_aliases = structure["negative_aliases"]
    workflow = structure["workflow"]
    coverage = structure["coverage"]

    lines = []

    universe = group["parent_group"]

    slug = group["group_slug"]

    lines.append("# Semantic Tree")
    lines.append("")

    lines.append("Universe")
    lines.append(f"└── {universe}")
    lines.append("")

    lines.append("    Group")
    lines.append(f"    └── {slug}")
    lines.append("")

    # -----------------------------
    # Presentation
    # -----------------------------

    lines.append("        Presentation")

    name = group.get("display_name") or group.get("group_name") or group.get("name") or "-"

    description = (
        metadata.get("description")
        or group.get("description")
        or "-"
    )

    lines.append(f"        ├── Name : {name}")
    lines.append(f"        └── Description : {description}")
    lines.append("")

    # -----------------------------
    # Attributes
    # -----------------------------

    lines.append("        Attributes")

    if attributes:

        for item in attributes:

            lines.append(f"        ├── {item}")

    else:

        lines.append("        └── -")

    lines.append("")

    # -----------------------------
    # Alias
    # -----------------------------

    lines.append("        Alias")

    if aliases:

        for item in aliases:

            lines.append(f"        ├── {item}")

    else:

        lines.append("        └── -")

    lines.append("")

    # -----------------------------
    # Negative Alias
    # -----------------------------

    lines.append("        Negative Alias")

    if negative_aliases:

        for item in negative_aliases:

            lines.append(f"        ├── {item}")

    else:

        lines.append("        └── -")

    lines.append("")

    # -----------------------------
    # Workflow
    # -----------------------------

    lines.append("        Workflow")

    if workflow:

        for item in workflow:

            lines.append(f"        ├── {item}")

    else:

        lines.append("        └── -")

    lines.append("")
    
    # -----------------------------
    # Coverage
    # -----------------------------

    lines.append("        Coverage")
    lines.append("")


    lines.append(
        f"        ├── Universe : {coverage['universe']}"
    )

    lines.append(
        f"        ├── Parent Group : {coverage['parent_group']}"
    )
       
    lines.append("")

    lines.append("        Membership")

    lines.append(
        f"        └── Attribute Count : {coverage['attribute_count']}"
    )

    lines.append("")
    
    lines.append("        Discovery")

    lines.append(
        f"        ├── Alias Count : {coverage['alias_count']}"
    )

    lines.append(
        f"        └── Negative Alias Count : {coverage['negative_alias_count']}"
    )

    lines.append("")
    
    lines.append("        Authority")

    runtime = "Available" if coverage["runtime_available"] else "Not Available"

    lines.append(
        f"        └── Runtime Availability : {runtime}"
    )

    lines.append("")
    
    
    # -----------------------------
    # Metadata
    # -----------------------------

    lines.append("        Metadata")

    for key in [

        "title",
        "subtitle",
        "description",
        "seo_title",
        "seo_description",

    ]:

        value = metadata.get(key)

        if value:

            lines.append(

                f"        ├── {key} : {value}"

            )

    lines.append("")

    return "\n".join(lines)



# --------------------------------------------------
# Build Master View
# --------------------------------------------------

def build_master_view(

    structure,

):

    group = structure["group"]
    metadata = structure["metadata"]
    attributes = structure["attributes"]
    aliases = structure["aliases"]
    negative_aliases = structure["negative_aliases"]
    workflow = structure["workflow"]
    coverage = structure["coverage"]

    lines = []
    
    universe = group["parent_group"]

    slug = group["group_slug"]

    name = (
        group.get("display_name")
        or group.get("group_name")
        or group.get("name")
        or "-"
    )

    lines.append("# Original Semantic Master View")
    lines.append("")

    lines.append("Semantic Entity")
    lines.append("")

    lines.append("Identity")
    lines.append(f"├── Slug : {slug}")
    lines.append(f"├── Universe : {universe}")
    lines.append(f"├── Parent Group : {group['parent_group']}")
    lines.append(f"└── Name : {name}")
    lines.append("")


    # -----------------------------
    # Presentation
    # -----------------------------

    lines.append("        Presentation")

    name = (
        group.get("display_name")
        or group.get("group_name")
        or group.get("name")
        or "-"
    )

    lines.append(f"        └── Name : {name}")

    lines.append("")
    
    # -----------------------------
    # Description
    # -----------------------------

    lines.append("        Description")

    lines.append(
        f"        └── {group['presentation_description']}"
    )

    lines.append("")
    

    # -----------------------------
    # Attributes
    # -----------------------------

    lines.append("        Attribute Mapping")

    if attributes:

        for item in attributes:

            lines.append(f"        ├── {item}")

    else:

        lines.append("        └── -")

    lines.append("")

    # -----------------------------
    # Alias
    # -----------------------------

    lines.append("        Alias")

    if aliases:

        for item in aliases:

            lines.append(f"        ├── {item}")

    else:

        lines.append("        └── -")

    lines.append("")

    # -----------------------------
    # Negative Alias
    # -----------------------------

    lines.append("        Negative Alias")

    if negative_aliases:

        for item in negative_aliases:

            lines.append(f"        ├── {item}")

    else:

        lines.append("        └── -")

    lines.append("")

    # -----------------------------
    # Workflow
    # -----------------------------

    lines.append("        Workflow")

    if workflow:

        for item in workflow:

            lines.append(f"        ├── {item}")

    else:

        lines.append("        └── -")

    lines.append("")
    
    
    # -----------------------------
    # Coverage
    # -----------------------------

    lines.append("        Coverage")
    lines.append("")

    runtime = (
        "Available"
        if coverage["runtime_available"]
        else "Not Available"
    )

    lines.append(
        f"        ├── Universe : {coverage['universe']}"
    )

    lines.append(
        f"        ├── Parent Group : {coverage['parent_group']}"
    )

    lines.append(
    f"        ├── Product Count : {coverage['product_count']}"
    
)

    lines.append(
        f"        ├── Alias Count : {coverage['alias_count']}"
    )

    lines.append(
        f"        ├── Negative Alias Count : {coverage['negative_alias_count']}"
    )

    lines.append(
        f"        └── Runtime Availability : {runtime}"
    )

    lines.append("")
   
    
    # -----------------------------
    # Metadata
    # -----------------------------

    lines.append("        Metadata")

    for key in [

        "title",
        "subtitle",
        "description",
        "seo_title",
        "seo_description",

    ]:

        value = metadata.get(key)

        if value:

            lines.append(

                f"        ├── {key} : {value}"

            )

    lines.append("")
    
    
    # -----------------------------
    # Runtime Projection
    # -----------------------------

    lines.append("        Runtime Projection")
    lines.append("        └── -")
    lines.append("")

    # -----------------------------
    # Relation
    # -----------------------------

    lines.append("        Relation")
    lines.append("        └── -")
    lines.append("")

    return "\n".join(lines)

# --------------------------------------------------
# Build Dependency
# --------------------------------------------------

def build_dependency(

    structures,

):

    """
    Future

    Dependency View Generator
    """

    return ""