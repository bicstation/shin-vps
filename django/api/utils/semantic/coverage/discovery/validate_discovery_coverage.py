# =========================================================
# FILE:
# api/utils/semantic/coverage/discovery/validate_discovery_coverage.py
# =========================================================

def validate_discovery_coverage(

    semantic_master,

    result,

):

    # =====================================================
    # GROUP MAPPINGS
    # =====================================================

    group_mappings = (

        semantic_master.get(

            "group_mappings",

            [],

        )

    )

    # =====================================================
    # LOOKUP
    # =====================================================

    attribute_to_groups = {}

    for row in group_mappings:

        attribute_slug = str(

            row.get(

                "attribute_slug",

                ""

            )

        ).strip()

        group_slug = str(

            row.get(

                "group_slug",

                ""

            )

        ).strip()

        if not attribute_slug:

            continue

        if not group_slug:

            continue

        attribute_to_groups.setdefault(

            attribute_slug,

            []

        ).append(

            group_slug

        )

    # =====================================================
    # COVERAGE
    # =====================================================

    for coverage in result.coverage_rows:

        groups = (

            attribute_to_groups.get(

                coverage.attribute_slug,

                []

            )

        )

        # =============================================
        # PASS
        # =============================================

        if groups:

            coverage.discovery = "PASS"

            coverage.notes.append(

                "group_mapping_exists"

            )

            continue

        # =============================================
        # FAIL
        # =============================================

        coverage.discovery = "FAIL"

        coverage.notes.append(

            "missing_group_mapping"

        )