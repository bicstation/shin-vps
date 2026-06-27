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

def build_topology_runtime():

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
            # Presentation Authority
            # ----------------------------------

            **metadata_index.get(
                group_slug,
                {},
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