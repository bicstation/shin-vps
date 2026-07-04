# -*- coding: utf-8 -*-
# api/services/semantic/v2/topology/topology_runtime.py

from collections import defaultdict

from api.services.semantic.v2.authority.authority_runtime import (
    build_authority_runtime,
)

from api.services.semantic.v2.authority.tsv_loader import (
    load_semantic_groups,
    load_semantic_attributes,
    load_semantic_group_mappings,
)


# ==========================================================
# TOPOLOGY
# ==========================================================

def build_topology_runtime(
    parent_groups=None,
    ):

    authority = (
        build_authority_runtime()
    )

    # ------------------------------------------------------
    # Metadata Index
    # ------------------------------------------------------

    metadata_index = {

        row["slug"]: row

        for row in authority.get(
            "slug_metadata",
            []
        )
    }

    # ------------------------------------------------------
    # Raw Authority
    # ------------------------------------------------------

    groups = (
        load_semantic_groups()
    )


    # ------------------------------------------------------
    # Parent Group Filter
    # ------------------------------------------------------

    if parent_groups:

        groups = [

            group

            for group in groups

            if group.get(
                "parent_group"
            ) in parent_groups

        ]


    attributes = (
        load_semantic_attributes()
    )

    mappings = (
        load_semantic_group_mappings()
    )

    # ------------------------------------------------------
    # Attribute Index
    # ------------------------------------------------------

    attribute_index = {

        row["slug"]: row

        for row in attributes
    }

    # ------------------------------------------------------
    # Mapping Index
    # ------------------------------------------------------

    mapping_index = defaultdict(list)

    for row in mappings:

        mapping_index[
            row["group_slug"]
        ].append(

            row["attribute_slug"]
        )

    # ------------------------------------------------------
    # Runtime
    # ------------------------------------------------------

    topology = []

    for group in groups:

        if str(

            group.get(
                "is_active",
                "1",
            )

        ).lower() not in (

            "1",
            "true",
        ):
            continue

        group_slug = (
            group.get(
                "group_slug"
            )
        )

        children = []

        for attribute_slug in mapping_index.get(
            group_slug,
            [],
        ):

            attribute = (
                attribute_index.get(
                    attribute_slug
                )
            )

            if attribute is None:
                continue

            children.append({

                # ----------------------------------
                # Presentation Authority
                # ----------------------------------

                **metadata_index.get(
                    attribute_slug,
                    {},
                ),

                # ----------------------------------
                # Semantic Authority
                # ----------------------------------

                "type":
                    attribute.get(
                        "type"
                    ),

                "icon":
                    attribute.get(
                        "icon"
                    ),

                "color":
                    attribute.get(
                        "color"
                    ),

                "semantic_role":
                    attribute.get(
                        "semantic_role"
                    ),

                "semantic_weight":
                    attribute.get(
                        "semantic_weight"
                    ),

                "is_ranking_enabled":
                    attribute.get(
                        "is_ranking_enabled"
                    ),
            })

        topology.append({

            # ----------------------------------
            # Existing Presentation Metadata
            # ----------------------------------

            **metadata_index.get(
                group_slug,
                {},
            ),

            # ----------------------------------
            # Canonical Semantic Identity
            # ----------------------------------

            "group_slug":
                group_slug,

            "group_name":
                group.get(
                    "group_name"
                ),

            # ----------------------------------
            # Semantic Group Presentation Layer
            # ----------------------------------

            "presentation_name":
                group.get(
                    "presentation_name"
                ),

            "presentation_description":
                group.get(
                    "presentation_description"
                ),

            # ----------------------------------
            # Semantic Authority
            # ----------------------------------

            "parent_group":
                group.get(
                    "parent_group"
                ),

            "type":
                group.get(
                    "type"
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

            # ----------------------------------
            # Relations
            # ----------------------------------

            "attributes":
                children,
        })
 
    topology = sorted(

        topology,

        key=lambda row:

            int(

                row.get(
                    "sort_order",
                    999,
                )

            ),
    )
    
    
    # ------------------------------------------------------
    # Parent Group Index
    # ------------------------------------------------------

    parent_index = defaultdict(list)

    for group in topology:

        parent_index[
            group.get("parent_group")
        ].append(group)


    # ------------------------------------------------------
    # Sibling Groups
    # ------------------------------------------------------

    for group in topology:

        siblings = []

        for sibling in parent_index.get(
            group.get("parent_group"),
            []
        ):

            siblings.append({

                "group_slug":
                    sibling.get("group_slug"),

                "group_name":
                    sibling.get("group_name"),

                "presentation_name":
                    sibling.get("presentation_name"),

                "presentation_description":
                    sibling.get("presentation_description"),

                "icon":
                    sibling.get("icon"),

                "color":
                    sibling.get("color"),

                "sort_order":
                    sibling.get("sort_order"),

                "is_current":
                    sibling.get("group_slug")
                    ==
                    group.get("group_slug"),
            })

        group["sibling_groups"] = siblings
    

    return {

        "groups":
            topology,

        "semantic_schema_version":

            authority.get(
                "semantic_schema_version"
            ),

        "authority_version":

            authority.get(
                "authority_version"
            ),

        "semantic_authority":

            authority.get(
                "semantic_authority"
            ),

        "ready":
            True,
    }