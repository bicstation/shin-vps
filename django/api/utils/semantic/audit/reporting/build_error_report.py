def build_error_report(

    result,

):

    print()

    print(
        "=" * 60
    )

    print(
        "ERROR REPORT"
    )

    print(
        "=" * 60
    )

    print()

    if not result.errors:

        print(
            "NONE"
        )

        return

    for error in result.errors:

        print(
            error
        )

    print()