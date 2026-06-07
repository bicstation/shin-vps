def audit_negative_alias_integrity(

    semantic_master,

    result,

):

    negative_aliases = (
        semantic_master.get(
            "negative_aliases",
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

    # =====================================================
    # TARGET EXISTS
    # =====================================================

    for row in negative_aliases:

        target = str(
            row.get(
                "slug",
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

    # =====================================================
    # ERROR REGISTER
    # =====================================================

    for target in sorted(
        missing_targets
    ):

        result.add_error({

            "type":
                "missing_negative_alias_target",

            "target":
                target,

        })

    # =====================================================
    # METRICS
    # =====================================================

    result.set_metric(

        "negative_alias_count",

        len(
            negative_aliases
        ),

    )

    result.set_metric(

        "negative_alias_errors",

        errors,

    )

    result.add_info({

        "audit":
            "negative_alias_integrity",

        "aliases":
            len(
                negative_aliases
            ),

        "errors":
            errors,

    })