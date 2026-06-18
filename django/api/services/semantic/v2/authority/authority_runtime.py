# -*- coding: utf-8 -*-
# /home/maya/shin-vps/django/api/services/semantic/v2/authority/authority_runtime.py

"""
SHIN CORE LINX

Authority Runtime V2

Authority TSV
↓
Semantic Registry
↓
Authority Runtime

Single Source Of Truth
"""

from .semantic_registry import (
    build_semantic_registry,
)


# ==========================================================
# CONSTANTS
# ==========================================================

AUTHORITY_VERSION = "2.0"

SEMANTIC_SCHEMA_VERSION = 3

SEMANTIC_AUTHORITY = "backend"


# ==========================================================
# AUTHORITY RUNTIME
# ==========================================================

def build_authority_runtime():

    registry = (
        build_semantic_registry()
    )

    runtime = {

        # ==========================================
        # Contract
        # ==========================================

        "semantic_schema_version":
            SEMANTIC_SCHEMA_VERSION,

        "authority_version":
            AUTHORITY_VERSION,

        "semantic_authority":
            SEMANTIC_AUTHORITY,

        # ==========================================
        # Registry
        # ==========================================

        "groups":
            registry.get(
                "groups",
                []
            ),

        "attributes":
            registry.get(
                "attributes",
                []
            ),

        "group_mappings":
            registry.get(
                "group_mappings",
                []
            ),

        "aliases":
            registry.get(
                "aliases",
                []
            ),

        "negative_aliases":
            registry.get(
                "negative_aliases",
                []
            ),

        "normalization_rules":
            registry.get(
                "normalization_rules",
                []
            ),
        
        "slug_metadata":
            registry.get(
                "slug_metadata",
                []
            ),
        
        "workflow_mappings":
            registry.get(
                "workflow_mappings",
                []
            ),

        # ==========================================
        # Runtime Metadata
        # ==========================================

        "runtime":
            "authority_runtime_v2",

        "source":
            "tsv",

        "ready":
            True,
    }

    return runtime


# ==========================================================
# HELPERS
# ==========================================================

def get_runtime_groups():

    runtime = (
        build_authority_runtime()
    )

    return runtime.get(
        "groups",
        []
    )


def get_runtime_attributes():

    runtime = (
        build_authority_runtime()
    )

    return runtime.get(
        "attributes",
        []
    )


def get_runtime_group_mappings():

    runtime = (
        build_authority_runtime()
    )

    return runtime.get(
        "group_mappings",
        []
    )


def get_runtime_aliases():

    runtime = (
        build_authority_runtime()
    )

    return runtime.get(
        "aliases",
        []
    )


def get_runtime_negative_aliases():

    runtime = (
        build_authority_runtime()
    )

    return runtime.get(
        "negative_aliases",
        []
    )


def get_runtime_normalization_rules():

    runtime = (
        build_authority_runtime()
    )

    return runtime.get(
        "normalization_rules",
        []
    )

def get_runtime_slug_metadata():

    runtime = (
        build_authority_runtime()
    )

    return runtime.get(
        "slug_metadata",
        []
    )

# ==========================================================
# DEBUG
# ==========================================================

if __name__ == "__main__":

    runtime = (
        build_authority_runtime()
    )

    print()

    print("=" * 60)
    print("AUTHORITY RUNTIME V2")
    print("=" * 60)

    print()

    print(
        "Groups:",
        len(
            runtime["groups"]
        )
    )

    print(
        "Attributes:",
        len(
            runtime["attributes"]
        )
    )

    print(
        "Group Mappings:",
        len(
            runtime["group_mappings"]
        )
    )

    print(
        "Aliases:",
        len(
            runtime["aliases"]
        )
    )

    print(
        "Negative Aliases:",
        len(
            runtime["negative_aliases"]
        )
    )

    print(
        "Normalization Rules:",
        len(
            runtime["normalization_rules"]
        )
    )

    print(
        "Slug Metadata:",
        len(
            runtime["slug_metadata"]
        )
    )

    print()

    print(
        "Authority Runtime Ready"
    )
    
    