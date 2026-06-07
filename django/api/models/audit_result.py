# =========================================================
# FILE:
# audit/models/audit_result.py
# =========================================================


class AuditResult:

    def __init__(self):

        self.errors = []

        self.warnings = []

        self.infos = []

        self.metrics = {}

    # =====================================================
    # ERROR
    # =====================================================

    def add_error(self, payload):

        self.errors.append(
            payload
        )

    # =====================================================
    # WARNING
    # =====================================================

    def add_warning(self, payload):

        self.warnings.append(
            payload
        )

    # =====================================================
    # INFO
    # =====================================================

    def add_info(self, payload):

        self.infos.append(
            payload
        )

    # =====================================================
    # METRIC
    # =====================================================

    def set_metric(

        self,

        key,

        value,

    ):

        self.metrics[key] = value