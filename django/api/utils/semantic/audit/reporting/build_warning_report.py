def build_warning_report(

    result,

):

    print()

    print(
        "=" * 60
    )

    print(
        "WARNING REPORT"
    )

    print(
        "=" * 60
    )

    print()

    if not result.warnings:

        print(
            "NONE"
        )

        return

    for warning in result.warnings:

        print(
            warning
        )

    print()