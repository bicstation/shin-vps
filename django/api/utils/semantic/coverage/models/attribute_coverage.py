# =========================================================
# FILE:
# api/utils/semantic/coverage/models/attribute_coverage.py
# =========================================================

class AttributeCoverage:

    def __init__(

        self,

        attribute_slug,

    ):

        # =============================================
        # IDENTITY
        # =============================================

        self.attribute_slug = (
            attribute_slug
        )

        # =============================================
        # COVERAGE
        # =============================================

        self.discovery = (
            "UNKNOWN"
        )

        self.ranking = (
            "UNKNOWN"
        )

        self.finder = (
            "UNKNOWN"
        )

        self.related = (
            "UNKNOWN"
        )

        self.api = (
            "UNKNOWN"
        )

        # =============================================
        # FINAL STATUS
        # =============================================

        self.overall_status = (
            "UNKNOWN"
        )

        # =============================================
        # NOTES
        # =============================================

        self.notes = []

    # =====================================================
    # COMPUTE STATUS
    # =====================================================

    def finalize(

        self,

    ):

        statuses = [

            self.discovery,

            self.ranking,

            self.finder,

            self.related,

            self.api,

        ]

        # =============================================
        # PASS
        # =============================================

        if all(

            status == "PASS"

            for status in statuses

        ):

            self.overall_status = (
                "PASS"
            )

            return

        # =============================================
        # PARTIAL
        # =============================================

        if any(

            status == "PASS"

            for status in statuses

        ):

            self.overall_status = (
                "PARTIAL"
            )

            return

        # =============================================
        # FAIL
        # =============================================

        self.overall_status = (
            "FAIL"
        )

    # =====================================================
    # SERIALIZE
    # =====================================================

    def to_dict(

        self,

    ):

        self.finalize()

        return {

            "attribute_slug":
                self.attribute_slug,

            "discovery":
                self.discovery,

            "ranking":
                self.ranking,

            "finder":
                self.finder,

            "related":
                self.related,

            "api":
                self.api,

            "overall_status":
                self.overall_status,

            "notes":
                self.notes,

        }