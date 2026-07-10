# /home/maya/shin-vps/django/visualization/generators/graph/graph_collector.py

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
                "presentation_name",
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

            "id": attribute["slug"],

            "label": attribute.get(
                "name",
                attribute["slug"],
            ),

            "type": "attribute",

        })

        #
        # semantic_attributes.tsv には
        # group_slug が存在しないため、
        # 現在は Attribute Edge を生成しない。
        #
        # Phase 2:
        # Runtime の契約が決まったら追加する。
        #

    
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

            "from": alias["slug"],

            "to": alias["alias"],

            "type": "has_alias",

        })

    
    # ------------------------------------------
    # Workflow
    # ------------------------------------------

    for step in workflow:

        edges.append({

            "from": step["group_slug"],

            "to": step["workflow_slug"],

            "type": "workflow",

        })
    

    # ------------------------------------------
    # Graph Object
    # ------------------------------------------

    return {

        "nodes": nodes,

        "edges": edges,

    }