# =========================================================
# FILE:
# api/utils/semantic/coverage/ranking/validate_ranking_coverage.py
# =========================================================

def validate_ranking_coverage(

    semantic_master,

    result,

):

    # =====================================================
    # VALIDATION
    # =====================================================

    for coverage in result.coverage_rows:

        # =============================================
        # DISCOVERY PASS
        # =============================================

        if coverage.discovery == "PASS":

            coverage.ranking = (
                "PASS"
            )

            coverage.notes.append(

                "ranking_reachable"

            )

        # =============================================
        # DISCOVERY FAIL
        # =============================================

        else:

            coverage.ranking = (
                "FAIL"
            )

            coverage.notes.append(

                "ranking_unreachable"

            )