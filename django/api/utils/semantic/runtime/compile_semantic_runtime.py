# =========================================================
# FILE:
# api/utils/semantic/runtime/compile_semantic_runtime.py
# =========================================================

from api.utils.semantic.authority.loader import (
    load_semantic_master,
)

from api.utils.semantic.extraction.extract_pc_specs import (
    extract_pc_specs,
)

from api.utils.semantic.authority.normalization import (
    normalize_runtime,
)

from api.utils.semantic.authority.aliases import (
    resolve_alias_runtime,
)

from api.utils.semantic.traversal.detect_usage import (
    detect_usage_runtime,
)

from api.utils.semantic.traversal.detect_memory import (
    detect_memory_runtime,
)

from api.utils.semantic.traversal.detect_storage import (
    detect_storage_runtime,
)

from api.utils.semantic.traversal.detect_features import (
    detect_features_runtime,
)

from api.utils.semantic.traversal.compile_workflows import (
    compile_workflow_runtime,
)

from api.utils.semantic.runtime.runtime_log import (
    runtime_log,
)


# =========================================================
# COMPILE SEMANTIC RUNTIME
# =========================================================

def compile_semantic_runtime(

    product,

    trace_runtime=True,

    runtime_mode="production",

):

    # =====================================================
    # LOAD AUTHORITY
    # =====================================================

    semantic_master = (
        load_semantic_master()
    )

    # =====================================================
    # EXTRACTION
    # =====================================================

    specs = extract_pc_specs(
        product
    )

    runtime_log(
        trace_runtime,
        "SPECS",
        specs,
    )

    # =====================================================
    # NORMALIZATION
    # =====================================================

    normalized_tokens = (
        normalize_runtime(

            specs,

            semantic_master,

        )
    )

    runtime_log(
        trace_runtime,
        "NORMALIZED",
        normalized_tokens,
    )

    # =====================================================
    # ATTRIBUTE RESOLUTION
    # =====================================================

    semantic_attributes = (
        resolve_alias_runtime(

            normalized_tokens,

            semantic_master,

        )
    )

    runtime_log(
        trace_runtime,
        "ATTRIBUTES",
        semantic_attributes,
    )

    # =====================================================
    # DETECT RUNTIME ATTRIBUTES
    # =====================================================

    semantic_attributes += (

        detect_usage_runtime(

            specs,

            semantic_master,

        )
    )

    semantic_attributes += (

        detect_memory_runtime(
            specs
        )
    )

    semantic_attributes += (

        detect_storage_runtime(
            specs
        )
    )

    semantic_attributes += (

        detect_features_runtime(
            specs
        )
    )

    # =====================================================
    # UNIQUE ATTRIBUTES
    # =====================================================

    semantic_attributes = sorted(

        list(
            set(
                semantic_attributes
            )
        )
    )

    runtime_log(
        trace_runtime,
        "SEMANTIC ATTRIBUTES",
        semantic_attributes,
    )

    # =====================================================
    # GROUP MAPPINGS
    # =====================================================

    semantic_groups = []

    group_mappings = semantic_master.get(

        "group_mappings",

        []
    )

    # =====================================================
    # TRAVERSAL
    # =====================================================

    for attribute in semantic_attributes:

        for row in group_mappings:

            attribute_slug = str(

                row.get(
                    "attribute_slug",
                    ""
                )

            ).strip()

            group_slug = str(

                row.get(
                    "group_slug",
                    ""
                )

            ).strip()

            if not attribute_slug:

                continue

            if not group_slug:

                continue

            # =============================================
            # MATCH
            # =============================================

            if attribute_slug == attribute:

                semantic_groups.append(
                    group_slug
                )

    # =====================================================
    # UNIQUE GROUPS
    # =====================================================

    semantic_groups = sorted(

        list(
            set(
                semantic_groups
            )
        )
    )

    runtime_log(
        trace_runtime,
        "SEMANTIC GROUPS",
        semantic_groups,
    )

    # =====================================================
    # WORKFLOW COMPILE
    # =====================================================

    workflow_runtime = (
        compile_workflow_runtime(

            semantic_groups,

            semantic_master,

        )
    )

    workflow_tags = (
        workflow_runtime.get(
            "workflow_tags",
            []
        )
    )

    semantic_labels = (
        workflow_runtime.get(
            "semantic_labels",
            []
        )
    )

    scores = (
        workflow_runtime.get(
            "scores",
            {}
        )
    )

    runtime_log(
        trace_runtime,
        "WORKFLOW",
        workflow_runtime,
    )

    # =====================================================
    # SEMANTIC RUNTIME
    # =====================================================

    semantic_runtime = {

        # =================================================
        # META
        # =================================================

        "runtime_mode":
            runtime_mode,

        # =================================================
        # SOURCE
        # =================================================

        "specs":
            specs,

        # =================================================
        # NORMALIZED
        # =================================================

        "normalized_tokens":
            normalized_tokens,

        # =================================================
        # ATTRIBUTES
        # =================================================

        "semantic_attributes":
            semantic_attributes,

        # =================================================
        # GROUPS
        # =================================================

        "semantic_groups":
            semantic_groups,

        # =================================================
        # WORKFLOW
        # =================================================

        "workflow_tags":
            workflow_tags,

        "semantic_labels":
            semantic_labels,

        "scores":
            scores,
    }

    runtime_log(
        trace_runtime,
        "SEMANTIC RUNTIME",
        semantic_runtime,
    )

    # =====================================================
    # RESULT
    # =====================================================

    return semantic_runtime