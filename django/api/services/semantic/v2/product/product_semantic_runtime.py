# -*- coding: utf-8 -*-

from api.services.semantic.v2.authority.semantic_registry import (
    build_semantic_registry,
)


# ==========================================================
# HELPERS
# ==========================================================

def _build_attribute_index(registry):

    index = {}

    for row in registry.get(
        "attributes",
        [],
    ):

        slug = (
            row.get("slug")
            or ""
        ).strip()

        if slug:

            index[slug] = row

    return index


def _build_group_index(registry):

    index = {}

    for row in registry.get(
        "group_mappings",
        [],
    ):

        attribute_slug = (
            row.get("attribute_slug")
            or ""
        ).strip()

        group_slug = (
            row.get("group_slug")
            or ""
        ).strip()

        if attribute_slug:

            index.setdefault(
                attribute_slug,
                []
            ).append(
                group_slug
            )

    return index


# ==========================================================
# PRODUCT SEMANTIC RUNTIME
# ==========================================================

def build_product_semantic_runtime(
    product,
):

    registry = (
        build_semantic_registry()
    )

    semantic_runtime = (
        product.semantic_runtime
        or {}
    )

    semantic_attributes = (
        semantic_runtime.get(
            "semantic_attributes",
            []
        )
    )

    semantic_labels = (
        semantic_runtime.get(
            "semantic_labels",
            []
        )
    )

    workflow_tags = (
        semantic_runtime.get(
            "workflow_tags",
            []
        )
    )

    attribute_index = (
        _build_attribute_index(
            registry
        )
    )

    group_index = (
        _build_group_index(
            registry
        )
    )

    # ------------------------------------------------------
    # GROUPED ATTRIBUTES
    # ------------------------------------------------------

    grouped_attributes = {}

    for attribute_slug in semantic_attributes:

        row = (
            attribute_index.get(
                attribute_slug,
                {}
            )
        )

        attribute_info = {

            "slug":
                attribute_slug,

            "title":
                row.get("title")
                or row.get("name")
                or attribute_slug,

            "description":
                row.get(
                    "description"
                ),

            "role":
                row.get(
                    "semantic_role"
                ),

            "weight":
                row.get(
                    "semantic_weight"
                ),
        }

        attribute_type = (
            row.get("type")
            or "other"
        )

        grouped_attributes\
            .setdefault(
                attribute_type,
                []
            )\
            .append(
                attribute_info
            )
    

    # ------------------------------------------------------
    # SEMANTIC SUMMARY
    # ------------------------------------------------------

    if semantic_labels:

        semantic_summary = (

            "・".join(
                semantic_labels
            )

            + "に対応する製品"
        )

    else:

        semantic_summary = (
            "Semantic Runtime Product"
        )

    # ------------------------------------------------------
    # SEMANTIC REASONS
    # ------------------------------------------------------
    
    semantic_reasons = []

    for attribute_slug in semantic_attributes:

        row = (
            attribute_index.get(
                attribute_slug,
                {}
            )
        )

        semantic_reasons.append({

            "slug":
                attribute_slug,

            "title":
                row.get("title")
                or row.get("name")
                or attribute_slug,

            "description":
                row.get(
                    "description"
                ),

            "role":
                row.get(
                    "semantic_role"
                ),

            "weight":
                row.get(
                    "semantic_weight"
                ),
        })

    # ------------------------------------------------------
    # RELATED INTENTS
    # ------------------------------------------------------
    
    related_intents = []

    for workflow in workflow_tags:

        rows = [

            x

            for x in registry.get(
                "attributes",
                []
            )

            if x.get("slug")
            == workflow

        ]

        row = (
            rows[0]
            if rows
            else {}
        )

        related_intents.append({

            "slug":
                workflow,

            "title":
                row.get("title")
                or row.get("name")
                or workflow,

            "description":
                row.get(
                    "description"
                ),
        })

    # ------------------------------------------------------
    # RETURN
    # ------------------------------------------------------

    return {

        "semantic_labels":
            semantic_labels,

        "workflow_tags":
            workflow_tags,

        "grouped_attributes":
            grouped_attributes,

        "semantic_summary":
            semantic_summary,

        "semantic_reasons":
            semantic_reasons,

        "related_intents":
            related_intents,

    }