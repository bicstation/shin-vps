# =========================================================
# FILE:
# api/utils/semantic/coverage/models/coverage_result.py
# =========================================================

class CoverageResult:

    def __init__(

        self,

    ):

        # =============================================
        # COUNTERS
        # =============================================

        self.total_attributes = 0

        self.validated = 0

        self.pass_count = 0

        self.partial_count = 0

        self.fail_count = 0

        # =============================================
        # DETAILS
        # =============================================

        self.coverage_rows = []

        # =============================================
        # CRITICAL DEFECTS
        # =============================================

        self.missing_attributes = []

        self.workflow_missing_groups = []

        self.missing_negative_alias_targets = []

    # =====================================================
    # ADD ROW
    # =====================================================

    def add(

        self,

        coverage,

    ):

        self.coverage_rows.append(
            coverage
        )

        self.validated += 1

        status = (
            coverage.overall_status
        )

        if status == "PASS":

            self.pass_count += 1

        elif status == "PARTIAL":

            self.partial_count += 1

        else:

            self.fail_count += 1

    # =====================================================
    # SUMMARY
    # =====================================================

    def summary(

        self,

    ):

        return {

            "total_attributes":
                self.total_attributes,

            "validated":
                self.validated,

            "pass":
                self.pass_count,

            "partial":
                self.partial_count,

            "fail":
                self.fail_count,

            "missing_attributes":
                len(
                    self.missing_attributes
                ),

            "workflow_missing_groups":
                len(
                    self.workflow_missing_groups
                ),

            "missing_negative_alias_targets":
                len(
                    self.missing_negative_alias_targets
                ),

        }