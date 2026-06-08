# -*- coding: utf-8 -*-
# /home/maya/shin-vps/django/api/services/semantic/v2/graph/semantic_graph_builder.py

"""
SHIN CORE LINX

Semantic Graph Builder V2

TSV
↓
Relation Runtime
↓
Semantic Graph

NO WORKFLOW RULES
NO PRODUCT RULES
NO HARD CODE
"""

from api.services.semantic.v2.compiler.relation_compiler import (
    build_relation_runtime,
)


# ==========================================================
# NODE
# ==========================================================

def build_group_node(group):

    return {

        "node_id":
            group["group_slug"],

        "node_type":
            "group",

        "label":
            group.get(
                "group_name"
            ),

        "data":
            group,
    }


def build_attribute_node(attribute):

    return {

        "node_id":
            attribute["slug"],

        "node_type":
            "attribute",

        "label":
            attribute.get(
                "name"
            ),

        "data":
            attribute,
    }


# ==========================================================
# EDGE
# ==========================================================

def build_relation_edge(relation):

    return {

        "source":
            relation[
                "group_slug"
            ],

        "target":
            relation[
                "attribute_slug"
            ],

        "edge_type":
            relation[
                "relation_type"
            ],
    }


# ==========================================================
# MAIN
# ==========================================================

def build_semantic_graph():

    runtime = (
        build_relation_runtime()
    )

    nodes = {}
    edges = []

    # ======================================================
    # Relations
    # ======================================================

    for relation in runtime.get(
        "relations",
        []
    ):

        group = relation[
            "group"
        ]

        attribute = relation[
            "attribute"
        ]

        group_node = (
            build_group_node(
                group
            )
        )

        attribute_node = (
            build_attribute_node(
                attribute
            )
        )

        nodes[
            group_node["node_id"]
        ] = group_node

        nodes[
            attribute_node["node_id"]
        ] = attribute_node

        edges.append(

            build_relation_edge(
                relation
            )
        )

    return {

        "runtime":
            "semantic_graph_v2",

        "node_count":
            len(nodes),

        "edge_count":
            len(edges),

        "nodes":
            list(
                nodes.values()
            ),

        "edges":
            edges,

        "ready":
            True,
    }


# ==========================================================
# LOOKUP
# ==========================================================

def graph_node_index(graph):

    return {

        node["node_id"]: node

        for node in graph.get(
            "nodes",
            []
        )
    }


def graph_edges_for_node(

    graph,
    node_id
):

    result = []

    for edge in graph.get(
        "edges",
        []
    ):

        if edge["source"] == node_id:

            result.append(edge)

        elif edge["target"] == node_id:

            result.append(edge)

    return result


# ==========================================================
# DEBUG
# ==========================================================

if __name__ == "__main__":

    graph = (
        build_semantic_graph()
    )

    print()

    print("=" * 60)
    print("SEMANTIC GRAPH V2")
    print("=" * 60)

    print()

    print(
        "Nodes:",
        graph["node_count"]
    )

    print(
        "Edges:",
        graph["edge_count"]
    )

    print()