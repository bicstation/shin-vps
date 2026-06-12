# =========================================================
# FILE:
# api/utils/semantic/coverage/authority/validate_authority_coverage.py
# =========================================================

from api.utils.semantic.coverage.models.attribute_coverage import (
    AttributeCoverage,
)


# =========================================================
# AUTHORITY COVERAGE
# =========================================================

def validate_authority_coverage(

    semantic_master,

    result,

):

    # =====================================================
    # ATTRIBUTES
    # =====================================================

    attributes = (

        semantic_master.get(

            "attributes",

            [],

        )

    )

    # =====================================================
    # COUNT
    # =====================================================

    result.total_attributes = (
        len(attributes)
    )

    # =====================================================
    # LOOP
    # =====================================================

    for attribute in attributes:

        slug = str(

            attribute.get(

                "slug",

                ""

            )

        ).strip()

        if not slug:

            continue

        # =============================================
        # COVERAGE OBJECT
        # =============================================

        coverage = (

            AttributeCoverage(

                slug

            )

        )

        # =============================================
        # AUTHORITY PASS
        # =============================================

        coverage.notes.append(
            "authority_exists"
        )

        result.add(
            coverage
        )