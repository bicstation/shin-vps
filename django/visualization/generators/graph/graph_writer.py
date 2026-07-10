# /home/maya/shin-dev/shin-vps/django/visualization/generators/graph/graph_writer.py

"""
============================================================

SHIN CORE LINX

Visualization Platform

Graph Writer

============================================================

DOT

        ↓

File

============================================================
"""

# --------------------------------------------------
# Imports
# --------------------------------------------------

from pathlib import Path

# --------------------------------------------------
# Write Graph
# --------------------------------------------------

def write_graph(

    output_file,
    content,

):

    output_file = Path(output_file)

    output_file.parent.mkdir(

        parents=True,
        exist_ok=True,

    )

    output_file.write_text(

        content,

        encoding="utf-8",

    )

# --------------------------------------------------
# Write Relation Map
# --------------------------------------------------

def write_relation_map(

    output_file,
    dot,

):

    write_graph(

        output_file,

        dot,

    )

# --------------------------------------------------
# Write Universe Graph
# --------------------------------------------------

def write_universe_graph(

    output_file,
    dot,

):

    write_graph(

        output_file,

        dot,

    )

# --------------------------------------------------
# Write Workflow Graph
# --------------------------------------------------

def write_workflow_graph(

    output_file,
    dot,

):

    write_graph(

        output_file,

        dot,

    )

# --------------------------------------------------
# Write Dependency Graph
# --------------------------------------------------

def write_dependency_graph(

    output_file,
    dot,

):

    write_graph(

        output_file,

        dot,

    )