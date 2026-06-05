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
    # WORKFLOW MAPPINGS
    # =====================================================

    workflow_mappings = (

        semantic_master.get(

            "workflow_mappings",

            []

        )
    )

    # =====================================================
    # RELATIONSHIP AUTHORITY
    # =====================================================

    for mapping in workflow_mappings:

        group_slug = (

            mapping.get(
                "group_slug"
            )
        )

        workflow_slug = (

            mapping.get(
                "workflow_slug"
            )
        )

        try:

            weight = int(

                mapping.get(
                    "weight",
                    0
                )
            )

        except Exception:

            weight = 0

        # =============================================
        # GROUP → WORKFLOW
        # =============================================

        if group_slug not in semantic_groups:

            continue

        if workflow_slug not in scores:

            scores[
                workflow_slug
            ] = 0

        scores[
            workflow_slug
        ] += weight

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

        group.get(
            "group_slug"
        ):

        group.get(
            "group_name"
        )

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