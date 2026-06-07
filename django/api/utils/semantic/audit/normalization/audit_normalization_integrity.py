def audit_normalization_integrity(

    semantic_master,

    result,

):

    rules = (
        semantic_master.get(
            "normalization_rules",
            []
        )
    )

    attributes = (
        semantic_master.get(
            "attributes",
            []
        )
    )

    attribute_slugs = set()

    for row in attributes:

        slug = str(
            row.get(
                "slug",
                ""
            )
        ).strip()

        if slug:

            attribute_slugs.add(
                slug
            )

    errors = 0

    missing_targets = set()

    # ==========================================
    # TARGET EXISTS
    # ==========================================

    for row in rules:

        target = str(
            row.get(
                "target",
                ""
            )
        ).strip()

        if not target:

            continue

        if target not in attribute_slugs:

            errors += 1

            missing_targets.add(
                target
            )

    # ==========================================
    # ERROR REGISTER
    # ==========================================

    for target in sorted(
        missing_targets
    ):

        result.add_error({

            "type":
                "missing_normalization_target",

            "target":
                target,

        })

    # ==========================================
    # METRICS
    # ==========================================

    result.set_metric(

        "normalization_count",

        len(
            rules
        ),

    )

    result.set_metric(

        "normalization_errors",

        errors,

    )

    result.add_info({

        "audit":
            "normalization_integrity",

        "rules":
            len(
                rules
            ),

        "errors":
            errors,

    })