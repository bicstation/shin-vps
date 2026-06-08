# -*- coding: utf-8 -*-
# /home/maya/shin-vps/django/api/services/semantic/v2/compiler/relation_compiler.py

"""
SHIN CORE LINX

Relation Compiler V2

Authority Runtime
↓
Relation Runtime

NO HARDCODED RULES
NO WORKFLOW LOGIC
NO SHELF LOGIC
"""

from api.services.semantic.v2.authority.authority_runtime import (
    build_authority_runtime,
)


# ==========================================================
# UTIL
# ==========================================================

def safe_str(value):

    if value is None:
        return ""

    return str(value).strip()


# ==========================================================
# INDEX
# ==========================================================

def index_attributes(attributes):

    result = {}

    for row in attributes:

        slug = safe_str(
            row.get("slug")
        )

        if not slug:
            continue

        result[slug] = row

    return result


def index_groups(groups):

    result = {}

    for row in groups:

        slug = safe_str(
            row.get("group_slug")
        )

        if not slug:
            continue

        result[slug] = row

    return result


# ==========================================================
# COMPILE
# ==========================================================

def compile_relations():

    runtime = (
        build_authority_runtime()
    )

    groups = runtime.get(
        "groups",
        []
    )

    attributes = runtime.get(
        "attributes",
        []
    )

    mappings = runtime.get(
        "group_mappings",
        []
    )

    attribute_index = (
        index_attributes(
            attributes
        )
    )

    group_index = (
        index_groups(
            groups
        )
    )

    relations = []

    for mapping in mappings:

        group_slug = safe_str(

            mapping.get(
                "group_slug"
            )
        )

        attribute_slug = safe_str(

            mapping.get(
                "attribute_slug"
            )
        )

        if not group_slug:
            continue

        if not attribute_slug:
            continue

        group_row = group_index.get(
            group_slug
        )

        attribute_row = attribute_index.get(
            attribute_slug
        )

        if not group_row:
            continue

        if not attribute_row:
            continue

        relations.append({

            # ======================================
            # Identity
            # ======================================

            "group_slug":
                group_slug,

            "attribute_slug":
                attribute_slug,

            # ======================================
            # Authority
            # ======================================

            "group":
                group_row,

            "attribute":
                attribute_row,

            # ======================================
            # Relation
            # ======================================

            "relation_type":
                "group_contains_attribute",
        })

    return relations


# ==========================================================
# GROUP VIEW
# ==========================================================

def compile_group_relations():

    relations = (
        compile_relations()
    )

    result = {}

    for relation in relations:

        group_slug = relation[
            "group_slug"
        ]

        if group_slug not in result:

            result[group_slug] = {

                "group":
                    relation["group"],

                "attributes": [],
            }

        result[
            group_slug
        ][
            "attributes"
        ].append(

            relation[
                "attribute"
            ]
        )

    return result


# ==========================================================
# ATTRIBUTE VIEW
# ==========================================================

def compile_attribute_relations():

    relations = (
        compile_relations()
    )

    result = {}

    for relation in relations:

        attribute_slug = relation[
            "attribute_slug"
        ]

        if attribute_slug not in result:

            result[attribute_slug] = {

                "attribute":
                    relation["attribute"],

                "groups": [],
            }

        result[
            attribute_slug
        ][
            "groups"
        ].append(

            relation[
                "group"
            ]
        )

    return result


# ==========================================================
# RUNTIME
# ==========================================================

def build_relation_runtime():

    relations = (
        compile_relations()
    )

    groups = (
        compile_group_relations()
    )

    attributes = (
        compile_attribute_relations()
    )

    return {

        "runtime":
            "relation_runtime_v2",

        "relation_count":
            len(relations),

        "group_count":
            len(groups),

        "attribute_count":
            len(attributes),

        "relations":
            relations,

        "groups":
            groups,

        "attributes":
            attributes,

        "ready":
            True,
    }


# ==========================================================
# DEBUG
# ==========================================================

if __name__ == "__main__":

    runtime = (
        build_relation_runtime()
    )

    print()

    print("=" * 60)
    print("RELATION RUNTIME V2")
    print("=" * 60)

    print()

    print(
        "Relations:",
        runtime["relation_count"]
    )

    print(
        "Groups:",
        runtime["group_count"]
    )

    print(
        "Attributes:",
        runtime["attribute_count"]
    )

    print()