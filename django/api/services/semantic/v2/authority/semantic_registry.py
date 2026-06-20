# -*- coding: utf-8 -*-
# /home/maya/shin-vps/django/api/services/semantic/v2/authority/semantic_registry.py

"""
SHIN CORE LINX

Semantic Registry V2

Authority TSV
↓
Authority Registry

No Graph
No Traversal
No Shelf Logic
No Workflow Logic
"""

from .tsv_loader import (
    load_all_tsvs,
)


# ==========================================================
# FILE NAMES
# ==========================================================

GROUPS_FILE = "semantic_groups"

ATTRIBUTES_FILE = "semantic_attributes"

GROUP_MAPPINGS_FILE = "semantic_group_mappings"

ALIASES_FILE = "semantic_aliases"

NEGATIVE_ALIASES_FILE = "semantic_negative_aliases"

NORMALIZATION_RULES_FILE = (
    "semantic_normalization_rules"
)

SLUG_METADATA_FILE = (
    "semantic_slug_metadata"
)

WORKFLOW_MAPPINGS_FILE = (
    "semantic_workflow_mappings"
)

UNIVERSES_FILE = (
    "semantic_universes"
)

# ==========================================================
# REGISTRY BUILDER
# ==========================================================

def build_semantic_registry():

    raw = load_all_tsvs()

    registry = {

        # ------------------------------------------
        # Raw Authority
        # ------------------------------------------
        "universes":
            raw.get(
                UNIVERSES_FILE,
                []
            ),

        "groups":
            raw.get(
                GROUPS_FILE,
                []
            ),

        "attributes":
            raw.get(
                ATTRIBUTES_FILE,
                []
            ),

        "group_mappings":
            raw.get(
                GROUP_MAPPINGS_FILE,
                []
            ),

        "aliases":
            raw.get(
                ALIASES_FILE,
                []
            ),

        "negative_aliases":
            raw.get(
                NEGATIVE_ALIASES_FILE,
                []
            ),

        "normalization_rules":
            raw.get(
                NORMALIZATION_RULES_FILE,
                []
            ),
               
        "slug_metadata":
            raw.get(
                SLUG_METADATA_FILE,
                []
            ),
        
        "workflow_mappings":
            raw.get(
                WORKFLOW_MAPPINGS_FILE,
                []
            ),

        # ------------------------------------------
        # Metadata
        # ------------------------------------------

        "registry_version":
            1,

        "authority":
            "tsv",

    }

    return registry


# ==========================================================
# HELPERS
# ==========================================================

def get_groups(registry):

    return registry.get(
        "groups",
        []
    )


def get_attributes(registry):

    return registry.get(
        "attributes",
        []
    )


def get_group_mappings(registry):

    return registry.get(
        "group_mappings",
        []
    )


def get_aliases(registry):

    return registry.get(
        "aliases",
        []
    )


def get_negative_aliases(registry):

    return registry.get(
        "negative_aliases",
        []
    )


def get_normalization_rules(registry):

    return registry.get(
        "normalization_rules",
        []
    )

def get_slug_metadata(registry):

    return registry.get(
        "slug_metadata",
        []
    )


# ==========================================================
# DEBUG
# ==========================================================

if __name__ == "__main__":

    registry = (
        build_semantic_registry()
    )

    print()

    print("=" * 50)
    print("Semantic Registry")
    print("=" * 50)

    print()

    print(
        "groups:",
        len(
            registry["groups"]
        )
    )

    print(
        "attributes:",
        len(
            registry["attributes"]
        )
    )

    print(
        "group_mappings:",
        len(
            registry["group_mappings"]
        )
    )

    print(
        "aliases:",
        len(
            registry["aliases"]
        )
    )

    print(
        "negative_aliases:",
        len(
            registry["negative_aliases"]
        )
    )

    print(
        "normalization_rules:",
        len(
            registry["normalization_rules"]
        )
    )
    
    print(
        "slug_metadata:",
        len(
            registry["slug_metadata"]
        )
    )