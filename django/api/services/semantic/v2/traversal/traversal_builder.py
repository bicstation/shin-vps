# -*- coding: utf-8 -*-
# api/services/semantic/v2/traversal/traversal_builder.py

import time

from api.models import (
    PCProduct,
)


# ==========================================================
# PRODUCT
# ==========================================================

def build_product_traversal(
    product,
    runtime=None,
):
    runtime = (
        runtime
        or product.semantic_runtime
        or {}
    )

    return {
        "product_id":
            product.id,
        "unique_id":
            product.unique_id,
        "name":
            getattr(
                product,
                "name",
                ""
            ),
        "maker":
            getattr(
                product,
                "maker",
                ""
            ),
        "price":
            getattr(
                product,
                "price",
                None
            ),
        "image_url":
            getattr(
                product,
                "image_url",
                ""
            ),
        "cpu_model":
            getattr(
                product,
                "cpu_model",
                None
            ),
        "gpu_model":
            getattr(
                product,
                "gpu_model",
                None
            ),
        "memory_gb":
            getattr(
                product,
                "memory_gb",
                None
            ),
        "storage_gb":
            getattr(
                product,
                "storage_gb",
                None
            ),
        "display_info":
            getattr(
                product,
                "display_info",
                None
            ),
        "is_ai_pc":
            getattr(
                product,
                "is_ai_pc",
                False
            ),
        "semantic_attributes":
            runtime.get(
                "semantic_attributes",
                []
            ),
        "matched_groups":
            runtime.get(
                "semantic_groups",
                []
            ),
        "reality_scores":
            runtime.get(
                "reality_scores",
                {}
            ),
        "product_type":
            runtime.get(
                "product_type"
            ),
        "primary_workflow":
            runtime.get(
                "primary_workflow"
            ),
        "workflow_score":
            runtime.get(
                "workflow_score",
                0
            ),
        "semantic_score":
            runtime.get(
                "semantic_score",
                0
            ),
        "workflow_tags":
            runtime.get(
                "workflow_tags",
                []
            ),
        "workflows":
            runtime.get(
                "workflows",
                []
            ),
        "semantic_labels":
            runtime.get(
                "semantic_labels",
                []
            ),
        "adaptive_runtime":
            runtime.get(
                "adaptive_runtime",
                {}
            ),
        "semantic_version":
            runtime.get(
                "semantic_version"
            ),
        "semantic_authority":
            runtime.get(
                "semantic_authority"
            ),
        "runtime_valid":
            runtime.get(
                "runtime_valid",
                False
            ),
    }


# ==========================================================
# ALL PRODUCTS
# ==========================================================

def build_traversal_runtime():

    started_at = time.perf_counter()

    print()
    print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    print("🔥 TRAVERSAL RUNTIME START")
    print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")

    # ------------------------------------------------------
    # QUERY
    # ------------------------------------------------------

    query_started_at = time.perf_counter()

    products = (
        PCProduct.objects.filter(
            is_active=True
        )
    )

    query_created_at = time.perf_counter()

    print(
        "⏱️ TRAVERSAL QUERY CREATED:",
        f"{(query_created_at - query_started_at) * 1000:.2f}ms"
    )

    # ------------------------------------------------------
    # EVALUATE QUERYSET
    # ------------------------------------------------------

    evaluation_started_at = time.perf_counter()

    traversals = []

    product_list = list(products)

    evaluation_completed_at = time.perf_counter()

    print(
        "⏱️ TRAVERSAL DB EVALUATION:",
        f"{(evaluation_completed_at - evaluation_started_at) * 1000:.2f}ms",
        "products=",
        len(product_list)
    )

    # ------------------------------------------------------
    # BUILD TRAVERSAL
    # ------------------------------------------------------

    build_started_at = time.perf_counter()

    skipped = 0

    for product in product_list:

        runtime = (
            product.semantic_runtime
            or {}
        )

        if not runtime:
            skipped += 1
            continue

        try:

            traversals.append(
                build_product_traversal(
                    product=product,
                    runtime=runtime,
                )
            )

        except Exception:
            skipped += 1
            continue

    build_completed_at = time.perf_counter()

    print(
        "⏱️ TRAVERSAL PRODUCT BUILD:",
        f"{(build_completed_at - build_started_at) * 1000:.2f}ms",
        "products=",
        len(traversals),
        "skipped=",
        skipped
    )

    # ------------------------------------------------------
    # COMPLETE
    # ------------------------------------------------------

    completed_at = time.perf_counter()

    print(
        "⏱️ TRAVERSAL RUNTIME COMPLETE:",
        f"{(completed_at - started_at) * 1000:.2f}ms"
    )

    print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")

    return {
        "runtime":
            "traversal_v2",
        "product_count":
            len(traversals),
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

    products = (
        build_traversal_runtime()
        .get(
            "products",
            []
        )
    )

    return next(
        (
            product
            for product in products
            if product.get(
                "unique_id"
            ) == unique_id
        ),
        None,
    )