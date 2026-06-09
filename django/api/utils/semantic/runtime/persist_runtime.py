# =========================================================
# FILE:
# api/utils/semantic/runtime/persist_runtime.py
# =========================================================

from django.utils import timezone
from api.models import (  PCAttribute,)
from api.utils.semantic.runtime.runtime_log import ( runtime_log,)

# =========================================================
# PERSIST RUNTIME
# =========================================================

def persist_runtime(

    product,

    semantic_runtime,

    trace_runtime=False,

):

    # =====================================================
    # SAFETY
    # =====================================================

    if not isinstance(

        semantic_runtime,

        dict,

    ):

        semantic_runtime = {}

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

    normalized_tokens = semantic_runtime.get(

        "normalized_tokens",

        []
    )

    scores = semantic_runtime.get(

        "scores",

        {}
    )

    # =====================================================
    # OBSERVABILITY RUNTIME
    # =====================================================

    semantic_runtime["runtime_status"] = {

        "compiled": True,

        "compiled_at":
            timezone.now().isoformat(),

        "attribute_count":
            len(
                semantic_attributes
            ),

        "group_count":
            len(
                semantic_groups
            ),

        "workflow_count":
            len(
                workflow_tags
            ),
    }

    # =====================================================
    # PROJECTION
    # =====================================================

    product.workflow_tags = (
        workflow_tags
    )

    product.semantic_labels = (
        semantic_labels
    )

    product.semantic_runtime = (
        semantic_runtime
    )

    # =====================================================
    # OPTIONAL SCORE
    # =====================================================

    semantic_score = 0

    if isinstance(scores, dict):

        semantic_score = max(

            scores.values(),

            default=0,
        )

    product.semantic_score = (
        semantic_score
    )

    # =====================================================
    # META
    # =====================================================

    product.semantic_schema_version = (
        "v2"
    )

    product.semantic_runtime_compiled = (
        True
    )

    product.semantic_updated_at = (
        timezone.now()
    )

    # =========================================
    # ATTRIBUTE ATTACH
    # =========================================

    product.attributes.clear()

    attribute_objects = (

        PCAttribute.objects

        .filter(
            slug__in=semantic_attributes
        )

    )

    if attribute_objects.exists():

        product.attributes.add(
            *attribute_objects
        )

    runtime_log(

        False,

        "ATTRIBUTE_ATTACH",

        {

            "product_id":
                product.id,

            "attached":
                attribute_objects.count(),

        },

    )

    # =====================================================
    # SAVE
    # =====================================================

    product.save(

        update_fields=[

            # =============================================
            # WORKFLOW
            # =============================================

            "workflow_tags",

            "semantic_labels",

            # =============================================
            # RUNTIME
            # =============================================

            "semantic_runtime",

            "semantic_score",

            # =============================================
            # META
            # =============================================

            "semantic_schema_version",

            "semantic_runtime_compiled",

            "semantic_updated_at",
        ]
    )

    # =====================================================
    # RESULT
    # =====================================================

    return {

        "workflow_tags":
            workflow_tags,

        "semantic_labels":
            semantic_labels,

        "semantic_groups":
            semantic_groups,

        "semantic_attributes":
            semantic_attributes,

        "normalized_tokens":
            normalized_tokens,

        "scores":
            scores,

        "semantic_score":
            semantic_score,
    }