# /home/maya/shin-dev/shin-vps/django/visualization/generators/structures/structure_collector.py

"""
============================================================

SHIN CORE LINX

Visualization Platform

Structure Collector

============================================================

TSV Reality

        ↓

Structure Object

============================================================
"""

# --------------------------------------------------
# Collect Structure
# --------------------------------------------------

def collect_structure(

    universes,
    groups,
    mappings,

):

    structures = []

    for universe in universes:

        universe_slug = universe["universe_slug"]

        universe_groups = [

            group

            for group in groups

            if group["parent_group"] == universe_slug

        ]

        structure = {

            "universe": universe,

            "groups": universe_groups,

            "mappings": [

                mapping

                for mapping in mappings

                if mapping.get(
                    "parent_group"
                ) == universe_slug

            ],

        }

        structures.append(

            structure,

        )

    return structures