# -*- coding: utf-8 -*-

import json

from concurrent.futures import (
    ThreadPoolExecutor,
    as_completed,
)

from django.core.management.base import (
    BaseCommand,
)

from django.db import (
    close_old_connections,
)

from django.db.models import (
    Q,
)

from api.models.pc_products import (
    PCProduct,
)

from api.services.ai.services.pc_summary_service import (
    PCSummaryService,
)


MAX_WORKERS = 1


class Command(BaseCommand):

    help = (
        "Generate PC AI Summary"
    )

    def add_arguments(

        self,

        parser,

    ):

        parser.add_argument(

            "unique_id",

            nargs="?",

            type=str,

        )

        parser.add_argument(

            "--limit",

            type=int,

            default=1,

        )

        parser.add_argument(

            "--force",

            action="store_true",

        )

    # =====================================================
    # HANDLE
    # =====================================================

    def handle(

        self,

        *args,

        **options,

    ):

        unique_id = (
            options["unique_id"]
        )

        limit = (
            options["limit"]
        )

        force = (
            options["force"]
        )

        products = (
            self.get_products(

                unique_id,

                limit,

                force,

            )
        )

        if not products.exists():

            self.stdout.write(

                self.style.WARNING(

                    "🔎 対象製品なし"

                )

            )

            return

        self.stdout.write(

            self.style.SUCCESS(

                f"🚀 START "
                f"{products.count()}"

            )

        )

        with ThreadPoolExecutor(

            max_workers=
            MAX_WORKERS

        ) as executor:

            futures = {

                executor.submit(

                    self.process_product,

                    product,

                    index + 1,

                    len(products),

                ): product

                for index, product
                in enumerate(products)

            }

            for future in as_completed(
                futures
            ):

                try:

                    future.result()

                except Exception as e:

                    product = (
                        futures[
                            future
                        ]
                    )

                    self.stdout.write(

                        self.style.ERROR(

                            f"❌ "
                            f"{product.unique_id} "
                            f"{e}"

                        )

                    )

    # =====================================================
    # PRODUCTS
    # =====================================================

    def get_products(

        self,

        unique_id,

        limit,

        force,

    ):

        if unique_id:

            return (
                PCProduct.objects
                .filter(
                    unique_id=
                    unique_id
                )
            )

        query = (
            PCProduct.objects.all()
        )

        if not force:

            query = query.filter(

                Q(
                    ai_summary__isnull=True
                )

                |

                Q(
                    ai_summary=""
                )

            )

            query = query.exclude(
                cpu_model=""
            )

            query = query.exclude(
                memory_gb=0
            )

            query = query.exclude(
                storage_gb=0
            )

        return query[:limit]

    # =====================================================
    # PROCESS
    # =====================================================

    def process_product(
        self,
        product,
        count,
        total,
    ):

        close_old_connections()

        try:

            service = (
                PCSummaryService()
            )

            result = (
                service.generate(
                    product
                )
            )

            if not result:

                return

            self.save_summary(
                product,
                result,
            )

            self.stdout.write(

                self.style.SUCCESS(

                    f"✅ "
                    f"({count}/{total}) "
                    f"{product.unique_id}"
                    f"{product.title}"

                )

            )

        finally:

            close_old_connections()

    # =====================================================
    # SAVE
    # =====================================================

    def save_summary(
        self,
        product,
        result,
    ):

        product.is_active = True
        product.is_posted = True

        product.ai_summary = ( result.summary )
        product.target_user = ( result.target_user )
        product.strengths = (
            json.dumps(
                result.strengths,
                ensure_ascii=False,
            )
        )
        product.weaknesses = (
            json.dumps(
                result.weaknesses,
                ensure_ascii=False,
            )
        )
        product.usage_tags = (
            json.dumps(
                result.usage_tags,
                ensure_ascii=False,
            )
        )
        product.save()
        
        print(
            f"[{product.unique_id}] "
            f"SUMMARY:{result.summary[:80]}"
        )

        print(
            f"TARGET:{result.target_user}"
        )

        print(
            f"TAGS:{', '.join(result.usage_tags)}"
        )

        print(
            "-" * 60
        )