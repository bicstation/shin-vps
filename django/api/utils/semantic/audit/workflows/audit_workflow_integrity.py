# =========================================================
# FILE:
# audit/workflows/audit_workflow_integrity.py
# =========================================================


def audit_workflow_integrity(

    semantic_master,

    result,

):

    workflow_mappings = (
        semantic_master.get(
            "workflow_mappings",
            []
        )
    )

    groups = (
        semantic_master.get(
            "groups",
            []
        )
    )

    group_slugs = set()

    # =====================================================
    # GROUP INDEX
    # =====================================================

    for row in groups:

        slug = str(
            row.get(
                "group_slug",
                ""
            )
        ).strip()

        if slug:

            group_slugs.add(
                slug
            )

    # =====================================================
    # VALIDATE
    # =====================================================

    errors = 0

    missing_groups = set()

    for row in workflow_mappings:

        group_slug = str(
            row.get(
                "group_slug",
                ""
            )
        ).strip()

        if not group_slug:

            continue

        if group_slug not in group_slugs:

            errors += 1

            missing_groups.add(
                group_slug
            )

    # =====================================================
    # ERROR REGISTER
    # =====================================================

    for group_slug in sorted(
        missing_groups
    ):

        result.add_error({

            "type":
                "workflow_missing_group",

            "group":
                group_slug,
        })

    # =====================================================
    # METRICS
    # =====================================================

    result.set_metric(

        "workflow_mapping_count",

        len(
            workflow_mappings
        ),

    )

    result.set_metric(

        "workflow_errors",

        errors,

    )

    result.add_info({

        "audit":
            "workflow_integrity",

        "mappings":
            len(
                workflow_mappings
            ),

        "errors":
            errors,
    })