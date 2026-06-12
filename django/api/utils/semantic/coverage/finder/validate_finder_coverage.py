# =========================================================
# FILE:
# api/utils/semantic/coverage/finder/validate_finder_coverage.py
# =========================================================

def validate_finder_coverage(

    semantic_master,

    result,

):

    # =====================================================
    # VALIDATION
    # =====================================================

    for coverage in result.coverage_rows:

        # =============================================
        # RANKING PASS
        # =============================================

        if coverage.ranking == "PASS":

            coverage.finder = (
                "PASS"
            )

            coverage.notes.append(

                "finder_reachable"

            )

        # =============================================
        # RANKING FAIL
        # =============================================

        else:

            coverage.finder = (
                "FAIL"
            )

            coverage.notes.append(

                "finder_unreachable"

            )