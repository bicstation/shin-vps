#!/usr/bin/env python3

# /home/maya/shin-dev/shin-vps/django/visualization/generators/graph/generate_graph.py

"""
============================================================

SHIN CORE LINX

Visualization Platform

Graph Generator

============================================================

TSV Reality
        ↓
Loader
        ↓
Collector
        ↓
Builder
        ↓
Writer
        ↓
Artifact

============================================================

Reality is NOT modified.

Generator orchestrates the Graph Layer.

============================================================
"""

# --------------------------------------------------
# Version
# --------------------------------------------------

VERSION = "1.0"

# --------------------------------------------------
# Imports
# --------------------------------------------------

from pathlib import Path

import os
import sys

ROOT = Path(__file__).resolve().parents[3]

if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

os.environ.setdefault(
    "DJANGO_SETTINGS_MODULE",
    "tiper_api.settings",
)

import django

django.setup()

# --------------------------------------------------
# Loader
# --------------------------------------------------

from visualization.generators.graph.graph_loader import (

    load_universes,
    load_groups,
    load_group_mappings,
    load_attributes,
    load_aliases,
    load_workflow,

)

# --------------------------------------------------
# Collector
# --------------------------------------------------

from visualization.generators.graph.graph_collector import (

    collect_graph,

)

# --------------------------------------------------
# Builder
# --------------------------------------------------

from visualization.generators.graph.graph_builder import (

    build_relation_map,
    build_universe_graph,
    build_workflow_graph,
    build_dependency_graph,

)

# --------------------------------------------------
# Writer
# --------------------------------------------------

from visualization.generators.graph.graph_writer import (

    write_relation_map,
    write_universe_graph,
    write_workflow_graph,
    write_dependency_graph,

)

# --------------------------------------------------
# Output Directory
# --------------------------------------------------

OUTPUT = (
    ROOT
    / "visualization"
    / "relation_map"
)

# --------------------------------------------------
# Generate Relation Map
# --------------------------------------------------

def generate_relation(

    graph,

):

    dot = build_relation_map(

        graph,

    )

    write_relation_map(

        OUTPUT / "semantic_relation_map.dot",

        dot,

    )

# --------------------------------------------------
# Generate Universe Graph
# --------------------------------------------------

def generate_universe(

    graph,

):

    #
    # Phase 2
    #

    # dot = build_universe_graph(
    #     graph,
    # )

    # write_universe_graph(
    #     OUTPUT / "universe_group.dot",
    #     dot,
    # )

    return

# --------------------------------------------------
# Generate Workflow Graph
# --------------------------------------------------

def generate_workflow(

    graph,

):

    #
    # Future
    #

    # dot = build_workflow_graph(
    #     graph,
    # )

    # write_workflow_graph(
    #     OUTPUT / "workflow.dot",
    #     dot,
    # )

    return

# --------------------------------------------------
# Generate Dependency Graph
# --------------------------------------------------

def generate_dependency(

    graph,

):

    #
    # Future
    #

    # dot = build_dependency_graph(
    #     graph,
    # )

    # write_dependency_graph(
    #     OUTPUT / "dependency.dot",
    #     dot,
    # )

    return

# --------------------------------------------------
# Main
# --------------------------------------------------

def main():

    #
    # Load
    #

    universes = load_universes()

    groups = load_groups()

    mappings = load_group_mappings()

    attributes = load_attributes()

    aliases = load_aliases()

    workflow = load_workflow()

    #
    # Collect
    #

    graph = collect_graph(

        universes,
        groups,
        mappings,
        attributes,
        aliases,
        workflow,

    )

    #
    # Build Artifacts
    #

    generate_relation(

        graph,

    )

    generate_universe(

        graph,

    )

    generate_workflow(

        graph,

    )

    generate_dependency(

        graph,

    )

    #
    # Console
    #

    print()
    print("========================================")
    print(" SHIN CORE LINX")
    print(" Graph Generator")
    print("========================================")
    print()
    print("Version :", VERSION)
    print("Nodes   :", len(graph["nodes"]))
    print("Edges   :", len(graph["edges"]))
    print()
    print("Graph Generation Completed.")
    print()

# --------------------------------------------------
# Entry Point
# --------------------------------------------------

if __name__ == "__main__":

    main()