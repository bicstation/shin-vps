# =========================================================
# FILE:
# coverage/reporting/build_coverage_report.py
# =========================================================

def build_coverage_report(

    result,

):

    print()

    print("=" * 70)
    print("SEMANTIC COVERAGE REPORT")
    print("=" * 70)

    for coverage in result.coverage_rows:

        print()

        print(
            coverage.attribute_slug
        )

        print(
            f"  Discovery : {coverage.discovery}"
        )

        print(
            f"  Ranking   : {coverage.ranking}"
        )

        print(
            f"  Finder    : {coverage.finder}"
        )

        print(
            f"  Related   : {coverage.related}"
        )

        if coverage.notes:

            print(
                f"  Notes     : "
                f"{', '.join(coverage.notes)}"
            )