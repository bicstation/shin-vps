#!/usr/bin/env python3

# /home/maya/shin-vps/django/visualization/generators/evidence/generate_semantic_evidence_dataset.py

"""
============================================================

SHIN CORE LINX

TSV Semantic Infrastructure Team

Semantic Evidence Dataset Generator

============================================================

Semantic Entity
        ↓
Evidence Dataset
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

ROOT = Path(__file__).resolve().parents[3]

import os
import csv
import sys

if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

os.environ.setdefault(
    "DJANGO_SETTINGS_MODULE",
    "tiper_api.settings",
)

import django

django.setup()


from api.services.semantic.v2.discover.group_identity_runtime import (
    build_group_identity_runtime,
)

from api.models import (
    PCProduct,
)


# --------------------------------------------------
# Paths
# --------------------------------------------------


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
    / "evidence"
)

# --------------------------------------------------
# Load Products
# --------------------------------------------------

def load_products(

    entity_slug,

):
    products = (

        PCProduct.objects.filter(

            is_active=True,

        )

        .order_by(
            "id"
        )

    )

    return products


# --------------------------------------------------
# Find Product Evidence
# --------------------------------------------------

def find_product_evidence(

    alias,
    products,

):

    matches = []

    alias_lower = alias.lower()

    for product in products:

        name = (
            product.name
            or ""
        )

        if alias_lower in name.lower():

            matches.append({

                "unique_id":
                    product.unique_id,

                "name":
                    name,

                "source":
                    "Product Name",

            })

    return matches

# --------------------------------------------------
# Load Runtime
# --------------------------------------------------

def load_runtime(

    entity_slug,

):

    runtime = (
        build_group_identity_runtime(
            entity_slug,
        )
    )

    return runtime

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

            if row.get(
                "is_active",
                "1",
            ) != "1":

                continue

            if row.get(
                "slug",
            ) != entity_slug:

                continue

            aliases.append(

                row.get(
                    "alias",
                    "",
                )

            )

    return sorted(
        list(
            set(
                aliases
            )
        )
    )

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

            if row.get(
                "is_active",
                "1",
            ) != "1":

                continue

            if row.get(
                "slug",
            ) != entity_slug:

                continue

            aliases.append(

                row.get(
                    "negative_alias",
                    "",
                )

            )

    return sorted(
        list(
            set(
                aliases
            )
        )
    )

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
# Build Semantic Evidence Dataset
# --------------------------------------------------

def build_semantic_evidence_dataset(

    group,
    aliases,
    negative_aliases,
    products,

):

    lines = []

    lines.append("# Semantic Evidence Dataset")
    lines.append("")
    
    lines.append("Semantic Entity")
    lines.append(f"└── {group['group_slug']}")
    lines.append("")
    
    # -----------------------------
    # Alias Evidence
    # -----------------------------

    lines.append("Alias Evidence")

    if aliases:

        for alias in aliases:

            matches = find_product_evidence(
                alias,
                products,
            )
            
            lines.append(f"├── {alias}")
            lines.append(
                f"│   ├── Match : {len(matches)}"
            )

            if matches:

                for match in matches:

                    lines.append(

                        "│   ├── "
                        f"{match['unique_id']}"

                    )

                    lines.append(

                        "│   │   "
                        f"{match['name']}"

                    )

                    lines.append(

                        "│   │   "
                        f"Source : {match['source']}"

                    )

            else:

                lines.append(
                    "│   └── No Evidence"
                )

    else:

        lines.append(
            "└── -"
        )

    lines.append("")

    
    # -----------------------------
    # Negative Alias
    # -----------------------------

    lines.append("Negative Alias")

    if negative_aliases:

        for alias in negative_aliases:

            lines.append(
                f"├── {alias}"
            )

    else:

        lines.append(
            "└── -"
        )

    lines.append("")


    lines.append("Products")
    lines.append(
        f"└── Count : {products.count()}"
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
        print("python3 generate_semantic_evidence_dataset.py <group_slug>")
        print()
        print("Example:")
        print("python3 generate_semantic_evidence_dataset.py usage-ai")
        print()

        return
    
   
    entity_slug = sys.argv[1]

    group = load_group(entity_slug)

    products = load_products(
        entity_slug,
    )

    
    aliases = load_aliases(
        entity_slug,
    )

    negative_aliases = load_negative_aliases(
        entity_slug,
    )

    if group is None:

        print()
        print(f"Semantic Group not found : {entity_slug}")
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

    # Phase 6
    # Runtime Comparison
    
    runtime = load_runtime(
        entity_slug,
    )

    markdown = build_semantic_evidence_dataset(
        group,
        aliases,
        negative_aliases,
        products,
    )

    structure_file.write_text(
        markdown,
        encoding="utf-8",
    )

    print()
    print("========================================")
    print(" SHIN CORE LINX")
    print(" Semantic Evidence Dataset")
    print("========================================")
    print()
    print("Version  :", VERSION)
    print("Target   :", entity_slug)
    print("Universe :", universe_slug)
    print("Output   :", structure_file)
    print()
    print("Semantic Evidence Dataset Ready.")
    print()


if __name__ == "__main__":

    main()
