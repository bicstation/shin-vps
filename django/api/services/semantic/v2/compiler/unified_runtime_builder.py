# -*- coding: utf-8 -*-

"""
SHIN CORE LINX

Unified Runtime Builder

Reality Runtime
+
Meaning Runtime
=
Unified Semantic Runtime
"""

from api.utils.semantic.runtime.compile_semantic_runtime import (
    compile_semantic_runtime,
)

from api.services.semantic.runtime_builder import (
    build_product_runtime,
)


# ==========================================================
# BUILD UNIFIED RUNTIME
# ==========================================================

def build_unified_runtime(
    product,
):
    """
    Reality Layer
    +
    Meaning Layer
    """

    # ======================================================
    # REALITY
    # ======================================================

    reality_runtime = (
        compile_semantic_runtime(
            product
        )
        or {}
    )

    # ======================================================
    # MEANING
    # ======================================================

    meaning_runtime = (
        build_product_runtime(
            product
        )
        or {}
    )

    # ======================================================
    # UNIFIED
    # ======================================================

    unified_runtime = {

        # --------------------------------------------------
        # Reality Authority
        # --------------------------------------------------

        "runtime_mode":
            reality_runtime.get(
                "runtime_mode"
            ),

        "specs":
            reality_runtime.get(
                "specs",
                {}
            ),

        "normalized_tokens":
            reality_runtime.get(
                "normalized_tokens",
                []
            ),

        "semantic_attributes":
            reality_runtime.get(
                "semantic_attributes",
                []
            ),

        "semantic_groups":
            reality_runtime.get(
                "semantic_groups",
                []
            ),

        "reality_workflow_tags":
            reality_runtime.get(
                "workflow_tags",
                []
            ),

        "reality_labels":
            reality_runtime.get(
                "semantic_labels",
                []
            ),

        "reality_scores":
            reality_runtime.get(
                "scores",
                {}
            ),

        # --------------------------------------------------
        # Meaning Authority
        # --------------------------------------------------

        "product_type":
            meaning_runtime.get(
                "product_type"
            ),

        "base_type":
            meaning_runtime.get(
                "base_type"
            ),

        "cpu_model":
            meaning_runtime.get(
                "cpu_model"
            ),

        "gpu_model":
            meaning_runtime.get(
                "gpu_model"
            ),

        "memory_gb":
            meaning_runtime.get(
                "memory_gb"
            ),

        "storage_gb":
            meaning_runtime.get(
                "storage_gb"
            ),

        "display_type":
            meaning_runtime.get(
                "display_type"
            ),

        "refresh_rate":
            meaning_runtime.get(
                "refresh_rate"
            ),

        "workflows":
            meaning_runtime.get(
                "workflows",
                []
            ),

        "workflow_tags":
            meaning_runtime.get(
                "workflow_tags",
                []
            ),

        "primary_workflow":
            meaning_runtime.get(
                "primary_workflow"
            ),

        "workflow_score":
            meaning_runtime.get(
                "workflow_score",
                0
            ),

        "semantic_score":
            meaning_runtime.get(
                "semantic_score",
                0
            ),

        "semantic_labels":
            meaning_runtime.get(
                "semantic_labels",
                []
            ),

        "adaptive_runtime":
            meaning_runtime.get(
                "adaptive_runtime",
                {}
            ),

        "semantic_graph":
            meaning_runtime.get(
                "semantic_graph",
                []
            ),

        # --------------------------------------------------
        # Metadata
        # --------------------------------------------------

        "semantic_authority":
            "backend",

        "semantic_version":
            "unified_v1",

        "runtime_valid":
            True,
    }

    return unified_runtime