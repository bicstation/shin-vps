# =========================================================
# FILE:
# coverage/reporting/build_coverage_summary.py
# =========================================================

def build_coverage_summary(

    result,

):

    pass_count = 0

    partial_count = 0

    fail_count = 0

    for coverage in result.coverage_rows:
        
        coverage.finalize()

        statuses = [

            coverage.discovery,
            coverage.ranking,
            coverage.finder,
            coverage.related,

        ]

        passed = (

            statuses.count(
                "PASS"
            )

        )

        # =====================================
        # PASS
        # =====================================

        if passed == len(statuses):

            pass_count += 1

        # =====================================
        # FAIL
        # =====================================

        elif passed == 0:

            fail_count += 1

        # =====================================
        # PARTIAL
        # =====================================

        else:

            partial_count += 1

    result.pass_count = (
        pass_count
    )

    result.partial_count = (
        partial_count
    )

    result.fail_count = (
        fail_count
    )

    print()

    print("=" * 70)

    print(
        "SEMANTIC COVERAGE SUMMARY"
    )

    print("=" * 70)

    print(
        f"Total    : {result.total_attributes}"
    )

    print(
        f"Validated: {result.validated}"
    )

    print(
        f"PASS     : {result.pass_count}"
    )

    print(
        f"PARTIAL  : {result.partial_count}"
    )

    print(
        f"FAIL     : {result.fail_count}"
    )

    print("=" * 70)