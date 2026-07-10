#!/usr/bin/env python3

"""
============================================================

SHIN CORE LINX

TSV Semantic Infrastructure Team

Semantic Tree Generator

============================================================

Mission

Current TSV
        ↓
Semantic Tree
        ↓
Markdown

============================================================

Reality is NOT modified.

Generator only visualizes existing TSV structure.

============================================================
"""

# --------------------------------------------------
# Version
# --------------------------------------------------

VERSION = "0.1"

# --------------------------------------------------
# Imports
# --------------------------------------------------

from pathlib import Path

import csv
import sys


# --------------------------------------------------
# Paths
# --------------------------------------------------

ROOT = Path(__file__).resolve().parents[3]

MASTER = ROOT / "master_data"

GROUPS = MASTER / "semantic_groups.tsv"
GROUP_MAPPINGS = MASTER / "semantic_group_mappings.tsv"
ALIASES = MASTER / "semantic_aliases.tsv"
NEGATIVE_ALIASES = MASTER / "semantic_negative_aliases.tsv"
WORKFLOW = MASTER / "semantic_workflow_mappings.tsv"
METADATA = MASTER / "semantic_slug_metadata.tsv"

STRUCTURES = (
    ROOT
    / "visualization"
    / "structures"
)


# --------------------------------------------------
# Load Attributes
# --------------------------------------------------

def load_attributes(

    entity_slug,

):

    attributes = []

    with open(

        GROUP_MAPPINGS,

        encoding="utf-8",

    ) as f:

        reader = csv.DictReader(

            f,

            delimiter="\t",

        )

        for row in reader:

            if row["group_slug"] != entity_slug:
                continue

            attributes.append(

                row["attribute_slug"]

            )

    return sorted(attributes)


# --------------------------------------------------
# Load Aliases
# --------------------------------------------------

def load_aliases(

    entity_slug,

):

    aliases = []

    with open(

        ALIASES,

        encoding="utf-8",

    ) as f:

        reader = csv.DictReader(

            f,

            delimiter="\t",

        )

        for row in reader:

            if row["slug"] != entity_slug:
                continue

            aliases.append(

                row["alias"]

            )

    return sorted(aliases)


# --------------------------------------------------
# Load Negative Aliases
# --------------------------------------------------

def load_negative_aliases(

    entity_slug,

):

    aliases = []

    with open(

        NEGATIVE_ALIASES,

        encoding="utf-8",

    ) as f:

        reader = csv.DictReader(

            f,

            delimiter="\t",

        )

        for row in reader:

            if row["slug"] != entity_slug:
                continue

            aliases.append(

                row["negative_alias"]

            )

    return sorted(aliases)


# --------------------------------------------------
# Load Workflow
# --------------------------------------------------

def load_workflow(

    entity_slug,

):

    workflow = []

    with open(

        WORKFLOW,

        encoding="utf-8",

    ) as f:

        reader = csv.DictReader(

            f,

            delimiter="\t",

        )

        for row in reader:

            if row["group_slug"] != entity_slug:
                continue

            workflow.append(

                row["workflow_slug"]

            )

    return sorted(workflow)


# --------------------------------------------------
# Load Metadata
# --------------------------------------------------

def load_metadata(

    entity_slug,

):

    with open(

        METADATA,

        encoding="utf-8",

    ) as f:

        reader = csv.DictReader(

            f,

            delimiter="\t",

        )

        for row in reader:

            if row["slug"] == entity_slug:

                return row

    return {}



# --------------------------------------------------
# Load Group
# --------------------------------------------------

def load_group(entity_slug):

    with open(GROUPS, encoding="utf-8") as f:

        reader = csv.DictReader(
            f,
            delimiter="\t",
        )

        for row in reader:

            if row["is_active"] != "1":
                continue

            if row["group_slug"] == entity_slug:

                return row

    return None


# --------------------------------------------------
# Universe
# --------------------------------------------------

def get_universe(group):

    return group["parent_group"]


# --------------------------------------------------
# Structure Directory
# --------------------------------------------------

def get_structure_dir(

    universe_slug,

):

    structure_dir = (

        STRUCTURES
        / universe_slug

    )

    structure_dir.mkdir(

        parents=True,
        exist_ok=True,

    )

    return structure_dir


# --------------------------------------------------
# Structure File
# --------------------------------------------------

def get_structure_file(

    structure_dir,
    group_slug,

):

    return (

        structure_dir
        / f"{group_slug}.md"

    )




# --------------------------------------------------
# Build Coverage
# --------------------------------------------------

def build_coverage(

    group,
    attributes,
    aliases,
    negative_aliases,

):

    return {

        "universe": group["parent_group"],
        "parent_group": group["parent_group"],
        "attribute_count": len(attributes),
        "alias_count": len(aliases),
        "negative_alias_count": len(negative_aliases),
        "runtime_available": True,

    }



# --------------------------------------------------
# Build Tree
# --------------------------------------------------

def build_tree(

    group,
    metadata,
    attributes,
    aliases,
    negative_aliases,
    workflow,
    coverage,

):


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
# Main
# --------------------------------------------------

def main():

    if len(sys.argv) != 2:

        print()
        print("Usage:")
        print("python3 generate_semantic_tree.py <group_slug>")
        print()
        print("Example:")
        print("python3 generate_semantic_tree.py usage-ai")
        print()

        return

    entity_slug = sys.argv[1]

    group = load_group(entity_slug)

    if group is None:

        print()

        print(
            f"Semantic Group not found : {entity_slug}"
        )

        print()

        return

    universe_slug = get_universe(group)

    structure_dir = get_structure_dir(

        universe_slug,

    )

    structure_file = get_structure_file(
        structure_dir,
        entity_slug,
    )
    
    
    attributes = load_attributes(
        entity_slug,
    )

    aliases = load_aliases(
        entity_slug,
    )

    negative_aliases = load_negative_aliases(
        entity_slug,
    )

    workflow = load_workflow(
        entity_slug,
    )

    metadata = load_metadata(
        entity_slug,
    )
    
    coverage = build_coverage(
        group,
        attributes,
        aliases,
        negative_aliases,
    )
    
    
    markdown = build_tree(
        group,
        metadata,
        attributes,
        aliases,
        negative_aliases,
        workflow,
        coverage,
    )

    structure_file.write_text(
        markdown,
        encoding="utf-8",
    )

    print()
    print("========================================")
    print(" SHIN CORE LINX")
    print(" Semantic Tree Generator")
    print("========================================")
    print()
    print("Version :", VERSION)
    print("Target  :", entity_slug)
    print()
    print("Universe :", universe_slug)
    print("Output   :", structure_file)
    print()
    print("Semantic Tree Ready.")
    print()

if __name__ == "__main__":

    main()

