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

    workflow_tags = []

    semantic_labels = []

    # =====================================================
    # GROUPS
    # =====================================================

    groups = semantic_master.get(
        "groups",
        []
    )

    # =====================================================
    # WORKFLOW GROUPS
    # =====================================================

    for group in groups:

        group_slug = str(
            group.get(
                "group_slug",
                ""
            )
        ).strip()

        group_name = str(
            group.get(
                "group_name",
                ""
            )
        ).strip()

        parent_group = str(
            group.get(
                "parent_group",
                ""
            )
        ).strip()

        if (

            group_slug

            not in

            semantic_groups

        ):

            continue

        # =================================================
        # WORKFLOW
        # =================================================

        if parent_group == "usage":

            workflow_tags.append(
                group_slug
            )

            semantic_labels.append(
                group_name
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

    workflow_tags = list(
        set(workflow_tags)
    )

    semantic_labels = list(
        set(semantic_labels)
    )

    # =====================================================
    # RESULT
    # =====================================================

    return {

        "workflow_tags":
            workflow_tags,

        "semantic_labels":
            semantic_labels,
    }