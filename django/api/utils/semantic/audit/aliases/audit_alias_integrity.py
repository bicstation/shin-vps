# =========================================================
# FILE:
# audit/aliases/audit_alias_integrity.py
# =========================================================


def audit_alias_integrity(

    semantic_master,

    result,

):

    aliases = (
        semantic_master.get(
            "aliases",
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

    # =====================================================
    # ATTRIBUTE INDEX
    # =====================================================

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

    # =====================================================
    # VALIDATE
    # =====================================================

    errors = 0

    missing_attributes = set()

    for row in aliases:

        attribute_slug = str(
            row.get(
                "slug",
                ""
            )
        ).strip()

        if not attribute_slug:

            continue

        if attribute_slug not in attribute_slugs:

            errors += 1

            missing_attributes.add(
                attribute_slug
            )

    # =====================================================
    # ERROR REGISTER
    # =====================================================

    for slug in sorted(
        missing_attributes
    ):

        result.add_error({

            "type":
                "missing_attribute",

            "attribute":
                slug,
        })

    # =====================================================
    # DEBUG
    # =====================================================

    # for error in result.errors:

        # print(
        #     error
        # )

    # =====================================================
    # METRICS
    # =====================================================

    result.set_metric(

        "alias_count",

        len(
            aliases
        ),

    )

    result.set_metric(

        "alias_errors",

        errors,

    )

    result.add_info({

        "audit":
            "alias_integrity",

        "aliases":
            len(
                aliases
            ),

        "errors":
            errors,
    })