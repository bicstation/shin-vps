# =========================================================
# FILE:
# api/utils/semantic/coverage/orchestrator/semantic_coverage_guardian.py
# =========================================================

from api.utils.semantic.coverage.models.coverage_result import (
    CoverageResult,
)

from api.utils.semantic.coverage.authority.validate_authority_coverage import (
    validate_authority_coverage,
)

from api.utils.semantic.coverage.discovery.validate_discovery_coverage import (
    validate_discovery_coverage,
)

from api.utils.semantic.coverage.ranking.validate_ranking_coverage import (
    validate_ranking_coverage,
)

from api.utils.semantic.coverage.finder.validate_finder_coverage import (
    validate_finder_coverage,
)

from api.utils.semantic.coverage.related.validate_related_coverage import (
    validate_related_coverage,
)


# =========================================================
# COVERAGE GUARDIAN
# =========================================================

class SemanticCoverageGuardian:

    def __init__(

        self,

        semantic_master,

    ):

        self.semantic_master = (
            semantic_master
        )

    # =====================================================
    # RUN
    # =====================================================

    def run(

        self,

    ):

        result = (
            CoverageResult()
        )

        # =============================================
        # AUTHORITY
        # =============================================

        validate_authority_coverage(

            self.semantic_master,

            result,

        )

        # =============================================
        # DISCOVERY
        # =============================================

        validate_discovery_coverage(

            self.semantic_master,

            result,

        )

        # =============================================
        # RANKING
        # =============================================

        validate_ranking_coverage(

            self.semantic_master,

            result,

        )

        # =============================================
        # FINDER
        # =============================================

        validate_finder_coverage(

            self.semantic_master,

            result,

        )

        # =============================================
        # RELATED
        # =============================================

        validate_related_coverage(

            self.semantic_master,

            result,

        )

        return result