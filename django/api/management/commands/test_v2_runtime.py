# -*- coding: utf-8 -*-

from pprint import pprint

from django.core.management.base import (
    BaseCommand,
)

from api.models import (
    PCProduct,
)

from api.services.semantic.runtime_builder import (
    build_product_runtime,
)


class Command(BaseCommand):

    help = (
        "Test V2 Runtime Builder"
    )

    def add_arguments(
        self,
        parser,
    ):

        parser.add_argument(

            "--unique-id",

            type=str,

            required=True,
        )

        parser.add_argument(

            "--save",

            action="store_true",
        )

    def handle(
        self,
        *args,
        **options,
    ):

        unique_id = options[
            "unique_id"
        ]

        save = options[
            "save"
        ]

        product = (

            PCProduct.objects

            .filter(
                unique_id=unique_id
            )

            .first()
        )

        if not product:

            self.stdout.write(

                self.style.ERROR(

                    f"Product not found: {unique_id}"
                )
            )

            return

        self.stdout.write("")
        self.stdout.write("=" * 80)
        self.stdout.write("PRODUCT")
        self.stdout.write("=" * 80)

        self.stdout.write(
            product.name
        )

        self.stdout.write("")
        self.stdout.write("=" * 80)
        self.stdout.write("BUILD V2 RUNTIME")
        self.stdout.write("=" * 80)

        runtime = (
            build_product_runtime(
                product
            )
        )

        pprint(runtime)

        self.stdout.write("")
        self.stdout.write("=" * 80)
        self.stdout.write("SUMMARY")
        self.stdout.write("=" * 80)

        self.stdout.write(

            f"product_type: "
            f"{runtime.get('product_type')}"
        )

        self.stdout.write(

            f"semantic_score: "
            f"{runtime.get('semantic_score')}"
        )

        self.stdout.write(

            f"workflow_tags: "
            f"{runtime.get('workflow_tags')}"
        )

        self.stdout.write(

            f"semantic_labels: "
            f"{runtime.get('semantic_labels')}"
        )

        # =====================================
        # OPTIONAL SAVE
        # =====================================

        if save:

            product.semantic_runtime = (
                runtime
            )

            product.semantic_score = (
                runtime.get(
                    "semantic_score",
                    0,
                )
            )

            product.semantic_labels = (
                runtime.get(
                    "semantic_labels",
                    [],
                )
            )

            product.product_type = (
                runtime.get(
                    "product_type"
                )
            )

            product.save(

                update_fields=[

                    "semantic_runtime",

                    "semantic_score",

                    "semantic_labels",

                    "product_type",
                ]
            )

            self.stdout.write("")
            self.stdout.write(

                self.style.SUCCESS(
                    "V2 runtime saved."
                )
            )