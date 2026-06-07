from api.utils.semantic.audit.reporting.build_metrics_report import (
    build_metrics_report,
)

from api.utils.semantic.audit.reporting.build_error_report import (
    build_error_report,
)

from api.utils.semantic.audit.reporting.build_warning_report import (
    build_warning_report,
)

from api.utils.semantic.audit.reporting.build_health_report import (
    build_health_report,
)


def build_audit_report(

    result,

):

    build_metrics_report(
        result
    )

    build_error_report(
        result
    )

    build_warning_report(
        result
    )

    build_health_report(
        result
    )