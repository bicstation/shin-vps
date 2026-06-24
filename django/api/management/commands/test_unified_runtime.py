# -*- coding: utf-8 -*-

from pprint import pprint

from django.core.management.base import (
    BaseCommand,
)

from api.models import (
    PCProduct,
)

from api.services.semantic.v2.compiler.unified_runtime_builder import (
    build_unified_runtime,
)

from api.services.semantic.v2.compiler.unified_runtime_persist import (
    apply_unified_runtime,
)


class Command(BaseCommand):

    help = (
        "Test Unified Runtime"
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

        # ==================================================
        # BUILD
        # ==================================================

        runtime = (
            build_unified_runtime(
                product
            )
        )

        self.stdout.write("")
        self.stdout.write("=" * 80)
        self.stdout.write("UNIFIED RUNTIME")
        self.stdout.write("=" * 80)

        pprint(runtime)

        # ==================================================
        # SUMMARY
        # ==================================================

        self.stdout.write("")
        self.stdout.write("=" * 80)
        self.stdout.write("SUMMARY")
        self.stdout.write("=" * 80)

        self.stdout.write(

            f"product_type="
            f"{runtime.get('product_type')}"
        )

        self.stdout.write(

            f"semantic_score="
            f"{runtime.get('semantic_score')}"
        )

        self.stdout.write(

            f"semantic_attributes="
            f"{len(runtime.get('semantic_attributes', []))}"
        )

        self.stdout.write(

            f"semantic_groups="
            f"{len(runtime.get('semantic_groups', []))}"
        )

        self.stdout.write(

            f"workflow_tags="
            f"{runtime.get('workflow_tags', [])}"
        )

        # ==================================================
        # SAVE
        # ==================================================

        if save:

            product = (
                apply_unified_runtime(
                    product
                )
            )

            product.save(

                update_fields=[

                    "semantic_runtime",

                    "semantic_score",

                    "semantic_labels",

                    "product_type",

                    "semantic_runtime_compiled",
                ]
            )

            self.stdout.write("")
            self.stdout.write(

                self.style.SUCCESS(
                    "Unified runtime saved."
                )
            )