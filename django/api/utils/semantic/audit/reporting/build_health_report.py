# =========================================================
# FILE:
# audit/reporting/build_health_report.py
# =========================================================


def build_health_report(

    result,

):

    print()

    print(
        "=" * 60
    )

    print(
        "HEALTH REPORT"
    )

    print(
        "=" * 60
    )

    print()

    error_count = len(
        result.errors
    )

    warning_count = len(
        result.warnings
    )

    print(
        f"ERRORS   : {error_count}"
    )

    print(
        f"WARNINGS : {warning_count}"
    )

    print()

    if error_count > 0:

        status = (
            "FAILED"
        )

    elif warning_count > 0:

        status = (
            "WARNING"
        )

    else:

        status = (
            "PASS"
        )

    print(
        f"STATUS   : {status}"
    )

    print()