# -*- coding: utf-8 -*-
# api/services/semantic/v2/discover/discover_insight_runtime.py

from collections import Counter

from api.services.semantic.v2.traversal.traversal_builder import (
    build_traversal_runtime,
)


# ==========================================================
# DISCOVER INSIGHT
# ==========================================================

def build_discover_insight_runtime():

    traversal = (
        build_traversal_runtime()
    )

    products = (
        traversal.get(
            "products",
            []
        )
    )

    product_type_counter = Counter()

    workflow_counter = Counter()

    semantic_scores = []

    workflow_scores = []

    # ------------------------------------------------------
    # AGGREGATE
    # ------------------------------------------------------

    for product in products:

        product_type = (
            product.get(
                "product_type"
            )
        )

        if product_type:

            product_type_counter.update(
                [product_type]
            )

        primary = (
            product.get(
                "primary_workflow"
            )
        )

        if primary:

            workflow_counter.update(
                [primary]
            )

        semantic_score = (
            product.get(
                "semantic_score",
                0
            )
        )

        workflow_score = (
            product.get(
                "workflow_score",
                0
            )
        )

        if semantic_score:

            semantic_scores.append(
                semantic_score
            )

        if workflow_score:

            workflow_scores.append(
                workflow_score
            )

    # ------------------------------------------------------
    # AVERAGE
    # ------------------------------------------------------

    average_semantic_score = (

        round(

            sum(
                semantic_scores
            )

            /

            len(
                semantic_scores
            ),

            1,

        )

        if semantic_scores

        else 0

    )

    average_workflow_score = (

        round(

            sum(
                workflow_scores
            )

            /

            len(
                workflow_scores
            ),

            1,

        )

        if workflow_scores

        else 0

    )

    # ------------------------------------------------------
    # PAYLOAD
    # ------------------------------------------------------

    return {

        "product_count":
            len(
                products
            ),

        "average_semantic_score":
            average_semantic_score,

        "average_workflow_score":
            average_workflow_score,

        "top_product_types": [

            {

                "product_type":
                    name,

                "count":
                    count,
            }

            for name, count in (

                product_type_counter

                .most_common(10)
            )
        ],

        "top_workflows": [

            {

                "workflow":
                    name,

                "count":
                    count,
            }

            for name, count in (

                workflow_counter

                .most_common(10)
            )
        ],
    }