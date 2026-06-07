# -*- coding: utf-8 -*-

"""
SHIN CORE LINX

Relation Compiler V2

Authority Runtime
↓
Relation Runtime

TSV Relation Authority

NO HARDCODED SHELVES
NO HARDCODED WORKFLOWS
NO HARDCODED GRAPH
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


def index_attributes(attributes):

    result = {}

    for row in attributes:

        attribute = safe_str(
            row.get("attribute")
        )

        if not attribute:
            continue

        result[attribute] = row

    return result


def index_groups(groups):

    result = {}

    for row in groups:

        group = safe_str(
            row.get("group")
        )

        if not group:
            continue

        result[group] = row

    return result


# ==========================================================
# RELATION COMPILER
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

        group_name = safe_str(

            mapping.get(
                "group"
            )
        )

        attribute_name = safe_str(

            mapping.get(
                "attribute"
            )
        )

        if not group_name:
            continue

        if not attribute_name:
            continue

        group_row = group_index.get(
            group_name
        )

        attribute_row = attribute_index.get(
            attribute_name
        )

        if not group_row:
            continue

        if not attribute_row:
            continue

        relation = {

            # ======================================
            # Identity
            # ======================================

            "group":
                group_name,

            "attribute":
                attribute_name,

            # ======================================
            # Source
            # ======================================

            "group_row":
                group_row,

            "attribute_row":
                attribute_row,

            # ======================================
            # Relation
            # ======================================

            "relation_type":
                "group_contains_attribute",
        }

        relations.append(
            relation
        )

    return relations


# ==========================================================
# GROUP CENTRIC VIEW
# ==========================================================

def compile_group_relations():

    relations = (
        compile_relations()
    )

    groups = {}

    for relation in relations:

        group = relation["group"]

        if group not in groups:

            groups[group] = {

                "group":
                    group,

                "attributes": [],
            }

        groups[group][
            "attributes"
        ].append(

            relation["attribute"]
        )

    return groups


# ==========================================================
# ATTRIBUTE CENTRIC VIEW
# ==========================================================

def compile_attribute_relations():

    relations = (
        compile_relations()
    )

    attributes = {}

    for relation in relations:

        attribute = relation[
            "attribute"
        ]

        if attribute not in attributes:

            attributes[attribute] = {

                "attribute":
                    attribute,

                "groups": [],
            }

        attributes[
            attribute
        ][
            "groups"
        ].append(

            relation["group"]
        )

    return attributes


# ==========================================================
# RUNTIME
# ==========================================================

def build_relation_runtime():

    relations = (
        compile_relations()
    )

    return {

        "runtime":
            "relation_runtime_v2",

        "relation_count":
            len(relations),

        "relations":
            relations,

        "groups":
            compile_group_relations(),

        "attributes":
            compile_attribute_relations(),
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

    print()