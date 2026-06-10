# =========================================================
# FILE:
# api/management/commands/compile_spec_runtime.py
# =========================================================

import time

from concurrent.futures import ( ThreadPoolExecutor, as_completed, )
from django.core.management.base import ( BaseCommand, )
from django.db import ( close_old_connections, )
from django.db.models import ( Q, )
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

        products = (
            self.get_products(
                options
            )
        )

        if not products.exists():

            self.stdout.write(

                self.style.WARNING(
                    "🔎 No Target Products"
                )

            )

            return

        self.stdout.write(

            self.style.SUCCESS(

                f"🚀 Spec Runtime "
                f"{len(products)} Products "
                f"/ Workers="
                f"{AIRuntime.max_workers()}"

            )

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
                        futures[future]
                    )

                    self.stdout.write(

                        self.style.ERROR(

                            f"❌ "
                            f"{product.unique_id} "
                            # f"{str(e)}"

                        )

                    )

    # =====================================================
    # PRODUCTS
    # =====================================================

    def get_products(

        self,

        options,

    ):

        unique_id = (
            options["unique_id"]
        )

        force = (
            options["force"]
        )

        limit = (
            options["limit"]
        )

        if unique_id:

            return (

                PCProduct.objects.filter(
                    unique_id=unique_id
                )

            )

        query = (
            PCProduct.objects.all()
        )

        if not force:

            query = query.filter(

                Q(cpu_model__isnull=True)

                |

                Q(cpu_model="")

                |

                Q(memory_gb=0)

                |

                Q(storage_gb=0)

                |

                Q(display_info__isnull=True)

                |

                Q(display_info="")

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

        started = time.time()

        try:

            self.stdout.write(

                f"📤 "
                f"({count}/{total}) "
                f"{product.name}"

            )

            bundle = (

                self.spec_service.generate(
                    product
                )

            )

            if not bundle:

                self.stdout.write(

                    self.style.WARNING(

                        f"⚠️ Empty Result "
                        f"{product.unique_id}"

                    )

                )

                return

            spec_result = (
                bundle["spec_result"]
            )

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