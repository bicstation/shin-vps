# /home/maya/shin-dev/shin-vps/django/visualization/generators/graph/graph_collector.py

# /home/maya/shin-dev/shin-vps/django/visualization/generators/graph/graph_collector.py

"""
============================================================

SHIN CORE LINX

Visualization Platform

Graph Collector

============================================================

TSV Reality

        ↓

Graph Object

============================================================
"""

# --------------------------------------------------
# Collect Graph
# --------------------------------------------------

def collect_graph(

    universes,
    groups,
    mappings,
    attributes,
    aliases,
    workflow,

):

    nodes = []

    edges = []

    # ------------------------------------------
    # Universe Nodes
    # ------------------------------------------

    for universe in universes:

        nodes.append({

            "id": universe["universe_slug"],

            "label": universe.get(
                "label",
                universe["universe_slug"],
            ),

            "type": "universe",

        })

    # ------------------------------------------
    # Group Nodes
    # ------------------------------------------

    for group in groups:

        nodes.append({

            "id": group["group_slug"],

            "label": group.get(
                "label",
                group["group_slug"],
            ),

            "type": "group",

        })

        edges.append({

            "from": group["parent_group"],

            "to": group["group_slug"],

            "type": "belongs_to",

        })

    # ------------------------------------------
    # Attribute Nodes
    # ------------------------------------------

    for attribute in attributes:

        nodes.append({

            "id": attribute["attribute_slug"],

            "label": attribute.get(
                "label",
                attribute["attribute_slug"],
            ),

            "type": "attribute",

        })

        edges.append({

            "from": attribute["group_slug"],

            "to": attribute["attribute_slug"],

            "type": "has_attribute",

        })

    # ------------------------------------------
    # Alias Nodes
    # ------------------------------------------

    for alias in aliases:

        nodes.append({

            "id": alias["alias"],

            "label": alias["alias"],

            "type": "alias",

        })

        edges.append({

            "from": alias["group_slug"],

            "to": alias["alias"],

            "type": "has_alias",

        })

    # ------------------------------------------
    # Workflow
    # ------------------------------------------

    for step in workflow:

        edges.append({

            "from": step["from_slug"],

            "to": step["to_slug"],

            "type": "workflow",

        })

    # ------------------------------------------
    # Graph Object
    # ------------------------------------------

    return {

        "nodes": nodes,

        "edges": edges,

    }