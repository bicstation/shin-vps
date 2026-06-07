# =========================================================
# FILE:
# audit/attributes/audit_attribute_integrity.py
# =========================================================


def audit_attribute_integrity(

    semantic_master,

    result,

):

    attributes = (
        semantic_master.get(
            "attributes",
            []
        )
    )

    group_mappings = (
        semantic_master.get(
            "group_mappings",
            []
        )
    )

    attribute_slugs = set()

    mapped_attributes = set()

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
    # GROUP MAPPING INDEX
    # =====================================================

    for row in group_mappings:

        attribute_slug = str(
            row.get(
                "attribute_slug",
                ""
            )
        ).strip()

        if attribute_slug:

            mapped_attributes.add(
                attribute_slug
            )

    # =====================================================
    # VALIDATE
    # =====================================================

    missing = []

    for slug in sorted(
        attribute_slugs
    ):

        if slug not in mapped_attributes:

            missing.append(
                slug
            )

            result.add_warning({

                "type":
                    "missing_group_mapping",

                "attribute":
                    slug,
            })

    # =====================================================
    # METRICS
    # =====================================================

    result.set_metric(

        "attribute_count",

        len(
            attribute_slugs
        ),

    )

    result.set_metric(

        "mapped_attributes",

        len(
            mapped_attributes
        ),

    )

    result.set_metric(

        "missing_attributes",

        len(
            missing
        ),

    )