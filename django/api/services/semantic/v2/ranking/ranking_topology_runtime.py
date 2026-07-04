# -*- coding: utf-8 -*-
# /home/maya/shin-vps/django/api/services/semantic/v2/ranking/ranking_topology_runtime.py

"""
SHIN CORE LINX

Ranking Topology Runtime

Responsibility

Topology Runtime
↓

Ranking Category Projection

No Semantic Authority
No Traversal
No Product Ranking
"""

from collections import defaultdict

from api.services.semantic.v2.topology.topology_runtime import (
    build_topology_runtime,
)

from api.services.semantic.v2.traversal.traversal_builder import (
    build_traversal_runtime,
)

from api.services.semantic.v2.authority.authority_runtime import (
    build_authority_runtime,
)

# ==========================================================
# PRESENTATION LABELS
# ==========================================================

authority = (
    build_authority_runtime()
)

universe_index = {

    row["universe_slug"]: row

    for row in authority.get(
        "universes",
        []
    )
}

# ==========================================================
# RANKING TOPOLOGY
# ==========================================================

def build_ranking_topology_runtime():
    
    topology = (
        build_topology_runtime(
            parent_groups=[
                "usage",
                "device",
                "cpu",
                "gpu",
                "memory",
                "storage",
                "monitor",
                "maker",
            ]
        )
    )
    
    parent_index = defaultdict(list)
    
       
    
    traversal = (
        build_traversal_runtime()
    )

    # ------------------------------------------------------
    # Product Count Index
    # ------------------------------------------------------

    group_counts = defaultdict(int)

    for product in traversal.get(
        "products",
        [],
    ):

        for group_slug in product.get(
            "matched_groups",
            [],
        ):

            group_counts[
                group_slug
            ] += 1
    

    # ------------------------------------------------------
    # Grouping
    # ------------------------------------------------------

    for group in topology.get(
        "groups",
        [],
    ):

        parent_group = group.get(
            "parent_group"
        )

        if not parent_group:
            continue

        parent_index[
            parent_group
        ].append(group)

    # ------------------------------------------------------
    # Categories
    # ------------------------------------------------------

    categories = []

    for parent_group, groups in parent_index.items():

        groups = sorted(

            groups,

            key=lambda row:

                int(
                    row.get(
                        "sort_order",
                        999,
                    )
                ),
        )
        
        parent_product_count = sum(

            group_counts.get(
                group.get(
                    "group_slug"
                ),
                0,
            )

            for group in groups
        )
        

        categories.append({

            "parent_group":
                parent_group,
            
            "presentation_name":

            universe_index.get(

                parent_group,

                {}

            ).get(

                "universe_title",

                parent_group,
            ),


            "group_count":
                len(groups),
            
            "product_count":
                parent_product_count,

            "groups": [

                {

                    "group_slug":
                        group.get(
                            "group_slug"
                        ),

                    "group_name":
                        group.get(
                            "group_name"
                        ),

                    "presentation_name":
                        group.get(
                            "presentation_name"
                        ),

                    "presentation_description":
                        group.get(
                            "presentation_description"
                        ),

                    "icon":
                        group.get(
                            "icon"
                        ),

                    "color":
                        group.get(
                            "color"
                        ),

                    "sort_order":
                        group.get(
                            "sort_order"
                        ),
                    
                    "product_count":
                        group_counts.get(
                            group.get(
                                "group_slug"
                            ),
                            0,
                        ),

                }

                for group in groups
            ],
        })

    # ------------------------------------------------------
    # Sort Categories
    # ------------------------------------------------------

    categories = sorted(

        categories,

        key=lambda row:

            row.get(
                "presentation_name",
                ""
            ),
    )

    # ------------------------------------------------------
    # Runtime
    # ------------------------------------------------------

    return {

        "categories":
            categories,

        "semantic_schema_version":

            topology.get(
                "semantic_schema_version"
            ),

        "authority_version":

            topology.get(
                "authority_version"
            ),

        "semantic_authority":

            topology.get(
                "semantic_authority"
            ),

        "ready":
            True,
    }


# ==========================================================
# DEBUG
# ==========================================================

if __name__ == "__main__":

    runtime = (
        build_ranking_topology_runtime()
    )

    from pprint import pprint

    pprint(runtime)