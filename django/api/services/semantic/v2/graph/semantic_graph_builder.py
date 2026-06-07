# -*- coding: utf-8 -*-

"""
SHIN CORE LINX

Semantic Graph Builder V2

TSV Authority
↓
Relation Runtime
↓
Traversal Runtime

Graph is NOT authority.

Graph is a derived runtime.
"""

from collections import defaultdict

from api.services.semantic.v2.compiler.relation_compiler import (
    build_relation_runtime,
)


# ==========================================================
# NODE
# ==========================================================

def create_node_id(node_type, value):

    return f"{node_type}:{value}"


# ==========================================================
# GRAPH BUILD
# ==========================================================

def build_semantic_graph():

    runtime = (
        build_relation_runtime()
    )

    relations = runtime.get(
        "relations",
        []
    )

    nodes = {}

    edges = []

    adjacency = defaultdict(set)

    reverse_adjacency = defaultdict(set)

    for relation in relations:

        group = relation.get(
            "group"
        )

        attribute = relation.get(
            "attribute"
        )

        if not group:
            continue

        if not attribute:
            continue

        group_node = create_node_id(
            "group",
            group
        )

        attribute_node = create_node_id(
            "attribute",
            attribute
        )

        # =====================================
        # Nodes
        # =====================================

        nodes[group_node] = {

            "node_type":
                "group",

            "name":
                group,
        }

        nodes[attribute_node] = {

            "node_type":
                "attribute",

            "name":
                attribute,
        }

        # =====================================
        # Edge
        # =====================================

        edge = {

            "source":
                group_node,

            "target":
                attribute_node,

            "relation":
                "contains",
        }

        edges.append(edge)

        adjacency[group_node].add(
            attribute_node
        )

        reverse_adjacency[
            attribute_node
        ].add(
            group_node
        )

    return {

        "runtime":
            "semantic_graph_v2",

        "nodes":
            nodes,

        "edges":
            edges,

        "adjacency":
            adjacency,

        "reverse_adjacency":
            reverse_adjacency,
    }


# ==========================================================
# GROUP -> ATTRIBUTES
# ==========================================================

def group_attributes():

    graph = (
        build_semantic_graph()
    )

    adjacency = graph[
        "adjacency"
    ]

    result = {}

    for node in adjacency:

        if not node.startswith(
            "group:"
        ):
            continue

        group_name = node.replace(
            "group:",
            ""
        )

        attributes = []

        for target in adjacency[node]:

            attributes.append(

                target.replace(
                    "attribute:",
                    ""
                )
            )

        result[group_name] = sorted(
            attributes
        )

    return result


# ==========================================================
# ATTRIBUTE -> GROUPS
# ==========================================================

def attribute_groups():

    graph = (
        build_semantic_graph()
    )

    reverse_graph = graph[
        "reverse_adjacency"
    ]

    result = {}

    for node in reverse_graph:

        if not node.startswith(
            "attribute:"
        ):
            continue

        attribute_name = node.replace(
            "attribute:",
            ""
        )

        groups = []

        for source in reverse_graph[node]:

            groups.append(

                source.replace(
                    "group:",
                    ""
                )
            )

        result[attribute_name] = sorted(
            groups
        )

    return result


# ==========================================================
# TRAVERSAL
# ==========================================================

def discover_related_groups(
    attribute_name
):

    mapping = (
        attribute_groups()
    )

    return mapping.get(
        attribute_name,
        []
    )


def discover_group_attributes(
    group_name
):

    mapping = (
        group_attributes()
    )

    return mapping.get(
        group_name,
        []
    )


# ==========================================================
# FULL RUNTIME
# ==========================================================

def build_graph_runtime():

    graph = (
        build_semantic_graph()
    )

    return {

        "runtime":
            "graph_runtime_v2",

        "node_count":
            len(
                graph["nodes"]
            ),

        "edge_count":
            len(
                graph["edges"]
            ),

        "groups":
            group_attributes(),

        "attributes":
            attribute_groups(),

        "graph":
            graph,
    }


# ==========================================================
# DEBUG
# ==========================================================

if __name__ == "__main__":

    runtime = (
        build_graph_runtime()
    )

    print()
    print("=" * 60)
    print("GRAPH RUNTIME V2")
    print("=" * 60)

    print()

    print(
        "Nodes:",
        runtime["node_count"]
    )

    print(
        "Edges:",
        runtime["edge_count"]
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