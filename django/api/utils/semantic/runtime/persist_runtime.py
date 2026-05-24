# =========================================================
# FILE:
# api/utils/semantic/runtime/persist_runtime.py
# =========================================================

from django.utils import timezone


# =========================================================
# PERSIST RUNTIME
# =========================================================

def persist_runtime(

    product,

    semantic_runtime,

    trace_runtime=False,

):

    # =====================================================
    # RUNTIME
    # =====================================================

    workflow_tags = semantic_runtime.get(
        "workflow_tags",
        []
    )

    semantic_labels = semantic_runtime.get(
        "semantic_labels",
        []
    )

    semantic_groups = semantic_runtime.get(
        "semantic_groups",
        []
    )

    semantic_attributes = semantic_runtime.get(
        "semantic_attributes",
        []
    )

    # =====================================================
    # FLAGS
    # =====================================================

    product.is_ai = (
        "usage-ai"
        in workflow_tags
    )

    product.is_gaming = (
        "usage-gaming"
        in workflow_tags
    )

    product.is_creator = (
        "usage-creator"
        in workflow_tags
    )

    product.is_business = (
        "usage-business"
        in workflow_tags
    )

    # =====================================================
    # PRIMARY
    # =====================================================

    primary_usage = None

    if workflow_tags:

        primary_usage = (
            workflow_tags[0]
        )

    # =====================================================
    # SEMANTIC PROJECTION
    # =====================================================

    product.primary_usage = (
        primary_usage
    )

    product.workflow_tags = (
        workflow_tags
    )

    product.semantic_labels = (
        semantic_labels
    )

    product.semantic_groups = (
        semantic_groups
    )

    product.semantic_attributes = (
        semantic_attributes
    )

    # =====================================================
    # FULL RUNTIME
    # =====================================================

    product.semantic_runtime = {

        "workflow_tags":
            workflow_tags,

        "semantic_labels":
            semantic_labels,

        "semantic_groups":
            semantic_groups,

        "semantic_attributes":
            semantic_attributes,

        "runtime_mode":
            semantic_runtime.get(
                "runtime_mode",
                "production",
            ),

        "specs":
            semantic_runtime.get(
                "specs",
                {},
            ),
    }

    # =====================================================
    # META
    # =====================================================

    product.semantic_runtime_compiled = True

    product.semantic_schema_version = "v2"

    product.semantic_compiled_at = (
        timezone.now()
    )

    # =====================================================
    # SAVE
    # =====================================================

    product.save(

        update_fields=[

            "is_ai",

            "is_gaming",

            "is_creator",

            "is_business",

            "primary_usage",

            "workflow_tags",

            "semantic_labels",

            "semantic_groups",

            "semantic_attributes",

            "semantic_runtime",

            "semantic_runtime_compiled",

            "semantic_schema_version",

            "semantic_compiled_at",
        ]
    )

    return semantic_runtime