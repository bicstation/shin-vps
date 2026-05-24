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

    trace_runtime=False,

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
        product,
        trace_runtime,
    )

    runtime_log(
        trace_runtime,
        "SPECS",
        specs,
    )

    # =====================================================
    # NORMALIZE
    # =====================================================

    normalized_tokens = (
        normalize_runtime(
            specs,
            semantic_master,
            trace_runtime,
        )
    )

    runtime_log(
        trace_runtime,
        "NORMALIZED",
        normalized_tokens,
    )

    # =====================================================
    # ALIAS RESOLVE
    # =====================================================

    semantic_attributes = (
        resolve_alias_runtime(
            normalized_tokens,
            semantic_master,
            trace_runtime,
        )
    )

    runtime_log(
        trace_runtime,
        "ATTRIBUTES",
        semantic_attributes,
    )

    # =====================================================
    # DETECT EXTRA ATTRIBUTES
    # =====================================================

    semantic_attributes += (
        detect_memory_runtime(
            specs,
            trace_runtime,
        )
    )

    semantic_attributes += (
        detect_storage_runtime(
            specs,
            trace_runtime,
        )
    )

    semantic_attributes += (
        detect_features_runtime(
            specs,
            trace_runtime,
        )
    )

    semantic_attributes = list(
        set(semantic_attributes)
    )

    runtime_log(
        trace_runtime,
        "SEMANTIC ATTRIBUTES",
        semantic_attributes,
    )

    # =====================================================
    # GROUP TRAVERSAL
    # =====================================================

    semantic_groups = (
        detect_usage_runtime(
            {
                "semantic_attributes":
                    semantic_attributes
            },
            semantic_master,
            trace_runtime,
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
            trace_runtime,
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

    runtime_log(
        trace_runtime,
        "WORKFLOW",
        workflow_runtime,
    )

    # =====================================================
    # RUNTIME
    # =====================================================

    semantic_runtime = {

        "runtime_mode":
            runtime_mode,

        "specs":
            specs,

        "normalized_tokens":
            normalized_tokens,

        "semantic_attributes":
            semantic_attributes,

        "semantic_groups":
            semantic_groups,

        "workflow_tags":
            workflow_tags,

        "semantic_labels":
            semantic_labels,
    }

    runtime_log(
        trace_runtime,
        "SEMANTIC RUNTIME",
        semantic_runtime,
    )

    return semantic_runtime