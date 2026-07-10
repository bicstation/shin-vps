# /home/maya/shin-dev/shin-vps/django/visualization/generators/graph/graph_builder.py

"""
============================================================

SHIN CORE LINX

Visualization Platform

Graph Builder

============================================================

Graph Object

        ↓

DOT

============================================================
"""

# --------------------------------------------------
# Build Relation Map
# --------------------------------------------------

def build_relation_map(

    graph,

):

    nodes = graph["nodes"]
    edges = graph["edges"]

    lines = []

    lines.append("digraph SemanticRelationMap {")
    lines.append("")

    # ------------------------------------------
    # Graph Settings
    # ------------------------------------------

    lines.append("    rankdir=LR;")
    lines.append('    node [shape=box];')
    lines.append("")

    # ------------------------------------------
    # Nodes
    # ------------------------------------------

    for node in nodes:

        node_id = node["id"]
        label = node["label"]

        lines.append(

            f'    "{node_id}" [label="{label}"];'

        )

    lines.append("")

    # ------------------------------------------
    # Edges
    # ------------------------------------------

    for edge in edges:

        source = edge["from"]
        target = edge["to"]

        edge_type = edge.get(
            "type",
            "",
        )

        if edge_type:

            lines.append(

                f'    "{source}" -> "{target}" [label="{edge_type}"];'

            )

        else:

            lines.append(

                f'    "{source}" -> "{target}";'

            )

    lines.append("")
    lines.append("}")

    return "\n".join(lines)


# --------------------------------------------------
# Build Universe Graph
# --------------------------------------------------

def build_universe_graph(

    graph,

):

    """
    Phase 2

    Universe-only Relation Map
    """

    return ""


# --------------------------------------------------
# Build Workflow Graph
# --------------------------------------------------

def build_workflow_graph(

    graph,

):

    """
    Phase 2

    Workflow Relation Map
    """

    return ""


# --------------------------------------------------
# Build Dependency Graph
# --------------------------------------------------

def build_dependency_graph(

    graph,

):

    """
    Future

    Runtime Dependency Graph
    """

    return ""