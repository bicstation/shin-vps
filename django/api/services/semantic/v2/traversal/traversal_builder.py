# -*- coding: utf-8 -*-
# /home/maya/shin-vps/django/api/services/semantic/v2/traversal/traversal_builder.py

"""
SHIN CORE LINX

Traversal Runtime V2

PCProduct
+
Authority Graph

↓

Traversal Runtime

Responsibility

Product
↓
Attribute
↓
Group

Only.

NO SHELF
NO DISCOVERY
NO RULE ENGINE
"""

from api.models import PCProduct

from api.services.semantic.v2.graph.semantic_graph_builder import (
    build_semantic_graph,
)


# ==========================================================
# GRAPH INDEX
# ==========================================================

def build_graph_indexes(graph):

    node_index = {}

    group_to_attributes = {}

    attribute_to_groups = {}

    for node in graph.get(
        "nodes",
        []
    ):

        node_index[
            node["node_id"]
        ] = node

    for edge in graph.get(
        "edges",
        []
    ):

        group_slug = edge["source"]

        attribute_slug = edge["target"]

        group_to_attributes.setdefault(
            group_slug,
            set()
        ).add(
            attribute_slug
        )

        attribute_to_groups.setdefault(
            attribute_slug,
            set()
        ).add(
            group_slug
        )

    return {

        "nodes":
            node_index,

        "group_to_attributes":
            group_to_attributes,

        "attribute_to_groups":
            attribute_to_groups,
    }


# ==========================================================
# PRODUCT ATTRIBUTE EXTRACTION
# ==========================================================

def extract_product_attributes(product):

    attributes = []

    product_attributes = getattr(
        product,
        "attributes",
        None
    )

    if not product_attributes:
        return []

    try:

        for attr in product_attributes.all():

            slug = getattr(
                attr,
                "slug",
                None
            )

            if slug:

                attributes.append(
                    slug
                )

    except Exception:

        pass

    return list(
        set(attributes)
    )


# ==========================================================
# PRODUCT TRAVERSAL
# ==========================================================

def build_product_traversal(

    product,

    graph_indexes
):

    attribute_slugs = (
        extract_product_attributes(
            product
        )
    )

    matched_groups = set()

    semantic_paths = []

    attribute_to_groups = (

        graph_indexes[
            "attribute_to_groups"
        ]
    )

    for attribute_slug in attribute_slugs:

        groups = (

            attribute_to_groups.get(
                attribute_slug,
                set()
            )
        )

        for group_slug in groups:

            matched_groups.add(
                group_slug
            )

            semantic_paths.append({

                "attribute_slug":
                    attribute_slug,

                "group_slug":
                    group_slug,
            })

    return {

        "product_id":
            product.id,

        "unique_id":
            product.unique_id,

        "matched_attributes":
            attribute_slugs,

        "matched_groups":
            sorted(
                list(
                    matched_groups
                )
            ),

        "semantic_paths":
            semantic_paths,
    }


# ==========================================================
# ALL PRODUCTS
# ==========================================================

def build_traversal_runtime():

    graph = (
        build_semantic_graph()
    )

    indexes = (
        build_graph_indexes(
            graph
        )
    )

    products = (

        PCProduct.objects

        .prefetch_related(
            "attributes"
        )
    )

    traversals = []

    for product in products:

        try:

            traversals.append(

                build_product_traversal(

                    product,

                    indexes
                )
            )

        except Exception:

            continue

    return {

        "runtime":
            "traversal_v2",

        "graph_nodes":
            graph.get(
                "node_count",
                0
            ),

        "graph_edges":
            graph.get(
                "edge_count",
                0
            ),

        "products":
            traversals,

        "ready":
            True,
    }


# ==========================================================
# LOOKUP
# ==========================================================

def get_product_traversal(

    unique_id
):

    runtime = (
        build_traversal_runtime()
    )

    for product in runtime.get(
        "products",
        []
    ):

        if (

            product.get(
                "unique_id"
            )

            ==

            unique_id

        ):

            return product

    return None


# ==========================================================
# DEBUG
# ==========================================================

if __name__ == "__main__":

    runtime = (
        build_traversal_runtime()
    )

    print()

    print("=" * 60)
    print("TRAVERSAL V2")
    print("=" * 60)

    print()

    print(
        "Products:",
        len(
            runtime["products"]
        )
    )

    print(
        "Graph Nodes:",
        runtime["graph_nodes"]
    )

    print(
        "Graph Edges:",
        runtime["graph_edges"]
    )