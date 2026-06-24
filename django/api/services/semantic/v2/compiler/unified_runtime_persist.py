# -*- coding: utf-8 -*-

from api.services.semantic.v2.compiler.unified_runtime_builder import (
    build_unified_runtime,
)


# ==========================================================
# APPLY UNIFIED RUNTIME
# ==========================================================

def apply_unified_runtime(
    product,
):
    """
    Unified Runtime

    Reality
    +
    Meaning
    ↓
    Persistence
    """

    runtime = (
        build_unified_runtime(
            product
        )
    )

    # ------------------------------------------------------
    # Runtime
    # ------------------------------------------------------

    product.semantic_runtime = (
        runtime
    )

    # ------------------------------------------------------
    # Identity
    # ------------------------------------------------------

    product.product_type = (
        runtime.get(
            "product_type"
        )
    )

    # ------------------------------------------------------
    # Scores
    # ------------------------------------------------------

    product.semantic_score = (
        runtime.get(
            "semantic_score",
            0,
        )
    )

    # ------------------------------------------------------
    # Labels
    # ------------------------------------------------------

    product.semantic_labels = (
        runtime.get(
            "semantic_labels",
            [],
        )
    )

    # ------------------------------------------------------
    # Runtime State
    # ------------------------------------------------------

    product.semantic_runtime_compiled = (
        True
    )

    return product