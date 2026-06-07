# =========================================================
# FILE:
# audit/groups/audit_group_integrity.py
# =========================================================


def audit_group_integrity(

    semantic_master,

    result,

):

    groups = (
        semantic_master.get(
            "groups",
            []
        )
    )

    group_mappings = (
        semantic_master.get(
            "group_mappings",
            []
        )
    )

    group_slugs = set()

    # =====================================================
    # GROUP INDEX
    # =====================================================

    for row in groups:

        group_slug = str(
            row.get(
                "group_slug",
                ""
            )
        ).strip()

        if group_slug:

            group_slugs.add(
                group_slug
            )

    # =====================================================
    # VALIDATE
    # =====================================================

    errors = 0

    missing_groups = set()

    for row in group_mappings:

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
                "missing_group",

            "group":
                group_slug,
        })

    # =====================================================
    # METRICS
    # =====================================================

    result.set_metric(

        "group_count",

        len(
            group_slugs
        ),

    )

    result.set_metric(

        "group_errors",

        errors,

    )

    result.add_info({

        "audit":
            "group_integrity",

        "groups":
            len(
                group_slugs
            ),

        "errors":
            errors,
    })