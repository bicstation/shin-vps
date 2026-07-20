# =========================================================
# FILE:
# api/management/commands/compile_spec_runtime.py
# =========================================================

import time

from concurrent.futures import ( ThreadPoolExecutor, as_completed, )
from django.core.management.base import ( BaseCommand, )
from django.db import ( close_old_connections, )
from api.models.pc_products import ( PCProduct, )
from api.services.ai.runtime.ai_runtime import ( AIRuntime, )
from api.services.ai.services.pc_spec_service import ( PCSpecService, )
from api.services.ai.services.spec_runtime_persist_service import ( SpecRuntimePersistService, )


class Command(BaseCommand):

    help = ( "Compile Spec Runtime" )

    # =====================================================
    # INIT
    # =====================================================

    def __init__( self, *args, **kwargs, ):

        super().__init__( *args, **kwargs, )

        self.spec_service = ( PCSpecService() )
        self.persist_service = ( SpecRuntimePersistService() )

    # =====================================================
    # ARGUMENTS
    # =====================================================

    def add_arguments( self, parser, ):

        parser.add_argument(
            "unique_id",
            nargs="?",
            type=str,
        )

        parser.add_argument(
            "--maker",
            type=str,
        )

        parser.add_argument(
            "--all",
            action="store_true",
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

    def handle( self, *args, **options, ):

        products = self.get_products(
            options
        )

        total = len(
            products
        )

        if not products.exists():

            self.stdout.write(

                self.style.WARNING(
                    "🔎 No Target Products"
                )

            )

            return

        self.print_runtime_header(
            total,
            options,
        )

        with ThreadPoolExecutor(

            max_workers=(
                AIRuntime.max_workers()
            )

        ) as executor:

            futures = {

                executor.submit(
                    self.process_product,
                    product,
                    index + 1,
                    total,
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

                    product = futures[
                        future
                    ]

                    self.stdout.write(

                        self.style.ERROR(

                            f"❌ {product.unique_id}\n"
                            f"{type(e).__name__}: {e}"

                        )

                    )

                    raise

        self.print_runtime_footer()

    # =====================================================
    # TARGET QUERY
    # =====================================================

    def build_target_query(
        self,
        options,
    ):

        if options["unique_id"]:

            return PCProduct.objects.filter(
                unique_id=options["unique_id"]
            )

        if options["maker"]:

            return PCProduct.objects.filter(
                maker=options["maker"]
            )

        if options["all"]:

            return PCProduct.objects.all()

        return PCProduct.objects.all()
    
    # =====================================================
    # PRODUCTS
    # =====================================================

    def get_products(
        self,
        options,
    ):

        query = self.build_target_query(
            options
        )

        if not options["force"]:

            query = query.filter(
                spec_processed=False
            )

        if not (
            options["unique_id"]
            or options["maker"]
            or options["all"]
        ):

            query = query[
                :options["limit"]
            ]

        return query

    # =====================================================
    # RUNTIME HEADER
    # =====================================================

    def print_runtime_header(
        self,
        total,
        options,
    ):

        if options["unique_id"]:

            target = "Single Product"

        elif options["maker"]:

            target = (
                f"Maker : "
                f"{options['maker']}"
            )

        elif options["all"]:

            target = "All Products"

        else:

            target = "Uncompiled Products"

        self.stdout.write(

            self.style.SUCCESS(

                "\n"
                "==================================================\n"
                "🚀 SPEC RUNTIME\n"
                "==================================================\n"
                f"TARGET  : {target}\n"
                f"PRODUCT : {total}\n"
                f"WORKERS : {AIRuntime.max_workers()}\n"
                f"FORCE   : {options['force']}\n"
                "=================================================="

            )

        )

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

        started = time.time()

        try:

            self.stdout.write(

                f"📤 "
                f"({count}/{total}) "
                f"{product.name}"

            )

            bundle = self.spec_service.generate(
                product
            )

            if not bundle:

                self.stdout.write(

                    self.style.WARNING(

                        f"⚠️ Empty Result "
                        f"{product.unique_id}"

                    )

                )

                return

            spec_result = bundle[
                "spec_result"
            ]

            self.persist_service.save(

                product,

                spec_result,

            )

            elapsed = round(

                time.time()
                - started,

                2,

            )

            self.stdout.write(

                self.style.SUCCESS(

                    "\n"
                    "==================================================\n"
                    "✅ SPEC COMPLETED\n"
                    "==================================================\n"
                    f"PRODUCT : {product.unique_id}\n"
                    f"MODEL   : {bundle['model']}\n"
                    f"KEY     : {bundle['api_key_index']}\n"
                    f"TIME    : {elapsed} sec\n"
                    "\n"
                    f"CPU     : {spec_result.cpu_model}\n"
                    f"GPU     : {spec_result.gpu_model}\n"
                    f"MEMORY  : {spec_result.memory_gb} GB\n"
                    f"STORAGE : {spec_result.storage_gb} GB\n"
                    f"DISPLAY : {spec_result.display_info}\n"
                    f"AI PC   : {spec_result.is_ai_pc}\n"
                    "=================================================="

                )

            )

        finally:

            close_old_connections()

    # =====================================================
    # RUNTIME FOOTER
    # =====================================================

    def print_runtime_footer(
        self,
    ):

        self.stdout.write(

            self.style.SUCCESS(

                "\n"
                "==================================================\n"
                "✅ SPEC RUNTIME FINISHED\n"
                "=================================================="

            )

        )