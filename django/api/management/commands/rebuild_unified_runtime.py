# -*- coding: utf-8 -*-

from django.core.management.base import (
    BaseCommand,
)

from api.models import (
    PCProduct,
)

from api.services.semantic.v2.compiler.unified_runtime_persist import (
    apply_unified_runtime,
)


class Command(BaseCommand):

    help = (
        "Rebuild Unified Runtime"
    )

    def add_arguments(
        self,
        parser,
    ):

        parser.add_argument(

            "--limit",

            type=int,

            default=None,
        )

        parser.add_argument(

            "--unique-id",

            type=str,

            default=None,
        )

        parser.add_argument(

            "--dry-run",

            action="store_true",
        )

    def handle(
        self,
        *args,
        **options,
    ):

        limit = (
            options["limit"]
        )

        unique_id = (
            options["unique_id"]
        )

        dry_run = (
            options["dry_run"]
        )

        products = (
            PCProduct.objects
            .filter(
                is_active=True
            )
            .order_by("id")
        )

        # --------------------------------------------------
        # Single Product
        # --------------------------------------------------

        if unique_id:

            products = (
                products.filter(
                    unique_id=unique_id
                )
            )

        # --------------------------------------------------
        # Limit
        # --------------------------------------------------

        if limit:

            products = (
                products[:limit]
            )

        total = len(products)

        self.stdout.write("")
        self.stdout.write("=" * 80)
        self.stdout.write(
            "UNIFIED RUNTIME REBUILD"
        )
        self.stdout.write("=" * 80)

        self.stdout.write(
            f"products={total}"
        )

        self.stdout.write(
            f"dry_run={dry_run}"
        )

        success = 0
        failed = 0

        # --------------------------------------------------
        # Build
        # --------------------------------------------------

        for index, product in enumerate(
            products,
            start=1,
        ):

            try:

                product = (
                    apply_unified_runtime(
                        product
                    )
                )

                if not dry_run:

                    product.save(

                        update_fields=[

                            "semantic_runtime",

                            "semantic_score",

                            "semantic_labels",

                            "product_type",

                            "semantic_runtime_compiled",
                        ]
                    )

                success += 1

                self.stdout.write(

                    f"[{index}/{total}] "

                    f"OK "

                    f"{product.unique_id} "

                    f"score="

                    f"{product.semantic_score}"
                )

            except Exception as e:

                failed += 1

                self.stdout.write(

                    self.style.ERROR(

                        f"[{index}/{total}] "

                        f"FAILED "

                        f"{product.unique_id} "

                        f"{str(e)}"
                    )
                )

        # --------------------------------------------------
        # Summary
        # --------------------------------------------------

        self.stdout.write("")
        self.stdout.write("=" * 80)
        self.stdout.write(
            "SUMMARY"
        )
        self.stdout.write("=" * 80)

        self.stdout.write(
            f"success={success}"
        )

        self.stdout.write(
            f"failed={failed}"
        )

        self.stdout.write(
            f"total={total}"
        )

        if dry_run:

            self.stdout.write("")
            self.stdout.write(
                self.style.WARNING(
                    "DRY RUN ONLY"
                )
            )

        else:

            self.stdout.write("")
            self.stdout.write(
                self.style.SUCCESS(
                    "Unified Runtime Rebuild Complete"
                )
            )