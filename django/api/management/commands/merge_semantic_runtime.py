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
        "Merge Reality Runtime + Meaning Runtime"
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

        unique_id = (
            options["unique_id"]
        )

        save = (
            options["save"]
        )

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
                    "Product not found"
                )
            )

            return

        # =====================================
        # EXISTING REALITY
        # =====================================

        reality_runtime = (

            product.semantic_runtime

            or {}
        )

        # =====================================
        # V2 MEANING
        # =====================================

        meaning_runtime = (

            build_product_runtime(
                product
            )
        )

        # =====================================
        # MERGE
        # =====================================

        merged_runtime = {

            **reality_runtime,

            **meaning_runtime,
        }

        self.stdout.write("")
        self.stdout.write("=" * 80)
        self.stdout.write("REALITY")
        self.stdout.write("=" * 80)

        pprint(
            reality_runtime
        )

        self.stdout.write("")
        self.stdout.write("=" * 80)
        self.stdout.write("MEANING")
        self.stdout.write("=" * 80)

        pprint(
            meaning_runtime
        )

        self.stdout.write("")
        self.stdout.write("=" * 80)
        self.stdout.write("MERGED")
        self.stdout.write("=" * 80)

        pprint(
            merged_runtime
        )

        self.stdout.write("")
        self.stdout.write("=" * 80)
        self.stdout.write("SUMMARY")
        self.stdout.write("=" * 80)

        self.stdout.write(

            f"product_type="
            f"{merged_runtime.get('product_type')}"
        )

        self.stdout.write(

            f"semantic_score="
            f"{merged_runtime.get('semantic_score')}"
        )

        self.stdout.write(

            f"semantic_attributes="
            f"{len(merged_runtime.get('semantic_attributes', []))}"
        )

        self.stdout.write(

            f"semantic_groups="
            f"{len(merged_runtime.get('semantic_groups', []))}"
        )

        # =====================================
        # OPTIONAL SAVE
        # =====================================

        if save:

            product.semantic_runtime = (
                merged_runtime
            )

            product.semantic_score = (
                merged_runtime.get(
                    "semantic_score",
                    0,
                )
            )

            product.semantic_labels = (
                merged_runtime.get(
                    "semantic_labels",
                    [],
                )
            )

            product.product_type = (
                merged_runtime.get(
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
                    "Merged runtime saved."
                )
            )