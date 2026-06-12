# =========================================================
# FILE:
# api/management/commands/audit_semantic_coverage.py
# =========================================================

from django.core.management.base import (
    BaseCommand,
)

from api.utils.semantic.authority.loader import (
    load_semantic_master,
)

from api.utils.semantic.coverage.orchestrator.semantic_coverage_guardian import (
    SemanticCoverageGuardian,
)

from api.utils.semantic.coverage.reporting.build_coverage_report import (
    build_coverage_report,
)

from api.utils.semantic.coverage.reporting.build_coverage_summary import (
    build_coverage_summary,
)


# =========================================================
# COMMAND
# =========================================================

class Command(BaseCommand):

    help = (
        "Semantic Universe Coverage Validation"
    )

    # =====================================================
    # HANDLE
    # =====================================================

    def handle(

        self,

        *args,

        **options,

    ):

        # =============================================
        # AUTHORITY LOAD
        # =============================================

        semantic_master = (
            load_semantic_master()
        )

        # =============================================
        # GUARDIAN
        # =============================================

        guardian = (
            SemanticCoverageGuardian(
                semantic_master
            )
        )

        # =============================================
        # RUN
        # =============================================

        result = (
            guardian.run()
        )

        # =============================================
        # REPORT
        # =============================================

        build_coverage_report(
            result
        )

        build_coverage_summary(
            result
        )