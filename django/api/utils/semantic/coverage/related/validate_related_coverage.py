# =========================================================
# FILE:
# api/utils/semantic/coverage/related/validate_related_coverage.py
# =========================================================

def validate_related_coverage(

    semantic_master,

    result,

):

    # =====================================================
    # VALIDATION
    # =====================================================

    for coverage in result.coverage_rows:

        # =============================================
        # FINDER PASS
        # =============================================

        if coverage.finder == "PASS":

            coverage.related = (
                "PASS"
            )

            coverage.notes.append(

                "related_reachable"

            )

        # =============================================
        # FINDER FAIL
        # =============================================

        else:

            coverage.related = (
                "FAIL"
            )

            coverage.notes.append(

                "related_unreachable"

            )