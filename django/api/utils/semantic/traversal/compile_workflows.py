# =========================================================
# FILE:
# api/utils/semantic/traversal/compile_workflows.py
# =========================================================


# =========================================================
# COMPILE WORKFLOW RUNTIME
# =========================================================

def compile_workflow_runtime(

    semantic_groups,

    semantic_master,

    trace_runtime=False,

):

    # =====================================================
    # SCORES
    # =====================================================

    scores = {

        "usage-ai": 0,

        "usage-gaming": 0,

        "usage-creator": 0,

        "usage-business": 0,

        "usage-mobile": 0,

        "usage-budget": 0,
    }

    # =====================================================
    # WEIGHTING
    # =====================================================

    # =====================================================
    # GPU
    # =====================================================

    if "gpu-highend" in semantic_groups:

        scores["usage-gaming"] += 40

        scores["usage-creator"] += 25

        scores["usage-ai"] += 20

    if "gpu-mainstream" in semantic_groups:

        scores["usage-gaming"] += 20

        scores["usage-business"] += 10

    if "gpu-professional" in semantic_groups:

        scores["usage-creator"] += 40

        scores["usage-business"] += 20

    if "gpu-integrated" in semantic_groups:

        scores["usage-business"] += 20

        scores["usage-mobile"] += 20

    # =====================================================
    # CPU
    # =====================================================

    if "cpu-ai" in semantic_groups:

        scores["usage-ai"] += 50

    if "cpu-highend" in semantic_groups:

        scores["usage-gaming"] += 20

        scores["usage-creator"] += 20

    if "cpu-mainstream" in semantic_groups:

        scores["usage-business"] += 15

    if "cpu-entry" in semantic_groups:

        scores["usage-budget"] += 20

    if "cpu-arm" in semantic_groups:

        scores["usage-mobile"] += 30

    # =====================================================
    # MEMORY
    # =====================================================

    if "memory-highend" in semantic_groups:

        scores["usage-ai"] += 20

        scores["usage-creator"] += 20

        scores["usage-gaming"] += 10

    if "memory-standard" in semantic_groups:

        scores["usage-business"] += 10

    # =====================================================
    # STORAGE
    # =====================================================

    if "storage-fast" in semantic_groups:

        scores["usage-gaming"] += 15

        scores["usage-creator"] += 15

    if "storage-highend" in semantic_groups:

        scores["usage-creator"] += 10

    # =====================================================
    # DISPLAY
    # =====================================================

    if "monitor-gaming" in semantic_groups:

        scores["usage-gaming"] += 30

    if "monitor-oled" in semantic_groups:

        scores["usage-creator"] += 25

    if "monitor-ultrawide" in semantic_groups:

        scores["usage-creator"] += 15

    if "monitor-highrefresh" in semantic_groups:

        scores["usage-gaming"] += 20

    # =====================================================
    # DEVICE
    # =====================================================

    if "device-laptop" in semantic_groups:

        scores["usage-mobile"] += 15

    if "device-mini" in semantic_groups:

        scores["usage-business"] += 10

        scores["usage-mobile"] += 10

    if "device-workstation" in semantic_groups:

        scores["usage-creator"] += 25

        scores["usage-ai"] += 20

    # =====================================================
    # MAKER
    # =====================================================

    if "maker-gaming" in semantic_groups:

        scores["usage-gaming"] += 20

    # =====================================================
    # SORT
    # =====================================================

    sorted_scores = sorted(

        scores.items(),

        key=lambda x: x[1],

        reverse=True,

    )

    # =====================================================
    # WORKFLOW TAGS
    # =====================================================

    workflow_tags = []

    semantic_labels = []

    groups = semantic_master.get(
        "groups",
        []
    )

    group_map = {

        group.get("group_slug"):
            group.get("group_name")

        for group in groups
    }

    # =====================================================
    # THRESHOLD
    # =====================================================

    for workflow_tag, score in sorted_scores:

        if score < 20:

            continue

        workflow_tags.append(
            workflow_tag
        )

        semantic_labels.append(

            group_map.get(
                workflow_tag,
                workflow_tag,
            )
        )

    # =====================================================
    # FALLBACK
    # =====================================================

    if not workflow_tags:

        workflow_tags.append(
            "usage-business"
        )

        semantic_labels.append(
            "ビジネス用途"
        )

    # =====================================================
    # UNIQUE
    # =====================================================

    workflow_tags = sorted(
        list(
            set(
                workflow_tags
            )
        )
    )

    semantic_labels = sorted(
        list(
            set(
                semantic_labels
            )
        )
    )

    # =====================================================
    # RESULT
    # =====================================================

    return {

        "workflow_tags":
            workflow_tags,

        "semantic_labels":
            semantic_labels,

        "scores":
            scores,
    }