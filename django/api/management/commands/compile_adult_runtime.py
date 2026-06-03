# -*- coding: utf-8 -*-
# /home/maya/shin-dev/shin-vps/django/api/management/commands/compile_adult_runtime.py

from collections import Counter

from django.core.management.base import (
    BaseCommand,
)

from api.models import AdultProduct

from api.utils.semantic.runtime.compile_adult_runtime import (
    compile_adult_runtime,
)


class Command(BaseCommand):

    help = (
        "Compile Adult Runtime "
        "and generate coverage report"
    )

    def add_arguments(
        self,
        parser,
    ):

        parser.add_argument(
            "--limit",
            type=int,
            default=500,
        )

        parser.add_argument(
            "--trace",
            action="store_true",
        )

    def handle(
        self,
        *args,
        **options,
    ):

        limit = options["limit"]

        trace = options["trace"]

        queryset = (
            AdultProduct.objects
            .filter(
                has_attributes=True
            )
            .order_by("id")[:limit]
        )

        processed = 0

        with_attributes = 0

        with_groups = 0

        attribute_counter = Counter()

        group_counter = Counter()

        sample_payload = None

        self.stdout.write("")

        self.stdout.write(
            "=" * 60
        )

        self.stdout.write(
            "COMPILE ADULT RUNTIME"
        )

        self.stdout.write(
            "=" * 60
        )

        self.stdout.write(
            f"Products : {queryset.count()}"
        )

        for product in queryset:

            processed += 1

            runtime = (
                compile_adult_runtime(
                    product,
                    trace_runtime=False,
                )
            )

            attributes = (
                runtime.get(
                    "attributes",
                    []
                )
            )

            groups = (
                runtime.get(
                    "groups",
                    {}
                )
            )

            if attributes:

                with_attributes += 1

                for slug in attributes:

                    attribute_counter[
                        slug
                    ] += 1

            if groups:

                with_groups += 1

                for group_slug in groups:

                    group_counter[
                        group_slug
                    ] += 1

            if (
                sample_payload
                is None
            ):

                sample_payload = runtime

            if (
                trace
                and
                processed % 100 == 0
            ):

                self.stdout.write(

                    f"[PROGRESS] "
                    f"{processed}"

                )

        self.stdout.write("")

        self.stdout.write(
            "=" * 60
        )

        self.stdout.write(
            "RUNTIME COVERAGE"
        )

        self.stdout.write(
            "=" * 60
        )

        self.stdout.write(
            f"Processed       : "
            f"{processed}"
        )

        self.stdout.write(
            f"With Attributes : "
            f"{with_attributes}"
        )

        self.stdout.write(
            f"With Groups     : "
            f"{with_groups}"
        )

        self.stdout.write(
            f"Unique Attrs    : "
            f"{len(attribute_counter)}"
        )

        self.stdout.write(
            f"Unique Groups   : "
            f"{len(group_counter)}"
        )

        self.stdout.write("")

        self.stdout.write(
            "TOP ATTRIBUTES"
        )

        for (
            slug,
            count,
        ) in attribute_counter.most_common(
            20
        ):

            self.stdout.write(
                f"{slug:<25} "
                f"{count}"
            )

        self.stdout.write("")

        self.stdout.write(
            "TOP GROUPS"
        )

        for (
            slug,
            count,
        ) in group_counter.most_common():

            self.stdout.write(
                f"{slug:<25} "
                f"{count}"
            )

        self.stdout.write("")

        self.stdout.write(
            "=" * 60
        )

        self.stdout.write(
            "SAMPLE PAYLOAD"
        )

        self.stdout.write(
            "=" * 60
        )

        self.stdout.write(
            str(
                sample_payload
            )
        )

        self.stdout.write("")

        self.stdout.write(
            "=" * 60
        )